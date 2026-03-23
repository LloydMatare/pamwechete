import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const imageUrls = await Promise.all(
      args.images.map(async (imageId) => {
        if (imageId.startsWith("http")) return imageId;
        const url = await ctx.storage.getUrl(imageId);
        return url ?? imageId;
      })
    );

    const itemId = await ctx.db.insert("items", {
      ownerId: userId,
      title: args.title,
      description: args.description,
      category: args.category,
      images: imageUrls,
      condition: args.condition,
      estimatedValue: args.estimatedValue,
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

export const getItems = query({
  args: {
    limit: v.number(),
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let itemsQuery = ctx.db.query("items");

    if (args.category) {
      itemsQuery = itemsQuery.filter(q => q.eq(q.field("category"), args.category));
    }

    const userId = await auth.getUserId(ctx);
    const items = await itemsQuery.order("desc").take(args.limit);

    // Filter out user's own items if they are logged in
    const filteredItems = userId
      ? items.filter(item => item.ownerId !== userId)
      : items;

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      return filteredItems.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return filteredItems;
  },
});

export const getByUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await auth.getUserId(ctx));
    if (!userId) return [];
    return await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

export const update = mutation({
  args: {
    id: v.id("items"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    images: v.array(v.string()),
    condition: v.string(),
    estimatedValue: v.optional(v.number()),
    wants: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");
    if (item.ownerId !== userId) throw new Error("Not authorized");

    const imageUrls = await Promise.all(
      args.images.map(async (imageId) => {
        if (imageId.startsWith("http")) return imageId;
        const url = await ctx.storage.getUrl(imageId);
        return url ?? imageId;
      })
    );

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      category: args.category,
      images: imageUrls,
      condition: args.condition,
      wants: args.wants,
      estimatedValue: args.estimatedValue,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");
    if (item.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});

export const getSimilar = query({
  args: { 
    itemId: v.id("items"), 
    category: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    
    // Find items in same category, exclude current item
    const items = await ctx.db
      .query("items")
      .filter((q) => 
        q.and(
          q.eq(q.field("category"), args.category),
          q.neq(q.field("_id"), args.itemId),
          q.eq(q.field("status"), "available")
        )
      )
      .take(args.limit);

    // Filter out user's own items if logged in
    return userId 
      ? items.filter(item => item.ownerId !== userId)
      : items;
  },
});
