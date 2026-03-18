import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth as convexAuth } from "./auth";

export const create = mutation({
  args: {
    initiatorId: v.id("users"),
    receiverId: v.id("users"),
    initiatorItems: v.array(v.id("items")),
    receiverItems: v.array(v.id("items")),
    terms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if a pending trade already exists between these users for these items (simplified)
    const tradeId = await ctx.db.insert("trades", {
      initiatorId: args.initiatorId,
      receiverId: args.receiverId,
      initiatorItems: args.initiatorItems,
      receiverItems: args.receiverItems,
      status: "pending",
      terms: args.terms,
    });

    // Send an initial automated message
    await ctx.db.insert("messages", {
      tradeId,
      senderId: args.initiatorId,
      content: "I'd like to propose a trade!",
      createdAt: Date.now(),
    });

    return tradeId;
  },
});

export const getForUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await convexAuth.getUserId(ctx));
    if (!userId) return [];
    
    const initiated = await ctx.db
      .query("trades")
      .withIndex("by_initiator", (q) => q.eq("initiatorId", userId))
      .collect();
      
    const received = await ctx.db
      .query("trades")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .collect();

    // Map and fetch user details for each trade
    const allTrades = [...initiated, ...received].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    
    return Promise.all(allTrades.map(async (trade) => {
      const otherUserId = trade.initiatorId === userId ? trade.receiverId : trade.initiatorId;
      const otherUser = await ctx.db.get(otherUserId);
      return { ...trade, otherUser };
    }));
  },
});

export const get = query({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    const trade = await ctx.db.get(args.id);
    if (!trade) return null;

    const initiator = await ctx.db.get(trade.initiatorId);
    const receiver = await ctx.db.get(trade.receiverId);
    
    const initiatorItems = await Promise.all(trade.initiatorItems.map(id => ctx.db.get(id)));
    const receiverItems = await Promise.all(trade.receiverItems.map(id => ctx.db.get(id)));

    return { 
      ...trade, 
      initiator, 
      receiver, 
      initiatorItems: initiatorItems.filter(Boolean), 
      receiverItems: receiverItems.filter(Boolean) 
    };
  },
});

export const updateStatus = mutation({
  args: { 
    id: v.id("trades"), 
    status: v.union(
      v.literal("pending"),
      v.literal("negotiating"),
      v.literal("accepted"),
      v.literal("completed"),
      v.literal("cancelled")
    ) 
  },
  handler: async (ctx, args) => {
    const trade = await ctx.db.get(args.id);
    if (!trade) throw new Error("Trade not found");

    await ctx.db.patch(args.id, { 
      status: args.status,
      completedAt: args.status === "completed" ? Date.now() : trade.completedAt
    });
  },
});
