import { describe, it, expect, vi, beforeEach } from "vitest"

const {
  mockFollowing,
  mockFollowers,
  mockGet,
  mockFollow,
  mockUnfollow,
  mockFeed,
} = vi.hoisted(() => {
  const mockFollowing = vi.fn()
  const mockFollowers = vi.fn()
  const mockGet = vi.fn()
  const mockFollow = vi.fn()
  const mockUnfollow = vi.fn()
  const mockFeed = vi.fn(() => ({
    following: mockFollowing,
    followers: mockFollowers,
    get: mockGet,
    follow: mockFollow,
    unfollow: mockUnfollow,
  }))
  return {
    mockFollowing,
    mockFollowers,
    mockGet,
    mockFollow,
    mockUnfollow,
    mockFeed,
  }
})

vi.hoisted(() => {
  process.env.MCP_GETSTREAM_API_KEY = "test-api-key"
  process.env.MCP_GETSTREAM_SECRET = "test-api-secret"
})

vi.mock("getstream", () => ({
  connect: vi.fn(() => ({ feed: mockFeed })),
}))

import {
  getFeedFollowing,
  getFeedFollowers,
  getFeedActivities,
  followFeed,
  unfollowFeed,
} from "../index.js"

const text = (result: { content: Array<{ text: string }> }) =>
  result.content[0].text

beforeEach(() => {
  mockFollowing.mockReset()
  mockFollowers.mockReset()
  mockGet.mockReset()
  mockFollow.mockReset()
  mockUnfollow.mockReset()
  mockFeed.mockClear()
})

// ─── getFeedFollowing ───

describe("getFeedFollowing", () => {
  it("returns following list on success", async () => {
    const results = [{ feed_id: "timeline:timeline_global" }]
    mockFollowing.mockResolvedValue({ results })
    const result = await getFeedFollowing({
      feed_slug: "notification",
      feed_id: "user_123",
    })
    expect(text(result)).toContain("timeline_global")
    expect(mockFeed).toHaveBeenCalledWith("notification", "user_123")
    expect(mockFollowing).toHaveBeenCalledWith({ limit: 100 })
  })

  it("passes custom limit", async () => {
    mockFollowing.mockResolvedValue({ results: [] })
    await getFeedFollowing({
      feed_slug: "notification",
      feed_id: "abc",
      limit: 25,
    })
    expect(mockFollowing).toHaveBeenCalledWith({ limit: 25 })
  })

  it("returns error when SDK throws", async () => {
    mockFollowing.mockRejectedValue(new Error("Unauthorised"))
    const result = await getFeedFollowing({
      feed_slug: "notification",
      feed_id: "abc",
    })
    expect(text(result)).toContain("Error:")
    expect(text(result)).toContain("notification:abc")
  })
})

// ─── getFeedFollowers ───

describe("getFeedFollowers", () => {
  it("returns followers list on success", async () => {
    const results = [{ feed_id: "notification:user_123" }]
    mockFollowers.mockResolvedValue({ results })
    const result = await getFeedFollowers({
      feed_slug: "timeline",
      feed_id: "timeline_global",
    })
    expect(text(result)).toContain("user_123")
    expect(mockFeed).toHaveBeenCalledWith("timeline", "timeline_global")
    expect(mockFollowers).toHaveBeenCalledWith({ limit: 100, offset: 0 })
  })

  it("passes custom limit and offset", async () => {
    mockFollowers.mockResolvedValue({ results: [] })
    await getFeedFollowers({
      feed_slug: "timeline",
      feed_id: "all",
      limit: 50,
      offset: 100,
    })
    expect(mockFollowers).toHaveBeenCalledWith({ limit: 50, offset: 100 })
  })

  it("returns error when SDK throws", async () => {
    mockFollowers.mockRejectedValue(new Error("Not found"))
    const result = await getFeedFollowers({
      feed_slug: "timeline",
      feed_id: "all",
    })
    expect(text(result)).toContain("Error:")
  })
})

// ─── getFeedActivities ───

describe("getFeedActivities", () => {
  it("returns activities on success", async () => {
    const results = [{ id: "act1", verb: "push", time: "2024-01-01T00:00:00Z" }]
    mockGet.mockResolvedValue({ results })
    const result = await getFeedActivities({
      feed_slug: "user_activity",
      feed_id: "artist_123",
    })
    expect(text(result)).toContain("act1")
    expect(mockGet).toHaveBeenCalledWith({ limit: 10 })
  })

  it("passes custom limit", async () => {
    mockGet.mockResolvedValue({ results: [] })
    await getFeedActivities({
      feed_slug: "notification",
      feed_id: "abc",
      limit: 5,
    })
    expect(mockGet).toHaveBeenCalledWith({ limit: 5 })
  })

  it("returns error when SDK throws", async () => {
    mockGet.mockRejectedValue(new Error("Feed not found"))
    const result = await getFeedActivities({
      feed_slug: "notification",
      feed_id: "abc",
    })
    expect(text(result)).toContain("Error:")
  })
})

// ─── followFeed ───

describe("followFeed", () => {
  it("creates follow relationship when confirm is true", async () => {
    mockFollow.mockResolvedValue({ duration: "5ms" })
    const result = await followFeed({
      source_feed_slug: "notification",
      source_feed_id: "user_123",
      target_feed_slug: "timeline",
      target_feed_id: "timeline_global",
      confirm: true,
    })
    expect(text(result)).toContain("5ms")
    expect(mockFollow).toHaveBeenCalledWith("timeline", "timeline_global")
  })

  it("blocks when confirm is false", async () => {
    const result = await followFeed({
      source_feed_slug: "notification",
      source_feed_id: "abc",
      target_feed_slug: "timeline",
      target_feed_id: "all",
      confirm: false,
    })
    expect(text(result)).toContain("confirm must be true")
    expect(mockFollow).not.toHaveBeenCalled()
  })

  it("returns error when SDK throws", async () => {
    mockFollow.mockRejectedValue(new Error("Permission denied"))
    const result = await followFeed({
      source_feed_slug: "notification",
      source_feed_id: "abc",
      target_feed_slug: "timeline",
      target_feed_id: "all",
      confirm: true,
    })
    expect(text(result)).toContain("Error:")
  })
})

// ─── unfollowFeed ───

describe("unfollowFeed", () => {
  it("removes follow relationship when confirm is true", async () => {
    mockUnfollow.mockResolvedValue({ duration: "3ms" })
    const result = await unfollowFeed({
      source_feed_slug: "notification",
      source_feed_id: "user_123",
      target_feed_slug: "timeline",
      target_feed_id: "timeline_global",
      confirm: true,
    })
    expect(text(result)).toContain("3ms")
    expect(mockUnfollow).toHaveBeenCalledWith("timeline", "timeline_global")
  })

  it("blocks when confirm is false", async () => {
    const result = await unfollowFeed({
      source_feed_slug: "notification",
      source_feed_id: "abc",
      target_feed_slug: "timeline",
      target_feed_id: "all",
      confirm: false,
    })
    expect(text(result)).toContain("confirm must be true")
    expect(mockUnfollow).not.toHaveBeenCalled()
  })

  it("returns error when SDK throws", async () => {
    mockUnfollow.mockRejectedValue(new Error("Not found"))
    const result = await unfollowFeed({
      source_feed_slug: "notification",
      source_feed_id: "abc",
      target_feed_slug: "timeline",
      target_feed_id: "all",
      confirm: true,
    })
    expect(text(result)).toContain("Error:")
  })
})
