import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Use raw SQL to avoid OFFSET issue
        const users = await prisma.$queryRaw<Array<{ id: string; email: string; name: string; passwordHash: string; plan: string }>>`
          SELECT id, email, name, passwordHash, [plan] FROM [User] WHERE email = ${credentials.email}
        `;
        
        const user = users && users.length > 0 ? users[0] : null;

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        // Trim password hash in case there are any whitespace issues
        const trimmedHash = user.passwordHash.trim();
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          trimmedHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

