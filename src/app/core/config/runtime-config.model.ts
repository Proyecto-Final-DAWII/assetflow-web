export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfig {
  readonly baseUrl: string;
}

export interface ApiEndpointConfig {
  readonly client: string;
  readonly method: HttpMethod;
  readonly path: string;
}

export interface RuntimeConfig {
  readonly app: {
    readonly name: string;
    readonly companyName: string;
    readonly version: string;
    readonly locale: string;
    readonly currency: string;
    readonly dateFormat: string;
  };
  readonly api: {
    readonly useMocks: boolean;
    readonly timeoutMs: number;
    readonly clients: Readonly<Record<string, ApiClientConfig>>;
    readonly endpoints: Readonly<Record<string, ApiEndpointConfig>>;
  };
  readonly auth: {
    readonly storageKey: string;
    readonly allowDemoRoleLogin: boolean;
  };
  readonly features: Readonly<Record<string, boolean>>;
}
