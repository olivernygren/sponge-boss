"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// En hjälpfunktion för att kolla admin-status i varje action
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Ej auktoriserad");
  }
  return session.user;
}

// Hämta alla texter
export async function getChecklistItems() {
  return await prisma.rememberText.findMany({
    orderBy: { order: "asc" }, // Antaget att du har ett 'order'-fält
  });
}

// Lägg till en ny text
export async function addChecklistItem(formData: FormData) {
  await checkAdmin();

  const text = formData.get("text") as string;
  if (!text || text.trim() === "") {
    throw new Error("Text får inte vara tom");
  }

  await prisma.rememberText.create({
    data: { text },
  });

  revalidatePath("/admin");
}

// Uppdatera en text
export async function updateChecklistItem(id: string, text: string) {
  await checkAdmin();

  if (!text || text.trim() === "") {
    throw new Error("Text får inte vara tom");
  }

  await prisma.rememberText.update({
    where: { id },
    data: { text },
  });

  revalidatePath("/admin");
}

// Ta bort en text
export async function deleteChecklistItem(id: string) {
  await checkAdmin();

  await prisma.rememberText.delete({
    where: { id },
  });

  revalidatePath("/admin");
}

// Uppdatera ordning på flera texter
export async function updateChecklistOrder(
  items: { id: string; order: number }[]
) {
  await checkAdmin();

  await prisma.$transaction(
    items.map((item) =>
      prisma.rememberText.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidatePath("/admin");
}

// Hämta alla användare
export async function getUsers() {
  await checkAdmin(); // Bara admins får se användarlistan
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });
  // Return with explicit is_dormant field
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    is_dormant: (user as any).is_dormant ?? false,
    image: user.image,
  }));
}

// Uppdatera en användare
export async function updateUserSettings(formData: FormData) {
  await checkAdmin();

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as Role; // "ADMIN" or "MEMBER"
  const newDormantStatus = formData.get("is_dormant") === "true"; // Värdet från en switch

  if (!userId) throw new Error("Användar-ID saknas");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      is_dormant: newDormantStatus,
    } as any,
  });

  revalidatePath("/admin"); // Ladda om datan på adminsidan
}

export async function createUser(formData: FormData) {
  await checkAdmin(); // Återanvänd din admin-koll

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) throw new Error("Namn och e-post krävs");

  // Se till att e-posten är från er domän (extra säkerhet)
  // if (!email.endsWith("@dotnetmentor.se")) {
  //   throw new Error("Endast e-post från er domän är tillåten");
  // }

  // Kolla om användaren redan finns
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("En användare med denna e-post finns redan");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      role: "MEMBER", // Nya användare är alltid MEMBER som standard
    },
  });

  revalidatePath("/admin");
}

// Ta bort en användare permanent
export async function deleteUser(userId: string) {
  await checkAdmin();

  if (!userId) throw new Error("Användar-ID saknas");

  // Ta bort användaren och alla relaterade data (cascade)
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin");
}
