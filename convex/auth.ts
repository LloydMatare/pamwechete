import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Phone } from "@convex-dev/auth/providers/Phone";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
    Phone({
      // Zimbabwe specific implementation would go here
      // For now using the standard Phone provider which can be customized
    }),
  ],
});
