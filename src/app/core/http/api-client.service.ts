import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { ApiRequestOptions, QueryParams } from './api.models';
import { ApiUrlService } from './api-url.service';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly apiUrl = inject(ApiUrlService);

  execute<TResponse, TBody = unknown>(
    endpointKey: string,
    options: ApiRequestOptions<TBody> = {},
  ): Observable<TResponse> {
    const endpoint = this.runtimeConfig.endpoint(endpointKey);
    const url = this.apiUrl.build(endpointKey, options.pathParams);

    return this.http.request<TResponse>(endpoint.method, url, {
      body: options.body,
      context: options.context,
      headers: options.headers,
      params: this.toHttpParams(options.query),
    });
  }

  private toHttpParams(query: QueryParams | undefined): HttpParams {
    let params = new HttpParams();
    if (!query) {
      return params;
    }

    for (const [key, rawValue] of Object.entries(query)) {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      for (const value of values) {
        if (value !== null && value !== undefined && value !== '') {
          params = params.append(key, String(value));
        }
      }
    }

    return params;
  }
}
