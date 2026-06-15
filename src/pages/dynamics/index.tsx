import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { dailyRecordList } from '@/data/dynamics';
import { bookingList } from '@/data/booking';
import type { DailyRecord } from '@/types';

const DynamicsPage: React.FC = () => {
  const activeBookings = bookingList.filter(b => b.status === 'in_progress');
  const [selectedBookingId, setSelectedBookingId] = useState(
    activeBookings[0]?.id || ''
  );

  const records = useMemo(() => {
    return dailyRecordList.filter(r => r.bookingId === selectedBookingId);
  }, [selectedBookingId]);

  const latestRecord = records[0];
  const currentPet = activeBookings.find(b => b.id === selectedBookingId);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  const handlePhotoClick = (photo: string) => {
    console.log('[Dynamics] 查看大图', photo);
    Taro.previewImage({
      urls: latestRecord?.photos || [],
      current: photo
    });
  };

  if (activeBookings.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>在店动态</Text>
          <Text className={styles.headerSubtitle}>随时了解爱宠近况</Text>
        </View>
        <View className={styles.content}>
          <View style={{ textAlign: 'center', padding: '80rpx 0' }}>
            <Text style={{ fontSize: '120rpx' }}>🐾</Text>
            <Text style={{ fontSize: '28rpx', color: '#9CA3AF', marginTop: '24rpx' }}>
              暂无进行中的寄养
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>在店动态</Text>
        <Text className={styles.headerSubtitle}>随时了解爱宠近况</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
        {/* 宠物切换 */}
        <ScrollView className={styles.petSelector} scrollX>
          {activeBookings.map(booking => (
            <View
              key={booking.id}
              className={classnames(
                styles.petTab,
                selectedBookingId === booking.id && styles.active
              )}
              onClick={() => setSelectedBookingId(booking.id)}
            >
              <Image
                className={styles.petTabAvatar}
                src={booking.petAvatar}
                mode="aspectFill"
              />
              <Text className={styles.petTabName}>{booking.petName}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 今日概览 */}
        {latestRecord && (
          <View className={styles.todayCard}>
            <View className={styles.todayHeader}>
              <Text className={styles.todayDate}>
                今日动态 · {formatDate(latestRecord.date)}
              </Text>
              <View className={styles.todayMood}>
                <Text className={styles.todayMoodIcon}>😊</Text>
                <Text className={styles.todayMoodText}>{latestRecord.mood}</Text>
              </View>
            </View>

            <View className={styles.statusGrid}>
              <View className={styles.statusItem}>
                <Text className={styles.statusIcon}>🍚</Text>
                <Text className={styles.statusLabel}>饮食</Text>
                <Text className={styles.statusValue}>
                  {latestRecord.meals.filter(m => m.finished).length}/
                  {latestRecord.meals.length} 顿
                </Text>
              </View>
              <View className={styles.statusItem}>
                <Text className={styles.statusIcon}>💧</Text>
                <Text className={styles.statusLabel}>饮水</Text>
                <Text className={styles.statusValue}>{latestRecord.water}</Text>
              </View>
              <View className={styles.statusItem}>
                <Text className={styles.statusIcon}>💩</Text>
                <Text className={styles.statusLabel}>排便</Text>
                <Text className={styles.statusValue}>{latestRecord.poop}</Text>
              </View>
              <View className={styles.statusItem}>
                <Text className={styles.statusIcon}>💚</Text>
                <Text className={styles.statusLabel}>健康</Text>
                <Text className={styles.statusValue}>{latestRecord.health}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 每日记录时间线 */}
        <View className={styles.timeline}>
          <Text className={styles.timelineTitle}>每日日报</Text>

          {records.map(record => (
            <View key={record.id} className={styles.dayCard}>
              <View className={styles.dayHeader}>
                <Text className={styles.dayDate}>{formatDate(record.date)}</Text>
                <Text className={styles.dayStatus}>✓ 已更新</Text>
              </View>

              {/* 饮食记录 */}
              <View className={styles.daySection}>
                <Text className={styles.daySectionTitle}>
                  <Text className={styles.daySectionIcon}>🍽️</Text>
                  饮食记录
                </Text>
                <View className={styles.mealList}>
                  {record.meals.map((meal, idx) => (
                    <View key={idx} className={styles.mealItem}>
                      <Text className={styles.mealTime}>{meal.time}</Text>
                      <View className={styles.mealInfo}>
                        <Text className={styles.mealFood}>{meal.food}</Text>
                        <Text className={styles.mealAmount}>{meal.amount}</Text>
                      </View>
                      <Text
                        className={classnames(
                          styles.mealStatus,
                          !meal.finished && styles.partial
                        )}
                      >
                        {meal.finished ? '吃完' : '剩一点'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 散步记录 */}
              {record.walk && (
                <View className={styles.daySection}>
                  <Text className={styles.daySectionTitle}>
                    <Text className={styles.daySectionIcon}>🐕</Text>
                    散步记录
                  </Text>
                  <View className={styles.walkInfo}>
                    <View className={styles.walkInfoItem}>
                      <Text className={styles.walkInfoValue}>{record.walk.duration}</Text>
                      <Text className={styles.walkInfoLabel}>分钟</Text>
                    </View>
                    <View className={styles.walkInfoItem}>
                      <Text className={styles.walkInfoValue}>{record.walk.distance}</Text>
                      <Text className={styles.walkInfoLabel}>距离</Text>
                    </View>
                    <View className={styles.walkInfoItem}>
                      <Text className={styles.walkInfoValue}>{record.walk.time}</Text>
                      <Text className={styles.walkInfoLabel}>时间</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 其他状态 */}
              <View className={styles.daySection}>
                <Text className={styles.daySectionTitle}>
                  <Text className={styles.daySectionIcon}>📋</Text>
                  其他情况
                </Text>
                <View className={styles.daySectionContent}>
                  <Text>💧 饮水：{record.water}</Text>
                  <Text>{"\n"}</Text>
                  <Text>💩 排便：{record.poop}</Text>
                  <Text>{"\n"}</Text>
                  <Text>🚽 排尿：{record.pee}</Text>
                </View>
              </View>

              {/* 照片 */}
              {record.photos.length > 0 && (
                <View className={styles.daySection}>
                  <Text className={styles.daySectionTitle}>
                    <Text className={styles.daySectionIcon}>📷</Text>
                    今日照片 ({record.photos.length}张)
                  </Text>
                  <View className={styles.photoWall}>
                    {record.photos.slice(0, 6).map((photo, idx) => (
                      <View
                        key={idx}
                        className={styles.photoItem}
                        onClick={() => handlePhotoClick(photo)}
                      >
                        <Image
                          className={styles.photoImage}
                          src={photo}
                          mode="aspectFill"
                        />
                        {idx === 5 && record.photos.length > 6 && (
                          <View className={styles.photoMore}>
                            +{record.photos.length - 6}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 店员备注 */}
              <View className={styles.daySection}>
                <Text className={styles.daySectionTitle}>
                  <Text className={styles.daySectionIcon}>💬</Text>
                  店员留言
                </Text>
                <View className={styles.staffNote}>
                  <Text className={styles.staffNoteText}>{record.notes}</Text>
                  <View className={styles.staffNoteFooter}>
                    —— {record.staffName} · {record.createdAt.split(' ')[1]}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default DynamicsPage;
