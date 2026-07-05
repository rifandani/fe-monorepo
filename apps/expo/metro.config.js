// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro
// oxlint-disable-next-line unicorn/prefer-module -- Metro config requires CommonJS
const path = require("node:path");
/** @type {import('expo/metro-config')} */
// oxlint-disable-next-line unicorn/prefer-module -- Metro config requires CommonJS
const { getDefaultConfig } = require("expo/metro-config");

// oxlint-disable-next-line unicorn/prefer-module -- Metro config requires CommonJS
const projectRoot = path.dirname(require.resolve("./package.json"));
const config = getDefaultConfig(projectRoot);
const workspaceRoot = path.resolve(projectRoot, "../..");

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// // 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};
// oxlint-disable-next-line unicorn/prefer-module -- Metro config requires CommonJS
config.transformer.minifierPath = require.resolve("metro-minify-terser");

// oxlint-disable-next-line unicorn/prefer-module -- Metro config requires CommonJS
module.exports = config;
