# Math Meditations Geometry Gallery

This project is a creative coding environment for generating and displaying mathematical and geometric art. It features a collection of 75 unique, responsive visual components, a gallery for exploring fractal presets, and a book-style interface for a meditative experience.

## Key Features

- **75+ Custom Visuals**: A diverse collection of generative art pieces, each designed to be responsive and visually engaging.
- **Geometry Gallery**: An interactive gallery for exploring over 500 fractal presets, including Julia, Mandelbrot, Newton, and IFS Ferns.
- **Responsive Design**: All visual components are fully responsive and adapt to the container size, ensuring a consistent experience across devices.
- **Snapshot Generation**: A powerful script to automatically generate high-resolution snapshots of all visual components.
- **Book Interface**: A unique, book-style interface for a focused, meditative viewing experience.

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
npm install
```

Once the dependencies are installed, you can run the project in development mode:

```bash
npm run dev
```

This will start a Vite development server and open the project in your default browser.

## Available Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the project for production.
-   `npm run preview`: Serves the production build locally for previewing.
-   `npm run generate-snapshots`: Generates high-resolution snapshots of all visual components.

## Development Scripts

These scripts are intended for development purposes and help manage the visual components.

-   `node scripts/concat-visuals.mjs`: Concatenates all individual visual components from `src/components/custom-visuals/` into a single `AllVisuals.tsx` file. This is useful for debugging and analysis.
-   `node scripts/split-visuals.mjs`: Splits the `AllVisuals.tsx` file back into individual component files. This is helpful for refactoring and maintaining a clean project structure.
