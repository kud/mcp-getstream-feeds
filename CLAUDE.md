# mcp-getstream-feeds

MCP server for the GetStream Feeds API — investigate feed subscriptions and activity fan-out.

## API Reference

Official API docs: https://getstream.io/activity-feeds/docs/node/

## Auth

Requires `MCP_GETSTREAM_API_KEY` and `MCP_GETSTREAM_SECRET` env vars. The SDK handles JWT signing server-side automatically.

## Development

```bash
npm run dev          # run via tsx (no build step)
npm run build        # compile to dist/
npm test             # vitest
npm run inspect:dev  # MCP inspector
```
