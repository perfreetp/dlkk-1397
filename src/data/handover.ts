import type { HandoverItem, HandoverGoods } from '@/types';

export const defaultGoodsCategories = ['食品', '药品', '用品', '玩具', '证件', '其他'];

export const handoverList: HandoverItem[] = [
  {
    id: 'ho001',
    bookingId: 'bk001',
    type: 'check_in',
    itemsList: [
      { id: 'g1', name: '皇家狗粮', category: '食品', quantity: 1, checked: true },
      { id: 'g2', name: '钙片', category: '药品', quantity: 1, checked: true },
      { id: 'g3', name: '牵引绳', category: '用品', quantity: 1, checked: true },
      { id: 'g4', name: '飞盘玩具', category: '玩具', quantity: 1, checked: false },
      { id: 'g5', name: '疫苗本', category: '证件', quantity: 1, checked: true }
    ],
    healthStatus: '良好，精神状态佳',
    moodStatus: '兴奋，对新环境好奇',
    petStatusNote: '',
    ownerConfirmed: true,
    staffConfirmed: true,
    ownerConfirmedAt: '2024-06-15 10:25',
    staffConfirmedAt: '2024-06-15 10:30',
    completedAt: '2024-06-15 10:30'
  }
];

export const checkInChecklist = [
  { id: 'c1', label: '宠物身份信息核对', checked: true },
  { id: 'c2', label: '疫苗本/健康证明检查', checked: true },
  { id: 'c3', label: '体表检查（皮肤、毛发、指甲）', checked: true },
  { id: 'c4', label: '精神状态评估', checked: true },
  { id: 'c5', label: '随身物品清点', checked: true },
  { id: 'c6', label: '喂养须知确认', checked: true },
  { id: 'c7', label: '紧急联系人确认', checked: false }
];

export const checkOutChecklist = [
  { id: 'co1', label: '宠物状态核对', checked: false },
  { id: 'co2', label: '随身物品归还', checked: false },
  { id: 'co3', label: '寄养期间情况说明', checked: false },
  { id: 'co4', label: '费用结算确认', checked: false },
  { id: 'co5', label: '评价与反馈', checked: false }
];
