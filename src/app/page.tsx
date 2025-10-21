import { Header } from "@/components/Header";
import { Box } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main">{/* Your app content will go here */}</Box>
    </Box>
  );
}
