import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Image from 'next/image';

interface Forum {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  _count: {
    comments: number;
  };
}

export default function Home() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForums() {
      try {
        const response = await fetch('/api/proxy/forums');
        if (response.ok) {
          const data = await response.json();
          setForums(data);
        }
      } catch (error) {
        console.error('Error fetching forums:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchForums();
  }, []);

  return (
    <Layout title="Community Forum - Home">
      {loading ? (
        <div className="text-center py-10">Loading forums...</div>
      ) : forums.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No forums yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="border-b border-gray-700 p-6 shadow-sm hover:shadow-md transition"
            >
              <Link href={`/forums/${forum.id}`}>
                <h2 className="text-xl font-semibold mb-2">{forum.title}</h2>
              </Link>
              <p className="text-gray-600 mb-4">
                {forum.description.length > 150
                  ? `${forum.description.substring(0, 150)}...`
                  : forum.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="mr-2">
                    {forum.user.image ? (
                      <Image
                        src={forum.user.image}
                        alt={forum.user.name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <span>Posted by {forum.user.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{new Date(forum.createdAt).toLocaleDateString()}</span>
                  <span>{forum._count.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}