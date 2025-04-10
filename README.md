# Essence Discord Bot Landing Page

A sleek, modern landing page for the Essence Discord Bot with admin tools for managing status updates and incidents, plus a real-time user dashboard that connects to your Python Discord bot.

## Features

- Elegant black and white design with gradient effects
- Responsive mobile-first layout
- Status section to display bot operational status
- Commands showcase with categorized display
- Administrative tools for managing bot statistics and incident reporting
- Interactive UI with animations
- **NEW**: User dashboard with WebSocket connection to your Discord bot

## Tech Stack

- React.js + TypeScript
- Tailwind CSS for styling
- Vite for frontend bundling and development
- Express.js backend (in development) or Netlify serverless functions (in production)
- Framer Motion for animations
- WebSocket for real-time communication with your bot

## Deployment on Netlify

This project is set up to be easily deployed on Netlify using their serverless functions.

### Deployment Steps

1. Fork or clone this repository
2. Connect your repository to Netlify
3. Set up the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18.x or later

4. Deploy! Netlify will automatically handle the serverless functions setup based on the `netlify.toml` configuration.

### Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Admin Access

The admin dashboard is accessible at `/dev-tools` with the password: `essence@2025furry`

## Connecting Your Python Discord Bot to the Dashboard

The website includes a real-time user dashboard that can communicate with your Discord bot. Follow these steps to connect your Python bot:

### 1. WebSocket Communication

The dashboard uses WebSocket for real-time communication with your bot. There's a WebSocket server endpoint at `/ws` that your bot can connect to.

### 2. Python Code Example

We've included an example Python script (`example_bot_connection.py`) that shows how to connect a Discord.py bot to the dashboard. Main features:

- WebSocket connection with authentication
- Regular heartbeats to maintain connection
- Stats reporting (server count, user count, etc.)
- Command processing from dashboard to bot
- Error handling and reconnection logic

### 3. Authentication

Your bot needs to authenticate with the dashboard using a token:

```python
# In your bot code:
auth_payload = {
    "type": "auth",
    "token": "essence_bot_secret_token",  # This token is defined in server/routes.ts
    "isBot": True
}
await ws_connection.send(json.dumps(auth_payload))
```

### 4. Required Dependencies

Your Python bot will need:
```
pip install discord.py websockets
```

### 5. Message Protocol

Communication between the dashboard and your bot follows this protocol:

| Message Type | Direction | Purpose |
|--------------|-----------|---------|
| `auth` | Bot → Dashboard | Authenticate the bot |
| `heartbeat` | Bot → Dashboard | Keep connection alive |
| `bot_stats` | Bot → Dashboard | Update dashboard with bot stats |
| `command_request` | Dashboard → Bot | User executed a command |
| `command_response` | Bot → Dashboard | Response to user command |

### 6. Dashboard Features

Once connected, users will be able to:
- See real-time bot stats
- Send commands to your bot directly from the dashboard
- View the bot's online/offline status
- See active users with your bot

## Project Structure

- `/client` - Frontend React application
- `/server` - Express server for local development
- `/functions` - Netlify serverless functions for production
- `/shared` - Shared TypeScript types and utilities
- `example_bot_connection.py` - Example Python code for connecting your bot

## License

MIT