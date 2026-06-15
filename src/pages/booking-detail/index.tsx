import React from 'react';
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
import useAppStore from '@/store';
import StatusTag from '@/components/StatusTag';

const BookingDetailPage: React.FC = () => {
  const { bookings, updateBooking, handovers, feeItems, setLastSelectedBookingId } = useAppStore();
  const id = Taro.getCurrentInstance().router?.params?.id;
  const booking = bookings.find(b => b.id === id) || bookings[0];

  const handleCancel = () => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      confirmText: '确定取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          updateBooking(booking.id, { status: 'cancelled' });
          Taro.showToast({
            title: '已取消预约',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleContact = () => {
    Taro.showToast({
      title: '正在联系店家...',
      icon: 'none'
    });
  };

  const handleRebook = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const handleViewDynamics = () => {
    Taro.switchTab({ url: '/pages/dynamics/index' });
  };

  const checkInHandover = handovers.find(h => h.bookingId === booking.id && h.type === 'check_in');
  const checkOutHandover = handovers.find(h => h.bookingId === booking.id && h.type === 'check_out');

  const isCheckInCompleted = !!(checkInHandover?.ownerConfirmed && checkInHandover?.staffConfirmed);
  const isCheckOutCompleted = !!(checkOutHandover?.ownerConfirmed && checkOutHandover?.staffConfirmed);

  const returnGoodsTotalCount = checkOutHandover?.itemsList?.length || 0;
  const returnGoodsCheckedCount = (checkOutHandover?.itemsList || []).filter(g => g.checked).length;
  const returnGoodsMissingCount = returnGoodsTotalCount - returnGoodsCheckedCount;

  const totalFee = feeItems.reduce((s, f) => s + f.price * f.quantity, 0);
  const feeSettled = totalFee > 0;

  const hasHandoverRecord = !!(checkInHandover || checkOutHandover);

  const handleViewHandover = () => {
    if (!hasHandoverRecord) {
      Taro.showToast({ title: '暂无交接记录', icon: 'none' });
      return;
    }
    setLastSelectedBookingId(booking.id);
    Taro.switchTab({ url: '/pages/handover/index' });
  };

  const statusText: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };

  const statusDesc: Record<string, string> = {
    pending: '店家正在确认您的预约，请稍候...',
    confirmed: '预约已确认，期待您的爱宠到来！',
    in_progress: '宠物正在店中寄养，您可以查看实时动态',
    completed: '寄养已完成，感谢您的信任！',
    cancelled: '预约已取消'
  };

  const renderPrimaryAction = () => {
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      return (
        <Button
          className={classnames(styles.actionButton, styles.primaryButton)}
          onClick={handleCancel}
          style={{ background: '#EF4444' }}
        >
          取消预约
        </Button>
      );
    }
    if (booking.status === 'in_progress') {
      return (
        <Button
          className={classnames(styles.actionButton, styles.primaryButton)}
          onClick={handleViewDynamics}
        >
          查看动态
        </Button>
      );
    }
    if (booking.status === 'completed') {
      return (
        <Button
          className={classnames(styles.actionButton, styles.primaryButton)}
          onClick={handleRebook}
        >
          再次预约
        </Button>
      );
    }
    return null;
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        {/* 订单状态卡片 */}
        <View className={styles.statusCard}>
          <Text className={styles.statusBadge}>
            {statusText[booking.status]}
          </Text>
          <Text className={styles.statusText}>
            {booking.petName}的寄养预约
          </Text>
          <Text className={styles.statusDesc}>
            {statusDesc[booking.status]}
          </Text>
        </View>

        {/* 宠物信息 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>宠物信息</Text>
          <View className={styles.petInfo}>
            <Image
              className={styles.petAvatar}
              src={booking.petAvatar}
              mode="aspectFill"
            />
            <View className={styles.petDetail}>
              <Text className={styles.petName}>{booking.petName}</Text>
              <Text className={styles.petMeta}>
                {booking.roomTypeName} · {booking.days}天
              </Text>
            </View>
            <StatusTag status={booking.status} />
          </View>
        </View>

        {/* 寄养信息 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>寄养信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订单编号</Text>
            <Text className={styles.infoValue}>{booking.id}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>入住日期</Text>
            <Text className={styles.infoValue}>{booking.checkInDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>离店日期</Text>
            <Text className={styles.infoValue}>{booking.checkOutDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>寄养天数</Text>
            <Text className={styles.infoValue}>{booking.days}天</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>房型</Text>
            <Text className={styles.infoValue}>{booking.roomTypeName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订单金额</Text>
            <Text className={styles.infoValue} style={{ color: '#F59E0B' }}>
              ¥{booking.totalPrice}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下单时间</Text>
            <Text className={styles.infoValue}>{booking.createdAt}</Text>
          </View>
        </View>

        {/* 交接记录入口 */}
        <View className={styles.handoverEntry} onClick={handleViewHandover}>
          <View className={styles.handoverEntryHeader}>
            <Text className={styles.handoverEntryTitle}>交接记录</Text>
            <Text className={styles.handoverEntryArrow}>查看详情 →</Text>
          </View>

          {isCheckOutCompleted && checkOutHandover ? (
            <View className={styles.handoverSummary}>
              <View className={styles.handoverSummaryGrid}>
                <View className={styles.handoverSummaryItem}>
                  <Text className={styles.handoverSummaryLabel}>寄养天数</Text>
                  <Text className={styles.handoverSummaryValue}>{booking.days} 天</Text>
                </View>
                <View className={styles.handoverSummaryItem}>
                  <Text className={styles.handoverSummaryLabel}>交接完成</Text>
                  <Text className={styles.handoverSummaryValue}>
                    {checkOutHandover.completedAt ? checkOutHandover.completedAt.slice(5, 16) : '—'}
                  </Text>
                </View>
                <View className={styles.handoverSummaryItem}>
                  <Text className={styles.handoverSummaryLabel}>物品归还</Text>
                  <Text className={classnames(
                    styles.handoverSummaryValue,
                    returnGoodsMissingCount > 0 && styles.summaryWarn
                  )}>
                    {returnGoodsMissingCount > 0 ? `${returnGoodsMissingCount} 件未归还` : '全部归还'}
                  </Text>
                </View>
                <View className={styles.handoverSummaryItem}>
                  <Text className={styles.handoverSummaryLabel}>费用状态</Text>
                  <Text className={classnames(
                    styles.handoverSummaryValue,
                    feeSettled && styles.summaryOk
                  )}>
                    {feeSettled ? '已结清' : '待结算'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className={styles.handoverStatus}>
              <View className={styles.handoverStatusItem}>
                <View className={classnames(
                  styles.handoverStatusDot,
                  isCheckInCompleted && styles.statusDotDone
                )} />
                <Text className={styles.handoverStatusText}>
                  到店交接{isCheckInCompleted ? '已完成' : '待办理'}
                </Text>
                {checkInHandover?.completedAt && (
                  <Text className={styles.handoverStatusTime}>{checkInHandover.completedAt}</Text>
                )}
              </View>
              <View className={styles.handoverStatusItem}>
                <View className={classnames(
                  styles.handoverStatusDot,
                  isCheckOutCompleted && styles.statusDotDone
                )} />
                <Text className={styles.handoverStatusText}>
                  离店交接{isCheckOutCompleted ? '已完成' : '待办理'}
                </Text>
                {checkOutHandover?.completedAt && (
                  <Text className={styles.handoverStatusTime}>{checkOutHandover.completedAt}</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 喂食计划 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>喂食计划</Text>
          <View className={styles.feedingList}>
            {booking.feedingSchedule.map((item, idx) => (
              <View key={idx} className={styles.feedingItem}>
                <Text className={styles.feedingTime}>{item.time}</Text>
                <View className={styles.feedingDetail}>
                  <Text className={styles.feedingFood}>{item.food}</Text>
                  <Text className={styles.feedingAmount}>{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 药物登记 */}
        {booking.medications.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>药物登记</Text>
            <View className={styles.medicationList}>
              {booking.medications.map((med, idx) => (
                <View key={idx} className={styles.medicationItem}>
                  <Text className={styles.medicationName}>{med.name}</Text>
                  <Text className={styles.medicationDetail}>
                    {med.dosage} · {med.frequency}
                  </Text>
                  {med.notes && (
                    <Text className={styles.medicationDetail}>
                      备注：{med.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 其他要求 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>其他要求</Text>
          {booking.walkRequirements.length > 0 && (
            <View style={{ marginBottom: '24rpx' }}>
              <Text className={styles.infoLabel} style={{ marginBottom: '8rpx', display: 'block' }}>散步要求</Text>
              {booking.walkRequirements.map((item, idx) => (
                <View key={item.id} className={styles.medicationItem}>
                  <Text className={styles.medicationName}>• {item.text}</Text>
                </View>
              ))}
            </View>
          )}
          {booking.dietaryRestrictions.length > 0 && (
            <View style={{ marginBottom: '24rpx' }}>
              <Text className={styles.infoLabel} style={{ marginBottom: '8rpx', display: 'block' }}>饮食禁忌</Text>
              {booking.dietaryRestrictions.map((item, idx) => (
                <View key={item.id} className={styles.medicationItem}>
                  <Text className={styles.medicationName}>• {item.text}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ marginBottom: '8rpx' }}>
            <Text className={styles.infoLabel}>备注</Text>
          </View>
          <View style={{ fontSize: '26rpx', color: '#4B5563', lineHeight: 1.6 }}>
            {booking.notes || '无'}
          </View>
        </View>

        {/* 宠物照片 */}
        {booking.photos.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>宠物照片</Text>
            <View className={styles.photoWall}>
              {booking.photos.map((photo, idx) => (
                <View
                  key={idx}
                  className={styles.photoItem}
                  onClick={() => {
                    Taro.previewImage({
                      urls: booking.photos,
                      current: photo
                    });
                  }}
                >
                  <Image
                    className={styles.photoImage}
                    src={photo}
                    mode="aspectFill"
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.actionButton, styles.secondaryButton)}
          onClick={handleContact}
        >
          联系店家
        </Button>
        {renderPrimaryAction()}
      </View>
    </View>
  );
};

export default BookingDetailPage;
