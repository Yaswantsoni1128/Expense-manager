import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { ExpenseItem } from '../components/ExpenseItem';
import { MonthPicker } from '../components/MonthPicker';
import { SummaryCard } from '../components/SummaryCard';
import type { AppStackParamList } from '../navigation/types';
import type { Expense, Summary } from '../types';
import { colors } from '../theme';
import { getApiBaseUrl } from '../config';
import { currentMonth, monthLabel } from '../utils/month';

const PAGE_SIZE = 15;

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation, route }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(
    route.params?.month ?? currentMonth(),
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.month) {
      setSelectedMonth(route.params.month);
    }
  }, [route.params?.month]);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [expenseResult, summaryData] = await Promise.all([
          api.getExpenses(selectedMonth, 1, PAGE_SIZE),
          api.getSummary(selectedMonth),
        ]);
        setExpenses(expenseResult.data);
        setPage(1);
        setHasMore(expenseResult.pagination.hasMore);
        setTotalCount(expenseResult.pagination.total);
        setSummary(summaryData);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Could not connect to the server. Is the backend running?';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedMonth],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading || refreshing) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await api.getExpenses(selectedMonth, nextPage, PAGE_SIZE);
      setExpenses((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.pagination.hasMore);
      setTotalCount(result.pagination.total);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not load more');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loading, refreshing, page, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    loadData();
  }, [selectedMonth, loadData]);

  const handleDelete = (expense: Expense) => {
    Alert.alert('Delete expense', `Remove "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteExpense(expense.id);
            loadData(true);
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Delete failed');
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            <MonthPicker month={selectedMonth} onChange={setSelectedMonth} />
            <SummaryCard summary={summary} monthLabel={monthLabel(selectedMonth)} />
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>API: {getApiBaseUrl()}</Text>
                <Pressable style={styles.retryBtn} onPress={() => loadData()}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>
              Expenses this month
              {totalCount > 0 ? ` (${expenses.length} of ${totalCount})` : ''}
            </Text>
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              color={colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No expenses this month</Text>
              <Text style={styles.emptyText}>Tap + to add an expense.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onPress={() => navigation.navigate('EditExpense', { id: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textMuted,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
  },
  errorHint: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 6,
  },
  retryBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
