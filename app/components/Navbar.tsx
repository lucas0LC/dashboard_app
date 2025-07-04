import AuthButton  from "./auth/UserAction";
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar(){
    return(
        <nav className="sticky top-0 z-30 h-16 w-full items-center justify-between bg-white px-4 shadow-md dark:bg-gray-800">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                            </svg>
                        </button>
                        <Link href="/" className="flex ms-2 md:me-24">
                        <Image src="/logo.png" alt="Dashboard Logo" width={50} height={50} />
                            <span className="self-center text-xl ml-2 font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Dashboard</span>
                        </Link>
                    </div>
                    <div className="p-4">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}