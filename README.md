<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/npm/v/%40kud%2Fmcp-getstream-feeds?style=flat-square&color=CB3837)
![MIT](https://img.shields.io/badge/licence-MIT-22C55E?style=flat-square)

**MCP server for GetStream Feeds — investigate push notification delivery and subscription state.**

<a href="https://kud.io/projects/mcp-getstream-feeds">Website</a> · <a href="https://kud.io/projects/mcp-getstream-feeds/docs">Documentation</a>

</div>

## Features

- **Feed subscription inspection** — list everything a feed follows and everything that follows it, paginated.
- **Activity retrieval** — fetch recent activities on any feed with full timestamps and payloads.
- **Follow management** — create or remove follow relationships between feeds with a required `confirm` safety gate.
- **Safe by default** — write tools (`follow`, `unfollow`) require explicit confirmation to prevent accidental mutations.
- **Zero-config auth** — pass your GetStream API key and secret via environment variables; the SDK signs requests server-side automatically.

## Install

```sh
npx @kud/mcp-getstream-feeds
```

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "mcp-getstream-feeds": {
      "command": "npx",
      "args": ["@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "<your-api-key>",
        "MCP_GETSTREAM_SECRET": "<your-api-secret>"
      }
    }
  }
}
```

## Usage

| Tool                        | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| `getstream_feed_following`  | Get feeds that a specific feed follows (its subscriptions).               |
| `getstream_feed_followers`  | Get feeds that follow a specific feed (its subscribers).                  |
| `getstream_feed_activities` | Retrieve recent activities on a feed with timestamps and payloads.        |
| `getstream_feed_follow`     | Subscribe one feed to another. Requires `confirm: true`.                  |
| `getstream_feed_unfollow`   | Remove a follow relationship between two feeds. Requires `confirm: true`. |

## Development

```sh
git clone https://github.com/kud/mcp-getstream-feeds.git
cd mcp-getstream-feeds
npm install
npm run dev
```

| Script                | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Run via `tsx` (no build step)       |
| `npm run build`       | Compile TypeScript to `dist/`       |
| `npm test`            | Run tests with Vitest               |
| `npm run inspect:dev` | Launch MCP Inspector against source |

📚 **Full documentation → [mcp-getstream-feeds/docs](https://kud.io/projects/mcp-getstream-feeds/docs)**
