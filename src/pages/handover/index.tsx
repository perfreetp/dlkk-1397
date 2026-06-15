import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { bookingList } from '@/data/booking';
import { handoverList, checkInChecklist, checkOutChecklist } from '@/data/handover';
import type { HandoverGoods } from '@/types';

const HandoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out'>('check_in');
  const [checklist, setChecklist] = useState(
    activeTab === 'check_in' ? checkInChecklist : checkOutChecklist
  );

  const currentBooking = bookingList.find(b => b.status === 'in_progress');
  const currentHandover = handoverList[0];

  const [goods, setGoods] = useState<HandoverGoods[]>(
    currentHandover?.itemsList || []
  );

  const handleTabChange = (tab: 'check_in' | 'check_out') => {
    setActiveTab(tab);
    setChecklist(tab === 'check_in' ? checkInChecklist : checkOutChecklist);
  };

  const toggleCheckItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleGoodsItem = (id: string) => {
    setGoods(goods.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const groupedGoods = useMemo(() => {
    const groups: Record<string, HandoverGoods[]> = {};
    goods.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [goods]);

  const checkedCount = goods.filter(g => g.checked).length;
  const totalCount = goods.length;

  const handleSign = () => {
    Taro.showToast({
      title: '确认成功',
      icon: 'success'
    });
    console.log('[Handover] 签字确认', {
      type: activeTab,
      checklist: checklist.filter(c => c.checked),
      goods: goods.filter(g => g.checked)
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
        {/* Tab切换 */}
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

        {/* 宠物信息卡片 */}
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

        {/* 交接状态 */}
        {currentHandover && (
          <View className={styles.statusBar}>
            <Text className={styles.statusText}>
              {activeTab === 'check_in' ? '✓ 已完成到店交接' : '待离店交接'}
            </Text>
            {currentHandover.confirmedAt && (
              <Text className={styles.statusTime}>{currentHandover.confirmedAt}</Text>
            )}
          </View>
        )}

        {/* 交接清单 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>
            {activeTab === 'check_in' ? '到店核对清单' : '离店核对清单'}
          </Text>
          <View className={styles.checklist}>
            {checklist.map(item => (
              <View
                key={item.id}
                className={styles.checkItem}
                onClick={() => toggleCheckItem(item.id)}
              >
                <View
                  className={classnames(styles.checkbox, item.checked && styles.checked)}
                />
                <Text className={styles.checkLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 物品清单 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>
            物品清单 ({checkedCount}/{totalCount})
          </Text>
          {Object.entries(groupedGoods).map(([category, items]) => (
            <View key={category} className={styles.goodsCategory}>
              <Text className={styles.categoryTitle}>{category}</Text>
              <View className={styles.goodsList}>
                {items.map(item => (
                  <View
                    key={item.id}
                    className={styles.goodsItem}
                    onClick={() => toggleGoodsItem(item.id)}
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

        {/* 健康状态 */}
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

        {/* 确认签字 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>双方确认</Text>
          <View className={styles.confirmSection}>
            <View className={styles.confirmItem}>
              <Text className={styles.confirmLabel}>宠主确认</Text>
              <Text
                className={classnames(
                  styles.confirmStatus,
                  !currentHandover?.ownerConfirmed && styles.pending
                )}
              >
                {currentHandover?.ownerConfirmed ? '已确认' : '待确认'}
              </Text>
            </View>
            <View className={styles.confirmItem}>
              <Text className={styles.confirmLabel}>店员确认</Text>
              <Text
                className={classnames(
                  styles.confirmStatus,
                  !currentHandover?.staffConfirmed && styles.pending
                )}
              >
                {currentHandover?.staffConfirmed ? '已确认' : '待确认'}
              </Text>
            </View>
          </View>

          <Button className={styles.signButton} onClick={handleSign}>
            {activeTab === 'check_in' ? '确认到店交接' : '确认离店交接'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default HandoverPage;
