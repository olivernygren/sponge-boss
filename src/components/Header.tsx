"use client";

import { Box, ClientOnly, Container, Flex, Span } from "@chakra-ui/react";
import { AuthButtons } from "./AuthButtons";

export function Header() {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderBottomColor="border"
      py={4}
      position="sticky"
      top={0}
      bg="bg.subtle"
      zIndex={10}
    >
      <Container maxW="7xl" mx="auto">
        <Flex justify="space-between" align="center">
          <Box fontSize="xl" fontWeight="bold">
            Sponge Boss{" "}
            <Span
              textStyle="sm"
              fontWeight="medium"
              color="fg.muted"
              hideBelow="md"
            >
              – When kitchen responsibilities matter
            </Span>
          </Box>
          <ClientOnly>
            <AuthButtons />
          </ClientOnly>
        </Flex>
      </Container>
    </Box>
  );
}
