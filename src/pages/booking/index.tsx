import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Button,
  Textarea,
  Input
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { petList } from '@/data/pet';
import { roomTypeList, bookingList } from '@/data/booking';
import type { Pet, RoomType, FeedingItem, MedicationItem } from '@/types';

const BookingPage: React.FC = () => {
  const [selectedPet, setSelectedPet] = useState<Pet>(petList[0]);
  const [checkInDate, setCheckInDate] = useState('2024-06-20');
  const [checkOutDate, setCheckOutDate] = useState('2024-06-25');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(roomTypeList[1]);
  const [feedingSchedule, setFeedingSchedule] = useState<FeedingItem[]>([
    { time: '08:00', food: '皇家狗粮', amount: '150g' },
    { time: '18:00', food: '皇家狗粮', amount: '150g' }
  ]);
  const [medications, setMedications] = useState<MedicationItem[]>([
    { name: '钙片', dosage: '2片', frequency: '每日1次', notes: '饭后服用' }
  ]);
  const [walkRequirements, setWalkRequirements] = useState('每天早晚各遛一次，每次30分钟，喜欢捡球玩');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('对鸡肉过敏，不能吃葡萄和巧克力');
  const [notes, setNotes] = useState('性格温顺，怕打雷，下雨时请多安抚');
  const [photos, setPhotos] = useState<string[]>([
    'https://picsum.photos/id/237/400/300',
    'https://picsum.photos/id/1025/400/300'
  ]);

  const days = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    return selectedRoom.price * days;
  }, [selectedRoom, days]);

  const handleSubmit = () => {
    Taro.showToast({
      title: '预约提交成功',
      icon: 'success'
    });
    console.log('[Booking] 提交预约', {
      pet: selectedPet,
      checkInDate,
      checkOutDate,
      room: selectedRoom,
      feedingSchedule,
      medications,
      walkRequirements,
      dietaryRestrictions,
      notes,
      photos,
      totalPrice
    });
  };

  const handleAddPhoto = () => {
    const newPhoto = `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 237}/400/300`;
    setPhotos([...photos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddFeeding = () => {
    setFeedingSchedule([
      ...feedingSchedule,
      { time: '12:00', food: '', amount: '' }
    ]);
  };

  const handleRemoveFeeding = (index: number) => {
    setFeedingSchedule(feedingSchedule.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', notes: '' }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>预约寄养</Text>
        <Text className={styles.headerSubtitle}>为您的爱宠挑选温馨的家</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
        {/* 宠物选择 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>选择宠物</Text>
          {petList.map(pet => (
            <View
              key={pet.id}
              className={classnames(styles.petSelector, selectedPet.id === pet.id && styles.active)}
              onClick={() => setSelectedPet(pet)}
            >
              <Image className={styles.petAvatar} src={pet.avatar} mode="aspectFill" />
              <View className={styles.petInfo}>
                <Text className={styles.petName}>{pet.name}</Text>
                <Text className={styles.petDesc}>
                  {pet.breed} · {pet.age}岁 · {pet.gender === 'male' ? '公' : '母'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 日期选择 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>寄养时间</Text>
          <View className={styles.datePicker}>
            <View className={styles.dateItem} onClick={() => Taro.showToast({ title: '选择入住日期', icon: 'none' })}>
              <Text className={styles.dateLabel}>入住</Text>
              <Text className={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </View>
            <View className={styles.dateDays}>
              <View>
                <Text className={styles.daysText}>{days}</Text>
                <Text className={styles.daysLabel}> 天</Text>
              </View>
            </View>
            <View className={styles.dateItem} onClick={() => Taro.showToast({ title: '选择离店日期', icon: 'none' })}>
              <Text className={styles.dateLabel}>离店</Text>
              <Text className={styles.dateValue}>{formatDate(checkOutDate)}</Text>
            </View>
          </View>
        </View>

        {/* 房型选择 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>选择房型</Text>
          <View className={styles.roomList}>
            {roomTypeList.map(room => (
              <View
                key={room.id}
                className={classnames(styles.roomCard, selectedRoom.id === room.id && styles.selected)}
                onClick={() => setSelectedRoom(room)}
              >
                <Image className={styles.roomImage} src={room.image} mode="aspectFill" />
                <View className={styles.roomInfo}>
                  <View>
                    <Text className={styles.roomName}>{room.name}</Text>
                    <Text className={styles.roomDesc}>{room.description}</Text>
                    <View className={styles.roomFeatures}>
                      {room.features.slice(0, 3).map((feature, idx) => (
                        <Text key={idx} className={styles.roomFeature}>{feature}</Text>
                      ))}
                    </View>
                  </View>
                  <View className={styles.roomPrice}>
                    <Text className={styles.roomPriceNum}>¥{room.price}</Text>
                    <Text className={styles.roomPriceUnit}>/晚</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 喂食计划 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>喂食计划</Text>
          <View className={styles.feedingList}>
            {feedingSchedule.map((item, index) => (
              <View key={index} className={styles.feedingItem}>
                <Text className={styles.feedingTime}>{item.time}</Text>
                <View className={styles.feedingDetail}>
                  <Text className={styles.feedingFood}>{item.food || '未设置'}</Text>
                  <Text className={styles.feedingAmount}>{item.amount || '未设置用量'}</Text>
                </View>
                <View className={styles.feedingDelete} onClick={() => handleRemoveFeeding(index)}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
          </View>
          <View className={styles.addButton} onClick={handleAddFeeding}>
            <Text className={styles.addButtonIcon}>+</Text>
            <Text>添加喂食时间</Text>
          </View>
        </View>

        {/* 药物登记 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>药物登记</Text>
          {medications.length > 0 ? (
            medications.map((med, index) => (
              <View key={index} className={styles.medicationItem}>
                <View className={styles.medicationHeader}>
                  <Text className={styles.medicationName}>{med.name || '未命名药物'}</Text>
                  <Text onClick={() => handleRemoveMedication(index)} style={{ color: '#EF4444', fontSize: '24rpx' }}>
                    删除
                  </Text>
                </View>
                <Text className={styles.medicationDetail}>
                  {med.dosage} · {med.frequency}
                </Text>
                {med.notes && <Text className={styles.medicationDetail}>备注：{med.notes}</Text>}
              </View>
            ))
          ) : (
            <Text style={{ color: '#9CA3AF', fontSize: '26rpx' }}>暂无药物</Text>
          )}
          <View className={styles.addButton} onClick={handleAddMedication}>
            <Text className={styles.addButtonIcon}>+</Text>
            <Text>添加药物</Text>
          </View>
        </View>

        {/* 散步要求 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>散步要求</Text>
          <Textarea
            className={styles.textArea}
            placeholder="请填写散步频次、时长、特殊要求等"
            value={walkRequirements}
            onInput={(e) => setWalkRequirements(e.detail.value)}
            maxlength={200}
          />
        </View>

        {/* 饮食禁忌 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>饮食禁忌</Text>
          <Textarea
            className={styles.textArea}
            placeholder="请填写过敏食物、饮食禁忌等"
            value={dietaryRestrictions}
            onInput={(e) => setDietaryRestrictions(e.detail.value)}
            maxlength={200}
          />
        </View>

        {/* 其他备注 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>其他备注</Text>
          <Textarea
            className={styles.textArea}
            placeholder="性格特点、特殊习惯、注意事项等"
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={500}
          />
        </View>

        {/* 照片上传 */}
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>宠物照片</Text>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image className={styles.photoImage} src={photo} mode="aspectFill" />
                <View className={styles.photoDelete} onClick={() => handleRemovePhoto(index)}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {photos.length < 6 && (
              <View className={styles.photoAdd} onClick={handleAddPhoto}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            )}
          </View>
        </View>

        {/* 历史预约 */}
        <View className={styles.bookingList}>
          <Text className={styles.bookingListTitle}>我的预约</Text>
          {bookingList.map(booking => (
            <View key={booking.id} className={styles.bookingItem}>
              <Image className={styles.bookingItemAvatar} src={booking.petAvatar} mode="aspectFill" />
              <View className={styles.bookingItemContent}>
                <View className={styles.bookingItemHeader}>
                  <Text className={styles.bookingItemPetName}>{booking.petName}</Text>
                  <StatusTag status={booking.status} />
                </View>
                <Text className={styles.bookingItemDates}>
                  {booking.checkInDate} ~ {booking.checkOutDate} · {booking.days}天
                </Text>
                <Text className={styles.bookingItemRoom}>{booking.roomTypeName} · ¥{booking.totalPrice}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.totalPrice}>
          <Text className={styles.totalPriceLabel}>预估总价</Text>
          <Text className={styles.totalPriceValue}>¥{totalPrice}</Text>
        </View>
        <Button className={styles.submitButton} onClick={handleSubmit}>
          提交预约
        </Button>
      </View>
    </View>
  );
};

export default BookingPage;
