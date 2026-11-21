import { setupServer } from "msw/node";

export const MOCK_API_BASE_URL = "https://api.test";

export const server = setupServer();
