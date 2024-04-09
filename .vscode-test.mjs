import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "out/test/**/*.test.js",
});

// for more info, see:
//   https://code.visualstudio.com/api/working-with-extensions/testing-extension
