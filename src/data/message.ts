import type { Message } from '@/types';

export const messageList: Message[] = [
  {
    id: 'm1',
    type: 'daily',
    title: '今日日报已更新',
    content: '旺财 6月18日的日报已更新，快去看看它今天过得怎么样吧~',
    time: '10分钟前',
    read: false,
    relatedBookingId: 'bk001'
  },
  {
    id: 'm2',
    type: 'system',
    title: '预约确认通知',
    content: '您的寄养预约（订单号：bk002）已确认，期待咪咪的到来！',
    time: '2小时前',
    read: false,
    relatedBookingId: 'bk002'
  },
  {
    id: 'm3',
    type: 'alert',
    title: '⚠️ 异常情况提醒',
    content: '旺财今天食欲稍差，已联系兽医观察，暂无大碍，请您放心。',
    time: '昨天',
    read: true,
    relatedBookingId: 'bk001'
  },
  {
    id: 'm4',
    type: 'chat',
    title: '店员小李',
    content: '您好，旺财今天状态很好，刚和小伙伴玩了一会儿~',
    time: '昨天',
    read: true
  },
  {
    id: 'm5',
    type: 'system',
    title: '服务升级提醒',
    content: '您的会员等级已升级为黄金会员，享受9折优惠！',
    time: '3天前',
    read: true
  },
  {
    id: 'm6',
    type: 'daily',
    title: '今日日报已更新',
    content: '旺财 6月17日的日报已更新。',
    time: '4天前',
    read: true,
    relatedBookingId: 'bk001'
  },
  {
    id: 'm7',
    type: 'system',
    title: '寄养完成提醒',
    content: '您的寄养订单（订单号：bk003）已完成，感谢您的信任！',
    time: '1周前',
    read: true,
    relatedBookingId: 'bk003'
  }
];

export const unreadCount = 2;
