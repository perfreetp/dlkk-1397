import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, extra }) => {
  return (
    <View className={styles.wrapper}>
      <View className={styles.left}>
        <View className={styles.dot} />
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {extra && <View className={styles.extra}>{extra}</View>}
    </View>
  );
};

export default SectionTitle;
