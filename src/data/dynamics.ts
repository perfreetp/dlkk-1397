import type { DailyRecord } from '@/types';

export const dailyRecordList: DailyRecord[] = [
  {
    id: 'dr001',
    date: '2024-06-18',
    bookingId: 'bk001',
    petId: '1',
    meals: [
      { time: '08:00', food: '皇家狗粮', amount: '150g', finished: true },
      { time: '18:00', food: '皇家狗粮', amount: '150g', finished: true }
    ],
    water: '充足，饮水正常',
    poop: '2次，形状正常',
    pee: '4次，量正常',
    walk: { time: '07:30', duration: 40, distance: '约2公里', notes: '精神很好，跑了很多' },
    mood: '开心活跃',
    health: '良好',
    notes: '今天旺财心情特别好，和小伙伴玩得很开心，食欲也很棒！',
    photos: [
      'https://picsum.photos/id/237/600/400',
      'https://picsum.photos/id/1025/600/400',
      'https://picsum.photos/id/1062/600/400'
    ],
    videos: [],
    staffName: '小李',
    createdAt: '2024-06-18 20:00'
  },
  {
    id: 'dr002',
    date: '2024-06-17',
    bookingId: 'bk001',
    petId: '1',
    meals: [
      { time: '08:00', food: '皇家狗粮', amount: '150g', finished: true },
      { time: '18:00', food: '皇家狗粮', amount: '140g', finished: false }
    ],
    water: '正常',
    poop: '1次，偏软',
    pee: '3次',
    walk: { time: '08:30', duration: 30, distance: '约1.5公里', notes: '早上有点蔫' },
    mood: '一般',
    health: '基本良好，略有不适',
    notes: '今天旺财食欲稍差，可能是昨天吃多了，已减少喂食量。下午精神恢复了一些。',
    photos: [
      'https://picsum.photos/id/1074/600/400',
      'https://picsum.photos/id/1084/600/400'
    ],
    videos: [],
    staffName: '小王',
    createdAt: '2024-06-17 19:30'
  },
  {
    id: 'dr003',
    date: '2024-06-16',
    bookingId: 'bk001',
    petId: '1',
    meals: [
      { time: '08:00', food: '皇家狗粮', amount: '150g', finished: true },
      { time: '18:00', food: '皇家狗粮', amount: '150g', finished: true }
    ],
    water: '正常',
    poop: '2次，正常',
    pee: '4次',
    walk: { time: '07:00', duration: 35, distance: '约1.8公里', notes: '状态很好' },
    mood: '活泼开朗',
    health: '良好',
    notes: '旺财已经完全适应新环境了，和其他狗狗也相处得很好。',
    photos: [
      'https://picsum.photos/id/1060/600/400',
      'https://picsum.photos/id/1059/600/400'
    ],
    videos: [],
    staffName: '小李',
    createdAt: '2024-06-16 20:15'
  },
  {
    id: 'dr004',
    date: '2024-06-15',
    bookingId: 'bk001',
    petId: '1',
    meals: [
      { time: '08:00', food: '皇家狗粮', amount: '150g', finished: false },
      { time: '18:00', food: '皇家狗粮', amount: '150g', finished: true }
    ],
    water: '偏少，需要引导喝水',
    poop: '1次，正常',
    pee: '2次',
    walk: { time: '16:00', duration: 20, distance: '约1公里', notes: '刚到有点紧张' },
    mood: '有点紧张',
    health: '良好',
    notes: '第一天到店，旺财有点陌生和紧张，食欲一般。晚上适应了一些，晚饭全部吃完了。',
    photos: [
      'https://picsum.photos/id/1069/600/400',
      'https://picsum.photos/id/1070/600/400'
    ],
    videos: [],
    staffName: '小张',
    createdAt: '2024-06-15 21:00'
  }
];

export const latestRecord = dailyRecordList[0];
