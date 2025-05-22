import { signInAction } from "../../actions";
import Link from "next/link";

interface SearchParams {
  error?: string,
  success?: string
}

interface LoginProps {
  searchParams: Promise<SearchParams>;
}

export default async function Login({ searchParams }: LoginProps) {
  // Aguarda a resolução dos parâmetros de busca
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Faça login com sua conta
        </h2>
        <form action={signInAction}>
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
              Password
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                className="mr-2"
                id="remember"
                type="checkbox"
                name="remember"
              />
              <label className="text-gray-700" htmlFor="remember">
                Lembrar
              </label>
            </div>
            <Link className="text-blue-500 hover:underline" href="/forgot-password">
              Esqueceu a senha?
            </Link>
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            type="submit"
          >
            Login
          </button>
          {/* Exibe a mensagem de erro ou success, se houver */}
          {resolvedSearchParams.error && (
            <div className="mt-4 text-center text-red-500">
              {resolvedSearchParams.error}
            </div>
          )}
          {resolvedSearchParams.success && (
            <div className="mt-4 text-center text-gray-500">
              {resolvedSearchParams.success}
            </div>
          )}
        </form>
        <div className="flex items-center justify-center mt-6">
          <span className="text-gray-700">Não tem uma conta?</span>
          <Link className="text-blue-500 hover:underline ml-2" href="/sign-up">
            Cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}
