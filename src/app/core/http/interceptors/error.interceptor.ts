import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TimeoutError, catchError, throwError } from 'rxjs';
import { SessionStore } from '../../auth/session.store';
import { ToastStore } from '../../state/toast.store';
import { AppError } from '../app-error';
import { SKIP_ERROR_TOAST } from '../http-context.tokens';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastStore);
  const session = inject(SessionStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      const appError = normalizeError(error);

      if (appError.status === 401) {
        session.clear();
      }

      if (!request.context.get(SKIP_ERROR_TOAST)) {
        toast.error('No se pudo completar la operación', appError.message);
      }

      return throwError(() => appError);
    }),
  );
};

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TimeoutError) {
    return new AppError('La solicitud excedió el tiempo máximo de espera.', 408, 'REQUEST_TIMEOUT');
  }

  if (error instanceof HttpErrorResponse) {
    const backendMessage = extractBackendMessage(error.error);
    const message = backendMessage ?? statusMessage(error.status);
    return new AppError(message, error.status, extractBackendCode(error.error), error.error);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 0, 'CLIENT_ERROR');
  }

  return new AppError('Ocurrió un error inesperado.', 0, 'UNKNOWN_ERROR', error);
}

function extractBackendMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }
  if (isRecord(payload)) {
    const value = payload['message'] ?? payload['detail'] ?? payload['error'];
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
  return undefined;
}

function extractBackendCode(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }
  const value = payload['code'];
  return typeof value === 'string' ? value : undefined;
}

function statusMessage(status: number): string {
  const messages: Record<number, string> = {
    0: 'No fue posible conectar con el servidor.',
    400: 'La solicitud contiene datos inválidos.',
    401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El recurso solicitado no existe.',
    409: 'La operación entra en conflicto con el estado actual.',
    422: 'No fue posible validar la información enviada.',
    500: 'El servidor presentó un error interno.',
    503: 'El servicio no se encuentra disponible temporalmente.',
  };
  return messages[status] ?? `El servidor respondió con el estado ${status}.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
