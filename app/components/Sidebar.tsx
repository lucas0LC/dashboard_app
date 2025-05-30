import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="inline-flex w-40 bg-gray-800 text-white overflow-y-auto">
      <nav className="flex flex-col p-4 w-full">
        <Link href="/" className="py-2 hover:bg-gray-700 rounded">Dashboard</Link>
        <Link href="/relatorios" className="py-2 hover:bg-gray-700 rounded">Relatorios</Link>
        <Link href="/documents" className="py-2 hover:bg-gray-700 rounded">Documents</Link>
        <Link href="/config" className="py-2 hover:bg-gray-700 rounded">Configuração</Link>
      </nav>
    </div>
  );
}