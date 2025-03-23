import { defineConfig, UserManifest, WxtViteConfig } from "wxt";
import { resolve } from "node:path";
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
      permissions: [
        "storage",
        "notifications",
        "identity",
        "activeTab",
        "declarativeNetRequest",
        "declarativeNetRequestWithHostAccess",
      ],
      key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5xk6XXydfUCK9vM0V0dnm60rigaHf8S4QT8pYlZ6mpqrt+2e1mJ6gVA+2G2wUfyIarfiDnAXMVlaavnfazdyHfjbw5nmZBqswIWtLcQORiodC7k1Ga7r2E8fH0jASansSbTxEItcz3tiaUsrZ4JDc1+Xqgfh1fJ83w3wAjYTE0CY/drLj9R5qAogU+5wLZJjLF4Sj9flACGIR63IQgnMmAIG7kysqleTWdChjAu4licw3L+WJyqkR0mlcszMh1e3m1SxWdRPW09gVCbNZ0gABkqjNpn2Sv13+om1lWTE5m9M7dkwgbP46ktPb0cU01JsagQ9NB8WhIJNph6qrtIPoQIDAQAB",
      host_permissions: ["<all_urls>"],
      oauth2: {
        client_id:
          "608661990870-kno8u7trt6bhfd04borf9jtghqukcdft.apps.googleusercontent.com",
        scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      },
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
            `<head><script src="http://localhost:${port}"></script>`,
          );
        },
      },
    ] as WxtViteConfig["plugins"],
  }),
});
