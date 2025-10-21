import { requireAdmin } from "@/lib/auth";
import { Container, Heading, Text, Stack, Box } from "@chakra-ui/react";
import { ChecklistManager } from "@/components/ChecklistManager";
import { getChecklistItems } from "@/app/admin/actions";

export default async function AdminPage() {
  const session = await requireAdmin();
  const items = await getChecklistItems();

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

        <ChecklistManager initialItems={items} />
      </Stack>
    </Container>
  );
}
