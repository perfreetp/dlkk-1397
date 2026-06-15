import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { currentPet } from '@/data/pet';

const PetProfilePage: React.FC = () => {
  const pet = currentPet;

  const healthInfo = [
    { icon: '💉', text: '疫苗接种', status: 'ok', statusText: '已接种' },
    { icon: '✂️', text: '绝育手术', status: pet.sterilizationStatus ? 'ok' : 'warning', statusText: pet.sterilizationStatus ? '已绝育' : '未绝育' },
    { icon: '🦷', text: '口腔健康', status: 'ok', statusText: '良好' },
    { icon: '🩺', text: '定期驱虫', status: 'ok', statusText: '已驱虫' }
  ];

  const vaccineRecords = [
    { name: '狂犬疫苗', date: '2024-03-15', status: '有效' },
    { name: '六联疫苗', date: '2024-03-15', status: '有效' },
    { name: '体内驱虫', date: '2024-05-10', status: '有效' },
    { name: '体外驱虫', date: '2024-06-01', status: '有效' }
  ];

  const personalityTags = ['温顺', '粘人', '活泼', '爱吃', '怕打雷', '喜欢玩球'];

  return (
    <View className={styles.page}>
      {/* 头部 */}
      <View className={styles.header}>
        <Image className={styles.petAvatar} src={pet.avatar} mode="aspectFill" />
        <Text className={styles.petName}>{pet.name}</Text>
        <Text className={styles.petBreed}>{pet.breed}</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
        {/* 基本信息 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>基本信息</Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>品种</Text>
              <Text className={styles.infoValue}>{pet.breed}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>年龄</Text>
              <Text className={styles.infoValue}>{pet.age}岁</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>性别</Text>
              <Text className={styles.infoValue}>{pet.gender === 'male' ? '公' : '母'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>体重</Text>
              <Text className={styles.infoValue}>{pet.weight}kg</Text>
            </View>
          </View>
        </View>

        {/* 性格特点 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>性格特点</Text>
          <View className={styles.tagList}>
            {personalityTags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>

        {/* 健康档案 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>健康档案</Text>
          <View className={styles.healthList}>
            {healthInfo.map((item, idx) => (
              <View key={idx} className={styles.healthItem}>
                <View className={styles.healthInfo}>
                  <Text className={styles.healthIcon}>{item.icon}</Text>
                  <Text className={styles.healthText}>{item.text}</Text>
                </View>
                <Text
                  className={classnames(
                    styles.healthStatus,
                    item.status === 'ok' && styles.ok,
                    item.status === 'warning' && styles.warning
                  )}
                >
                  {item.statusText}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 疫苗记录 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>疫苗记录</Text>
          <View className={styles.vaccineList}>
            {vaccineRecords.map((item, idx) => (
              <View key={idx} className={styles.vaccineItem}>
                <View>
                  <Text className={styles.vaccineName}>{item.name}</Text>
                  <Text className={styles.vaccineDate}>{item.date}</Text>
                </View>
                <Text className={styles.vaccineTag}>{item.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 饮食习惯 */}
        <View className={styles.card}>
          <Text className={styles.cardTitle}>饮食习惯</Text>
          <View style={{ fontSize: '26rpx', color: '#4B5563', lineHeight: 1.8 }}>
            <Text>• 主食：皇家狗粮，每天2次，每次150g</Text>
            <Text>{"\n"}</Text>
            <Text>• 零食：每天少量零食作为奖励</Text>
            <Text>{"\n"}</Text>
            <Text>• 过敏食物：鸡肉、葡萄、巧克力</Text>
            <Text>{"\n"}</Text>
            <Text>• 偏好：喜欢牛肉味的食物</Text>
          </View>
        </View>

        {/* 编辑按钮 */}
        <View
          style={{
            marginTop: '24rpx',
            padding: '24rpx',
            backgroundColor: '#fff',
            borderRadius: '16rpx',
            textAlign: 'center',
            boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)'
          }}
          onClick={() => Taro.showToast({ title: '编辑宠物信息', icon: 'none' })}
        >
          <Text style={{ fontSize: '28rpx', color: '#FF8A3D', fontWeight: 500 }}>
            编辑宠物信息
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PetProfilePage;
