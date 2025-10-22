"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Stack,
  Card,
  Flex,
  IconButton,
  Text,
  Heading,
  Badge,
  Input,
  Field,
  Checkbox,
  createListCollection,
  Avatar,
} from "@chakra-ui/react";
import { Portal, Dialog, CloseButton, Select } from "@chakra-ui/react";
import {
  LuTrash2,
  LuPencil,
  LuPlus,
  LuUserX,
  LuShieldCheck,
} from "react-icons/lu";
import {
  createUser,
  updateUserSettings,
  deleteUser,
} from "@/app/admin/actions";
import { toaster } from "@/components/ui/toaster";
import type { Role } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  is_dormant: boolean;
  image: string | null;
}

interface UserManagementProps {
  initialUsers: User[];
}

interface CreateUserForm {
  name: string;
  email: string;
}

interface EditUserForm {
  role: Role;
  is_dormant: boolean;
}

const roles = createListCollection({
  items: [
    { label: "Member", value: "MEMBER" },
    { label: "Admin", value: "ADMIN" },
  ],
});

export function UserManagement({ initialUsers }: UserManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const createForm = useForm<CreateUserForm>();
  const editForm = useForm<EditUserForm>();

  async function handleCreateUser(data: CreateUserForm) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      await createUser(formData);

      toaster.create({
        title: "Lyckades!",
        description: "Användare skapad",
        type: "success",
      });

      setCreateDialogOpen(false);
      createForm.reset();
      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error ? error.message : "Kunde inte skapa användare",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateUser(data: EditUserForm) {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", selectedUser.id);
      formData.append("role", data.role);
      formData.append("is_dormant", data.is_dormant.toString());
      await updateUserSettings(formData);

      toaster.create({
        title: "Lyckades!",
        description: "Användare uppdaterad",
        type: "success",
      });

      setEditDialogOpen(false);
      setSelectedUser(null);
      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error
            ? error.message
            : "Kunde inte uppdatera användare",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);

      toaster.create({
        title: "Lyckades!",
        description: "Användare borttagen",
        type: "success",
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      router.refresh();
    } catch (error) {
      toaster.create({
        title: "Fel",
        description:
          error instanceof Error
            ? error.message
            : "Kunde inte ta bort användare",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openEditDialog(user: User) {
    setSelectedUser(user);
    editForm.reset({
      role: user.role,
      is_dormant: user.is_dormant,
    });
    setEditDialogOpen(true);
  }

  function openDeleteDialog(user: User) {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="xl">User Management</Heading>

        {/* Create User Dialog */}
        <Dialog.Root
          open={createDialogOpen}
          onOpenChange={(e) => setCreateDialogOpen(e.open)}
        >
          <Dialog.Trigger asChild>
            <Button rounded="lg">
              <LuPlus />
              Lägg till användare
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Skapa ny användare</Dialog.Title>
                </Dialog.Header>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
                <form onSubmit={createForm.handleSubmit(handleCreateUser)}>
                  <Dialog.Body>
                    <Stack gap={4}>
                      <Field.Root
                        invalid={!!createForm.formState.errors.name}
                        required
                      >
                        <Field.Label>Namn</Field.Label>
                        <Input
                          {...createForm.register("name", {
                            required: "Namn krävs",
                          })}
                          placeholder="Ange namn"
                        />
                        {createForm.formState.errors.name && (
                          <Field.ErrorText>
                            {createForm.formState.errors.name.message}
                          </Field.ErrorText>
                        )}
                      </Field.Root>

                      <Field.Root
                        invalid={!!createForm.formState.errors.email}
                        required
                      >
                        <Field.Label>E-post</Field.Label>
                        <Input
                          {...createForm.register("email", {
                            required: "E-post krävs",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Ogiltig e-postadress",
                            },
                          })}
                          placeholder="användare@example.com"
                          type="email"
                        />
                        {createForm.formState.errors.email && (
                          <Field.ErrorText>
                            {createForm.formState.errors.email.message}
                          </Field.ErrorText>
                        )}
                      </Field.Root>
                    </Stack>
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
                      Skapa
                    </Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Flex>

      {/* User List */}
      {initialUsers.length === 0 ? (
        <Card.Root>
          <Card.Body>
            <Text color="fg.muted" textAlign="center">
              Inga användare ännu.
            </Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <Stack gap={2}>
          {initialUsers.map((user) => (
            <Card.Root key={user.id}>
              <Card.Body p={3}>
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={3} flex={1}>
                    <Avatar.Root size="md">
                      <Avatar.Fallback name={user.name || "?"} />
                      <Avatar.Image src={user.image || undefined} />
                    </Avatar.Root>
                    <Box flex={1}>
                      <Flex align="center" gap={2}>
                        <Text fontWeight="medium">{user.name || "N/A"}</Text>
                        {user.role === "ADMIN" && (
                          <Badge
                            colorPalette="purple"
                            variant="surface"
                            rounded="full"
                          >
                            <LuShieldCheck /> ADMIN
                          </Badge>
                        )}
                        {user.is_dormant && (
                          <Badge
                            colorPalette="gray"
                            variant="surface"
                            rounded="full"
                          >
                            <LuUserX /> Vilande
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="fg.muted">
                        {user.email || "Ingen e-post"}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex gap={2}>
                    <IconButton
                      onClick={() => openEditDialog(user)}
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      aria-label="Redigera"
                      rounded="lg"
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      onClick={() => openDeleteDialog(user)}
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
              </Card.Body>
            </Card.Root>
          ))}
        </Stack>
      )}

      {/* Edit User Dialog */}
      <Dialog.Root
        open={editDialogOpen}
        onOpenChange={(e) => setEditDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Redigera användare</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <form onSubmit={editForm.handleSubmit(handleUpdateUser)}>
                <Dialog.Body>
                  <Stack gap={4}>
                    <Controller
                      control={editForm.control}
                      name="role"
                      render={({ field }) => (
                        <Field.Root>
                          <Field.Label>Roll</Field.Label>
                          <Select.Root
                            collection={roles}
                            value={[field.value]}
                            onValueChange={(e) => field.onChange(e.value[0])}
                            positioning={{ sameWidth: true }}
                          >
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Välj roll" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                              <Select.Content>
                                {roles.items.map((role) => (
                                  <Select.Item item={role} key={role.value}>
                                    {role.label}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Select.Root>
                        </Field.Root>
                      )}
                    />

                    <Controller
                      control={editForm.control}
                      name="is_dormant"
                      render={({ field }) => (
                        <Field.Root>
                          <Checkbox.Root
                            gap={4}
                            alignItems="start"
                            checked={field.value}
                            onCheckedChange={(e) => field.onChange(e.checked)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Stack gap="0">
                              <Checkbox.Label>Vilande användare</Checkbox.Label>
                              <Text textStyle="sm" color="fg.muted">
                                En vilande användare visas inte i scheman
                              </Text>
                            </Stack>
                          </Checkbox.Root>
                        </Field.Root>
                      )}
                    />
                  </Stack>
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
                    Spara
                  </Button>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete User Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(e) => setDeleteDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Ta bort användare</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <Text>
                  Är du säker på att du vill ta bort{" "}
                  <Text as="span" fontWeight="bold">
                    {selectedUser?.name}
                  </Text>
                  ? Denna åtgärd kan inte ångras.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" rounded="lg">
                    Avbryt
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  onClick={handleDeleteUser}
                  colorPalette="red"
                  loading={isLoading}
                  rounded="lg"
                >
                  Ta bort
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
