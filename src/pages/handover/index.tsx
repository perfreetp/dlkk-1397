import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Textarea
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import useAppStore from '@/store';
import type { Booking, HandoverGoods, HandoverItem } from '@/types';

const HandoverPage: React.FC = () => {
  const {
    bookings,
    handovers,
    toggleHandoverGoods,
    toggleChecklistItem,
    confirmHandover,
    checkInChecklist,
    checkOutChecklist,
    updateBooking,
    feeItems,
    updateHandover,
    addHandover,
    lastSelectedBookingId,
    setLastSelectedBookingId
  } = useAppStore();

  const inProgressBooking = useMemo(
    () => bookings.find(b => b.status === 'in_progress'),
    [bookings]
  );

  const getInitialBookingId = (): string | null => {
    if (lastSelectedBookingId && bookings.some(b => b.id === lastSelectedBookingId)) {
      return lastSelectedBookingId;
    }
    if (inProgressBooking?.id) return inProgressBooking.id;
    if (bookings.length > 0) return bookings[0].id;
    return null;
  };

  const getInitialTab = (bookingId: string | null): 'check_in' | 'check_out' => {
    if (!bookingId) return 'check_in';
    const b = bookings.find(bk => bk.id === bookingId);
    if (!b) return 'check_in';
    if (b.status === 'completed') return 'check_out';
    if (b.status === 'in_progress') return 'check_in';
    const checkoutHo = handovers.find(h => h.bookingId === bookingId && h.type === 'check_out');
    if (checkoutHo?.ownerConfirmed || checkoutHo?.staffConfirmed) return 'check_out';
    return 'check_in';
  };

  const initialBookingId = getInitialBookingId();
  const initialTab = getInitialTab(initialBookingId);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(initialBookingId);
  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out'>(initialTab);
  const [petStatusDraft, setPetStatusDraft] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (selectedBookingId && selectedBookingId !== lastSelectedBookingId) {
      setLastSelectedBookingId(selectedBookingId);
    }
  }, [selectedBookingId, lastSelectedBookingId, setLastSelectedBookingId]);

  useEffect(() => {
    if (!selectedBookingId && bookings.length > 0) {
      const defaultId = inProgressBooking?.id || bookings[0]?.id || null;
      setSelectedBookingId(defaultId);
    }
  }, [bookings, selectedBookingId, inProgressBooking]);

  const currentBooking: Booking | undefined = useMemo(
    () => bookings.find(b => b.id === selectedBookingId),
    [bookings, selectedBookingId]
  );

  const historicalBookings = useMemo(
    () => bookings.filter(b => b.id !== selectedBookingId),
    [bookings, selectedBookingId]
  );

  const checkInHandover: HandoverItem | undefined = useMemo(
    () => handovers.find(h => h.bookingId === selectedBookingId && h.type === 'check_in'),
    [handovers, selectedBookingId]
  );

  const checkOutHandover: HandoverItem | undefined = useMemo(
    () => handovers.find(h => h.bookingId === selectedBookingId && h.type === 'check_out'),
    [handovers, selectedBookingId]
  );

  const currentHandover = activeTab === 'check_in' ? checkInHandover : checkOutHandover;
  const checklist = activeTab === 'check_in' ? checkInChecklist : checkOutChecklist;

  useEffect(() => {
    if (
      activeTab === 'check_out' &&
      selectedBookingId &&
      checkInHandover &&
      !checkOutHandover
    ) {
      const itemsList: HandoverGoods[] = checkInHandover.itemsList.map(item => ({
        ...item,
        checked: false
      }));

      const newHandover: HandoverItem = {
        id: `ho_checkout_${Date.now()}`,
        bookingId: selectedBookingId,
        type: 'check_out',
        itemsList,
        healthStatus: checkInHandover.healthStatus,
        moodStatus: checkInHandover.moodStatus,
        petStatusNote: '',
        ownerConfirmed: false,
        staffConfirmed: false
      };

      addHandover(newHandover);
      Taro.showToast({
        title: '已生成离店交接单',
        icon: 'success'
      });
    }
  }, [activeTab, selectedBookingId, checkInHandover, checkOutHandover, addHandover]);

  const groupedGoods = useMemo(() => {
    const goods = currentHandover?.itemsList || [];
    const groups: Record<string, HandoverGoods[]> = {};
    goods.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [currentHandover]);

  const goodsCheckedCount = (currentHandover?.itemsList || []).filter(g => g.checked).length;
  const goodsTotalCount = (currentHandover?.itemsList || []).length;

  const returnGoodsCheckedCount = (checkOutHandover?.itemsList || []).filter(g => g.checked).length;
  const returnGoodsTotalCount = (checkOutHandover?.itemsList || []).length;
  const returnGoodsMissingCount = returnGoodsTotalCount - returnGoodsCheckedCount;

  const allChecklistChecked = checklist.every(c => c.checked);
  const allGoodsReturned = returnGoodsCheckedCount === returnGoodsTotalCount && returnGoodsTotalCount > 0;
  const hasPetStatusNote = !!(checkOutHandover?.petStatusNote && checkOutHandover.petStatusNote.trim().length > 0);

  const canConfirmCheckout = useMemo(() => {
    if (activeTab !== 'check_out') return allChecklistChecked;
    return allChecklistChecked && allGoodsReturned && hasPetStatusNote;
  }, [activeTab, allChecklistChecked, allGoodsReturned, hasPetStatusNote]);

  const roomFee = feeItems.filter(f => f.type === 'room').reduce((s, f) => s + f.price * f.quantity, 0);
  const serviceFee = feeItems.filter(f => f.type === 'service' || f.type === 'extra').reduce((s, f) => s + f.price * f.quantity, 0);
  const totalFee = feeItems.reduce((s, f) => s + f.price * f.quantity, 0);

  const isBothConfirmed = !!(currentHandover?.ownerConfirmed && currentHandover?.staffConfirmed);
  const isCheckoutCompleted = !!(checkOutHandover?.ownerConfirmed && checkOutHandover?.staffConfirmed);

  const feeSettled = totalFee > 0;

  const handleTabChange = (tab: 'check_in' | 'check_out') => {
    setActiveTab(tab);
  };

  const handleSelectHistory = (id: string) => {
    setSelectedBookingId(id);
    setShowHistory(false);
    const b = bookings.find(bk => bk.id === id);
    if (!b) {
      setActiveTab('check_in');
      return;
    }
    if (b.status === 'completed') {
      setActiveTab('check_out');
    } else if (b.status === 'in_progress') {
      setActiveTab('check_in');
    } else {
      const checkoutHo = handovers.find(h => h.bookingId === id && h.type === 'check_out');
      if (checkoutHo?.ownerConfirmed || checkoutHo?.staffConfirmed) {
        setActiveTab('check_out');
      } else {
        setActiveTab('check_in');
      }
    }
  };

  const handleToggleGoods = (goodsId: string) => {
    if (!currentHandover) return;
    toggleHandoverGoods(currentHandover.id, goodsId);
  };

  const handleToggleReturnGoods = (goodsId: string) => {
    if (!checkOutHandover) return;
    toggleHandoverGoods(checkOutHandover.id, goodsId);
  };

  const handleToggleChecklist = (itemId: string) => {
    toggleChecklistItem(activeTab, itemId);
  };

  const handlePetStatusBlur = useCallback(() => {
    if (!checkOutHandover) return;
    const note = petStatusDraft.trim();
    if (note !== checkOutHandover.petStatusNote) {
      updateHandover(checkOutHandover.id, { petStatusNote: note });
    }
  }, [checkOutHandover, petStatusDraft, updateHandover]);

  const handleConfirm = (role: 'owner' | 'staff') => {
    if (!currentHandover || !allChecklistChecked) return;

    if (activeTab === 'check_out') {
      if (!allGoodsReturned) {
        Taro.showToast({ title: '请先核对完所有归还物品', icon: 'none' });
        return;
      }
      if (!hasPetStatusNote) {
        Taro.showToast({ title: '请先填写宠物状态记录', icon: 'none' });
        return;
      }
    }

    const checklistSummary = checklist.map(c => `${c.checked ? '✓' : '✗'} ${c.label}`).join('\n');
    const returnSummary = activeTab === 'check_out'
      ? `\n\n归还物品：${returnGoodsCheckedCount}/${returnGoodsTotalCount} 件已核对`
      : '';
    const petNoteSummary = (activeTab === 'check_out' && checkOutHandover?.petStatusNote)
      ? `\n\n宠物状态：${checkOutHandover.petStatusNote}`
      : '';

    Taro.showModal({
      title: role === 'owner' ? '宠主确认' : '店员确认',
      content: `核对清单（${checklist.length}项）：\n${checklistSummary}${returnSummary}${petNoteSummary}`,
      success: (res) => {
        if (res.confirm) {
          confirmHandover(currentHandover.id, role);

          const updated = useAppStore.getState().handovers.find(h => h.id === currentHandover.id);
          const bothConfirmed = updated?.ownerConfirmed && updated?.staffConfirmed;

          if (bothConfirmed && activeTab === 'check_out' && currentBooking) {
            updateBooking(currentBooking.id, { status: 'completed' });
            Taro.showToast({ title: '离店交接完成！', icon: 'success' });
          } else if (bothConfirmed && activeTab === 'check_in' && currentBooking) {
            updateBooking(currentBooking.id, { status: 'in_progress' });
            Taro.showToast({ title: '到店交接完成！', icon: 'success' });
          } else {
            Taro.showToast({ title: '确认成功', icon: 'success' });
          }
        }
      }
    });
  };

  if (!currentBooking) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>交接单</Text>
          <Text className={styles.headerSubtitle}>透明交接，安心托付</Text>
        </View>
        <View className={styles.content}>
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无交接记录</Text>
            <Text style={{ fontSize: '24rpx', color: '#9CA3AF', marginTop: '16rpx' }}>
              请先创建预约
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>交接单</Text>
        <Text className={styles.headerSubtitle}>透明交接，安心托付</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
        <View className={styles.bookingSelector} onClick={() => setShowHistory(!showHistory)}>
          <View className={styles.bookingSelectorMain}>
            <Image
              className={styles.bookingSelectorAvatar}
              src={currentBooking.petAvatar}
              mode="aspectFill"
            />
            <View className={styles.bookingSelectorInfo}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                <Text className={styles.bookingSelectorName}>{currentBooking.petName}</Text>
                <StatusTag status={currentBooking.status} />
              </View>
              <Text className={styles.bookingSelectorMeta}>
                {currentBooking.checkInDate} ~ {currentBooking.checkOutDate} · {currentBooking.days}天
              </Text>
            </View>
            <Text className={styles.bookingSelectorArrow}>{showHistory ? '▲' : '▼'}</Text>
          </View>

          {showHistory && historicalBookings.length > 0 && (
            <View className={styles.historyList}>
              {historicalBookings.map(b => (
                <View
                  key={b.id}
                  className={styles.historyItem}
                  onClick={() => handleSelectHistory(b.id)}
                >
                  <Image
                    className={styles.historyAvatar}
                    src={b.petAvatar}
                    mode="aspectFill"
                  />
                  <View className={styles.historyInfo}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                      <Text className={styles.historyName}>{b.petName}</Text>
                      <StatusTag status={b.status} />
                    </View>
                    <Text className={styles.historyMeta}>
                      {b.checkInDate} ~ {b.checkOutDate} · {b.days}天
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          {showHistory && historicalBookings.length === 0 && (
            <View className={styles.historyEmpty}>
              <Text>暂无历史订单</Text>
            </View>
          )}
        </View>

        {isCheckoutCompleted && (
          <View className={styles.summaryCard}>
            <Text className={styles.summaryTitle}>交接摘要</Text>
            <View className={styles.summaryGrid}>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>寄养天数</Text>
                <Text className={styles.summaryValue}>{currentBooking.days} 天</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>交接完成</Text>
                <Text className={styles.summaryValue}>
                  {checkOutHandover?.completedAt ? checkOutHandover.completedAt.slice(5, 16) : '—'}
                </Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>物品归还</Text>
                <Text className={classnames(
                  styles.summaryValue,
                  returnGoodsMissingCount > 0 && styles.summaryWarn
                )}>
                  {returnGoodsMissingCount > 0 ? `${returnGoodsMissingCount} 件未归还` : '全部归还'}
                </Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>费用状态</Text>
                <Text className={classnames(
                  styles.summaryValue,
                  feeSettled && styles.summaryOk
                )}>
                  {feeSettled ? '已结清' : '待结算'}
                </Text>
              </View>
            </View>
            <View className={styles.summaryAmount}>
              <Text className={styles.summaryAmountLabel}>总费用</Text>
              <Text className={styles.summaryAmountValue}>¥{totalFee}</Text>
            </View>
          </View>
        )}

        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, activeTab === 'check_in' && styles.active)}
            onClick={() => handleTabChange('check_in')}
          >
            到店交接
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'check_out' && styles.active)}
            onClick={() => handleTabChange('check_out')}
          >
            离店交接
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <View className={styles.petInfo}>
              <Image
                className={styles.petAvatar}
                src={currentBooking.petAvatar}
                mode="aspectFill"
              />
              <View>
                <Text className={styles.petName}>{currentBooking.petName}</Text>
                <Text className={styles.petMeta}>
                  {currentBooking.roomTypeName} · {currentBooking.days}天
                </Text>
              </View>
            </View>
            <StatusTag status={currentBooking.status} />
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>入住日期</Text>
            <Text className={styles.infoValue}>{currentBooking.checkInDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>
              {isCheckoutCompleted ? '实际离店' : '预计离店'}
            </Text>
            <Text className={styles.infoValue}>{currentBooking.checkOutDate}</Text>
          </View>
        </View>

        {currentHandover && (
          <View className={classnames(styles.statusBar, isBothConfirmed && styles.completedBar)}>
            <Text className={classnames(styles.statusText, isBothConfirmed && styles.statusTextDone)}>
              {isBothConfirmed
                ? activeTab === 'check_in' ? '到店交接完成' : '离店交接完成'
                : activeTab === 'check_in'
                  ? '待到店交接'
                  : '待离店交接'}
            </Text>
            {isBothConfirmed && currentHandover.completedAt && (
              <Text className={styles.statusTime}>完成于 {currentHandover.completedAt}</Text>
            )}
          </View>
        )}

        {activeTab === 'check_out' && checkInHandover?.completedAt && (
          <View className={styles.card}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>到店交接完成时间</Text>
              <Text className={styles.infoValue}>{checkInHandover.completedAt}</Text>
            </View>
          </View>
        )}

        {isCheckoutCompleted && activeTab === 'check_out' && checkOutHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>离店交接记录</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>离店完成时间</Text>
              <Text className={styles.infoValue}>{checkOutHandover.completedAt || '—'}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>宠主确认</Text>
              <Text className={styles.infoValue}>{checkOutHandover.ownerConfirmedAt || '—'}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>店员确认</Text>
              <Text className={styles.infoValue}>{checkOutHandover.staffConfirmedAt || '—'}</Text>
            </View>
            {checkOutHandover.petStatusNote && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>宠物状态</Text>
                <Text className={styles.infoValue}>{checkOutHandover.petStatusNote}</Text>
              </View>
            )}
          </View>
        )}

        {!isBothConfirmed && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>
              {activeTab === 'check_in' ? '到店核对清单' : '离店核对清单'}
            </Text>
            <View className={styles.checklist}>
              {checklist.map(item => (
                <View
                  key={item.id}
                  className={styles.checkItem}
                  onClick={() => handleToggleChecklist(item.id)}
                >
                  <View
                    className={classnames(styles.checkbox, item.checked && styles.checked)}
                  />
                  <Text className={styles.checkLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'check_in' && !isBothConfirmed && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>
              物品清单 ({goodsCheckedCount}/{goodsTotalCount})
            </Text>
            {Object.entries(groupedGoods).map(([category, items]) => (
              <View key={category} className={styles.goodsCategory}>
                <Text className={styles.categoryTitle}>{category}</Text>
                <View className={styles.goodsList}>
                  {items.map(item => (
                    <View
                      key={item.id}
                      className={styles.goodsItem}
                      onClick={() => handleToggleGoods(item.id)}
                    >
                      <View
                        className={classnames(
                          styles.goodsCheckbox,
                          item.checked && styles.checked
                        )}
                      />
                      <Text className={styles.goodsName}>{item.name}</Text>
                      <Text className={styles.goodsQty}>×{item.quantity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {isCheckoutCompleted && activeTab === 'check_out' && checkOutHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>
              归还物品明细 ({returnGoodsCheckedCount}/{returnGoodsTotalCount} 件)
            </Text>
            {Object.entries(groupedGoods).map(([category, items]) => (
              <View key={category} className={styles.goodsCategory}>
                <Text className={styles.categoryTitle}>{category}</Text>
                <View className={styles.goodsList}>
                  {items.map(item => (
                    <View key={item.id} className={styles.goodsItem}>
                      <View
                        className={classnames(
                          styles.goodsCheckbox,
                          item.checked && styles.checked
                        )}
                      />
                      <Text className={styles.goodsName}>{item.name}</Text>
                      <Text className={classnames(
                        styles.goodsQty,
                        item.checked ? '' : styles.missingItem
                      )}>
                        {item.checked ? '已归还' : '未归还'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'check_in' && currentHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>
              {isBothConfirmed ? '到店健康状态' : '健康状态'}
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>体表检查</Text>
              <Text className={styles.infoValue}>{currentHandover.healthStatus}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>精神状态</Text>
              <Text className={styles.infoValue}>{currentHandover.moodStatus}</Text>
            </View>
          </View>
        )}

        {activeTab === 'check_out' && checkOutHandover && (
          <>
            {!isCheckoutCompleted && (
              <View className={styles.card}>
                <Text className={styles.sectionTitle}>归还物品核对</Text>
                <View className={styles.returnProgressText}>
                  <Text>
                    已归还 {returnGoodsCheckedCount}/{returnGoodsTotalCount} 件
                    {returnGoodsMissingCount > 0 && `（${returnGoodsMissingCount}件待核对）`}
                  </Text>
                </View>
                <View className={styles.returnProgress}>
                  <View
                    className={styles.returnProgressBar}
                    style={{ width: `${returnGoodsTotalCount ? (returnGoodsCheckedCount / returnGoodsTotalCount) * 100 : 0}%` }}
                  />
                </View>
                <View className={styles.goodsList}>
                  {checkOutHandover.itemsList.map(item => (
                    <View
                      key={item.id}
                      className={styles.goodsItem}
                      onClick={() => handleToggleReturnGoods(item.id)}
                    >
                      <View
                        className={classnames(
                          styles.goodsCheckbox,
                          item.checked && styles.checked
                        )}
                      />
                      <Text className={styles.goodsName}>{item.name}</Text>
                      <Text className={styles.goodsQty}>×{item.quantity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!isCheckoutCompleted && (
              <View className={styles.card}>
                <Text className={styles.sectionTitle}>
                  宠物状态记录
                  {!hasPetStatusNote && <Text style={{ color: '#EF4444', fontSize: '24rpx', marginLeft: '8rpx' }}>（必填）</Text>}
                </Text>
                <Textarea
                  className={styles.petStatusInput}
                  placeholder="请记录宠物当前状态，如精神状态、毛发、是否已洗澡等"
                  value={petStatusDraft || checkOutHandover.petStatusNote || ''}
                  onInput={(e) => setPetStatusDraft(e.detail.value)}
                  onBlur={handlePetStatusBlur}
                  maxlength={500}
                />
              </View>
            )}

            {!isCheckoutCompleted && (
              <View className={styles.card}>
                <Text className={styles.sectionTitle}>费用结算确认</Text>
                <View className={styles.feeSummary}>
                  <View className={styles.feeSummaryRow}>
                    <Text>寄养{currentBooking.days}天</Text>
                    <Text>¥{roomFee}</Text>
                  </View>
                  <View className={styles.feeSummaryRow}>
                    <Text>追加服务</Text>
                    <Text>¥{serviceFee}</Text>
                  </View>
                  <View className={classnames(styles.feeSummaryRow, styles.feeSummaryTotal)}>
                    <Text>合计</Text>
                    <Text>¥{totalFee}</Text>
                  </View>
                </View>
              </View>
            )}

            {!isCheckoutCompleted && (
              <View className={styles.card}>
                <Text className={styles.sectionTitle}>费用明细</Text>
                {feeItems.map(item => (
                  <View key={item.id} className={styles.infoRow}>
                    <Text className={styles.infoLabel}>
                      {item.name} {item.quantity > 1 ? `×${item.quantity}` : ''}
                    </Text>
                    <Text className={styles.infoValue}>¥{item.price * item.quantity}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {!isBothConfirmed && currentHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>双方确认</Text>
            <View className={styles.confirmButtons}>
              <View
                className={classnames(
                  styles.confirmBtn,
                  (!canConfirmCheckout || currentHandover?.ownerConfirmed) && styles.confirmBtnDisabled,
                  currentHandover?.ownerConfirmed && styles.confirmBtnDone
                )}
                onClick={() => handleConfirm('owner')}
              >
                <Text className={styles.confirmBtnText}>
                  {currentHandover?.ownerConfirmed ? '宠主已确认' : '宠主确认'}
                </Text>
                {currentHandover?.ownerConfirmedAt && (
                  <Text className={styles.confirmBtnTime}>{currentHandover.ownerConfirmedAt}</Text>
                )}
              </View>
              <View
                className={classnames(
                  styles.confirmBtn,
                  (!canConfirmCheckout || currentHandover?.staffConfirmed) && styles.confirmBtnDisabled,
                  currentHandover?.staffConfirmed && styles.confirmBtnDone
                )}
                onClick={() => handleConfirm('staff')}
              >
                <Text className={styles.confirmBtnText}>
                  {currentHandover?.staffConfirmed ? '店员已确认' : '店员确认'}
                </Text>
                {currentHandover?.staffConfirmedAt && (
                  <Text className={styles.confirmBtnTime}>{currentHandover.staffConfirmedAt}</Text>
                )}
              </View>
            </View>
            {!allChecklistChecked && (
              <Text className={styles.confirmTip}>请先完成所有核对项后再确认</Text>
            )}
            {activeTab === 'check_out' && allChecklistChecked && !allGoodsReturned && (
              <Text className={styles.confirmTip}>请先核对完所有归还物品</Text>
            )}
            {activeTab === 'check_out' && allChecklistChecked && allGoodsReturned && !hasPetStatusNote && (
              <Text className={styles.confirmTip}>请先填写宠物状态记录</Text>
            )}
          </View>
        )}

        {isBothConfirmed && currentHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>确认信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>宠主确认时间</Text>
              <Text className={styles.infoValue}>
                {currentHandover.ownerConfirmedAt || '—'}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>店员确认时间</Text>
              <Text className={styles.infoValue}>
                {currentHandover.staffConfirmedAt || '—'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HandoverPage;
