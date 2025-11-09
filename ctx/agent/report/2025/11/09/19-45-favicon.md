## Iteration Report

**Goal:** Add favicon reference to the main HTML head so the new icon loads for the PWA shell.

**Actions:** Inserted `<link rel="icon" href="assets/icons/icon-192.svg">` inside `web/index.html` next to the existing metadata.

**Results:** Browsers will now request `assets/icons/icon-192.svg` as the favicon when loading the home page.
