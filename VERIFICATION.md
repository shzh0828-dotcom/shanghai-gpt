# Verification and limitations

- TypeScript check passed after final source changes.
- Production build passed; large-bundle warning is expected for the geographic database and Three.js, which are loaded with the scene.
- Browser: confirmed the scene renders; landmark directory selection and smooth camera flights; day, sunset and night controls; tour start, timed progression, next stop and pause; overview/preset buttons; and GLB generation with a successful GLTFLoader reload.
- Optional WebMCP: landmark listing, navigation and lighting tools were registered. Valid lighting changes worked; invalid lighting was rejected. Browser reconnection interrupted the final all-tools recheck.
- The saved GLB has a valid glTF 2.0 binary header and includes the major named landmarks. Geometry is the final mapped city. Interactive lighting effects remain browser-only.
- Desktop visual checks were completed. Final phone-viewport verification was interrupted by loss of the browser connection, and is not claimed as completed.
- Camera drag/zoom/pan use OrbitControls. Touch gestures and reduced-motion defaults are implemented but were not verified on a physical touch device.
- The model uses 2,109 mapped building outlines and 2,026 road/path sections; these are map features, not counts of unique real-world buildings or streets. Some outlines are building parts. Heights without map tags are estimated.
- Landmark architecture is a procedural interpretation guided by user photos and additional references. It is not an exact photogrammetric or survey reconstruction. Some roofs, footprints and materials remain simplified. Museum interiors are omitted.
- Start-of-build account usage: 9% of five-hour allowance and 9% weekly used. Later usage includes intervening conversation and any other account activity; it is not project-isolated.

## Selected improvements (1, 3, 4, 5)

- Added detailed geometry to seven signature landmarks: mullions, crowns, architectural bands, heritage cornices, entrances and dome ribs.
- Added selective architectural lighting and varied lit/unlit windows.
- Added rippled planar river reflections, cargo/cruise vessel variants and animated wakes.
- Added landmark-area crossings, signals, bus shelters, benches, planters and moving pedestrians. Street furniture is illustrative rather than surveyed.
- TypeScript and production build passed. Local browser rendered day and Customs House night views with no captured console errors. Landmark flight and lighting tools passed. Updated GLB export completed and reloaded successfully through the exporter validation. Reflective water remains browser-only.

## Five-building material and lighting pass
- Only Shanghai Tower, SWFC, Oriental Pearl, Customs House and former HSBC geometry/materials changed. Other landmarks retain their previous geometry.
- TypeScript and production build passed. Local browser showed the rebuilt Shanghai Tower and historic façades in day and night; no captured console errors. Night selection worked using the visible control.
- Dedicated glass panel textures, denser mullions, a tapered 120-degree tower envelope, sphere latitude/longitude detail, four illuminated clock faces and warm façade spotlights added. This remains procedural architecture, not a photogrammetric replica.
