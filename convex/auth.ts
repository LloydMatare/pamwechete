import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          verified: true,
          location: {
            city: params.city as string,
            province: params.province as string,
            coordinates: { 
              lat: parseFloat(params.lat as string), 
              lng: parseFloat(params.lng as string) 
            },
          },
          profile: {
            name: params.name as string,
            email: params.email as string,
            languages: ["English", "Shona"],
            memberSince: Date.now(),
            rating: 5,
            tradesCompleted: 0,
          },
          nationalIdImage: params.nationalIdImage as string,
          verificationLevel: "verified",
          geolocked: true,
        };
      },
    }),
  ],
});
