"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Spinner, Box, Menu } from "@chakra-ui/react";
import { LuChevronDown, LuLogOut } from "react-icons/lu";

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
      <Button onClick={() => signIn("google")} rounded="lg">
        Logga in med Google
      </Button>
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="outline" rounded="lg">
            {session.user.name || "User"}
            <LuChevronDown />
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content rounded="lg">
            <Menu.Item value="signout" onClick={() => signOut()} rounded="lg">
              <LuLogOut />
              Logga ut
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    );
  }

  return null;
}
