# Call screen remote video handling

- **Goal:** stop mutating the frozen `HomeCall_Web_Ui_Screen_Call` singleton while keeping `updateRemoteStream` working with the DOM.
- **Actions:** switched the screen to track the remote video element via a module-scoped `WeakMap`, removed runtime assignments to `this`, surfaced the immutability requirement in `HomeCall_Web_Ui_Screen_Interface`, and double-checked other `HomeCall_Web_*` modules for similar `this`-mutations.
- **Result:** remote stream binding now uses the mapped element, no singleton properties are mutated, and the interface explicitly warns implementors about the frozen instances.
- **Tests:** `node --test test/web/app/**/*.test.mjs`
