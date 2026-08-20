// config.js — shared namespace and settings.
//
// Everything hangs off window.PC rather than top-level consts. That matters
// because background.js injects these files on demand for the right-click
// feature, and injecting twice into the same page would throw
// "Identifier has already been declared" with plain const.

window.PC = window.PC || {};

// The shared-key proxy. Users need no API key of their own when this is set.
// See worker/README.md for how it is deployed.
window.PC.PROXY_URL = "https://prompt-clarify-api.yashraj707077.workers.dev";
