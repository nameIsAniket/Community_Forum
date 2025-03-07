import { getProviders, signIn } from 'next-auth/react'
import { GetServerSideProps } from 'next'
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
  return (
    <Layout title="Sign In">
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to Community Forum</h1>
        
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <div key={provider.id} className="flex justify-center">
              <button
                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in with {provider.name}
              </button>
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
    console.log(providers);
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
