# Removed unused shared util module
**Goal:** drop the unused `HomeCall_Web_Shared_Util` module so the shared contour no longer provides unused helpers.

**Actions:** deleted `web/app/Shared/Util.mjs`, removed its DI/type reference from `web/app/types.d.js`, and removed the module from the service worker asset list so it will no longer be fetched.

**Results:** no code paths reference `HomeCall_Web_Shared_Util$` anymore; the shared contour now exposes only the remaining logger artifact.

**Testing:** not run (change limited to unused shared helpers).
