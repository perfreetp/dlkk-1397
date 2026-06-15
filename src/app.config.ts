export default defineAppConfig({
  pages: [
    'pages/booking/index',
    'pages/handover/index',
    'pages/dynamics/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/fee/index',
    'pages/pet-profile/index',
    'pages/booking-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '萌宠寄养',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFF7ED'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#FF8A3D',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/booking/index',
        text: '预约'
      },
      {
        pagePath: 'pages/handover/index',
        text: '交接单'
      },
      {
        pagePath: 'pages/dynamics/index',
        text: '在店动态'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
