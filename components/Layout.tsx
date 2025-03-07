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
      <main className="container mx-auto py-8 px-4">{children}</main>
    </>
  );
}