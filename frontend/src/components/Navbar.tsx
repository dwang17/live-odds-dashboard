import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold text-red-600">
          OddsRadar
        </Link>


        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          <Link href="/search" className="hover:text-red-600">
            Search
          </Link>
          <Link href="/signin" className="hover:text-red-600">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}