import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Community Forum
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          {session ? (
            <>
              <Link href="/create-forum" className="hover:text-gray-300">
                Create Forum
              </Link>
              <div className="flex items-center">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-500 rounded-full" />
                )}
                <span className="ml-2">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}