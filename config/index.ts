import type { UserConfigExport } from '@tarojs/cli'

export default {
  projectName: 'huanhu-miniprogram',
  date: '2026-05-03',
  designWidth: 375,
  deviceRatio: {
    375: 1 / 2,
    640: 1 / 2.34,
    750: 1,
    828: 1 / 1.81,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-platform-weapp'],
  defineConstants: {},
  copy: {
    patterns: [
      { from: 'src/assets/', to: 'assets/' },
    ],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: false,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024,
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
} satisfies UserConfigExport
