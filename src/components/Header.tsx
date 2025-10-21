"use client";

import {
  Box,
  Button,
  ClientOnly,
  Container,
  Flex,
  Group,
  Icon,
  Span,
} from "@chakra-ui/react";
import { AuthButtons } from "./AuthButtons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LuLock } from "react-icons/lu";

export function Header() {
  const { data: session } = useSession();

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
          <Flex align="center" gap={6}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box fontSize="xl" fontWeight="bold" cursor="pointer">
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
            </Link>
          </Flex>

          <Group gap={3}>
            {session?.user?.role === "ADMIN" && (
              <Button asChild variant="ghost" rounded="lg">
                <Link href="/admin">
                  <Icon size="sm">
                    <LuLock />
                  </Icon>
                  Admin
                </Link>
              </Button>
            )}
            <ClientOnly>
              <AuthButtons />
            </ClientOnly>
          </Group>
        </Flex>
      </Container>
    </Box>
  );
}
