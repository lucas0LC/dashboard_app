'use client'
import { useEffect, useState } from 'react';
import { ApiKeyGenerator } from '../config/components/ApiKeyGenerator';
import type { ExistingApiKeyInfo } from '../dataInterfaces';


export default function ConfigPage() {
  const [currentKeyInfo, setCurrentKeyInfo] = useState<ExistingApiKeyInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchApiKeyInfo = async () => {
    setIsLoadingInfo(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/get-api-key-info');
      const data: ExistingApiKeyInfo | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error((data as { error: string }).error || 'Falha ao buscar dados da chave.');
      }
      if ((data as ExistingApiKeyInfo).keyName) {
        setCurrentKeyInfo(data as ExistingApiKeyInfo);
      } else {
        setCurrentKeyInfo(null);
      }
    } catch (err: any) {
      setFetchError(err.message);
      setCurrentKeyInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchApiKeyInfo();
  }, []);

  const handleKeyGenerated = (newKeyInfoFromGenerator: ExistingApiKeyInfo) => {
    setCurrentKeyInfo(prevKeyInfo => {
      const resultingCreatedAt = prevKeyInfo ? prevKeyInfo.createdAt : newKeyInfoFromGenerator.createdAt;

      return {
        keyName: newKeyInfoFromGenerator.keyName,
        keyHint: newKeyInfoFromGenerator.keyHint,
        createdAt: resultingCreatedAt,
        updatedAt: newKeyInfoFromGenerator.updatedAt,
      };
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
            Minha Chave de API
          </h1>
        </header>
        
        <main className="space-y-8">
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Chave de API Atual</h2>
            {isLoadingInfo && <p className="text-gray-600 dark:text-gray-400">Carregando informações da chave...</p>}
            {fetchError && <p className="text-red-500">Erro ao carregar: {fetchError}</p>}
            {!isLoadingInfo && !fetchError && currentKeyInfo?.keyName && (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Nome:</strong> {currentKeyInfo.keyName}</p>
                <p><strong>Dica:</strong> {currentKeyInfo.keyHint}</p>
                <p><strong>Criada em:</strong> {formatDate(currentKeyInfo.createdAt)}</p>
                <p><strong>Última Atualização:</strong> {formatDate(currentKeyInfo.updatedAt)}</p>
                <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-400">
                  Esta é apenas uma referência à sua chave. A chave completa não é armazenada aqui.
                </p>
              </div>
            )}
            {!isLoadingInfo && !fetchError && !currentKeyInfo?.keyName && (
              <p className="text-gray-600 dark:text-gray-400">Você ainda não possui uma chave de API gerada.</p>
            )}
          </section>

          <ApiKeyGenerator onKeyGenerated={handleKeyGenerated} />
        </main>
      </div>
    </div>
  );

};
