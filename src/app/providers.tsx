"use client";

import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { system } from "@/components/ui/theme";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider>{children}</ColorModeProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
