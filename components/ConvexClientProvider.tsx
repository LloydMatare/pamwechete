import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "https://dummy-url.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthProvider client={convex} storage={AsyncStorage}>
      {children}
    </ConvexAuthProvider>
  );
}
