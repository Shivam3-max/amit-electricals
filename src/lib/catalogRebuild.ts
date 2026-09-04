import "server-only";

// scripts/ sits outside src/, so this is the one place that needs a relative
// path up to it — every admin route imports the regenerator from here
// instead of repeating (and risking miscounting) that path itself.
export { regenerateCatalog } from "../../scripts/build-catalog.mjs";
