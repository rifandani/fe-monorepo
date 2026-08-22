import {
  userStoreLocalStorageSchema,
  userStoreName,
} from "@/auth/hooks/use-auth-user-store";

export const checkAuthUser = () => {
  const appUser = localStorage.getItem(userStoreName) ?? "{}";
  const parsed = userStoreLocalStorageSchema.safeParse(JSON.parse(appUser));
  return parsed.success && !!parsed.data.state.user;
};
