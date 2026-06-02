import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { AppStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { CURRENCY_SYMBOL, todayIso } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'AddExpense' | 'EditExpense'>;

const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

export function ExpenseFormScreen({ navigation, route }: Props) {
  const isEdit = route.name === 'EditExpense';
  const expenseId =
    isEdit && route.params && 'id' in route.params ? route.params.id : undefined;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || !expenseId) return;

    setLoading(true);
    api
      .getExpense(expenseId)
      .then((expense) => {
        setTitle(expense.title);
        setAmount(String(expense.amount));
        setCategory(expense.category);
        setDate(expense.date);
        setNote(expense.note ?? '');
      })
      .catch((err: Error) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [isEdit, expenseId]);

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Validation', `Please enter a valid amount in rupees (${CURRENCY_SYMBOL}).`);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Validation', 'Date must be YYYY-MM-DD.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        note: note.trim() || undefined,
      };

      if (isEdit && expenseId) {
        await api.updateExpense(expenseId, payload);
      } else {
        await api.createExpense(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Coffee, groceries..."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Amount in rupees ({CURRENCY_SYMBOL})</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder={`${CURRENCY_SYMBOL}0`}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-06-02"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Add a note..."
        placeholderTextColor={colors.textMuted}
      />

      <Pressable
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.saveBtnText}>{isEdit ? 'Update expense' : 'Add expense'}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
