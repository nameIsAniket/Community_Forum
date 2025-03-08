// pages/auth/signup.tsx

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        // Optionally, sign in automatically after successful signup
        await signIn('credentials', { email, password, callbackUrl: '/' });
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    <Layout title="Sign Up">
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
            </Link>
        </p>

      </div>
    </Layout>
  );
}
