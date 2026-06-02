import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { AppStackParamList } from '../navigation/types';
import type { MonthlyOverview } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'MonthlyInsights'>;

export function MonthlyInsightsScreen({ navigation }: Props) {
  const [overview, setOverview] = useState<MonthlyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.getMonthlyOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const maxTotal = overview?.months.reduce((max, m) => Math.max(max, m.total), 0) ?? 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
      }
    >
      {overview && overview.averageMonthlySpend > 0 && (
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Average monthly spend</Text>
          <Text style={styles.avgValue}>{formatCurrency(overview.averageMonthlySpend)}</Text>
        </View>
      )}

      {overview?.insights.map((line) => (
        <View key={line} style={styles.insightBox}>
          <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          <Text style={styles.insightText}>{line}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Month by month</Text>

      {overview?.months.length === 0 ? (
        <Text style={styles.empty}>No monthly data yet.</Text>
      ) : (
        overview?.months.map((item) => (
          <Pressable
            key={item.month}
            style={[styles.monthRow, item.isHighSpending && styles.monthRowHigh]}
            onPress={() => navigation.navigate('Home', { month: item.month })}
          >
            <View style={styles.monthHeader}>
              <View>
                <Text style={styles.monthName}>{item.label}</Text>
                <Text style={styles.monthMeta}>
                  {item.count} expense{item.count === 1 ? '' : 's'}
                  {item.isHighSpending ? ' · High spending' : ''}
                </Text>
              </View>
              <Text style={styles.monthTotal}>{formatCurrency(item.total)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(8, (item.total / maxTotal) * 100)}%`,
                    backgroundColor: item.isHighSpending ? colors.danger : colors.primary,
                  },
                ]}
              />
            </View>
            {item.percentAboveAverage !== 0 && (
              <Text style={styles.percent}>
                {item.percentAboveAverage > 0 ? '+' : ''}
                {item.percentAboveAverage}% vs average
              </Text>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avgCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avgLabel: { color: '#e0f2fe', fontSize: 13 },
  avgValue: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 },
  insightBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  insightText: { flex: 1, color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  monthRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthRowHigh: {
    borderColor: colors.danger,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  monthName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  monthMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  monthTotal: { color: colors.text, fontSize: 16, fontWeight: '700' },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  percent: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
});
