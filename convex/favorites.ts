import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Toggles an item in the user's favorites.
 */
export const toggle = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", userId).eq("itemId", args.itemId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed from favorites
    } else {
      await ctx.db.insert("favorites", {
        userId,
        itemId: args.itemId,
        createdAt: Date.now(),
      });
      return true; // Added to favorites
    }
  },
});

/**
 * Checks if an item is favorited by the current user.
 */
export const isFavorite = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", userId).eq("itemId", args.itemId)
      )
      .unique();

    return !!favorite;
  },
});

/**
 * Lists all favorited items for the current user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const items = await Promise.all(
      favorites.map(async (fav) => {
        return await ctx.db.get(fav.itemId);
      })
    );

    return items.filter((item) => item !== null);
  },
});
