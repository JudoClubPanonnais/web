import { createContext, useContext } from 'react'

export type Role = 'gerant' | 'coach' | null
export const AdminRoleContext = createContext<Role>(null)
export function useAdminRole() { return useContext(AdminRoleContext) }
