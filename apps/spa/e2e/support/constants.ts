/**
 * The API origin of every Route Test. `vitest.e2e.config.ts` pins
 * `VITE_API_BASE_URL` to it, and every handler in `network.ts` matches on it.
 *
 * It must stay free of browser and Node imports: the config imports it in Node,
 * the handlers import it in the browser.
 */
export const MOCK_API_BASE_URL = "https://api.spa.test";
