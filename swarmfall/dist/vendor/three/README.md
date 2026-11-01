# three.js (Swarmfall's copy)

Bundled renderer r180. License: [MIT](LICENSE).

Copied from the simulator's `dist/vendor/three/` (commit 454c3e6) when Swarmfall was isolated
on November 1, 2026, so the game and the lab no longer load the simulator's files. The
vendored Dragonfly modules in `../dragonfly/` are written against this release; if you upgrade
it, refresh or recheck those as well (`node swarmfall/tools/sync-dragonfly.mjs --check` notes
when the simulator's renderer differs from this one).

The Environment Lab adds these unchanged files from the official npm `three@0.180.0` package.
They moved here from the simulator's vendor folder with their history; the simulator never
used them:

- `addons/loaders/GLTFLoader.js`
- `addons/utils/BufferGeometryUtils.js`
- `addons/controls/OrbitControls.js`

Source: https://github.com/mrdoob/three.js/tree/r180/examples/jsm
Package: https://registry.npmjs.org/three/-/three-0.180.0.tgz

The gallery import map resolves bare `three` imports to this renderer. No package
installation or remote runtime/CDN dependency is required.

October 23 Codex (made in the simulator's copy, carried over here): the nested
`./three.core.min.js` import in the renderer wrapper uses `?v=dev`, stamped by the publish
workflow. URL-only patch after a reproducible stalled unversioned public request;
algorithms/version/license unchanged.
