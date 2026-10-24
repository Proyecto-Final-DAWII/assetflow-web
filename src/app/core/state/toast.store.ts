import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  readonly id: string;
  readonly tone: ToastTone;
  readonly title: string;
  readonly message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastStore {
  private readonly itemsState = signal<readonly ToastMessage[]>([]);
  readonly items = this.itemsState.asReadonly();

  success(title: string, message?: string): void {
    this.push('success', title, message);
  }

  error(title: string, message?: string): void {
    this.push('error', title, message, 6500);
  }

  warning(title: string, message?: string): void {
    this.push('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.push('info', title, message);
  }

  dismiss(id: string): void {
    this.itemsState.update((items) => items.filter((item) => item.id !== id));
  }

  private push(tone: ToastTone, title: string, message?: string, duration = 4500): void {
    const item: ToastMessage = {
      id: crypto.randomUUID(),
      tone,
      title,
      message,
    };
    this.itemsState.update((items) => [...items, item]);
    window.setTimeout(() => this.dismiss(item.id), duration);
  }
}
