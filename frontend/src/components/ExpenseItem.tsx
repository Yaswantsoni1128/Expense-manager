import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Expense } from '../types';
import { categoryColors, colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

type Props = {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
};

export function ExpenseItem({ expense, onPress, onDelete }: Props) {
  const badgeColor = categoryColors[expense.category] ?? colors.textMuted;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{expense.category[0]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.subtitle}>
            {expense.category} · {formatDate(expense.date)}
          </Text>
          {expense.note ? <Text style={styles.note}>{expense.note}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={8}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
});
