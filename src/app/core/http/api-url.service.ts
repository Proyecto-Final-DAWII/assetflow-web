import { Injectable, inject } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { PathParams } from './api.models';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly runtimeConfig = inject(RuntimeConfigService);

  build(endpointKey: string, pathParams: PathParams = {}): string {
    const endpoint = this.runtimeConfig.endpoint(endpointKey);
    const client = this.runtimeConfig.client(endpoint.client);
    const path = this.replacePathParams(endpoint.path, pathParams);

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${client.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  replacePathParams(path: string, pathParams: PathParams): string {
    const result = path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      const value = pathParams[key];
      if (value === undefined || value === null || value === '') {
        throw new Error(`Falta el parámetro de ruta "${key}" para "${path}".`);
      }
      return encodeURIComponent(String(value));
    });

    const unresolved = result.match(/\{[^}]+\}/);
    if (unresolved) {
      throw new Error(`Quedó un parámetro sin resolver en "${path}".`);
    }

    return result;
  }
}
