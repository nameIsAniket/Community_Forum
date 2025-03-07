import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useSession } from 'next-auth/react';

export default function EditForum() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchForum() {
      try {
        const response = await fetch(`/api/forums/${id}`);
        if (response.ok) {
          const forum = await response.json();
          
          // Check if user is the owner
          if (session?.user?.id !== forum.userId) {
            router.push(`/forums/${id}`);
            return;
          }
          
          setTitle(forum.title);
          setDescription(forum.description);
          
          if (forum.tags) {
            try {
              const parsedTags = JSON.parse(forum.tags);
              setTags(parsedTags.join(', '));
            } catch (e) {
              console.error('Error parsing tags:', e);
            }
          }
        } else {
          setError('Failed to load forum');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      fetchForum();
    }
  }, [id, session, status, router]);

  // Redirect if not authenticated
  if (status === 'loading' || loading) return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/forums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        }),
      });
      
      if (response.ok) {
        router.push(`/forums/${id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update forum');
      }
    } catch {
      setError('An error occurred while updating the forum');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Edit Forum">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Forum</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional, comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. javascript, react, nextjs"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Updating...' : 'Update Forum'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push(`/forums/${id}`)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}