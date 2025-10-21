import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// Importera den "Provider" du vill använda. Google är enklast för ett kontor.
// Du kan lägga till fler senare (t.ex. Slack, eller E-post/Lösenord)
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export const authOptions = {
  // Tala om för Auth.js att använda Prisma för att spara användare, sessioner etc.
  adapter: PrismaAdapter(prisma),

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
    async session({ session, user }) {
      // Lägg till 'role' och 'id' från databas-användaren till session-objektet
      session.user.role = user.role; // user.role kommer från din Prisma-modell
      session.user.id = user.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
