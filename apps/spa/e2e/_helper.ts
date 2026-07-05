/* oxlint-disable eslint/func-style -- function declarations */
import { faker } from "@faker-js/faker";
import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";

import type { UserStoreState } from "@/auth/hooks/use-auth-user-store";

export function seedUser(): AuthLoginResponseSchema {
  return {
    accessToken: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: faker.helpers.arrayElement(["male", "female"]),
    id: faker.number.int(),
    image: faker.image.avatar(),
    lastName: faker.person.lastName(),
    refreshToken: faker.string.uuid(),
    username: faker.person.middleName(),
  };
}
export function getLocalStorageUser(): {
  version: number;
  state: UserStoreState;
} | null {
  if (!localStorage) {
    throw new Error("You are not in the browser env!");
  }
  return JSON.parse(localStorage.getItem("app-user") ?? "null");
}
export function setLocalStorageUser(user: AuthLoginResponseSchema) {
  if (!localStorage) {
    throw new Error("You are not in the browser env!");
  }
  localStorage.setItem("app-user", JSON.stringify(user));
}
