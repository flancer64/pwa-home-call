# Env provider rollout

- **Goal:** route all web modules/tests through `HomeCall_Web_Env_Provider$` so browser globals stop being registered directly.
- **Actions:** refactored DI constructors across Core, Media, Net, and UI layers plus the DI bootstrap to consume `HomeCall_Web_Env_Provider$`; replaced `globalThis` usages with env accessors; rewired web tests to stub the env provider instead of individual globals; executed `node --test` to verify.
- **Result:** target modules now depend exclusively on the env provider and container bootstrap no longer registers browser globals. Web suites pass, but the existing backend suite `test/unit/Back/Service/Signal/Server.test.mjs` still fails with runner output `"test failed"` even when executed solo.
