import React, { useState, useRef } from "react";

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v5.25" />
  </svg>
);

const LoadingSpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const PdfFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-400 dark:text-red-500">
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
    <path d="M12.971 1.816A5.23 5.23 0 0114.25 1.5a.75.75 0 01.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 01.53.22l.22.22a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 010-1.06l.22-.22c.151-.149.35-.22.53-.22Z" />
  </svg>
);

interface ReportForUploader {
  id: string | number;
  report_period: string;
}

interface PdfUploaderProps {
  onUploadSuccess: (newReport: ReportForUploader) => void;
}

export default function PdfUploader({ onUploadSuccess }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setSuccessMessage(null);
    setError(null);

    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        setFile(null);
        setError("Por favor, selecione um arquivo PDF válido.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione um arquivo PDF.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parseData", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Erro ${response.status} ao processar o arquivo.`;
        } catch (jsonError: unknown) {
          // Se a resposta não for JSON, tenta ler como texto
          if(jsonError instanceof Error){
            const textError = await response.text();
            errorMessage = textError || jsonError.message;
          }
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(result.data);
      if (result.data) {
        onUploadSuccess(result.data as ReportForUploader);
      }

      setSuccessMessage(result?.message || "Arquivo enviado e processado com sucesso!");
      setFile(null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
        if(err instanceof Error){
          console.error("Erro ao processar o arquivo:", err);
          setError(err.message || "Erro de conexão ou ao processar o arquivo. Tente novamente.");
        }
    } finally {
      setLoading(false);
    }
  };

  console.log(successMessage);
  

  return (
    <div className="max-w-xl mx-auto bg-gray-700 p-6 sm:p-8 rounded-lg shadow-xl text-gray-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Área de Upload Customizada */}
        <div>
          <label 
            htmlFor="pdf-file-input" 
            className={`
              flex flex-col items-center justify-center w-full h-32 px-4 
              border-2 border-gray-600 border-dashed rounded-lg 
              cursor-pointer transition-colors duration-200 ease-in-out
              ${file ? 'bg-gray-700 border-indigo-500' : 'bg-gray-700/50 hover:bg-gray-700 hover:border-indigo-500'}
            `}
          >
            <input 
              id="pdf-file-input"
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="hidden" 
            />
            {!file && (
              <>
                <UploadIcon />
                <span className="font-medium text-gray-400">
                  Arraste um PDF aqui ou{" "}
                  <span className="text-indigo-400 hover:text-indigo-300">clique para selecionar</span>
                </span>
                <p className="mt-1 text-xs text-gray-500">Apenas arquivos .PDF são permitidos (máx. 10MB)</p>
              </>
            )}

            {file && (
              <div className="text-center">
                <PdfFileIcon />
                <p className="mt-2 text-sm font-medium text-gray-200">{file.name}</p>
                <p className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</p>
                <button 
                  type="button" 
                  onClick={handleRemoveFile} 
                  className="mt-3 text-xs text-red-400 hover:text-red-300 hover:underline focus:outline-none"
                >
                  Remover arquivo
                </button>
              </div>
            )}
          </label>
        </div>

        {/* Mensagem de Erro Global do Input */}
        {error && !file && ( // Mostra erro de validação de arquivo apenas se nenhum arquivo estiver selecionado
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}
        
        <button 
          type="submit" 
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <LoadingSpinnerIcon />
              Processando...
            </>
          ) : (
            "Enviar e Processar PDF"
          )}
        </button>
      </form>

      {/* Feedback após o envio */}
      {error && file && ( // Mostra erro de envio apenas se um arquivo estava selecionado
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-md text-sm">
          <p><strong className="font-semibold">Falha no Envio:</strong> {error}</p>
        </div>
      )}
      {successMessage && (
         <div className="mt-6 p-4 bg-green-900/30 border border-green-700 text-green-300 rounded-md text-sm">
          <p><strong className="font-semibold">Sucesso:</strong> {successMessage}</p>
        </div>
      )}
    </div>
  );
}