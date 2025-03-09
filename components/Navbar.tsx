import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black text-white p-4 ">
      <div className="container mx-auto flex justify-between items-center ">
        <Link href="/" className="text-xl font-bold">
          Community Forum
        </Link>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
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
                className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white">
                Sign Up
              </Link>
              <button
                onClick={() => signIn()}
                className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
