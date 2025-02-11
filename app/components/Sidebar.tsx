import Link from 'next/link';
import AuthButton  from "./auth/UserId";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen fixed bg-gray-800 text-white">
      <h2 className="text-lg font-bold p-4">Dashboard</h2>
      <nav className="flex flex-col p-4">
        <Link href="/" className="py-2 hover:bg-gray-700 rounded">Dashboard</Link>
        <Link href="/relatorios" className="py-2 hover:bg-gray-700 rounded">Relatorios</Link>
        <Link href="/documents" className="py-2 hover:bg-gray-700 rounded">Documents</Link>
        <Link href="/config" className="py-2 hover:bg-gray-700 rounded">Configuração</Link>
      </nav>
      <div className="p-4">
        <AuthButton />
      </div>
    </div>
  );
}