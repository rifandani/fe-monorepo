import type { Options } from "ky";
import ky from "ky";

const defaultHeader = "Authorization";
const defaultFormat = (token: string) => `Bearer ${token}`;

/**
 * @description How an `Http` instance proves the Session on every request.
 */
export interface HttpAuthConfig {
  /**
   * @description Read the current Access Token, or `null` when there is no Session.
   * Called per request, so login and logout need not notify the instance.
   */
  getToken: () => string | null;
  /**
   * @description Name of the header the Access Token is sent in.
   * @default "Authorization"
   */
  header?: string;
  /**
   * @description Format the Access Token into a header value.
   * @default token => `Bearer ${token}`
   */
  format?: (token: string) => string;
  /**
   * @description End the Session, called when the server rejects an Access Token.
   * Only fires when the rejected request actually carried one, so a failed sign-in
   * — which is a 401 with no Session to end — never triggers it.
   */
  onUnauthorized?: () => void;
}

export type HttpConfig = Options & {
  auth?: HttpAuthConfig;
};

const withAuth = (config: Options, auth: HttpAuthConfig): Options => {
  const header = auth.header ?? defaultHeader;
  const format = auth.format ?? defaultFormat;
  return {
    ...config,
    hooks: {
      ...config.hooks,
      beforeRequest: [
        ...(config.hooks?.beforeRequest ?? []),
        ({ request }) => {
          const token = auth.getToken();
          if (token) {
            request.headers.set(header, format(token));
          }
        },
      ],
      afterResponse: [
        ...(config.hooks?.afterResponse ?? []),
        ({ request, response }) => {
          // Only a request that proved a Session can have that proof rejected.
          // A 401 from sign-in carries no header, and must not end anything.
          if (response.status === 401 && request.headers.has(header)) {
            auth.onUnauthorized?.();
          }
        },
      ],
    },
  };
};

export class Http {
  /**
   * @description Ky instance
   */
  instance: typeof ky;
  /**
   * @description Create a new instance of Http service
   * @param {HttpConfig} config Ky config options, plus optional Session auth
   */
  constructor({ auth, ...config }: HttpConfig) {
    this.instance = ky.create(auth ? withAuth(config, auth) : config);
  }
}
