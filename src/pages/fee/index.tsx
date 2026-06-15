import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  Picker
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { extraServiceList } from '@/data/booking';

const FeePage: React.FC = () => {
  const {
    feeItems,
    selectedExtraServices,
    toggleExtraService,
    bookings,
    addFeeItem,
    updateBooking
  } = useAppStore();

  const currentBooking = bookings.find(b => b.status === 'in_progress');
  const [extendDate, setExtendDate] = useState(currentBooking?.checkOutDate || '');

  const includedServiceNames = useMemo(() => {
    return feeItems
      .filter(f => f.type === 'service')
      .map(f => f.name);
  }, [feeItems]);

  const totalPrice = useMemo(() => {
    return feeItems.reduce((sum, f) => sum + f.price * f.quantity, 0);
  }, [feeItems]);

  const extraTotal = useMemo(() => {
    return feeItems
      .filter(f => f.type === 'extra')
      .reduce((sum, f) => sum + f.price * f.quantity, 0);
  }, [feeItems]);

  const handlePay = () => {
    console.log('[Fee] 支付费用', totalPrice);
    Taro.showToast({
      title: '支付成功',
      icon: 'success'
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '请选择';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  const handleExtendDateChange = (e) => {
    const newDate = e.detail.value;
    setExtendDate(newDate);
  };

  const handleSubmitExtend = () => {
    if (!currentBooking || !extendDate) {
      Taro.showToast({ title: '请选择延期日期', icon: 'none' });
      return;
    }

    const current = new Date(currentBooking.checkOutDate);
    const extended = new Date(extendDate);

    if (extended <= current) {
      Taro.showToast({ title: '新日期需晚于当前离店日期', icon: 'none' });
      return;
    }

    const extraDays = Math.ceil(
      (extended.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    const roomFeeItem = feeItems.find(f => f.type === 'room');
    const roomPrice = roomFeeItem ? roomFeeItem.price : 0;

    addFeeItem({
      id: `fee_extend_${Date.now()}`,
      name: `延期住宿 (${extraDays}晚)`,
      price: roomPrice,
      quantity: extraDays,
      type: 'room'
    });

    updateBooking(currentBooking.id, { checkOutDate: extendDate });

    Taro.showToast({ title: '延期申请已提交', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        {/* 总费用 */}
        <View className={styles.totalCard}>
          <Text className={styles.totalLabel}>当前订单总费用</Text>
          <Text className={styles.totalAmount}>¥{totalPrice}</Text>
          <Text className={styles.totalDesc}>
            {currentBooking?.petName} · {currentBooking?.roomTypeName}
          </Text>
        </View>

        {/* 费用明细 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>费用明细</Text>
          <View className={styles.feeList}>
            {feeItems.map(item => (
              <View key={item.id} className={styles.feeItem}>
                <View className={styles.feeInfo}>
                  <Text className={styles.feeName}>{item.name}</Text>
                  {item.quantity > 1 && (
                    <Text className={styles.feeDesc}>x{item.quantity}</Text>
                  )}
                </View>
                <Text className={styles.feePrice}>¥{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 追加服务 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>追加服务</Text>
          <View className={styles.serviceGrid}>
            {extraServiceList.map(service => {
              const isIncluded = includedServiceNames.includes(service.name);
              const isSelected = selectedExtraServices.includes(service.id);

              return (
                <View
                  key={service.id}
                  className={classnames(
                    styles.serviceCard,
                    isSelected && styles.selected,
                    isIncluded && styles.serviceCardIncluded
                  )}
                  onClick={() => {
                    if (!isIncluded) {
                      toggleExtraService(service.id);
                    }
                  }}
                >
                  <Text className={styles.serviceIcon}>{service.icon}</Text>
                  <Text className={styles.serviceName}>{service.name}</Text>
                  <Text className={styles.serviceDesc}>{service.description}</Text>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text className={styles.servicePrice}>¥{service.price}</Text>
                    {isIncluded && (
                      <Text className={styles.includedBadge}>已包含</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          {extraTotal > 0 && (
            <View style={{ marginTop: '24rpx', textAlign: 'right' }}>
              <Text style={{ fontSize: '24rpx', color: '#6B7280' }}>
                追加服务合计：
              </Text>
              <Text style={{ fontSize: '32rpx', color: '#F59E0B', fontWeight: 600 }}>
                ¥{extraTotal}
              </Text>
            </View>
          )}
        </View>

        {/* 延期申请 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>延期申请</Text>
          <View className={styles.extendSection}>
            <View className={styles.extendInfo}>
              <Text className={styles.extendTitle}>需要延长寄养时间？</Text>
              <Text className={styles.extendDesc}>
                当前离店：{currentBooking?.checkOutDate}
              </Text>
              <View className={styles.extendDatePicker}>
                <Text style={{ fontSize: '24rpx', color: '#6B7280' }}>延期至：</Text>
                <Picker mode="date" value={extendDate} start={currentBooking?.checkOutDate} onChange={handleExtendDateChange}>
                  <View className={styles.extendDateValue}>
                    <Text>{extendDate ? formatDate(extendDate) : '请选择新离店日期'}</Text>
                  </View>
                </Picker>
              </View>
            </View>
            <Button className={styles.extendButton} onClick={handleSubmitExtend}>
              确认延期
            </Button>
          </View>
        </View>

        {/* 费用说明 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>费用说明</Text>
          <View style={{ fontSize: '24rpx', color: '#9CA3AF', lineHeight: 1.8 }}>
            <Text>1. 房费按实际入住天数计算</Text>
            <Text>{"\n"}</Text>
            <Text>2. 押金在离店时无损坏情况下退还</Text>
            <Text>{"\n"}</Text>
            <Text>3. 追加服务需提前预约，以实际服务为准</Text>
            <Text>{"\n"}</Text>
            <Text>4. 如需提前离店，按实际天数结算</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.bottomTotal}>
          <Text className={styles.bottomTotalLabel}>应付金额</Text>
          <Text className={styles.bottomTotalValue}>¥{totalPrice}</Text>
        </View>
        <Button className={styles.payButton} onClick={handlePay}>
          立即支付
        </Button>
      </View>
    </View>
  );
};

export default FeePage;
