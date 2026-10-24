import { readFile } from 'node:fs/promises';

const configPath = new URL('../public/config/app.config.json', import.meta.url);
const raw = await readFile(configPath, 'utf8');
const config = JSON.parse(raw);
const errors = [];
const methods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

if (!config?.app?.name) errors.push('Falta app.name.');
if (typeof config?.api?.useMocks !== 'boolean') errors.push('api.useMocks debe ser boolean.');
if (!Number.isFinite(config?.api?.timeoutMs) || config.api.timeoutMs <= 0) errors.push('api.timeoutMs debe ser mayor que cero.');

const clients = config?.api?.clients ?? {};
for (const [key, client] of Object.entries(clients)) {
  if (typeof client?.baseUrl !== 'string' || !client.baseUrl.trim()) errors.push(`El cliente ${key} no tiene baseUrl.`);
}

const endpoints = config?.api?.endpoints ?? {};
for (const [key, endpoint] of Object.entries(endpoints)) {
  if (!methods.has(endpoint?.method)) errors.push(`El endpoint ${key} usa un metodo no permitido.`);
  if (!clients[endpoint?.client]) errors.push(`El endpoint ${key} referencia el cliente inexistente ${endpoint?.client}.`);
  if (typeof endpoint?.path !== 'string' || (!endpoint.path.startsWith('/') && !/^https?:\/\//i.test(endpoint.path))) {
    errors.push(`La ruta del endpoint ${key} debe comenzar con / o ser una URL absoluta.`);
  }
}

if (errors.length) {
  console.error('app.config.json no es valido:\n- ' + errors.join('\n- '));
  process.exit(1);
}

console.log(`Configuracion valida: ${Object.keys(clients).length} clientes y ${Object.keys(endpoints).length} endpoints.`);
