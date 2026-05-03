import type { User } from './useUsers'

export const useUserActions = () => {
  const toast = useToast()
  const confirm = useConfirmDialog()
  const { createUser, updateUser, deleteUser, fetchUsers } = useUsers()
  const currentPage = useState<number>('usersPage', () => 0)

  const availableRoles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Profesor', value: 'TEACHER' },
    { label: 'Estudiante', value: 'STUDENT' },
    { label: 'Control Escolar', value: 'CONTROL_ESCOLAR' },
    { label: 'Director', value: 'DIRECTOR' }
  ]

  const handleCreateUser = async (formData: any): Promise<boolean> => {
    const result = await createUser(formData)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      return true
    } else {
      toast.add({ title: result.message, color: 'error' })
      return false
    }
  }

  const handleUpdateUser = async (userId: string, formData: any): Promise<boolean> => {
    const result = await updateUser(userId, formData)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      return true
    } else {
      toast.add({ title: result.message, color: 'error' })
      return false
    }
  }

  const handleDeleteUser = async (userId: string, username: string): Promise<boolean> => {
    const confirmed = await confirm({
      title: 'Eliminar usuario',
      description: `¿Estás seguro de eliminar a ${username}?`
    })
    if (confirmed) {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.add({ title: result.message, color: 'success' })
        return true
      } else {
        toast.add({ title: result.message, color: 'error' })
        return false
      }
    }
    return false
  }

  return {
    availableRoles,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
  }
}
