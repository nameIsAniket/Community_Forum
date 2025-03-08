// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, Session } from "next-auth";
import JWT from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

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
  ],
  callbacks: {
    // The session callback is invoked whenever a session is checked.
    // Here we attach the user id from the token to the session object.
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
