# Math Meditations Geometry Gallery

This project is a creative coding environment for generating and displaying mathematical and geometric art. It features a massive collection of unique, responsive visual components, a gallery for exploring fractal presets, and a daily quote interface for a meditative experience.

## Key Features

- **240+ Custom Visuals**: A massive collection of original generative art pieces, ranging from strange attractors and flow fields to reaction-diffusion systems and 3D three.js scenes.
- **Geometry Gallery**: An interactive explorer for over 500 mathematical presets, covering families like Julia sets, Mandelbrot, Newton basins, IFS ferns, and chaotic attractors (Lorenz, Rössler, Aizawa).
- **Daily Quotes**: A meditative interface that pairs a daily quote with a unique mathematical visualization, accessible via `/daily-quotes/:day`.
- **Printable Book**: A built-in tool to generate a high-resolution, printable PDF book of the collection.
- **Responsive Design**: All visual components are fully responsive and adapt to the container size.
- **Docker Support**: Lightweight containerization for easy production deployment.

## Project Structure

- **`src/components/DailyQuotes.tsx`**: The main application view. It maps each day of the year to a specific quote and visual, creating a "book-like" browsing experience.
- **`src/components/MathVisual.tsx`**: The core rendering engine. It acts as a facade, dynamically loading either a specific "Custom Visual" component or a geometric preset based on the current index.
- **`src/components/custom-visuals/`**: The heart of the creative code. This directory contains over 240 individual React components, each implementing a unique visual algorithm.
  - *Examples*: `AbelianSandGarden`, `FluidTurbulence`, `QuantumFoam`, `LorenzAttractor`, `ReactionDiffusion`.
- **`geometry_web_gallery_500_presets.jsx`**: A standalone gallery application included in the project, allowing deep exploration of parametric families and fractals.
- **`src/components/PrintableBook.tsx`**: A utility component that renders pages in high resolution and compiles them into a PDF using `html2canvas` and `jspdf`.

## Visuals Collection

The project includes a diverse range of mathematical beauty:

1.  **Chaos & Attractors**: Visualizations of chaotic systems like Lorenz, Rössler, Aizawa, and strange attractors.
2.  **Fractals**: Mandelbrot sets, Julia sets, Newton basins, and IFS (Iterated Function Systems).
3.  **Flow Fields**: Particle systems driven by noise, vector fields, and fluid dynamics.
4.  **Cellular Automata**: Game of Life variations, Abelian Sandpiles, and reaction-diffusion models.
5.  **3D Scenes**: Three.js implementations of geometric forms, knots, and particle clouds.
6.  **Data Art**: ASCII representations and algorithmic patterns.

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
