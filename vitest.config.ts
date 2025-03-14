import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

export default defineConfig({
  plugins: [
    // @ts-expect-error - WxtVitest is not part of the official Vite plugin list
    WxtVitest(),
  ],
});
