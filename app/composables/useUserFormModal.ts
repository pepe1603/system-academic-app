import type { User } from './useUsers'

export interface CreateUserForm {
  username: string
  email: string
  password: string
  roles: string[]
}

export interface EditUserForm {
  roles: string[]
  isActive: boolean
  mustChangePassword: boolean
}

export const useUserFormModal = () => {
  const showCreateModal = useState('userFormCreateModal', () => false)
  const showEditModal = useState('userFormEditModal', () => false)
  const editingUser = useState<User | null>('userFormEditingUser', () => null)
  const submitting = useState('userFormSubmitting', () => false)

  const createForm = useState<CreateUserForm>('userFormCreate', () => ({
    username: '',
    email: '',
    password: '',
    roles: []
  }))

  const editForm = useState<EditUserForm>('userFormEdit', () => ({
    roles: [],
    isActive: true,
    mustChangePassword: false
  }))

  const openCreateModal = () => {
    createForm.value = { username: '', email: '', password: '', roles: [] }
    showCreateModal.value = true
  }

  const openEditModal = (user: User) => {
    editingUser.value = user
    editForm.value = {
      roles: [...user.roles],
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword
    }
    showEditModal.value = true
  }

  const closeCreateModal = () => {
    showCreateModal.value = false
  }

  const closeEditModal = () => {
    showEditModal.value = false
    editingUser.value = null
  }

  return {
    showCreateModal,
    showEditModal,
    editingUser,
    submitting,
    createForm,
    editForm,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal
  }
}
