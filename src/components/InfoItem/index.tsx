import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  bordered?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, bordered = true }) => {
  return (
    <View className={[styles.wrapper, bordered && styles.bordered].join(' ')}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.value}>
        {typeof value === 'string' ? <Text className={styles.valueText}>{value}</Text> : value}
      </View>
    </View>
  );
};

export default InfoItem;
