const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs',
  'mp4',
  'wav',
];

config.resolver.assetExts = [
  'glb',
  'gltf',
  'png',
  'jpg',
  'ttf',
  'mp4',
  'otf',
  'wav',
];

module.exports = config;