import { resetPasswordAction } from "../actions";
import Link from "next/link";

// Defina o tipo Message conforme sua necessidade
export type Message = {
  error?: string;
  message?: string;
};

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  // Aguarda os parâmetros da query (por exemplo, error ou message)
  const searchParams = await props.searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Redefinir senha</h1>
          <p className="text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>
        <form action={resetPasswordAction} method="POST">
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="password"
            >
              Nova senha
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              name="password"
              placeholder="Digite a senha nova"
              required
              type="password"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="confirmPassword"
            >
              Confirme a senha
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Digite a senha nova"
              required
              type="password"
            />
          </div>
          <div className="mb-6">
            <button
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              type="submit"
            >
              Redefinir
            </button>
          </div>
          {/* Exibe mensagem de erro, se houver */}
          {searchParams.error && (
            <div className="mb-4 text-center text-red-500">
              {searchParams.error}
            </div>
          )}
        </form>
        <div className="text-center">
          <Link className="text-blue-500 hover:underline" href="/sign-in">
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}