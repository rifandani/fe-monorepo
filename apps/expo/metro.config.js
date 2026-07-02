import { createRequire } from "node:module";
import path from "node:path";

import { getDefaultConfig } from "expo/metro-config";

const projectRoot = import.meta.dirname;
const require = createRequire(import.meta.url);
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve("metro-minify-terser"),
  unstable_allowRequireContext: true,
};

export default config;
