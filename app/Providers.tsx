"use client";

import { AuthLoadingView } from "@/features/auth/components/auth-loadin-view";
import { UnauthenticatedView } from "@/features/auth/components/unauthenticated-view";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  ConvexProvider,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>{children}</Authenticated>
        <Unauthenticated>
          <UnauthenticatedView />
        </Unauthenticated>
        <AuthLoading>
          <AuthLoadingView />
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
