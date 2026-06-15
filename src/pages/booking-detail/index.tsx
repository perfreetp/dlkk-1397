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
  const { bookings, updateBooking } = useAppStore();
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
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>散步要求</Text>
          </View>
          <View style={{ fontSize: '26rpx', color: '#4B5563', lineHeight: 1.6, marginBottom: '16rpx' }}>
            {booking.walkRequirements}
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>饮食禁忌</Text>
          </View>
          <View style={{ fontSize: '26rpx', color: '#4B5563', lineHeight: 1.6, marginBottom: '16rpx' }}>
            {booking.dietaryRestrictions}
          </View>
          <View className={styles.infoRow}>
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
