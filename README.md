# Shanghai · Between Two Shores

Interactive 3D Bund and Lujiazui miniature with 21 selectable landmarks, bilingual descriptions, three lighting modes, camera flights, guided tour, animated water, boats, traffic, and GLB export.

## Run locally

Requires Node.js 22.13 or newer.

1. Open this folder in a terminal.
2. Run `npm install` if dependencies are absent.
3. Run `npm run dev`.
4. Open the local URL printed by the server.

`npm run build` creates the hosted production build. `npm run start` serves that build through Wrangler.

## Files

- `app/page.tsx`: interface, tour, controls, and optional WebMCP tools.
- `lib/scene.ts`: procedural 3D geometry, rendering, camera controls, animation, and verified GLB export.
- `lib/landmarks.ts`: landmark descriptions, dimensions, locations, references.
- `app/globals.css`: responsive interface.
- `public/guide.html`: full function guide, references, credits, and model limitations.
- `exports/shanghai-bund.glb`: saved 3D model, when exported during verification.

Use Download 3D in the app for a fresh GLB of the current scene. Import in Blender with File → Import → glTF 2.0. Add lighting or use Material Preview. Browser-only effects and all geographic simplifications are documented in the guide.

This is an artistic miniature with compressed horizontal geography and simplified buildings, not a survey model. No interiors, live traffic, ticketing, or live opening-hours data.

## Geographic realism update

The city base now uses 2,109 OpenStreetMap building outlines, 2,026 road/path sections, 35 water polygons, and 130 green spaces. Coordinates use 0.22 model units per metre in X, Y, and Z. Mapped heights or floor counts are used when provided; other heights are estimated. Landmark façades remain modeled interpretations rather than photogrammetric replicas.

Attribution: © OpenStreetMap contributors, ODbL 1.0. Derived geographic database: `public/data/shanghai-map.json`; original downloaded extract: `references/data/shanghai.osm`. User photos and identification notes: `references/`. No user photos are included in the public assets.
