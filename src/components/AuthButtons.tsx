"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Spinner, Box, Menu } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Box>
        <Spinner size="md" colorPalette="teal" />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button onClick={() => signIn("google")} px={4}>
        Sign in with Google
      </Button>
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="outline">
            {session.user.name || "User"}
            <LuChevronDown />
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="signout" onClick={() => signOut()}>
              Sign out
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    );
  }

  return null;
}
