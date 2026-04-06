interface ServerStatus {
  isOnline: boolean
  isChecking: boolean
  lastChecked: Date | null
  services: {
    database: boolean | null
    redis: boolean | null
  }
  isMonitoring: boolean
  isDestroyed: boolean
}

const HEALTH_CHECK_INTERVAL = 30000
const HEALTH_ENDPOINT = '/api/health'
const MONITOR_ENDPOINT = '/api/monitor'

export const useServerStatus = () => {
  const status = useState<ServerStatus>('serverStatus', () => ({
    isOnline: true,
    isChecking: false,
    lastChecked: null,
    services: {
      database: null,
      redis: null
    },
    isMonitoring: false,
    isDestroyed: false
  }))

  let checkInterval: ReturnType<typeof setInterval> | null = null

  const checkHealth = async (): Promise<boolean> => {
    if (status.value.isChecking) return status.value.isOnline
    if (status.value.isDestroyed) return false

    status.value.isChecking = true

    try {
      const response = await $fetch<{ status: string }>(HEALTH_ENDPOINT, {
        method: 'GET',
        timeout: 5000
      })

      status.value.isOnline = response.status === 'UP'
      status.value.lastChecked = new Date()

      if (status.value.isOnline && !status.value.isDestroyed) {
        await checkMonitor()
      }

      return status.value.isOnline
    } catch {
      status.value.isOnline = false
      status.value.lastChecked = new Date()
      return false
    } finally {
      status.value.isChecking = false
    }
  }

  const checkMonitor = async (): Promise<void> => {
    if (status.value.isDestroyed) return

    try {
      const { accessToken } = useAuth()

      if (!accessToken.value) return

      const response = await $fetch<{
        status: string
        services: { database: string; redis: string }
      }>(MONITOR_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        },
        timeout: 5000
      })

      status.value.services = {
        database: response.services.database === 'UP',
        redis: response.services.redis === 'UP'
      }
    } catch {
      status.value.services = {
        database: null,
        redis: null
      }
    }
  }

  const startMonitoring = () => {
    if (status.value.isMonitoring || status.value.isDestroyed) return

    status.value.isMonitoring = true
    checkHealth()

    checkInterval = setInterval(() => {
      if (!status.value.isDestroyed && status.value.isMonitoring) {
        checkHealth()
      }
    }, HEALTH_CHECK_INTERVAL)
  }

  const stopMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    status.value.isMonitoring = false
  }

  const destroy = () => {
    status.value.isDestroyed = true
    stopMonitoring()
    status.value.isOnline = true
  }

  const waitForServer = async (maxAttempts = 10, interval = 5000): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      if (await checkHealth()) return true
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    return false
  }

  return {
    status: readonly(status),
    checkHealth,
    startMonitoring,
    stopMonitoring,
    waitForServer,
    destroy
  }
}
