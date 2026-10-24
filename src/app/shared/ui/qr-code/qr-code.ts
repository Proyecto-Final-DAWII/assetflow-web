import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'af-qr-code',
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCode {
  readonly value = input.required<string>();
  readonly size = input(180);

  protected readonly dataUrl = signal<string | null>(null);
  protected readonly failed = signal(false);

  constructor() {
    effect(() => {
      const value = this.value();
      const size = this.size();
      void this.render(value, size);
    });
  }

  download(filename = 'asset-qr.png'): void {
    const source = this.dataUrl();
    if (!source) return;
    const anchor = document.createElement('a');
    anchor.href = source;
    anchor.download = filename;
    anchor.click();
  }

  private async render(value: string, size: number): Promise<void> {
    try {
      const dataUrl = await QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#101a2d', light: '#ffffff' },
      });
      this.dataUrl.set(dataUrl);
      this.failed.set(false);
    } catch {
      this.failed.set(true);
      this.dataUrl.set(null);
    }
  }
}
