import crypto from 'crypto';

/**
 * Gera uma nova chave de API (string aleatória criptograficamente segura).
 * @param byteLength O número de bytes aleatórios. 32 bytes = 64 caracteres hex.
 * @returns A chave de API gerada.
 */
export function generateNewApiKey(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Cria um hash SHA256 da chave de API para armazenamento seguro.
 * @param apiKey A chave de API a ser hasheada.
 * @returns O hash hexadecimal da chave.
 */
export function hashApiKey(apiKey: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(apiKey);
  return hash.digest('hex');
}