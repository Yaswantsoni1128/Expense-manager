import { StyleSheet, Text, View } from 'react-native';
import type { Summary } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

type Props = {
  summary: Summary | null;
  monthLabel?: string;
};

export function SummaryCard({ summary, monthLabel: monthTitle }: Props) {
  const total = summary?.total ?? 0;
  const count = summary?.count ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        {monthTitle ? `${monthTitle} — spent` : 'Total spent (₹)'}
      </Text>
      <Text style={styles.total}>{formatCurrency(total)}</Text>
      <Text style={styles.meta}>
        {count} expense{count === 1 ? '' : 's'}
      </Text>
      {summary && summary.byCategory.length > 0 && (
        <View style={styles.breakdown}>
          {summary.byCategory.slice(0, 3).map((item) => (
            <View key={item.category} style={styles.breakdownRow}>
              <Text style={styles.breakdownCategory}>{item.category}</Text>
              <Text style={styles.breakdownAmount}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    color: '#e0f2fe',
    fontSize: 14,
    marginBottom: 4,
  },
  total: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  meta: {
    color: '#e0f2fe',
    fontSize: 14,
    marginTop: 4,
  },
  breakdown: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownCategory: {
    color: '#e0f2fe',
    fontSize: 13,
  },
  breakdownAmount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
