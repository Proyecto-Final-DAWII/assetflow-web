export type AssetDocumentType = 'INVOICE' | 'WARRANTY' | 'DELIVERY_ACT' | 'PHOTO' | 'OTHER';

export interface AssetDocument {
  readonly id: string;
  readonly assetId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly size: number;
  readonly type: AssetDocumentType;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
  readonly downloadUrl?: string;
}
