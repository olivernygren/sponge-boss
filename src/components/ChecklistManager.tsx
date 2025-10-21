"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Input,
  Stack,
  Card,
  Flex,
  IconButton,
  Text,
  Heading,
} from "@chakra-ui/react";
import { LuTrash2, LuCheck, LuX, LuPencil, LuPlus } from "react-icons/lu";
import {
  addChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from "@/app/admin/actions";
import { toaster } from "@/components/ui/toaster";

interface RememberText {
  id: string;
  text: string;
  order: number;
}

interface ChecklistManagerProps {
  initialItems: RememberText[];
}

export function ChecklistManager({ initialItems }: ChecklistManagerProps) {
  const router = useRouter();
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddItem() {
    if (!newItemText.trim()) {
      toaster.create({
        title: "Varning",
        description: "Text får inte vara tom",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", newItemText);
      await addChecklistItem(formData);

      toaster.create({
        title: "Lyckades!",
        description: "Ny text tillagd",
        type: "success",
      });

      setNewItemText("");
      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error ? error.message : "Kunde inte lägga till text",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateItem(id: string) {
    if (!editText.trim()) {
      toaster.create({
        title: "Varning",
        description: "Text får inte vara tom",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateChecklistItem(id, editText);

      toaster.create({
        title: "Lyckades!",
        description: "Text uppdaterad",
        type: "success",
      });

      setEditingId(null);
      setEditText("");
      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error ? error.message : "Kunde inte uppdatera text",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Är du säker på att du vill ta bort denna text?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteChecklistItem(id);

      toaster.create({
        title: "Lyckades!",
        description: "Text borttagen",
        type: "success",
      });

      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error ? error.message : "Kunde inte ta bort text",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(item: RememberText) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditText("");
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Kom-ihåg texter
      </Heading>

      <Stack gap={8}>
        {/* Add new item form */}
        <Flex gap={2}>
          <Input
            placeholder="Lägg till ny kom-ihåg-text..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleAddItem();
              }
            }}
            disabled={isLoading}
            flex={1}
            rounded="lg"
          />
          <Button
            onClick={handleAddItem}
            colorPalette="teal"
            disabled={isLoading}
            loading={isLoading}
            loadingText="Lägger till..."
            rounded="lg"
          >
            <LuPlus />
            Lägg till
          </Button>
        </Flex>

        {/* List of items */}
        {initialItems.length === 0 ? (
          <Card.Root>
            <Card.Body>
              <Text color="fg.muted" textAlign="center">
                Inga texter ännu. Lägg till en ovan!
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          <Stack gap={2}>
            {initialItems.map((item) => (
              <Card.Root key={item.id}>
                <Card.Body rounded="lg" p={3}>
                  {editingId === item.id ? (
                    // Edit mode
                    <Flex gap={2} align="center">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateItem(item.id);
                          }
                          if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                        autoFocus
                        disabled={isLoading}
                        flex={1}
                        rounded="lg"
                      />
                      <IconButton
                        onClick={() => handleUpdateItem(item.id)}
                        colorPalette="green"
                        variant="ghost"
                        disabled={isLoading}
                        aria-label="Spara"
                        rounded="lg"
                      >
                        <LuCheck />
                      </IconButton>
                      <IconButton
                        onClick={cancelEditing}
                        variant="ghost"
                        disabled={isLoading}
                        aria-label="Avbryt"
                        rounded="lg"
                      >
                        <LuX />
                      </IconButton>
                    </Flex>
                  ) : (
                    // View mode
                    <Flex justify="space-between" align="center">
                      <Text flex={1}>{item.text}</Text>
                      <Flex gap={2}>
                        <IconButton
                          onClick={() => startEditing(item)}
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          aria-label="Redigera"
                          rounded="lg"
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteItem(item.id)}
                          colorPalette="red"
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          aria-label="Ta bort"
                          rounded="lg"
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Flex>
                    </Flex>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
