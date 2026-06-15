import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Input,
  Textarea,
  Video
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import type { DailyRecord, MealRecord, WalkRecord } from '@/types';

const MOOD_OPTIONS = ['开心活跃', '一般', '有点紧张', '精神不好'];
const HEALTH_OPTIONS = ['良好', '基本良好', '略有不适', '需关注'];

interface MealForm {
  food: string;
  amount: string;
  finished: boolean;
}

interface WalkForm {
  time: string;
  duration: string;
  distance: string;
  notes: string;
}

const DynamicsPage: React.FC = () => {
  const { dailyRecords, bookings, addDailyRecord } = useAppStore();
  const activeBookings = bookings.filter(b => b.status === 'in_progress');

  const [selectedBookingId, setSelectedBookingId] = useState(
    activeBookings[0]?.id || ''
  );

  const [showModal, setShowModal] = useState(false);

  const [mealFood, setMealFood] = useState('');
  const [mealAmount, setMealAmount] = useState('');
  const [mealFinished, setMealFinished] = useState(true);
  const [waterStatus, setWaterStatus] = useState('');
  const [poopStatus, setPoopStatus] = useState('');
  const [peeStatus, setPeeStatus] = useState('');
  const [walkForm, setWalkForm] = useState<WalkForm>({ time: '', duration: '', distance: '', notes: '' });
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formVideos, setFormVideos] = useState<string[]>([]);
  const [staffNotes, setStaffNotes] = useState('');

  const records = useMemo(() => {
    return dailyRecords.filter(r => r.bookingId === selectedBookingId);
  }, [dailyRecords, selectedBookingId]);

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
    Taro.previewImage({
      urls: latestRecord?.photos || [],
      current: photo
    });
  };

  const resetForm = () => {
    setMealFood('');
    setMealAmount('');
    setMealFinished(true);
    setWaterStatus('');
    setPoopStatus('');
    setPeeStatus('');
    setWalkForm({ time: '', duration: '', distance: '', notes: '' });
    setSelectedMood('');
    setSelectedHealth('');
    setFormPhotos([]);
    setFormVideos([]);
    setStaffNotes('');
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 6 - formPhotos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setFormPhotos(prev => [...prev, ...res.tempFilePaths].slice(0, 6));
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setFormPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleChooseVideo = () => {
    if (formVideos.length >= 1) {
      Taro.showToast({ title: '最多选择1个视频', icon: 'none' });
      return;
    }
    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        setFormVideos([res.tempFilePath]);
      }
    });
  };

  const handleRemoveVideo = () => {
    setFormVideos([]);
  };

  const handleSave = () => {
    if (!selectedBookingId || !currentPet) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const createdAtStr = `${dateStr} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const meals: MealRecord[] = mealFood
      ? [{
          time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
          food: mealFood,
          amount: mealAmount || '适量',
          finished: mealFinished
        }]
      : [];

    const walk: WalkRecord | null = walkForm.time || walkForm.duration
      ? {
          time: walkForm.time || `${pad(now.getHours())}:${pad(now.getMinutes())}`,
          duration: Number(walkForm.duration) || 0,
          distance: walkForm.distance || '0',
          notes: walkForm.notes || ''
        }
      : null;

    const record: DailyRecord = {
      id: `dr${Date.now()}`,
      date: dateStr,
      bookingId: selectedBookingId,
      petId: currentPet.petId,
      meals,
      water: waterStatus || '正常',
      poop: poopStatus || '正常',
      pee: peeStatus || '正常',
      walk: walk || { time: '', duration: 0, distance: '', notes: '' },
      mood: selectedMood || '一般',
      health: selectedHealth || '良好',
      notes: staffNotes || '',
      photos: formPhotos,
      videos: formVideos,
      staffName: '店员',
      createdAt: createdAtStr
    };

    addDailyRecord(record);
    setShowModal(false);
    Taro.showToast({ title: '记录已保存', icon: 'success' });
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
              {record.meals.length > 0 && (
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
              )}

              {/* 散步记录 */}
              {record.walk && record.walk.duration > 0 && (
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

              {/* 视频 */}
              {record.videos.length > 0 && (
                <View className={styles.daySection}>
                  <Text className={styles.daySectionTitle}>
                    <Text className={styles.daySectionIcon}>🎬</Text>
                    视频 ({record.videos.length}个)
                  </Text>
                  <View className={styles.videoSection}>
                    {record.videos.map((video, idx) => (
                      <View key={idx} className={styles.videoItem}>
                        <Video
                          className={styles.videoPlayer}
                          src={video}
                          controls
                          autoplay={false}
                          objectFit="contain"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 店员备注 */}
              {record.notes && (
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
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 浮动添加按钮 */}
      <View className={styles.floatBtn} onClick={handleOpenModal}>
        <Text style={{ fontSize: '48rpx', color: '#fff', lineHeight: '100rpx', textAlign: 'center' }}>+</Text>
      </View>

      {/* 底部弹出表单模态框 */}
      {showModal && (
        <View className={styles.modal} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加每日记录</Text>
              <View className={styles.modalClose} onClick={handleCloseModal}>
                <Text style={{ fontSize: '32rpx', color: '#9CA3AF' }}>✕</Text>
              </View>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              {/* 饮食 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>🍚 饮食</Text>
                <Input
                  className={styles.formInput}
                  placeholder="食物名称"
                  value={mealFood}
                  onInput={e => setMealFood(e.detail.value)}
                />
                <Input
                  className={styles.formInput}
                  placeholder="食量（如：一碗、半碗）"
                  value={mealAmount}
                  onInput={e => setMealAmount(e.detail.value)}
                />
                <View className={styles.formToggleRow}>
                  <Text className={styles.formToggleLabel}>是否吃完</Text>
                  <View
                    className={classnames(styles.formToggle, mealFinished && styles.formToggleActive)}
                    onClick={() => setMealFinished(!mealFinished)}
                  >
                    <Text style={{ fontSize: '22rpx', color: mealFinished ? '#fff' : '#6B7280' }}>
                      {mealFinished ? '已吃完' : '未吃完'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 饮水 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>💧 饮水状态</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：正常、偏少、充足"
                  value={waterStatus}
                  onInput={e => setWaterStatus(e.detail.value)}
                />
              </View>

              {/* 排便 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>💩 排便状态</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：正常、偏软、未排便"
                  value={poopStatus}
                  onInput={e => setPoopStatus(e.detail.value)}
                />
              </View>

              {/* 排尿 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>🚽 排尿状态</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：正常、偏少"
                  value={peeStatus}
                  onInput={e => setPeeStatus(e.detail.value)}
                />
              </View>

              {/* 散步 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>🐕 散步</Text>
                <View className={styles.formInputRow}>
                  <Input
                    className={styles.formInputSmall}
                    placeholder="时间"
                    value={walkForm.time}
                    onInput={e => setWalkForm({ ...walkForm, time: e.detail.value })}
                  />
                  <Input
                    className={styles.formInputSmall}
                    placeholder="时长(分钟)"
                    type="number"
                    value={walkForm.duration}
                    onInput={e => setWalkForm({ ...walkForm, duration: e.detail.value })}
                  />
                  <Input
                    className={styles.formInputSmall}
                    placeholder="距离"
                    value={walkForm.distance}
                    onInput={e => setWalkForm({ ...walkForm, distance: e.detail.value })}
                  />
                </View>
                <Input
                  className={styles.formInput}
                  placeholder="散步备注"
                  value={walkForm.notes}
                  onInput={e => setWalkForm({ ...walkForm, notes: e.detail.value })}
                />
              </View>

              {/* 心情 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>😊 心情</Text>
                <View className={styles.moodPicker}>
                  {MOOD_OPTIONS.map(option => (
                    <View
                      key={option}
                      className={classnames(
                        styles.moodOption,
                        selectedMood === option && styles.moodOptionSelected
                      )}
                      onClick={() => setSelectedMood(option)}
                    >
                      <Text style={{
                        fontSize: '24rpx',
                        color: selectedMood === option ? '#fff' : '#6B7280'
                      }}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 健康 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>💚 健康状况</Text>
                <View className={styles.moodPicker}>
                  {HEALTH_OPTIONS.map(option => (
                    <View
                      key={option}
                      className={classnames(
                        styles.moodOption,
                        selectedHealth === option && styles.moodOptionSelected
                      )}
                      onClick={() => setSelectedHealth(option)}
                    >
                      <Text style={{
                        fontSize: '24rpx',
                        color: selectedHealth === option ? '#fff' : '#6B7280'
                      }}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 照片 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>📷 照片</Text>
                <View className={styles.photoRow}>
                  {formPhotos.map((photo, idx) => (
                    <View key={idx} className={styles.formPhotoItem}>
                      <Image
                        className={styles.formPhotoImage}
                        src={photo}
                        mode="aspectFill"
                      />
                      <View
                        className={styles.formPhotoRemove}
                        onClick={() => handleRemovePhoto(idx)}
                      >
                        <Text style={{ fontSize: '20rpx', color: '#fff' }}>✕</Text>
                      </View>
                    </View>
                  ))}
                  {formPhotos.length < 6 && (
                    <View className={styles.formPhotoAdd} onClick={handleChooseImage}>
                      <Text style={{ fontSize: '40rpx', color: '#9CA3AF' }}>+</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 视频 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>🎬 视频</Text>
                <View className={styles.photoRow}>
                  {formVideos.map((video, idx) => (
                    <View key={idx} className={styles.formVideoItem}>
                      <Video
                        className={styles.videoPlayer}
                        src={video}
                        controls
                        autoplay={false}
                        objectFit="contain"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <View
                        className={styles.formVideoRemove}
                        onClick={handleRemoveVideo}
                      >
                        <Text style={{ fontSize: '20rpx', color: '#fff' }}>✕</Text>
                      </View>
                    </View>
                  ))}
                  {formVideos.length < 1 && (
                    <View className={styles.formVideoAdd} onClick={handleChooseVideo}>
                      <Text style={{ fontSize: '24rpx', color: '#9CA3AF' }}>选择视频</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 店员备注 */}
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>💬 店员备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="记录宠物今日的特殊情况..."
                  value={staffNotes}
                  onInput={e => setStaffNotes(e.detail.value)}
                  maxlength={500}
                />
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <View className={styles.saveBtn} onClick={handleSave}>
                <Text style={{ fontSize: '30rpx', color: '#fff', fontWeight: '600' }}>保存记录</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DynamicsPage;
