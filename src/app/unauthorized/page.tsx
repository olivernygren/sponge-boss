import { Header } from "@/components/Header";
import { Box, Container, Heading, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <Box minH="100vh">
      <Header />
      <Container maxW="7xl" py={20}>
        <Box textAlign="center">
          <Heading size="3xl" mb={4}>
            403
          </Heading>
          <Heading size="xl" mb={4}>
            Unauthorized Access
          </Heading>
          <Text color="fg.muted" mb={8}>
            You must be logged in with a valid email domain to access this
            application.
          </Text>
          <Link href="/">
            <Button colorPalette="teal">Go Home</Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
