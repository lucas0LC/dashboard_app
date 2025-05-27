import React, { useState } from 'react';
import type { ExistingApiKeyInfo } from '../../dataInterfaces';

interface ApiKeyGenerationResponse {
  apiKey?: string;
  keyName?: string;
  keyHint?: string;
  updatedAt?: string;
  message?: string;
  error?: string;
}

interface ApiKeyGeneratorProps {
  onKeyGenerated: (newKeyInfo: ExistingApiKeyInfo) => void;
}

export const ApiKeyGenerator: React.FC<ApiKeyGeneratorProps> = ({ onKeyGenerated }) => {
  const [keyNameInput, setKeyNameInput] = useState<string>('');
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKeyGenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateKey = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setNewlyGeneratedKey(null);
    setCopied(false);

    let httpResponse: Response | undefined;

    try {
      httpResponse = await fetch('/api/generate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyName: keyNameInput.trim() || undefined }),
      });

      const responseText = await httpResponse.text();
      const data: ApiKeyGenerationResponse = JSON.parse(responseText);

      if (!httpResponse.ok) {
        throw new Error(data.error || `Falha (status: ${httpResponse.status}) - ${responseText}`);
      }
      
      setNewlyGeneratedKey(data);
      if (data.keyName && data.keyHint && data.updatedAt) {
        onKeyGenerated({
            keyName: data.keyName || null,
            keyHint: data.keyHint || null,
            createdAt: null,
            updatedAt: data.updatedAt || null
        });
      }
      setKeyNameInput('');
    } catch (err: any) {
      console.error("Erro ao gerar chave de API:", err);
      if (httpResponse) {
        console.error("Detalhes da Resposta da API:", {
          status: httpResponse.status,
          statusText: httpResponse.statusText,
        });
      }
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (newlyGeneratedKey?.apiKey) {
      navigator.clipboard.writeText(newlyGeneratedKey.apiKey)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
        .catch(err => { setError('Falha ao copiar. Copie manualmente.'); });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Gerar/Atualizar Chave de API</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Se você já possui uma chave, gerar uma nova irá invalidar a anterior.
      </p>
      <form onSubmit={handleGenerateKey}>
        <div className="mb-4">
          <label htmlFor="keyName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome para a Chave (opcional):
          </label>
          <input
            type="text"
            id="keyName"
            value={keyNameInput}
            onChange={(e) => setKeyNameInput(e.target.value)}
            placeholder="Ex: Minha Integração Principal"
            disabled={isLoading}
            className="w-full p-2.5 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <button type="submit" disabled={isLoading}
          className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                      ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600'}`}>
          {isLoading ? 'Processando...' : 'Gerar / Substituir Chave'}
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-4 p-4 text-sm text-red-700 bg-red-100 border border-red-500 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-700">
          <span className="font-medium">Erro:</span> {error}
        </div>
      )}

      {newlyGeneratedKey?.apiKey && (
        <div className="mt-6 p-4 border border-green-500 rounded-lg bg-green-50 dark:bg-gray-700 dark:border-green-400">
          <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">
            {newlyGeneratedKey.message || 'Nova Chave de API Pronta!'}
          </h4>
          <div role="alert" className="mt-2 p-3 text-sm text-yellow-700 bg-yellow-100 border border-yellow-500 rounded-lg dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-600">
            <p className="font-bold">
              ⚠️ Copie sua nova chave de API abaixo. Ela não será exibida novamente.
            </p>
          </div>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Nome:</span> {newlyGeneratedKey.keyName} <br />
            <span className="font-semibold">Dica:</span> {newlyGeneratedKey.keyHint}
          </p>
          <div className="mt-2 flex items-center gap-x-3 bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-300 dark:border-gray-600">
            <pre className="flex-grow text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
              <code>{newlyGeneratedKey.apiKey}</code>
            </pre>
            <button onClick={handleCopyToClipboard} title="Copiar"
              className={`p-2 text-white rounded-md text-xs font-medium ${copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
