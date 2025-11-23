# Math Meditations Geometry Gallery

This project is a creative coding environment for generating and displaying mathematical and geometric art. It features a collection of 75 unique, responsive visual components, a gallery for exploring fractal presets, and a book-style interface for a meditative experience.

## Key Features

- **75+ Custom Visuals**: A diverse collection of generative art pieces, each designed to be responsive and visually engaging.
- **Geometry Gallery**: An interactive gallery for exploring over 500 fractal presets, including Julia, Mandelbrot, Newton, and IFS Ferns.
- **Responsive Design**: All visual components are fully responsive and adapt to the container size, ensuring a consistent experience across devices.
- **Snapshot Generation**: A powerful script to automatically generate high-resolution snapshots of all visual components.
- **Book Interface**: A unique, book-style interface for a focused, meditative viewing experience.
- **Cloudflared Integration**: Configured for secure tunneling with custom domain support.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for cloudflared tunnel)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
# Development configuration
VITE_ALLOWED_HOST=your-domain.com
```

3. Run the project in development mode:

```bash
npm run dev
```

For custom port (e.g., for cloudflared tunnel):

```bash
npm run dev -- --port 2846
```

This will start a Vite development server. The server is configured to accept connections from external hosts for tunnel integration.

## Available Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the project for production.
-   `npm run preview`: Serves the production build locally for previewing.
-   `npm run generate-snapshots`: Generates high-resolution snapshots of all visual components.

## Cloudflared Tunnel Setup

This project is configured to work with Cloudflare tunnels for secure external access.

### Configuration

The Vite development server is configured to:
- Bind to `0.0.0.0` (all interfaces) for external access
- Accept connections from custom domains via `allowedHosts`
- Load domain configuration from environment variables

### Troubleshooting

If you encounter a 502 Bad Gateway error:

1. Ensure your dev server is running on the correct port
2. Verify the domain is added to `VITE_ALLOWED_HOST` in your `.env` file
3. Check that your cloudflared configuration points to the correct local port
4. Restart the dev server after configuration changes

Common cloudflared ingress rule example:
```json
{
  "hostname": "your-domain.com",
  "service": "http://localhost:2846"
}
```

## Development Scripts

These scripts are intended for development purposes and help manage the visual components.

-   `node scripts/concat-visuals.mjs`: Concatenates all individual visual components from `src/components/custom-visuals/` into a single `AllVisuals.tsx` file. This is useful for debugging and analysis.
-   `node scripts/split-visuals.mjs`: Splits the `AllVisuals.tsx` file back into individual component files. This is helpful for refactoring and maintaining a clean project structure.

## Environment Variables

- `VITE_ALLOWED_HOST`: Domain name allowed to access the development server (required for cloudflared tunnels)

## Docker Deployment

This project includes a lightweight Docker setup for production deployment using Nginx.

### Build and Run with Docker Compose

1. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```

2. The application will be available at `http://localhost:2846`

### Manual Docker Build

1. Build the image:
   ```bash
   docker build -t math-meditations .
   ```

2. Run the container:
   ```bash
   docker run -d -p 2846:80 math-meditations
   ```

### Architecture

The Docker setup uses a multi-stage build process:
1. **Build Stage**: Uses Node.js Alpine image to install dependencies and build the Vite application.
2. **Production Stage**: Uses Nginx Alpine image to serve the static assets.
3. **Configuration**: Includes a custom `nginx.conf` to handle React Router's SPA routing (redirecting all requests to index.html).
