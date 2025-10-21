import { Header } from "@/components/Header";
import { Box } from "@chakra-ui/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main">{children}</Box>
    </Box>
  );
}
