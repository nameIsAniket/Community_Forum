import Navbar from './Navbar';
import Head from 'next/head';
import Link from 'next/link';
import { useSession} from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}


export default function Layout({ children, title = 'Community Forum' }: LayoutProps) {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="A community forum application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed w-full border-b border-gray-700">
        <Navbar />  
      </div>
      
      <div className="flex bg-black min-h-screen pt-16">
        <aside className="w-3/12 bg-black my-4 p-4 fixed">
        {session ? <>
          <Link href="/create-forum" className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white">
                  New Forum
          </Link>
        </> : null}
        </aside>
        
        <main className="w-6/12 bg-black container mx-auto py-2 px-4 ml-3/12 overflow-y-auto">
          {children}
        </main>

        <aside className="w-3/12 bg-black my-4 p-4 fixed right-0 h-full">
          {/* Right Sidebar content here */}
        </aside>
      </div>
    </>
  );
}