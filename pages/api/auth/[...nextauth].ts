
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import JWT from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs"; 

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), 
  // Use JWT for session storage
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Make sure credentials are provided
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }
        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }
        // Compare the provided password with the stored hash
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }
        // Return the user object if credentials are valid.
        return user;
      },
    }),
  ],
  
  callbacks: {
    // The session callback is invoked whenever a session is checked.
    session: async ({ session, token }): Promise<Session> => {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    // The JWT callback is called when a token is created or updated.
    jwt: async ({ token, user }): Promise<JWT.JWT> => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true,
  // Uncomment the following line if you want to use Prisma for user persistence.
  // adapter: PrismaAdapter(prisma),
};

export default NextAuth(authOptions);
