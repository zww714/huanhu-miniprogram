export const colors = {
  primary: '#2563EB',
  primaryLight: '#EAF2FF',
  pageBg: '#F6F8FC',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F97316',
  danger: '#EF4444',
  tagBg: '#F1F5F9',
} as const

export const fontSize = {
  pageTitle: '34rpx',
  brandTitle: '40rpx',
  primaryTab: '28rpx',
  sectionTitle: '32rpx',
  cardTitle: '30rpx',
  body: '26rpx',
  caption: '24rpx',
  tag: '22rpx',
  button: '26rpx',
  emphasisNumber: '40rpx',
} as const

export const radius = {
  xs: '8rpx',
  sm: '12rpx',
  md: '18rpx',
  lg: '24rpx',
  xl: '32rpx',
  pill: '999rpx',
} as const

export const spacing = {
  pagePaddingX: '32rpx',
  sectionGap: '24rpx',
  cardPadding: '28rpx',
  cardGap: '20rpx',
  itemGap: '16rpx',
  tagGap: '12rpx',
  floatingRight: '32rpx',
  floatingBottom: '160rpx',
  tabBarSafePadding: '32rpx',
} as const

export const shadows = {
  card: '0 8rpx 24rpx rgba(15, 23, 42, 0.06)',
  search: '0 6rpx 18rpx rgba(15, 23, 42, 0.06)',
  floating: '0 12rpx 32rpx rgba(37, 99, 235, 0.35)',
} as const

export const zIndex = {
  header: 100,
  tabBar: 200,
  floatingButton: 300,
  modal: 900,
  toast: 1000,
} as const

export const uiTokens = {
  colors,
  fontSize,
  radius,
  spacing,
  shadows,
  zIndex,
} as const
