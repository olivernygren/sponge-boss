import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

// Importera den "Provider" du vill använda. Google är enklast för ett kontor.
// Du kan lägga till fler senare (t.ex. Slack, eller E-post/Lösenord)
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  // Tala om för Auth.js att använda Prisma för att spara användare, sessioner etc.
  adapter: PrismaAdapter(prisma) as Adapter,

  // Här listar du dina inloggningsmetoder
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ...du kan lägga till fler providers här
  ],

  // Detta är avgörande för att lägga till ROLLEn (ADMIN/MEMBER) i sessionen
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email as string | undefined;

      const validDomains = ["dotnetmentor.se", "ferrysystems.com"];

      if (
        email &&
        validDomains.some((domain) => email.endsWith(`@${domain}`))
      ) {
        return true;
      } else {
        return "/unauthorized";
      }
    },

    async session({ session, user }) {
      // Lägg till 'role' och 'id' från databas-användaren till session-objektet
      if (session.user) {
        session.user.role = user.role;
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
