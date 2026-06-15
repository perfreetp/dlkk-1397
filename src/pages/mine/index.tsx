import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { petList } from '@/data/pet';
import { bookingList } from '@/data/booking';

const MinePage: React.FC = () => {
  const userInfo = {
    name: '小明同学',
    avatar: 'https://picsum.photos/id/177/200/200',
    memberLevel: '黄金会员',
    totalBookings: 12,
    totalDays: 45
  };

  const totalBookings = bookingList.length;
  const totalDays = bookingList.reduce((sum, b) => sum + b.days, 0);

  const handleMenuClick = (key: string) => {
    console.log('[Mine] 点击菜单', key);
    switch (key) {
      case 'fee':
        Taro.navigateTo({ url: '/pages/fee/index' });
        break;
      case 'pet-profile':
        Taro.navigateTo({ url: '/pages/pet-profile/index' });
        break;
      case 'booking-detail':
        Taro.navigateTo({ url: '/pages/booking-detail/index' });
        break;
      default:
        Taro.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  };

  const handlePetClick = (petId: string) => {
    console.log('[Mine] 查看宠物', petId);
    Taro.navigateTo({ url: '/pages/pet-profile/index?id=' + petId });
  };

  const menuGroups = [
    {
      title: '我的服务',
      items: [
        { key: 'booking', icon: '📅', title: '寄养记录' },
        { key: 'fee', icon: '💰', title: '费用明细' },
        { key: 'pet-profile', icon: '🐾', title: '宠物档案' },
        { key: 'coupon', icon: '🎫', title: '优惠券', badge: '3' }
      ]
    },
    {
      title: '其他',
      items: [
        { key: 'contact', icon: '📞', title: '联系我们' },
        { key: 'feedback', icon: '💬', title: '意见反馈' },
        { key: 'about', icon: 'ℹ️', title: '关于我们' },
        { key: 'settings', icon: '⚙️', title: '设置' }
      ]
    }
  ];

  return (
    <View className={styles.page}>
      {/* 用户信息头部 */}
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={userInfo.avatar} mode="aspectFill" />
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{userInfo.name}</Text>
            <View className={styles.memberLevel}>
              <Text className={styles.memberLevelIcon}>👑</Text>
              <Text className={styles.memberLevelText}>{userInfo.memberLevel}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 数据统计 */}
      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalBookings}</Text>
          <Text className={styles.statLabel}>寄养次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalDays}</Text>
          <Text className={styles.statLabel}>累计天数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{petList.length}</Text>
          <Text className={styles.statLabel}>宠物数量</Text>
        </View>
      </View>

      <ScrollView scrollY>
        {/* 宠物档案 */}
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的宠物</Text>
            <Text className={styles.sectionMore} onClick={() => handleMenuClick('pet-profile')}>
              查看全部 ›
            </Text>
          </View>
          <ScrollView className={styles.petCardList} scrollX>
            {petList.map(pet => (
              <View
                key={pet.id}
                className={styles.petCard}
                onClick={() => handlePetClick(pet.id)}
              >
                <Image
                  className={styles.petCardAvatar}
                  src={pet.avatar}
                  mode="aspectFill"
                />
                <Text className={styles.petCardName}>{pet.name}</Text>
                <Text className={styles.petCardMeta}>
                  {pet.breed} · {pet.age}岁
                </Text>
              </View>
            ))}
            {/* 添加宠物按钮 */}
            <View
              className={styles.petCard}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2rpx dashed #E5E7EB',
                boxShadow: 'none'
              }}
              onClick={() => Taro.showToast({ title: '添加宠物', icon: 'none' })}
            >
              <Text style={{ fontSize: '60rpx', color: '#9CA3AF' }}>+</Text>
              <Text style={{ fontSize: '24rpx', color: '#9CA3AF', marginTop: '8rpx' }}>
                添加宠物
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* 功能菜单 */}
        {menuGroups.map((group, groupIdx) => (
          <View key={groupIdx} style={{ marginBottom: '24rpx' }}>
            <Text
              style={{
                fontSize: '24rpx',
                color: '#9CA3AF',
                marginLeft: '32rpx',
                marginBottom: '12rpx',
                fontWeight: 500
              }}
            >
              {group.title}
            </Text>
            <View className={styles.menuList}>
              {group.items.map(item => (
                <View
                  key={item.key}
                  className={styles.menuItem}
                  onClick={() => handleMenuClick(item.key)}
                >
                  <View className={styles.menuIcon}>{item.icon}</View>
                  <View className={styles.menuContent}>
                    <Text className={styles.menuTitle}>{item.title}</Text>
                  </View>
                  {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MinePage;
