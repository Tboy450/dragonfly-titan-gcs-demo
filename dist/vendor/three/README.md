# three.js

Existing bundled renderer: r180. License: [MIT](LICENSE).

The simulator uses only the renderer. The Environment Lab's three unchanged addons
(GLTFLoader, BufferGeometryUtils, OrbitControls from npm `three@0.180.0`) moved with their
history to Swarmfall's own copy in `swarmfall/dist/vendor/three/` when the game was isolated on
November 1, 2026; that folder also holds the game's copy of this renderer.

Source: https://github.com/mrdoob/three.js/tree/r180/examples/jsm
Package: https://registry.npmjs.org/three/-/three-0.180.0.tgz

No package installation or remote runtime/CDN dependency is required.

October23 Codex: the nested `./three.core.min.js` import in the renderer wrapper now uses
`?v=dev`, stamped by the publish workflow. URL-only patch after a reproducible stalled
unversioned public request; algorithms/version/license unchanged. Original wrapper saved
in archive/attic-local-insulation-2026-10-22.
