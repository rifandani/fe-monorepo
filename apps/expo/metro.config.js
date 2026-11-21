/* oxlint-disable unicorn/prefer-module */
const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = path.dirname(require.resolve("./package.json"));
const config = getDefaultConfig(projectRoot);
const workspaceRoot = path.resolve(projectRoot, "../..");

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.transformer.minifierPath = require.resolve("metro-minify-terser");

module.exports = config;
