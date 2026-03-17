import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
    args: {
        tradeId: v.id("trades"),
        senderId: v.id("users"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            tradeId: args.tradeId,
            senderId: args.senderId,
            content: args.content,
            createdAt: Date.now(),
        });
    },
});

export const getByTrade = query({
    args: { tradeId: v.id("trades") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_trade", (q) => q.eq("tradeId", args.tradeId))
            .order("asc")
            .collect();
    },
});
