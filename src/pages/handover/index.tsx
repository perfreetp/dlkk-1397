import React, { useState, useMemo, useCallback } from 'react';
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
import type { HandoverGoods } from '@/types';

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
    updateHandover
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out'>('check_in');
  const [petStatusDraft, setPetStatusDraft] = useState('');

  const currentBooking = bookings.find(b => b.status === 'in_progress');
  const checkInHandover = handovers.find(h => h.bookingId === currentBooking?.id && h.type === 'check_in');
  const currentHandover = activeTab === 'check_in'
    ? checkInHandover
    : handovers.find(h => h.bookingId === currentBooking?.id && h.type === 'check_out');

  const checklist = activeTab === 'check_in' ? checkInChecklist : checkOutChecklist;

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

  const returnGoodsCheckedCount = (checkInHandover?.itemsList || []).filter(g => g.checked).length;
  const returnGoodsTotalCount = (checkInHandover?.itemsList || []).length;

  const allChecklistChecked = checklist.every(c => c.checked);

  const roomFee = feeItems.filter(f => f.type === 'room').reduce((s, f) => s + f.price * f.quantity, 0);
  const serviceFee = feeItems.filter(f => f.type === 'service' || f.type === 'extra').reduce((s, f) => s + f.price * f.quantity, 0);
  const totalFee = feeItems.reduce((s, f) => s + f.price * f.quantity, 0);

  const isBothConfirmed = !!(currentHandover?.ownerConfirmed && currentHandover?.staffConfirmed);

  const handleTabChange = (tab: 'check_in' | 'check_out') => {
    setActiveTab(tab);
  };

  const handleToggleGoods = (goodsId: string) => {
    if (!currentHandover) return;
    toggleHandoverGoods(currentHandover.id, goodsId);
  };

  const handleToggleChecklist = (itemId: string) => {
    toggleChecklistItem(activeTab, itemId);
  };

  const handlePetStatusBlur = useCallback(() => {
    if (!currentHandover) return;
    const note = petStatusDraft.trim();
    if (note !== currentHandover.petStatusNote) {
      updateHandover(currentHandover.id, { petStatusNote: note });
    }
  }, [currentHandover, petStatusDraft, updateHandover]);

  const handleConfirm = (role: 'owner' | 'staff') => {
    if (!currentHandover || !allChecklistChecked) return;

    const uncheckedItems = checklist.filter(c => !c.checked);
    if (uncheckedItems.length > 0) {
      Taro.showToast({ title: '请先完成所有核对项', icon: 'none' });
      return;
    }

    const checklistSummary = checklist.map(c => `${c.checked ? '✓' : '✗'} ${c.label}`).join('\n');
    const returnSummary = activeTab === 'check_out'
      ? `\n\n归还物品：${returnGoodsCheckedCount}/${returnGoodsTotalCount} 件已核对`
      : '';
    const petNoteSummary = (activeTab === 'check_out' && currentHandover.petStatusNote)
      ? `\n\n宠物状态：${currentHandover.petStatusNote}`
      : '';

    Taro.showModal({
      title: role === 'owner' ? '宠主确认' : '店员确认',
      content: `核对清单（${checklist.length}项）：\n${checklistSummary}${returnSummary}${petNoteSummary}`,
      success: (res) => {
        if (res.confirm) {
          confirmHandover(currentHandover.id, role);

          const updated = useAppStore.getState().handovers.find(h => h.id === currentHandover.id);
          const bothConfirmed = updated?.ownerConfirmed && updated?.staffConfirmed;

          if (bothConfirmed && currentBooking) {
            updateBooking(currentBooking.id, { status: 'completed' });
            Taro.showToast({ title: '交接完成！', icon: 'success' });
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
            <Text className={styles.emptyText}>暂无进行中的寄养</Text>
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
            <Text className={styles.infoLabel}>预计离店</Text>
            <Text className={styles.infoValue}>{currentBooking.checkOutDate}</Text>
          </View>
        </View>

        {currentHandover && (
          <View className={classnames(styles.statusBar, isBothConfirmed && styles.completedBar)}>
            <Text className={classnames(styles.statusText, isBothConfirmed && styles.statusTextDone)}>
              {isBothConfirmed
                ? '交接完成'
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

        {activeTab === 'check_in' && currentHandover && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>健康状态</Text>
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

        {activeTab === 'check_out' && checkInHandover && (
          <>
            <View className={styles.card}>
              <Text className={styles.sectionTitle}>归还物品核对</Text>
              <View className={styles.returnProgressText}>
                <Text>已归还 {returnGoodsCheckedCount}/{returnGoodsTotalCount} 件</Text>
              </View>
              <View className={styles.returnProgress}>
                <View
                  className={styles.returnProgressBar}
                  style={{ width: `${returnGoodsTotalCount ? (returnGoodsCheckedCount / returnGoodsTotalCount) * 100 : 0}%` }}
                />
              </View>
              <View className={styles.goodsList}>
                {checkInHandover.itemsList.map(item => (
                  <View
                    key={item.id}
                    className={styles.goodsItem}
                    onClick={() => toggleHandoverGoods(checkInHandover.id, item.id)}
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

            <View className={styles.card}>
              <Text className={styles.sectionTitle}>宠物状态记录</Text>
              <Textarea
                className={styles.petStatusInput}
                placeholder="请记录宠物当前状态，如精神状态、毛发、是否已洗澡等"
                value={petStatusDraft || currentHandover?.petStatusNote || ''}
                onInput={(e) => setPetStatusDraft(e.detail.value)}
                onBlur={handlePetStatusBlur}
                maxlength={500}
              />
            </View>

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
          </>
        )}

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>双方确认</Text>
          <View className={styles.confirmButtons}>
            <View
              className={classnames(
                styles.confirmBtn,
                (!allChecklistChecked || currentHandover?.ownerConfirmed) && styles.confirmBtnDisabled,
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
                (!allChecklistChecked || currentHandover?.staffConfirmed) && styles.confirmBtnDisabled,
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
        </View>
      </ScrollView>
    </View>
  );
};

export default HandoverPage;
