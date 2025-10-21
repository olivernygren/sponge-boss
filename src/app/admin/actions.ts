"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
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
