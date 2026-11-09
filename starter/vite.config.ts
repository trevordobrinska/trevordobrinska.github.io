import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the build works under the GitHub Pages project path
  // (https://trevordobrinska.github.io/game-slug/) without hard-coding the repo name.
  base: "./",
});
