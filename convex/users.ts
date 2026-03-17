import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", args.phoneNumber))
      .unique();
  },
});

export const create = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    city: v.string(),
    province: v.string(),
    lat: v.number(),
    lng: v.number(),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    nationalIdImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      phoneNumber: args.phoneNumber,
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
      password: args.password,
      nationalIdImage: args.nationalIdImage,
      verificationLevel: "verified", // Assume verified if they uploaded ID for this demo
      geolocked: true,
    });
    return userId;
  },
});
