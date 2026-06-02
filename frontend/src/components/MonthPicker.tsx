import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { monthLabel, shiftMonth } from '../utils/month';
import { colors } from '../theme';

type Props = {
  month: string;
  onChange: (month: string) => void;
};

export function MonthPicker({ month, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onChange(shiftMonth(month, -1))} style={styles.btn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.label}>{monthLabel(month)}</Text>
      <Pressable onPress={() => onChange(shiftMonth(month, 1))} style={styles.btn} hitSlop={8}>
        <Ionicons name="chevron-forward" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  btn: { padding: 8 },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
