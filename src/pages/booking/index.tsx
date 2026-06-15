import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Button,
  Textarea,
  Input,
  Picker
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { petList } from '@/data/pet';
import { roomTypeList } from '@/data/booking';
import useAppStore from '@/store';
import type { Pet, RoomType, FeedingItem, MedicationItem, Booking } from '@/types';

const BookingPage: React.FC = () => {
  const { bookings, addBooking } = useAppStore();

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
  const [photos, setPhotos] = useState<string[]>([]);

  const [editingFeedingIdx, setEditingFeedingIdx] = useState(-1);
  const [editingMedIdx, setEditingMedIdx] = useState(-1);
  const [editFeeding, setEditFeeding] = useState<FeedingItem>({ time: '', food: '', amount: '' });
  const [editMed, setEditMed] = useState<MedicationItem>({ name: '', dosage: '', frequency: '', notes: '' });

  const days = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => selectedRoom.price * days, [selectedRoom, days]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  const handleChooseImage = useCallback(() => {
    Taro.chooseImage({
      count: 6 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setPhotos(prev => [...prev, ...res.tempFilePaths].slice(0, 6));
      }
    });
  }, [photos]);

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePreviewPhoto = (current: string) => {
    Taro.previewImage({ urls: photos, current });
  };

  const handleAddFeeding = () => {
    setEditFeeding({ time: '12:00', food: '', amount: '' });
    setEditingFeedingIdx(-1);
  };

  const handleEditFeeding = (idx: number) => {
    setEditFeeding({ ...feedingSchedule[idx] });
    setEditingFeedingIdx(idx);
  };

  const handleSaveFeeding = () => {
    if (!editFeeding.time || !editFeeding.food) {
      Taro.showToast({ title: '请填写时间和食物', icon: 'none' });
      return;
    }
    if (editingFeedingIdx === -1) {
      setFeedingSchedule([...feedingSchedule, editFeeding]);
    } else {
      const newSchedule = [...feedingSchedule];
      newSchedule[editingFeedingIdx] = editFeeding;
      setFeedingSchedule(newSchedule);
    }
    setEditingFeedingIdx(-2);
  };

  const handleRemoveFeeding = (idx: number) => {
    setFeedingSchedule(feedingSchedule.filter((_, i) => i !== idx));
  };

  const handleAddMedication = () => {
    setEditMed({ name: '', dosage: '', frequency: '', notes: '' });
    setEditingMedIdx(-1);
  };

  const handleEditMedication = (idx: number) => {
    setEditMed({ ...medications[idx] });
    setEditingMedIdx(idx);
  };

  const handleSaveMedication = () => {
    if (!editMed.name || !editMed.dosage) {
      Taro.showToast({ title: '请填写药物名称和用量', icon: 'none' });
      return;
    }
    if (editingMedIdx === -1) {
      setMedications([...medications, editMed]);
    } else {
      const newMeds = [...medications];
      newMeds[editingMedIdx] = editMed;
      setMedications(newMeds);
    }
    setEditingMedIdx(-2);
  };

  const handleRemoveMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!selectedPet) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' });
      return;
    }
    if (days <= 0) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const newBooking: Booking = {
      id: `bk${Date.now()}`,
      petId: selectedPet.id,
      petName: selectedPet.name,
      petAvatar: selectedPet.avatar,
      roomTypeId: selectedRoom.id,
      roomTypeName: selectedRoom.name,
      checkInDate,
      checkOutDate,
      days,
      status: 'pending',
      totalPrice,
      feedingSchedule: [...feedingSchedule],
      medications: [...medications],
      walkRequirements,
      dietaryRestrictions,
      notes,
      photos: [...photos],
      createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    };

    addBooking(newBooking);
    Taro.showToast({ title: '预约提交成功！', icon: 'success' });

    setFeedingSchedule([
      { time: '08:00', food: '皇家狗粮', amount: '150g' },
      { time: '18:00', food: '皇家狗粮', amount: '150g' }
    ]);
    setMedications([]);
    setWalkRequirements('');
    setDietaryRestrictions('');
    setNotes('');
    setPhotos([]);
  };

  const onCheckInChange = (e) => {
    const val = e.detail.value;
    setCheckInDate(val);
    if (new Date(val) >= new Date(checkOutDate)) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      setCheckOutDate(`${y}-${m}-${d}`);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>预约寄养</Text>
        <Text className={styles.headerSubtitle}>为您的爱宠挑选温馨的家</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
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

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>寄养时间</Text>
          <View className={styles.datePicker}>
            <Picker mode="date" value={checkInDate} onChange={onCheckInChange}>
              <View className={styles.dateItem}>
                <Text className={styles.dateLabel}>入住</Text>
                <Text className={styles.dateValue}>{formatDate(checkInDate)}</Text>
              </View>
            </Picker>
            <View className={styles.dateDays}>
              <View>
                <Text className={styles.daysText}>{days}</Text>
                <Text className={styles.daysLabel}> 天</Text>
              </View>
            </View>
            <Picker mode="date" value={checkOutDate} start={checkInDate} onChange={(e) => setCheckOutDate(e.detail.value)}>
              <View className={styles.dateItem}>
                <Text className={styles.dateLabel}>离店</Text>
                <Text className={styles.dateValue}>{formatDate(checkOutDate)}</Text>
              </View>
            </Picker>
          </View>
        </View>

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

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>喂食计划</Text>
          <View className={styles.feedingList}>
            {feedingSchedule.map((item, index) => (
              editingFeedingIdx === index ? (
                <View key={index} className={styles.editCard}>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>时间</Text>
                    <Input
                      className={styles.editInput}
                      value={editFeeding.time}
                      onInput={(e) => setEditFeeding({ ...editFeeding, time: e.detail.value })}
                      placeholder="08:00"
                    />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>食物</Text>
                    <Input
                      className={styles.editInput}
                      value={editFeeding.food}
                      onInput={(e) => setEditFeeding({ ...editFeeding, food: e.detail.value })}
                      placeholder="请输入食物名称"
                    />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>用量</Text>
                    <Input
                      className={styles.editInput}
                      value={editFeeding.amount}
                      onInput={(e) => setEditFeeding({ ...editFeeding, amount: e.detail.value })}
                      placeholder="如150g"
                    />
                  </View>
                  <View className={styles.editActions}>
                    <Button className={styles.editBtnCancel} onClick={() => setEditingFeedingIdx(-2)}>取消</Button>
                    <Button className={styles.editBtnSave} onClick={handleSaveFeeding}>保存</Button>
                  </View>
                </View>
              ) : (
                <View key={index} className={styles.feedingItem}>
                  <Text className={styles.feedingTime}>{item.time}</Text>
                  <View className={styles.feedingDetail}>
                    <Text className={styles.feedingFood}>{item.food || '未设置'}</Text>
                    <Text className={styles.feedingAmount}>{item.amount || '未设置用量'}</Text>
                  </View>
                  <Text className={styles.actionText} onClick={() => handleEditFeeding(index)}>编辑</Text>
                  <View className={styles.feedingDelete} onClick={() => handleRemoveFeeding(index)}>
                    <Text>×</Text>
                  </View>
                </View>
              )
            ))}
          </View>
          <View className={styles.addButton} onClick={handleAddFeeding}>
            <Text className={styles.addButtonIcon}>+</Text>
            <Text>添加喂食时间</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>药物登记</Text>
          {medications.length > 0 ? (
            medications.map((med, index) => (
              editingMedIdx === index ? (
                <View key={index} className={styles.editCard}>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>名称</Text>
                    <Input className={styles.editInput} value={editMed.name} onInput={(e) => setEditMed({ ...editMed, name: e.detail.value })} placeholder="药物名称" />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>用量</Text>
                    <Input className={styles.editInput} value={editMed.dosage} onInput={(e) => setEditMed({ ...editMed, dosage: e.detail.value })} placeholder="如2片" />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>频次</Text>
                    <Input className={styles.editInput} value={editMed.frequency} onInput={(e) => setEditMed({ ...editMed, frequency: e.detail.value })} placeholder="如每日1次" />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>备注</Text>
                    <Input className={styles.editInput} value={editMed.notes} onInput={(e) => setEditMed({ ...editMed, notes: e.detail.value })} placeholder="如饭后服用" />
                  </View>
                  <View className={styles.editActions}>
                    <Button className={styles.editBtnCancel} onClick={() => setEditingMedIdx(-2)}>取消</Button>
                    <Button className={styles.editBtnSave} onClick={handleSaveMedication}>保存</Button>
                  </View>
                </View>
              ) : (
                <View key={index} className={styles.medicationItem}>
                  <View className={styles.medicationHeader}>
                    <Text className={styles.medicationName}>{med.name || '未命名药物'}</Text>
                    <View style={{ display: 'flex', gap: '16rpx' }}>
                      <Text className={styles.actionText} onClick={() => handleEditMedication(index)}>编辑</Text>
                      <Text className={styles.deleteText} onClick={() => handleRemoveMedication(index)}>删除</Text>
                    </View>
                  </View>
                  <Text className={styles.medicationDetail}>
                    {med.dosage} · {med.frequency}
                  </Text>
                  {med.notes && <Text className={styles.medicationDetail}>备注：{med.notes}</Text>}
                </View>
              )
            ))
          ) : (
            <Text style={{ color: '#9CA3AF', fontSize: '26rpx' }}>暂无药物</Text>
          )}
          <View className={styles.addButton} onClick={handleAddMedication}>
            <Text className={styles.addButtonIcon}>+</Text>
            <Text>添加药物</Text>
          </View>
        </View>

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

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>宠物照片</Text>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem} onClick={() => handlePreviewPhoto(photo)}>
                <Image className={styles.photoImage} src={photo} mode="aspectFill" />
                <View className={styles.photoDelete} onClick={(e) => { e.stopPropagation(); handleRemovePhoto(index); }}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {photos.length < 6 && (
              <View className={styles.photoAdd} onClick={handleChooseImage}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            )}
          </View>
          {photos.length > 0 && (
            <Text style={{ fontSize: '22rpx', color: '#9CA3AF', marginTop: '12rpx' }}>
              已选{photos.length}/6张，点击照片可预览
            </Text>
          )}
        </View>

        <View className={styles.bookingList}>
          <Text className={styles.bookingListTitle}>我的预约</Text>
          {bookings.map(booking => (
            <View
              key={booking.id}
              className={styles.bookingItem}
              onClick={() => Taro.navigateTo({ url: `/pages/booking-detail/index?id=${booking.id}` })}
            >
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
