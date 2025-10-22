"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  Field,
} from "@chakra-ui/react";
import { Portal, Dialog, CloseButton } from "@chakra-ui/react";
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

interface CreateItemForm {
  text: string;
}

export function ChecklistManager({ initialItems }: ChecklistManagerProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createForm = useForm<CreateItemForm>();

  async function handleAddItem(data: CreateItemForm) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", data.text);
      await addChecklistItem(formData);

      toaster.create({
        title: "Lyckades!",
        description: "Ny text tillagd",
        type: "success",
      });

      setCreateDialogOpen(false);
      createForm.reset();
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
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="xl">Kom-ihåg texter</Heading>

        {/* Create Item Dialog */}
        <Dialog.Root
          open={createDialogOpen}
          onOpenChange={(e) => setCreateDialogOpen(e.open)}
        >
          <Dialog.Trigger asChild>
            <Button rounded="lg">
              <LuPlus />
              Lägg till text
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Lägg till kom-ihåg-text</Dialog.Title>
                </Dialog.Header>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
                <form onSubmit={createForm.handleSubmit(handleAddItem)}>
                  <Dialog.Body>
                    <Field.Root
                      invalid={!!createForm.formState.errors.text}
                      required
                    >
                      <Field.Label>Text</Field.Label>
                      <Input
                        {...createForm.register("text", {
                          required: "Text krävs",
                        })}
                        placeholder="Ange kom-ihåg-text..."
                      />
                      {createForm.formState.errors.text && (
                        <Field.ErrorText>
                          {createForm.formState.errors.text.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline" rounded="lg">
                        Avbryt
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button
                      type="submit"
                      colorPalette="teal"
                      loading={isLoading}
                      rounded="lg"
                    >
                      Lägg till
                    </Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
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
    </Box>
  );
}
