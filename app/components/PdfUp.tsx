import { useState } from "react";


export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null); // Limpa o erro se o arquivo for válido
    } else {
      setFile(null);
      setError("Por favor, selecione um arquivo PDF válido.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    setLoading(true);
    setError(null); // Limpa o erro antes de enviar

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parseData", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`Erro: ${errorData.error || errorData.message}`);
        return;
      }
      setFile(null); // Limpa o arquivo após o envio bem-sucedido
    } catch (error) {
      console.error("Erro ao processar o arquivo:", error);
      setError("Erro ao processar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          className="mb-2" 
        />
        <button 
          type="submit" 
          className="p-2 bg-blue-500 text-white rounded" 
          disabled={loading}
        >
          {loading ? "Processando..." : "Enviar PDF"}
        </button>
      </form>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
    </div>

  );

}