export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/messages/index',
    'pages/profile/index',
  ],
  window: {
    navigationBarTitleText: '换乎ZJU版',
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#FFFFFF',
    backgroundColor: '#F8FAFC',
    backgroundTextStyle: 'light',
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '首页', iconPath: 'assets/icons/home.png', selectedIconPath: 'assets/icons/home-active.png' },
      { pagePath: 'pages/discover/index', text: '发现', iconPath: 'assets/icons/discover.png', selectedIconPath: 'assets/icons/discover-active.png' },
      { pagePath: 'pages/messages/index', text: '消息', iconPath: 'assets/icons/messages.png', selectedIconPath: 'assets/icons/messages-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/icons/profile.png', selectedIconPath: 'assets/icons/profile-active.png' },
    ],
  },
  subpackages: [
    { root: 'sp-common/', pages: ['pages/login/index','pages/verify/index','pages/webview/index','pages/search-results/index','pages/hot-topics/index','pages/privacy/index','pages/agreement/index'] },
    { root: 'sp-social/', pages: ['pages/chat/index','pages/contact-request/index','pages/notification-list/index','pages/message-likes/index','pages/message-follows/index','pages/message-comments/index','pages/message-system/index'] },
    { root: 'sp-profile/', pages: ['pages/avatar-select/index','pages/edit-profile/index','pages/settings/index','pages/settings-detail/index','pages/profile/view'] },
    { root: 'sp-content/', pages: ['pages/post-detail/index','pages/post-manage/index','pages/publish/index','pages/edit-skills/index','pages/my-skills/index','pages/my-posts/index','pages/my-followers/index','pages/my-following/index','pages/my-favorites/index','pages/my-ratings/index','pages/my-activities/index','pages/my-partners/index','pages/activity-register/index','pages/skill-detail/index','pages/skill-proof-detail/index','pages/edit-verified-skill/index','pages/interest-detail/index','pages/user-detail/index','pages/user-skills/index','pages/user-posts/index','pages/user-followers/index','pages/user-following/index','pages/browse-history/index'] },
  ],
  preloadRule: {
    'pages/index/index': { network: 'all', packages: ['sp-common', 'sp-social'] },
    'pages/discover/index': { network: 'all', packages: ['sp-content'] },
    'pages/messages/index': { network: 'all', packages: ['sp-social'] },
    'pages/profile/index': { network: 'all', packages: ['sp-profile'] },
  },
  usingComponents: {},
})

