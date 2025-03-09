import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  image: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Forum {
  id: string;
  title: string;
  description: string;
  tags: string | null;
  createdAt: string;
  userId: string;
  user: User;
  comments: Comment[];
}

export default function ForumDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchForum() {
      try {
        const response = await fetch(`/api/proxy/forums/${id}`);
        if (response.ok) {
          const data = await response.json();
          setForum(data);
        } else {
          setError('Failed to load forum');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchForum();
  }, [id]);

  const handleDelete = async () => {
    if (!forum || !confirm('Are you sure you want to delete this forum?')) return;

    try {
      const response = await fetch(`/api/proxy/forums/${forum.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        router.push('/');
      } else {
        setError('Failed to delete forum');
      }
    } catch {
      setError('An error occurred');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;
    if (!session) {
      alert('You must be signed in to comment');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/proxy/forums/${forum?.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentContent }),
      });
      
      if (response.ok) {
        const newComment = await response.json();
        setForum((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: [newComment, ...prev.comments],
          };
        });
        setCommentContent('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/proxy/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setForum((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.filter((comment) => comment.id !== commentId),
          };
        });
      } else {
        setError('Failed to delete comment');
      }
    } catch {
      setError('An error occurred');
    }
  };

  if (loading) {
    return (
      <Layout title="Loading Forum">
        <div className="text-center py-10">Loading forum...</div>
      </Layout>
    );
  }

  if (error || !forum) {
    return (
      <Layout title="Error">
        <div className="text-center py-10 text-red-600">
          {error || 'Forum not found'}
        </div>
      </Layout>
    );
  }

  const parsedTags = forum.tags ? JSON.parse(forum.tags) : [];
  const isOwner = session?.user?.id === forum.userId;

  return (
    <Layout title={`${forum.title} | Community Forum`}>
      <div className="mb-8 mt-4">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{forum.title}</h1>
          {isOwner && (
            <div className="flex space-x-2">
              <Link
                href={`/forums/${forum.id}/edit`}
                className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center mr-4">
            {forum.user.image ? (
              <Image
                src={forum.user.image}
                alt={forum.user.name || 'User'}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
            )}
            <span>Posted by {forum.user.name}</span>
          </div>
          <span>{new Date(forum.createdAt).toLocaleString()}</span>
        </div>
        
        <div className="prose max-w-none mb-6">
          <p>{forum.description}</p>
        </div>
        
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {parsedTags.map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-800 px-2 py-1 text-sm rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 pt-6">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        
        {session ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="mb-3">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <button
                onClick={() => router.push('/auth/signin')}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white my-4"
              >
                Please sign in to comment
          </button>
        )}
        
        {forum.comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet.
          </div>
        ) : (
          <ul>
            {forum.comments.map((comment) => (
              <li key={comment.id} className="mb-4">
                <div className="flex items-start">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name || 'User'}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{comment.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 border-b border-gray-700 pb-2">
                      <p>{comment.content}</p>
                      {session?.user?.id === comment.user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center justify-center py-1 px-2 border border-gray-600 rounded-md shadow-sm bg-[#27272A] text-white "
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}