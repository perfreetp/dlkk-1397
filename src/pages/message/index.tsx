import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { messageList, unreadCount } from '@/data/message';
import type { Message } from '@/types';

type TabType = 'all' | 'system' | 'alert' | 'daily' | 'chat';

const MessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [messages, setMessages] = useState<Message[]>(messageList);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'daily', label: '日报' },
    { key: 'system', label: '系统' },
    { key: 'alert', label: '提醒' },
    { key: 'chat', label: '聊天' }
  ];

  const filteredMessages = useMemo(() => {
    if (activeTab === 'all') return messages;
    return messages.filter(m => m.type === activeTab);
  }, [messages, activeTab]);

  const tabUnreadCounts = useMemo(() => {
    const counts: Record<TabType, number> = {
      all: unreadCount,
      system: 0,
      alert: 0,
      daily: 0,
      chat: 0
    };
    messages.forEach(m => {
      if (!m.read && m.type in counts) {
        counts[m.type]++;
      }
    });
    return counts;
  }, [messages]);

  const getIconByType = (type: string) => {
    const iconMap: Record<string, string> = {
      system: '📢',
      alert: '⚠️',
      daily: '📸',
      chat: '💬'
    };
    return iconMap[type] || '📬';
  };

  const handleMessageClick = (msg: Message) => {
    console.log('[Message] 查看消息', msg);
    setMessages(messages.map(m =>
      m.id === msg.id ? { ...m, read: true } : m
    ));

    if (msg.relatedBookingId) {
      Taro.showToast({
        title: '跳转到订单详情',
        icon: 'none'
      });
    }
  };

  const handleQuickAction = (action: string) => {
    console.log('[Message] 快捷操作', action);
    Taro.showToast({
      title: `正在${action}...`,
      icon: 'none'
    });
  };

  const handleCall = () => {
    Taro.showModal({
      title: '联系寄养店',
      content: '确定要拨打寄养店电话吗？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          console.log('[Message] 拨打电话');
          Taro.makePhoneCall({
            phoneNumber: '400-123-4567'
          });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>消息中心</Text>
        <Text className={styles.headerSubtitle}>重要消息不错过</Text>
      </View>

      <ScrollView className={styles.content} scrollY>
        {/* 快捷入口 */}
        <View className={styles.quickActions}>
          <View
            className={classnames(styles.quickAction, styles.danger)}
            onClick={handleCall}
          >
            <View className={styles.quickActionIcon}>📞</View>
            <Text className={styles.quickActionText}>紧急联系</Text>
          </View>
          <View
            className={classnames(styles.quickAction, styles.info)}
            onClick={() => handleQuickAction('联系客服')}
          >
            <View className={styles.quickActionIcon}>💬</View>
            <Text className={styles.quickActionText}>在线客服</Text>
          </View>
        </View>

        {/* 分类标签 */}
        <ScrollView className={styles.tabBar} scrollX>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                activeTab === tab.key && styles.active
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tabUnreadCounts[tab.key] > 0 && (
                <Text className={styles.tabBadge}>
                  {tabUnreadCounts[tab.key]}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* 消息列表 */}
        {filteredMessages.length > 0 ? (
          <View className={styles.messageList}>
            {filteredMessages.map(msg => (
              <View
                key={msg.id}
                className={classnames(
                  styles.messageItem,
                  !msg.read && styles.unread
                )}
                onClick={() => handleMessageClick(msg)}
              >
                <View
                  className={classnames(
                    styles.messageIcon,
                    styles[msg.type]
                  )}
                >
                  {getIconByType(msg.type)}
                </View>
                <View className={styles.messageContent}>
                  <View className={styles.messageHeader}>
                    <Text className={styles.messageTitle}>{msg.title}</Text>
                    <Text className={styles.messageTime}>{msg.time}</Text>
                  </View>
                  <Text className={styles.messagePreview}>{msg.content}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;
