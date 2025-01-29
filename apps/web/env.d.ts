declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Bundle environment variables for the browser by prefixing with NEXT_PUBLIC_
     */
    readonly NEXT_PUBLIC_TITLE: string
    readonly NEXT_PUBLIC_API_BASE_URL: string
  }
}
