import type { UserStoreLocalStorage } from '@/auth/hooks/use-auth-user-store'
import {
  userStoreLocalStorageSchema,
  userStoreName,
} from '@/auth/hooks/use-auth-user-store'

/**
 * validate if user is authenticated or not by checking localStorage and parse the schema
 *
 * @env browser
 */
export function validateAuthUser() {
  const appUser = localStorage.getItem(userStoreName) ?? '{}'
  const parsedAppUser = JSON.parse(appUser) as UserStoreLocalStorage
  const parsed = userStoreLocalStorageSchema.safeParse(parsedAppUser)

  return parsed.success && !!parsed.data.state.user
}
