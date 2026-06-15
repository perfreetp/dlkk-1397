import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { feeItemList, extraServiceList, bookingList } from '@/data/booking';
import type { FeeItem, ExtraService } from '@/types';

const FeePage: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>(['es1']);
  const currentBooking = bookingList.find(b => b.status === 'in_progress');

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const extraTotal = useMemo(() => {
    return extraServiceList
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const roomTotal = useMemo(() => {
    return feeItemList
      .filter(f => f.type === 'room')
      .reduce((sum, f) => sum + f.price * f.quantity, 0);
  }, []);

  const totalPrice = useMemo(() => {
    const baseTotal = feeItemList.reduce((sum, f) => sum + f.price * f.quantity, 0);
    return baseTotal + extraTotal;
  }, [extraTotal]);

  const handlePay = () => {
    console.log('[Fee] 支付费用', totalPrice);
    Taro.showToast({
      title: '支付成功',
      icon: 'success'
    });
  };

  const handleExtend = () => {
    console.log('[Fee] 申请延期');
    Taro.showActionSheet({
      itemList: ['延长1天', '延长2天', '延长3天', '自定义'],
      success: (res) => {
        Taro.showToast({
          title: '延期申请已提交',
          icon: 'success'
        });
      }
    });
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
            {feeItemList.map(item => (
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
            {extraServiceList.map(service => (
              <View
                key={service.id}
                className={classnames(
                  styles.serviceCard,
                  selectedServices.includes(service.id) && styles.selected
                )}
                onClick={() => toggleService(service.id)}
              >
                <Text className={styles.serviceIcon}>{service.icon}</Text>
                <Text className={styles.serviceName}>{service.name}</Text>
                <Text className={styles.serviceDesc}>{service.description}</Text>
                <Text className={styles.servicePrice}>¥{service.price}</Text>
              </View>
            ))}
          </View>
          {selectedServices.length > 0 && (
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
                预计离店：{currentBooking?.checkOutDate}
              </Text>
            </View>
            <Button className={styles.extendButton} onClick={handleExtend}>
              申请延期
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
