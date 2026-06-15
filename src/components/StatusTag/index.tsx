import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

export interface StatusTagProps {
  status: string;
  type?: 'booking' | 'health' | 'mood' | 'default';
}

const statusMap: Record<string, { text: string; className: string }> = {
  pending: { text: '待确认', className: styles.pending },
  confirmed: { text: '已确认', className: styles.confirmed },
  in_progress: { text: '进行中', className: styles.inProgress },
  completed: { text: '已完成', className: styles.completed },
  cancelled: { text: '已取消', className: styles.cancelled },
  good: { text: '良好', className: styles.good },
  normal: { text: '一般', className: styles.normal },
  bad: { text: '不佳', className: styles.bad }
};

const StatusTag: React.FC<StatusTagProps> = ({ status, type = 'default' }) => {
  const info = statusMap[status] || { text: status, className: styles.default };

  return (
    <View className={classnames(styles.tag, info.className)}>
      <Text className={styles.text}>{info.text}</Text>
    </View>
  );
};

export default StatusTag;
