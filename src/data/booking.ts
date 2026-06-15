import type { Booking, RoomType, ExtraService, FeeItem } from '@/types';

export const roomTypeList: RoomType[] = [
  {
    id: '1',
    name: '标准间',
    description: '温馨舒适的独立空间，适合中小型宠物',
    price: 88,
    size: '约2㎡',
    features: ['独立空间', '24小时监控', '每日清洁', '定时喂食'],
    image: 'https://picsum.photos/id/1048/600/400'
  },
  {
    id: '2',
    name: '豪华间',
    description: '宽敞明亮的大空间，配备舒适床垫和玩具',
    price: 168,
    size: '约4㎡',
    features: ['大空间', '独立空调', '舒适床垫', '互动玩具', '每日遛弯1次'],
    image: 'https://picsum.photos/id/1057/600/400'
  },
  {
    id: '3',
    name: 'VIP套房',
    description: '顶级奢华体验，专属护理人员一对一服务',
    price: 298,
    size: '约8㎡',
    features: ['超大空间', '专属护理', '独立花园', '每日遛弯3次', '实时视频', '豪华零食'],
    image: 'https://picsum.photos/id/1062/600/400'
  }
];

export const extraServiceList: ExtraService[] = [
  {
    id: 'es1',
    name: '基础洗护',
    description: '洗澡+吹干+梳毛',
    price: 98,
    category: 'grooming',
    icon: '🛁'
  },
  {
    id: 'es2',
    name: '精致美容',
    description: '洗护+造型修剪+指甲修剪',
    price: 198,
    category: 'grooming',
    icon: '✂️'
  },
  {
    id: 'es3',
    name: '额外遛狗',
    description: '每次30分钟，专人陪同',
    price: 30,
    category: 'walking',
    icon: '🐕'
  },
  {
    id: 'es4',
    name: '陪玩互动',
    description: '30分钟专人陪玩',
    price: 50,
    category: 'other',
    icon: '🎾'
  }
];

export const bookingList: Booking[] = [
  {
    id: 'bk001',
    petId: '1',
    petName: '旺财',
    petAvatar: 'https://picsum.photos/id/237/200/200',
    roomTypeId: '2',
    roomTypeName: '豪华间',
    checkInDate: '2024-06-15',
    checkOutDate: '2024-06-20',
    days: 5,
    status: 'in_progress',
    totalPrice: 840,
    feedingSchedule: [
      { time: '08:00', food: '皇家狗粮', amount: '150g' },
      { time: '18:00', food: '皇家狗粮', amount: '150g' }
    ],
    medications: [
      { name: '钙片', dosage: '2片', frequency: '每日1次', notes: '饭后服用' }
    ],
    walkRequirements: '每天早晚各遛一次，每次30分钟，喜欢捡球玩',
    dietaryRestrictions: '对鸡肉过敏，不能吃葡萄和巧克力',
    notes: '性格温顺，怕打雷，下雨时请多安抚',
    photos: [
      'https://picsum.photos/id/237/400/300',
      'https://picsum.photos/id/1025/400/300'
    ],
    createdAt: '2024-06-10 14:30'
  },
  {
    id: 'bk002',
    petId: '2',
    petName: '咪咪',
    petAvatar: 'https://picsum.photos/id/40/200/200',
    roomTypeId: '1',
    roomTypeName: '标准间',
    checkInDate: '2024-06-18',
    checkOutDate: '2024-06-22',
    days: 4,
    status: 'confirmed',
    totalPrice: 352,
    feedingSchedule: [
      { time: '09:00', food: '渴望猫粮', amount: '50g' },
      { time: '21:00', food: '渴望猫粮', amount: '50g' }
    ],
    medications: [],
    walkRequirements: '不需要遛，猫砂盆每日清理2次',
    dietaryRestrictions: '无特殊禁忌',
    notes: '比较胆小，刚开始可能会躲起来，请不要强行抱',
    photos: ['https://picsum.photos/id/40/400/300'],
    createdAt: '2024-06-12 10:15'
  },
  {
    id: 'bk003',
    petId: '1',
    petName: '旺财',
    petAvatar: 'https://picsum.photos/id/237/200/200',
    roomTypeId: '2',
    roomTypeName: '豪华间',
    checkInDate: '2024-05-01',
    checkOutDate: '2024-05-05',
    days: 4,
    status: 'completed',
    totalPrice: 672,
    feedingSchedule: [
      { time: '08:00', food: '皇家狗粮', amount: '150g' },
      { time: '18:00', food: '皇家狗粮', amount: '150g' }
    ],
    medications: [],
    walkRequirements: '每天2次，每次30分钟',
    dietaryRestrictions: '对鸡肉过敏',
    notes: '',
    photos: [],
    createdAt: '2024-04-20 16:00'
  }
];

export const feeItemList: FeeItem[] = [
  { id: 'f1', name: '豪华间 (5晚)', price: 168, quantity: 5, type: 'room' },
  { id: 'f2', name: '基础洗护', price: 98, quantity: 1, type: 'service' },
  { id: 'f3', name: '额外遛狗', price: 30, quantity: 3, type: 'extra' },
  { id: 'f4', name: '押金', price: 200, quantity: 1, type: 'deposit' }
];
