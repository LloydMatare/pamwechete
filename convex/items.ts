import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    images: v.array(v.string()),
    condition: v.string(),
    estimatedValue: v.optional(v.number()),
    wants: v.array(v.string()),
    location: v.object({
      city: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      displayPrecise: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Fetch user id from phoneNumber or subject
    const user = await ctx.db
      .query("users")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", identity.phoneNumber!))
      .unique();

    if (!user) throw new Error("User not found");

    const itemId = await ctx.db.insert("items", {
      ownerId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      images: args.images,
      condition: args.condition,
      wants: args.wants,
      tags: [], // Will be populated by AI in Phase 3
      location: args.location,
      status: "available",
      viewCount: 0,
      createdAt: Date.now(),
    });

    return itemId;
  },
});

export const getLatest = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .take(args.limit);
  },
});
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) {
      throw new Error("Please complete onboarding first to create a user before seeding.");
    }

    const dummyItems = [
      {
        title: "Solar Panel 200W",
        description: "Lightly used solar panel, perfect for home backup.",
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=400&auto=format&fit=crop"],
        condition: "Good",
        estimatedValue: 150,
        wants: ["Livestock", "Grain"],
        location: { city: "Harare", coordinates: { lat: -17.8252, lng: 31.0335 }, displayPrecise: false },
      },
      {
        title: "Brahman Bull Calf",
        description: "Healthy 6-month-old calf, vaccinated.",
        category: "Livestock",
        images: ["https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=400&auto=format&fit=crop"],
        condition: "New",
        estimatedValue: 450,
        wants: ["Solar Equipment", "Irrigation Pipes"],
        location: { city: "Bulawayo", coordinates: { lat: -20.1465, lng: 28.5703 }, displayPrecise: false },
      },
      {
        title: "Irrigation Pump",
        description: "Petrol powered, 3-inch outlet. High pressure.",
        category: "Agriculture",
        images: ["https://images.unsplash.com/photo-1589335640105-eb654a350101?q=80&w=400&auto=format&fit=crop"],
        condition: "Like New",
        estimatedValue: 300,
        wants: ["Fertilizer", "Seeds"],
        location: { city: "Mutare", coordinates: { lat: -18.9727, lng: 32.6695 }, displayPrecise: false },
      },
      {
        title: "Organic Maize Seeds",
        description: "50kg bag of high-yield drought-resistant seeds.",
        category: "Agriculture",
        images: ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=400&auto=format&fit=crop"],
        condition: "New",
        estimatedValue: 50,
        wants: ["Groceries", "Clothing"],
        location: { city: "Gweru", coordinates: { lat: -19.4524, lng: 29.8167 }, displayPrecise: false },
      }
    ];

    for (const item of dummyItems) {
      await ctx.db.insert("items", {
        ownerId: user._id,
        ...item,
        tags: [],
        status: "available",
        viewCount: Math.floor(Math.random() * 100),
        createdAt: Date.now(),
      });
    }

    return "Seeding successful!";
  },
});
