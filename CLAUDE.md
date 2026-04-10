# mcp-getstream-feeds

MCP server for the GetStream Feeds API, used to investigate push notification delivery and subscription state in the OrchardGo mobile app.

## API Reference

Official API docs: https://getstream.io/activity-feeds/docs/node/

## Feed Patterns (OrchardGo / ows-notifications)

- `user_mobile_push:<profile_feed_id>` — per-user mobile push feed (e.g. `user_mobile_push:InsightsProfile_366401`)
- `streams_updated:streams_updated_all` — global Spotify streams update fan-out feed
- `participant_spike:<participant_id>` — per-artist social spike feed

Feed IDs use `_` as delimiter. Special chars are encoded: `@` → `ATSYMBOL`, `.` → `DOTSYMBOL`, `-` → `DASHSYMBOL`.

## Auth

Requires `GETSTREAM_API_KEY` and `GETSTREAM_API_SECRET` env vars. The SDK handles JWT signing server-side automatically.

## Development

```bash
npm run dev          # run via tsx (no build step)
npm run build        # compile to dist/
npm test             # vitest
npm run inspect:dev  # MCP inspector
```
