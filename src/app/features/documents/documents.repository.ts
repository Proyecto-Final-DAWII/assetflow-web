import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { AssetDocument, AssetDocumentType } from '../../shared/models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentsRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(assetId: string): Observable<readonly AssetDocument[]> {
    if (this.config.isMockMode()) return this.demoDb.listDocuments(assetId);
    return this.api
      .execute<readonly AssetDocument[] | ApiEnvelope<readonly AssetDocument[]>>('documents.list', {
        pathParams: { assetId },
      })
      .pipe(map((response) => unwrapApiData(response)));
  }

  upload(assetId: string, file: File, type: AssetDocumentType): Observable<AssetDocument> {
    if (this.config.isMockMode()) return this.demoDb.uploadDocument(assetId, file, type);
    const body = new FormData();
    body.append('file', file, file.name);
    body.append('type', type);
    return this.api
      .execute<AssetDocument | ApiEnvelope<AssetDocument>, FormData>('documents.upload', {
        pathParams: { assetId },
        body,
      })
      .pipe(map((response) => unwrapApiData(response)));
  }

  delete(documentId: string): Observable<void> {
    if (this.config.isMockMode()) return this.demoDb.deleteDocument(documentId);
    return this.api.execute<void>('documents.delete', { pathParams: { id: documentId } });
  }
}
