import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";
import babelParser from "@babel/eslint-parser";

export default [
  { ignores: ["dist", "build", "coverage", "node_modules"] },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,

  // Vite HMR safety
  "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

  // Not needed in React 17+
  "react/react-in-jsx-scope": "off",

  // You’re not using PropTypes
  "react/prop-types": "off",

  // Make lint useful on an existing codebase:
  // - don't block builds on React "purity" / "static components" suggestions
  "react-hooks/static-components": "off",
  "react-hooks/set-state-in-effect": "off",
  "react-hooks/purity": "off",
  "react-hooks/refs": "off",
  "react-hooks/immutability": "off",

  // Keep these as warnings, not errors, while we clean up gradually
  "react-hooks/exhaustive-deps": "warn",

  // You have Web NFC; allow NDEFReader without adding types
  "no-undef": "off"
}
  },

  prettier
];
