import Navbar from './Navbar';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Community Forum' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="A community forum application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="flex bg-black min-h-screen">
        <aside className="w-3/12 bg-black p-4">
          {/* Left Sidebar content here */}
        </aside>
        <main className="w-6/12 bg-black container mx-auto py-8 px-4">
          {children}
        </main>
        <aside className="w-3/12 bg-black p-4">
          {/* Right Sidebar content here */}
        </aside>
      </div>
    </>
  );
}