# Building placement audit

Source: existing OpenStreetMap extract in references/data/shanghai.osm. Coordinates are footprint centroids where available, not newly surveyed locations. Architectural geometry and scale remain unchanged.

| Landmark | OSM feature | Longitude | Latitude | Evidence |
|---|---|---|---|---|
| pearl | 40778038 | 121.495262 | 31.241894 | Footprint centroid; model size not changed |
| shanghai | 165792123 | 121.501269 | 31.235555 | Footprint centroid; model size not changed |
| swfc | 10691100 | 121.503041 | 31.236577 | Footprint centroid; model size not changed |
| jinmao | 376075961 | 121.501406 | 31.237251 | Footprint centroid; model size not changed |
| customs | 178407318 | 121.485435 | 31.238615 | Footprint centroid; model size not changed |
| hsbc | 476149515 | 121.485757 | 31.238004 | Point/complex location retained; footprint unresolved |
| peace | 177998986 | 121.484489 | 31.241109 | Footprint centroid; model size not changed |
| boc | 177995050 | 121.485267 | 31.241497 | Footprint centroid; model size not changed |
| bridge | 27498117 | 121.485736 | 31.245314 | Point/complex location retained; footprint unresolved |
| rockbund | 446934758 | 121.483139 | 31.243190 | Footprint centroid; model size not changed |
| history | 5156435622 | 121.486769 | 31.244211 | Point/complex location retained; footprint unresolved |
| fosun | 520214798 | 121.493579 | 31.228860 | Footprint centroid; model size not changed |
| aurora | 1489398730 | 121.495396 | 31.236503 | Point/complex location retained; footprint unresolved |
| map | 803292747 | 121.491957 | 31.240243 | Footprint centroid; model size not changed |
| bfc | 520214797 | 121.493245 | 31.228440 | Point/complex location retained; footprint unresolved |
| ifc | 526005642 | 121.497997 | 31.238298 | Footprint centroid; model size not changed |
| superbrand | 40779113 | 121.494793 | 31.238699 | Footprint centroid; model size not changed |
| convention | 40778072 | 121.492404 | 31.241497 | Footprint centroid; model size not changed |
| club | 178410325 | 121.486546 | 31.235792 | Footprint centroid; model size not changed |
| bund18 | 1196704498 | 121.485032 | 31.240343 | Footprint centroid; model size not changed |
| nanjing |  | 121.482000 | 31.239910 | Point/complex location retained; footprint unresolved |

## Unresolved conflicts
- Aurora Art Museum is pinned inside Aurora Plaza in the source; its standalone model requires a verified separate footprint. No guessed relocation applied.
- Former HSBC uses an attraction node without a matching footprint in this extract. The previously requested spacing offset is retained.
- Some detailed models exceed their mapped footprint (including SWFC and Bank of China). Exact geographic placement and guaranteed road clearance cannot both be promised while preserving their existing size and orientation.
- Background buildings already use mapped footprint vertices and are not relocated.
- Roads and building shapes have not been altered.

## Approved modest adjustment
SWFC, Bank of China, Rockbund, Bund 18, Customs House and former HSBC receive a 5% width/depth reduction; heights remain unchanged. No large scaling or speculative rotation applied. Remaining conflicts from incomplete map footprints cannot be guaranteed eliminated.
