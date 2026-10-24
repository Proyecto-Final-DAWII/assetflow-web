import { Injectable, computed, signal } from '@angular/core';
import { ApiClientConfig, ApiEndpointConfig, RuntimeConfig } from './runtime-config.model';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly configState = signal<RuntimeConfig | null>(null);

  readonly config = this.configState.asReadonly();
  readonly isMockMode = computed(() => this.configState()?.api.useMocks ?? true);

  async load(): Promise<void> {
    const configUrl = new URL('config/app.config.json', document.baseURI).toString();
    const response = await fetch(configUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`No se pudo cargar la configuración (${response.status}).`);
    }

    const candidate: unknown = await response.json();
    this.assertRuntimeConfig(candidate);
    this.configState.set(candidate);
  }

  snapshot(): RuntimeConfig {
    const value = this.configState();
    if (!value) {
      throw new Error('La configuración todavía no ha sido inicializada.');
    }
    return value;
  }

  endpoint(key: string): ApiEndpointConfig {
    const endpoint = this.snapshot().api.endpoints[key];
    if (!endpoint) {
      throw new Error(`El endpoint "${key}" no existe en app.config.json.`);
    }
    return endpoint;
  }

  client(key: string): ApiClientConfig {
    const client = this.snapshot().api.clients[key];
    if (!client) {
      throw new Error(`El cliente API "${key}" no existe en app.config.json.`);
    }
    return client;
  }

  private assertRuntimeConfig(value: unknown): asserts value is RuntimeConfig {
    if (!this.isRecord(value)) {
      throw new Error('app.config.json debe contener un objeto JSON.');
    }

    const api = value['api'];
    const app = value['app'];
    const auth = value['auth'];

    if (!this.isRecord(app) || typeof app['name'] !== 'string') {
      throw new Error('Falta app.name en app.config.json.');
    }

    if (!this.isRecord(api) || !this.isRecord(api['clients']) || !this.isRecord(api['endpoints'])) {
      throw new Error('La sección api de app.config.json no es válida.');
    }

    if (!this.isRecord(auth) || typeof auth['storageKey'] !== 'string') {
      throw new Error('La sección auth de app.config.json no es válida.');
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
