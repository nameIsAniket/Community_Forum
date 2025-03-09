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
      <div className="max-w-md mx-auto my-16 p-6 bg-black border border-gray-800 text-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Community Forum</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">User name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User Name"
              required
              className="mt-1 block w-full h-12 border-gray-600 bg-gray-800 text-white rounded-md shadow-sm px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="projectforum@mm.com"
              required
              className="mt-1 block w-full h-12 border-gray-600 bg-gray-800 text-white rounded-md shadow-sm px-3"
            />
          </div>
          <div>
            <label className="block text-sm  font-semibold text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="mt-1 block w-full h-12 border-gray-600 bg-gray-800 text-white rounded-md shadow-sm px-3"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#2727A] text-white mt-8"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-300 text-center mt-4">Already have an account?</p>
        <div className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#2727A] text-white mt-4">
          <Link href="/auth/signin" >
            Sign in
          </Link>
        </div>
      </div>
    </Layout>
  );
}
