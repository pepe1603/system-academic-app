import { UserFormModal } from '#components'
import type { User } from './useUsers'

export const useUserModal = () => {
  const overlay = useOverlay()

  const modal = overlay.create(UserFormModal, {
    destroyOnClose: true
  })

  const availableRoles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Profesor', value: 'TEACHER' },
    { label: 'Estudiante', value: 'STUDENT' },
    { label: 'Control Escolar', value: 'CONTROL_ESCOLAR' },
    { label: 'Director', value: 'DIRECTOR' }
  ]

  const openCreateModal = async () => {
    return await modal.open({
      title: 'Crear Usuario',
      mode: 'create',
      availableRoles
    })
  }

  const openEditModal = async (user: User) => {
    return await modal.open({
      title: 'Editar Usuario',
      mode: 'edit',
      user,
      availableRoles
    })
  }

  return { openCreateModal, openEditModal }
}
