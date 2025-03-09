import { getProviders, signIn } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Layout from '../../components/Layout'

interface Provider {
  id: string
  name: string
  type: string
}

interface SignInProps {
  providers: Record<string, Provider>
}

export default function SignIn({ providers }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Sign-in failed. Please check your credentials and try again.')
      } else {
        window.location.href = '/'
      }
    } catch {
      setError('Sign-in failed. Please check your credentials and try again.')
    }
  }

  return (
    <Layout title="Sign In">
      <div className="max-w-md mx-auto my-16 p-6 bg-black border border-gray-700 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to Community Forum</h1>
        
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <div key={provider.id} className="flex justify-center">
              {provider.id === 'credentials' ? (
                <form onSubmit={handleSubmit}  className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder='projectforum@mm.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full h-10 border-gray-600 bg-gray-800 text-white rounded-md shadow-sm px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full h-10 border-gray-600 bg-gray-800 text-white rounded-md shadow-sm px-3"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#2727A] text-white mt-8"
                  >
                    Sign in with {provider.name}
                  </button>
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </form>
              ) : (
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#2727A] text-white mt-2"
                >
                  Sign in with {provider.name}
                </button>
              )}
            </div>
          ))} 
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const providers = await getProviders();
    //console.log("Providers:", providers);
    return {
      props: { providers },
    }
  } catch (error) {
    console.error("Error fetching providers:", error)
    return {
      props: { providers: {} },
    }
  }
}
