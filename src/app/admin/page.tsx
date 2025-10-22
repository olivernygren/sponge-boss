import { requireAdmin } from "@/lib/auth";
import {
  Container,
  Heading,
  Text,
  Stack,
  Box,
  SimpleGrid,
  Separator,
} from "@chakra-ui/react";
import { ChecklistManager } from "@/components/ChecklistManager";
import { UserManagement } from "@/components/UserManagement";
import { getChecklistItems, getUsers } from "@/app/admin/actions";

export default async function AdminPage() {
  const session = await requireAdmin();
  const items = await getChecklistItems();
  const users = await getUsers();

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="fg.muted">
            Välkommen, {session.user.name}! Du har adminrättigheter.
          </Text>
        </Box>

        <SimpleGrid
          columns={2}
          gap={8}
          border="1px solid"
          borderColor="border"
          p={6}
          rounded="lg"
        >
          <UserManagement initialUsers={users} />
          <ChecklistManager initialItems={items} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
