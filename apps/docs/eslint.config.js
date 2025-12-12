import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [{ ignores: [".next/**"] }, ...nextJsConfig];
