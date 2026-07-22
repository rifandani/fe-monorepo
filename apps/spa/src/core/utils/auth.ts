import type { UserStoreLocalStorage } from "@/auth/hooks/use-auth-user-store";
import {
  userStoreLocalStorageSchema,
  userStoreName,
} from "@/auth/hooks/use-auth-user-store";

export const checkAuthUser = () => {
  const appUser = localStorage.getItem(userStoreName) ?? "{}";
  const parsedAppUser = JSON.parse(appUser) as UserStoreLocalStorage;
  const parsed = userStoreLocalStorageSchema.safeParse(parsedAppUser);
  return parsed.success && !!parsed.data.state.user;
};
