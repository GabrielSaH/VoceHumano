/**
 * Dilemas servidos pelo json-server (api/db.json), acessados através de /api.
 * GET /api/dilemas      -> lista completa
 * GET /api/dilemas/:id  -> um dilema
 */
export const URL_DILEMAS = '/api/dilemas';

export function urlDilema(id: string): string {
  return `${URL_DILEMAS}/${encodeURIComponent(id)}`;
}
