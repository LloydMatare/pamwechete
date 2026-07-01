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
 * Gets a user by their email address. Used for uniqueness checks.
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    return user ?? null;
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

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found");

    const profile = existing.profile || {
      name: args.name,
      languages: ["English", "Shona"],
      memberSince: Date.now(),
      rating: 5,
      tradesCompleted: 0,
    };

    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
      verified: true,
      location: {
        city: args.city,
        province: args.province,
        coordinates: { lat: args.lat, lng: args.lng },
      },
      profile: {
        ...profile,
        name: args.name,
        email: args.email,
      },
      nationalIdImage: args.nationalIdImage,
      verificationLevel: "verified",
      geolocked: true,
    });
  },
});

/**
 * Edits the current user's profile fields without requiring location data.
 */
export const editProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found");

    const patch: Record<string, any> = {};
    const profilePatch: Record<string, any> = {};

    if (args.name) {
      patch.name = args.name;
      profilePatch.name = args.name;
    }
    if (args.email) {
      patch.email = args.email;
      profilePatch.email = args.email;
    }
    if (args.phone) patch.phone = args.phone;
    if (args.avatar) {
      patch.image = args.avatar;
      profilePatch.avatar = args.avatar;
    }
    if (args.city && existing.location) {
      patch.location = {
        ...existing.location,
        city: args.city,
      };
    } else if (args.city) {
      patch.location = {
        city: args.city,
        province: "",
        coordinates: { lat: 0, lng: 0 },
      };
    }

    if (Object.keys(profilePatch).length > 0) {
      patch.profile = {
        ...existing.profile,
        ...profilePatch,
      };
    }

    await ctx.db.patch(userId, patch);
  },
});

/**
 * Gets the total trade balance (TP) of the user's available items.
 */
export const getTradeBalance = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await auth.getUserId(ctx));
    if (!userId) return 0;
    
    const items = await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();
      
    return items.reduce((acc, item) => acc + (item.estimatedValue || 0), 0);
  },
});
