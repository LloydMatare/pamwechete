import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Gets a user by their ID.
 */
export const get = query({
  args: { id: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

/**
 * Gets the current authenticated user's profile.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Updates the current authenticated user's profile data after registration.
 */
export const updateProfile = mutation({
  args: {
    name: v.string(),
    city: v.string(),
    province: v.string(),
    lat: v.number(),
    lng: v.number(),
    email: v.optional(v.string()),
    nationalIdImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      name: args.name,
      verified: true,
      location: {
        city: args.city,
        province: args.province,
        coordinates: { lat: args.lat, lng: args.lng },
      },
      profile: {
        name: args.name,
        email: args.email,
        languages: ["English", "Shona"],
        memberSince: Date.now(),
        rating: 5,
        tradesCompleted: 0,
      },
      nationalIdImage: args.nationalIdImage,
      verificationLevel: "verified",
      geolocked: true,
    });
  },
});
