# Essence Discord Bot Landing Page

A sleek, modern landing page for the Essence Discord Bot with admin tools for managing status updates and incidents.

## Features

- Elegant black and white design with gradient effects
- Responsive mobile-first layout
- Status section to display bot operational status
- Commands showcase with categorized display
- Administrative tools for managing bot statistics and incident reporting
- Interactive UI with animations

## Tech Stack

- React.js + TypeScript
- Tailwind CSS for styling
- Vite for frontend bundling and development
- Express.js backend (in development) or Netlify serverless functions (in production)
- Framer Motion for animations

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

## Project Structure

- `/client` - Frontend React application
- `/server` - Express server for local development
- `/functions` - Netlify serverless functions for production
- `/shared` - Shared TypeScript types and utilities

## License

MIT