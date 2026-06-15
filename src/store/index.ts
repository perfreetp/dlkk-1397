import { create } from 'zustand';
import type { Booking, DailyRecord, FeeItem, HandoverItem, HandoverGoods } from '@/types';
import { bookingList as initBookings, feeItemList as initFeeItems, extraServiceList } from '@/data/booking';
import { dailyRecordList as initDailyRecords } from '@/data/dynamics';
import { handoverList as initHandovers, checkInChecklist, checkOutChecklist } from '@/data/handover';

interface AppState {
  bookings: Booking[];
  dailyRecords: DailyRecord[];
  feeItems: FeeItem[];
  handovers: HandoverItem[];
  selectedExtraServices: string[];

  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, data: Partial<Booking>) => void;

  addDailyRecord: (record: DailyRecord) => void;

  setFeeItems: (items: FeeItem[]) => void;
  addFeeItem: (item: FeeItem) => void;
  removeFeeItem: (id: string) => void;

  toggleExtraService: (serviceId: string) => void;
  setSelectedExtraServices: (ids: string[]) => void;

  updateHandover: (id: string, data: Partial<HandoverItem>) => void;
  addHandover: (item: HandoverItem) => void;
  toggleHandoverGoods: (handoverId: string, goodsId: string) => void;
  toggleChecklistItem: (tab: 'check_in' | 'check_out', itemId: string) => void;
  confirmHandover: (handoverId: string, role: 'owner' | 'staff') => void;

  checkInChecklist: typeof checkInChecklist;
  checkOutChecklist: typeof checkOutChecklist;
}

const useAppStore = create<AppState>((set, get) => ({
  bookings: initBookings,
  dailyRecords: initDailyRecords,
  feeItems: initFeeItems,
  handovers: initHandovers,
  selectedExtraServices: ['es1'],
  checkInChecklist: checkInChecklist.map(c => ({ ...c })),
  checkOutChecklist: checkOutChecklist.map(c => ({ ...c })),

  addBooking: (booking) => set(state => ({
    bookings: [booking, ...state.bookings]
  })),

  updateBooking: (id, data) => set(state => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, ...data } : b)
  })),

  addDailyRecord: (record) => set(state => ({
    dailyRecords: [record, ...state.dailyRecords]
  })),

  setFeeItems: (items) => set({ feeItems: items }),

  addFeeItem: (item) => set(state => ({
    feeItems: [...state.feeItems, item]
  })),

  removeFeeItem: (id) => set(state => ({
    feeItems: state.feeItems.filter(f => f.id !== id)
  })),

  toggleExtraService: (serviceId) => set(state => {
    const current = state.selectedExtraServices;
    const exists = current.includes(serviceId);
    const newSelected = exists
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId];

    const service = extraServiceList.find(s => s.id === serviceId);
    if (!service) return { selectedExtraServices: newSelected };

    let newFeeItems = [...state.feeItems];
    if (exists) {
      newFeeItems = newFeeItems.filter(
        f => !(f.type === 'extra' && f.name === service.name)
      );
    } else {
      const alreadyInFees = newFeeItems.some(
        f => f.type === 'extra' && f.name === service.name
      );
      if (!alreadyInFees) {
        newFeeItems.push({
          id: `fee_${serviceId}_${Date.now()}`,
          name: service.name,
          price: service.price,
          quantity: 1,
          type: 'extra'
        });
      }
    }

    return { selectedExtraServices: newSelected, feeItems: newFeeItems };
  }),

  setSelectedExtraServices: (ids) => set({ selectedExtraServices: ids }),

  updateHandover: (id, data) => set(state => ({
    handovers: state.handovers.map(h => h.id === id ? { ...h, ...data } : h)
  })),

  addHandover: (item) => set(state => ({
    handovers: [...state.handovers, item]
  })),

  toggleHandoverGoods: (handoverId, goodsId) => set(state => ({
    handovers: state.handovers.map(h => {
      if (h.id !== handoverId) return h;
      return {
        ...h,
        itemsList: h.itemsList.map(g =>
          g.id === goodsId ? { ...g, checked: !g.checked } : g
        )
      };
    })
  })),

  toggleChecklistItem: (tab, itemId) => set(state => {
    if (tab === 'check_in') {
      return {
        checkInChecklist: state.checkInChecklist.map(c =>
          c.id === itemId ? { ...c, checked: !c.checked } : c
        )
      };
    }
    return {
      checkOutChecklist: state.checkOutChecklist.map(c =>
        c.id === itemId ? { ...c, checked: !c.checked } : c
      )
    };
  }),

  confirmHandover: (handoverId, role) => set(state => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const confirmedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return {
      handovers: state.handovers.map(h => {
        if (h.id !== handoverId) return h;
        return {
          ...h,
          ...(role === 'owner' ? { ownerConfirmed: true } : { staffConfirmed: true }),
          confirmedAt
        };
      })
    };
  })
}));

export default useAppStore;
