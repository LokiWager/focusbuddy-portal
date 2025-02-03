import { defineConfig, UserManifest, WxtViteConfig } from "wxt";
import path, { resolve } from "node:path";
import fs from "node:fs";
import pluginReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const CHROME_DATA_DIR = ".wxt/chrome-data";
if (!fs.existsSync(CHROME_DATA_DIR)) {
  fs.mkdirSync(CHROME_DATA_DIR, { recursive: true });
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: false,
  extensionApi: "chrome",
  hooks: {
    "prepare:publicPaths": (_, paths) => {
      paths.push("/dashboard.html");
    },
  },
  runner: {
    // Mac
    chromiumArgs: [`--user-data-dir=${CHROME_DATA_DIR}`],
    // Windows
    chromiumProfile: resolve(".wxt/chrome-data"),
    keepProfileChanges: true,
  },
  manifest: ({ mode }) => {
    const manifest: UserManifest = {
      permissions: ["storage"],
    };
    if (mode === "development") {
      manifest.content_security_policy = {
        extension_pages:
          "script-src http://localhost:8097 http://localhost:8098",
      };
    }
    return manifest;
  },

  vite: ({ mode }) => ({
    plugins: [
      tailwindcss(),
      pluginReact({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      mode === "development" && {
        name: "react-devtools",
        transformIndexHtml: (html, ctx) => {
          const port = ctx.path.endsWith("popup.html")
            ? 8097
            : ctx.path.endsWith("dashboard.html")
            ? 8098
            : null;
          if (!port) return html;

          return html.replace(
            /<head>/,
            `<head><script src="http://localhost:${port}"></script>`
          );
        },
      },
    ] as WxtViteConfig["plugins"],
  }),
});
