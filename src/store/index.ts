import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, DailyRecord, FeeItem, HandoverItem, HandoverGoods, RequirementItem } from '@/types';
import { bookingList as initBookings, feeItemList as initFeeItems, extraServiceList } from '@/data/booking';
import { dailyRecordList as initDailyRecords } from '@/data/dynamics';
import { handoverList as initHandovers, checkInChecklist, checkOutChecklist } from '@/data/handover';

function fixBooking(b: any): Booking {
  return {
    ...b,
    walkRequirements: Array.isArray(b.walkRequirements)
      ? b.walkRequirements
      : b.walkRequirements
        ? b.walkRequirements.split('，').map((t: string, i: number) => ({ id: `walk_old_${i}`, text: t.trim() })).filter((r: RequirementItem) => r.text)
        : [],
    dietaryRestrictions: Array.isArray(b.dietaryRestrictions)
      ? b.dietaryRestrictions
      : b.dietaryRestrictions
        ? b.dietaryRestrictions.split('，').map((t: string, i: number) => ({ id: `diet_old_${i}`, text: t.trim() })).filter((r: RequirementItem) => r.text)
        : [],
  };
}

function fixDailyRecord(r: any): DailyRecord {
  return {
    ...r,
    videos: r.videos || []
  };
}

function fixHandover(h: any): HandoverItem {
  return {
    ...h,
    petStatusNote: h.petStatusNote || '',
    ownerConfirmedAt: h.ownerConfirmedAt || undefined,
    staffConfirmedAt: h.staffConfirmedAt || undefined,
    completedAt: h.completedAt || undefined,
  };
}

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
  syncSelectedServices: () => void;

  updateHandover: (id: string, data: Partial<HandoverItem>) => void;
  addHandover: (item: HandoverItem) => void;
  toggleHandoverGoods: (handoverId: string, goodsId: string) => void;
  toggleChecklistItem: (tab: 'check_in' | 'check_out', itemId: string) => void;
  confirmHandover: (handoverId: string, role: 'owner' | 'staff') => void;

  checkInChecklist: typeof checkInChecklist;
  checkOutChecklist: typeof checkOutChecklist;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      bookings: initBookings.map(fixBooking),
      dailyRecords: initDailyRecords.map(fixDailyRecord),
      feeItems: initFeeItems,
      handovers: initHandovers.map(fixHandover),
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

      syncSelectedServices: () => set(state => {
        const extraFeeServiceIds = state.feeItems
          .filter(f => f.type === 'extra')
          .map(f => {
            const svc = extraServiceList.find(s => s.name === f.name);
            return svc?.id;
          })
          .filter(Boolean) as string[];

        const includedServiceNames = state.feeItems
          .filter(f => f.type === 'service')
          .map(f => f.name);

        const serviceIdsFromFees = extraServiceList
          .filter(s => includedServiceNames.includes(s.name))
          .map(s => s.id);

        const allSelected = [...new Set([...extraFeeServiceIds, ...serviceIdsFromFees])];

        return { selectedExtraServices: allSelected };
      }),

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

        const handover = state.handovers.find(h => h.id === handoverId);
        const newOwnerConfirmed = role === 'owner' ? true : handover?.ownerConfirmed;
        const newStaffConfirmed = role === 'staff' ? true : handover?.staffConfirmed;
        const newOwnerConfirmedAt = role === 'owner' ? confirmedAt : handover?.ownerConfirmedAt;
        const newStaffConfirmedAt = role === 'staff' ? confirmedAt : handover?.staffConfirmedAt;
        const bothConfirmed = newOwnerConfirmed && newStaffConfirmed;

        return {
          handovers: state.handovers.map(h => {
            if (h.id !== handoverId) return h;
            return {
              ...h,
              ownerConfirmed: newOwnerConfirmed,
              staffConfirmed: newStaffConfirmed,
              ownerConfirmedAt: newOwnerConfirmedAt,
              staffConfirmedAt: newStaffConfirmedAt,
              completedAt: bothConfirmed ? confirmedAt : h.completedAt,
            };
          })
        };
      })
    }),
    {
      name: 'pet-board-store',
      partialize: (state) => ({
        bookings: state.bookings,
        dailyRecords: state.dailyRecords,
        feeItems: state.feeItems,
        handovers: state.handovers,
        selectedExtraServices: state.selectedExtraServices,
        checkInChecklist: state.checkInChecklist,
        checkOutChecklist: state.checkOutChecklist,
      })
    }
  )
);

export default useAppStore;
