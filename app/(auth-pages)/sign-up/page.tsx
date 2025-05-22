import { signUpAction } from "../../actions";
import Link from "next/link";

interface Message {
  message?: string;
  error?: string;
  success?: string;
}

interface SignupProps {
  searchParams: Promise<Message>;
}

export default async function Signup({ searchParams }: SignupProps) {
  const resolvedSearchParams = await searchParams;

  // Se houver uma mensagem de sucesso, exiba-a em tela separada (opcional)
  if (resolvedSearchParams.success) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <div className="text-green-500 border-l-2 border-green-500 pl-4">
          {resolvedSearchParams.success}
          <Link className="text-blue-500 hover:underline ml-2" href="/sign-in">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Criar uma nova conta
        </h2>
        <form action={signUpAction} method="POST">
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="name">
              Nome
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="name"
              name="name"
              placeholder="Enter your name"
              type="text"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              name="email"
              placeholder="nome@email.com"
              type="email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="password">
              Senha
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              name="password"
              placeholder="******"
              type="password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="confirm-password">
              Confirme sua senha
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="confirm-password"
              name="confirm-password"
              placeholder="******"
              type="password"
              required
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            type="submit"
          >
            Cadastre-se
          </button>
          {/* Exibe mensagem de erro, se houver */}
          {resolvedSearchParams.error && (
            <div className="mt-4 text-center text-red-500">
              {resolvedSearchParams.error}
            </div>
          )}
        </form>
        <div className="flex items-center justify-center mt-6">
          <span className="text-gray-700">Já tem uma conta?</span>
          <Link className="text-blue-500 hover:underline ml-2" href="/sign-in">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
