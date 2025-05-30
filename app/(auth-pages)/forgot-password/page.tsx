import { forgotPasswordAction } from "../../actions";
import Link from "next/link";

// Defina o tipo Message conforme sua necessidade
export type Message = {
  error?: string;
  success?: string;
};

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  // Aguarda os parâmetros da query (por exemplo, error ou success)
  const searchParams = await props.searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Esqueceu a senha</h1>
          <p className="text-gray-600">
            Digite seu e-mail para redefinir sua senha
          </p>
        </div>
        {/* O atributo "action" aponta para a server action que tratará o envio */}
        <form action={forgotPasswordAction} method="POST">
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              name="email"
              placeholder="nome@email.com"
              required
              type="email"
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
          {/* Exibe mensagem de sucesso, se houver */}
          {searchParams.success && (
            <div className="mb-4 text-center text-green-500">
              {searchParams.success}
            </div>
          )}
        </form>
        <div className="text-center">
          <Link className="text-blue-500 hover:underline" href="/sign-in">
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
}