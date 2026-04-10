#!/usr/bin/env node
import { connect } from "getstream"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const API_KEY = process.env.MCP_GETSTREAM_API_KEY
const API_SECRET = process.env.MCP_GETSTREAM_SECRET

if (!API_KEY || !API_SECRET) {
  console.error(
    "MCP_GETSTREAM_API_KEY and MCP_GETSTREAM_SECRET env vars are required",
  )
  process.exit(1)
}

const client = connect(API_KEY, API_SECRET)

export const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
})

export const err = (msg: string) => ({
  content: [{ type: "text" as const, text: `Error: ${msg}` }],
})

// ─── Feed Following ───

export const getFeedFollowing = async ({
  feed_slug,
  feed_id,
  limit = 100,
}: {
  feed_slug: string
  feed_id: string
  limit?: number
}) => {
  try {
    const feed = client.feed(feed_slug, feed_id)
    const result = await feed.following({ limit })
    return ok(result)
  } catch (e) {
    return err(`Failed to get following for ${feed_slug}:${feed_id} — ${e}`)
  }
}

// ─── Feed Followers ───

export const getFeedFollowers = async ({
  feed_slug,
  feed_id,
  limit = 100,
  offset = 0,
}: {
  feed_slug: string
  feed_id: string
  limit?: number
  offset?: number
}) => {
  try {
    const feed = client.feed(feed_slug, feed_id)
    const result = await feed.followers({ limit, offset })
    return ok(result)
  } catch (e) {
    return err(`Failed to get followers for ${feed_slug}:${feed_id} — ${e}`)
  }
}

// ─── Feed Activities ───

export const getFeedActivities = async ({
  feed_slug,
  feed_id,
  limit = 10,
}: {
  feed_slug: string
  feed_id: string
  limit?: number
}) => {
  try {
    const feed = client.feed(feed_slug, feed_id)
    const result = await feed.get({ limit })
    return ok(result)
  } catch (e) {
    return err(`Failed to get activities for ${feed_slug}:${feed_id} — ${e}`)
  }
}

// ─── Feed Follow ───

export const followFeed = async ({
  source_feed_slug,
  source_feed_id,
  target_feed_slug,
  target_feed_id,
  confirm,
}: {
  source_feed_slug: string
  source_feed_id: string
  target_feed_slug: string
  target_feed_id: string
  confirm: boolean
}) => {
  if (!confirm) {
    return err("confirm must be true to create a follow relationship")
  }
  try {
    const feed = client.feed(source_feed_slug, source_feed_id)
    const result = await feed.follow(target_feed_slug, target_feed_id)
    return ok(result)
  } catch (e) {
    return err(`Failed to follow ${target_feed_slug}:${target_feed_id} — ${e}`)
  }
}

// ─── Feed Unfollow ───

export const unfollowFeed = async ({
  source_feed_slug,
  source_feed_id,
  target_feed_slug,
  target_feed_id,
  confirm,
}: {
  source_feed_slug: string
  source_feed_id: string
  target_feed_slug: string
  target_feed_id: string
  confirm: boolean
}) => {
  if (!confirm) {
    return err("confirm must be true to remove a follow relationship")
  }
  try {
    const feed = client.feed(source_feed_slug, source_feed_id)
    const result = await feed.unfollow(target_feed_slug, target_feed_id)
    return ok(result)
  } catch (e) {
    return err(
      `Failed to unfollow ${target_feed_slug}:${target_feed_id} — ${e}`,
    )
  }
}

const server = new McpServer({ name: "mcp-getstream-feeds", version: "1.0.0" })

// ─── Tool Registration ───

server.registerTool(
  "getstream_feed_following",
  {
    description:
      "Get what feeds a specific feed follows (i.e. what a feed is subscribed to). Example: feed_slug=notification, feed_id=user_123",
    inputSchema: {
      feed_slug: z.string().describe('Feed slug (e.g. "notification")'),
      feed_id: z.string().describe('Feed ID (e.g. "user_123")'),
      limit: z
        .number()
        .default(100)
        .describe("Max number of results to return"),
    },
  },
  getFeedFollowing,
)

server.registerTool(
  "getstream_feed_followers",
  {
    description:
      "Get followers of a specific feed (i.e. who is subscribed to a feed). Example: feed_slug=timeline, feed_id=timeline_global",
    inputSchema: {
      feed_slug: z.string().describe('Feed slug (e.g. "timeline")'),
      feed_id: z.string().describe('Feed ID (e.g. "timeline_global")'),
      limit: z
        .number()
        .default(100)
        .describe("Max number of results to return"),
      offset: z.number().default(0).describe("Pagination offset (max 999)"),
    },
  },
  getFeedFollowers,
)

server.registerTool(
  "getstream_feed_activities",
  {
    description: "Get recent activities on a feed with timestamps and payloads",
    inputSchema: {
      feed_slug: z.string().describe("Feed slug"),
      feed_id: z.string().describe("Feed ID"),
      limit: z
        .number()
        .default(10)
        .describe("Max number of activities to return"),
    },
  },
  getFeedActivities,
)

server.registerTool(
  "getstream_feed_follow",
  {
    description:
      "Subscribe a feed to another feed (create a follow relationship). Requires confirm: true as a safety gate.",
    inputSchema: {
      source_feed_slug: z
        .string()
        .describe("Slug of the feed that will follow"),
      source_feed_id: z.string().describe("ID of the feed that will follow"),
      target_feed_slug: z.string().describe("Slug of the feed to be followed"),
      target_feed_id: z.string().describe("ID of the feed to be followed"),
      confirm: z
        .boolean()
        .default(false)
        .describe("Must be true to execute the follow"),
    },
  },
  followFeed,
)

server.registerTool(
  "getstream_feed_unfollow",
  {
    description:
      "Unsubscribe a feed from another feed (remove a follow relationship). Requires confirm: true as a safety gate.",
    inputSchema: {
      source_feed_slug: z
        .string()
        .describe("Slug of the feed that will unfollow"),
      source_feed_id: z.string().describe("ID of the feed that will unfollow"),
      target_feed_slug: z
        .string()
        .describe("Slug of the feed to unfollow from"),
      target_feed_id: z.string().describe("ID of the feed to unfollow from"),
      confirm: z
        .boolean()
        .default(false)
        .describe("Must be true to execute the unfollow"),
    },
  },
  unfollowFeed,
)

const main = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("mcp-getstream-feeds running")
}

main().catch((e) => {
  console.error("Fatal:", e)
  process.exit(1)
})
