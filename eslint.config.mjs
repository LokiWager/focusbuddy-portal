import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginQuery from "@tanstack/eslint-plugin-query";

function errorToWarn(config) {
  if (Array.isArray(config)) {
    return config.map(errorToWarn);
  }
  if (config.rules) {
    const rules = { ...config.rules };
    for (const key of Object.keys(rules)) {
      if (rules[key] === "error" || rules[key] === 2) {
        rules[key] = "warn";
      }
    }
    return { ...config, rules };
  }
  return config;
}

export default tseslint.config(
  {
    ignores: [".wxt", ".output", "eslint.config.*"],
  },
  errorToWarn(js.configs.recommended),
  errorToWarn(tseslint.configs.recommended),
  errorToWarn(react.configs.flat.recommended),
  errorToWarn(react.configs.flat["jsx-runtime"]),
  errorToWarn(reactCompiler.configs.recommended),
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  pluginQuery.configs["flat/recommended"],
);
