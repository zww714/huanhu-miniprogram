import type { UserConfigExport } from '@tarojs/cli'

export default {
  env: {
    NODE_ENV: '"production"',
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
  h5: {
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
    },
  },
} satisfies UserConfigExport
