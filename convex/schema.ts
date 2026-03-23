import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    // Custom fields from legacy users table
    verified: v.optional(v.boolean()),
    location: v.optional(v.object({
      city: v.string(),
      province: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    profile: v.optional(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      avatar: v.optional(v.string()),
      languages: v.array(v.string()),
      memberSince: v.number(),
      rating: v.number(),
      tradesCompleted: v.number(),
    })),
    nationalIdImage: v.optional(v.string()), // StorageId
    verificationLevel: v.optional(v.union(v.literal("basic"), v.literal("verified"), v.literal("premium"))),
    geolocked: v.optional(v.boolean()),
  }).index("email", ["email"]),

  items: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    subCategory: v.optional(v.string()),
    images: v.array(v.string()),
    condition: v.string(),
    estimatedValue: v.optional(v.number()),
    wants: v.array(v.string()),
    tags: v.array(v.string()),
    location: v.object({
      city: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      displayPrecise: v.boolean(),
    }),
    status: v.union(v.literal("available"), v.literal("pending"), v.literal("traded")),
    aiTags: v.optional(v.array(v.string())),
    viewCount: v.number(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_owner", ["ownerId"]),

  trades: defineTable({
    initiatorId: v.id("users"),
    receiverId: v.id("users"),
    initiatorItems: v.array(v.id("items")),
    receiverItems: v.array(v.id("items")),
    status: v.union(
      v.literal("pending"),
      v.literal("negotiating"),
      v.literal("accepted"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    terms: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    rating: v.optional(
      v.object({
        initiatorRating: v.optional(v.number()),
        receiverRating: v.optional(v.number()),
        feedback: v.optional(v.string()),
      })
    ),
  })
  .index("by_initiator", ["initiatorId"])
  .index("by_receiver", ["receiverId"]),

  messages: defineTable({
    tradeId: v.id("trades"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_trade", ["tradeId"]),
  
  favorites: defineTable({
    userId: v.id("users"),
    itemId: v.id("items"),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_item", ["itemId"])
  .index("by_user_item", ["userId", "itemId"]),
});
