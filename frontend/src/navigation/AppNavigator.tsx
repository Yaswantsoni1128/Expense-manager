import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ExpenseFormScreen } from '../screens/ExpenseFormScreen';
import { MonthlyInsightsScreen } from '../screens/MonthlyInsightsScreen';
import type { AppStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const { logout, user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: user ? `Hi, ${user.name.split(' ')[0]}` : 'Expenses',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable
                onPress={() => navigation.navigate('MonthlyInsights')}
                hitSlop={8}
              >
                <Ionicons name="stats-chart-outline" size={24} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => logout()} hitSlop={8}>
                <Ionicons name="log-out-outline" size={24} color={colors.text} />
              </Pressable>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="MonthlyInsights"
        component={MonthlyInsightsScreen}
        options={{ title: 'Monthly insights' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={ExpenseFormScreen}
        options={{ title: 'Add expense' }}
      />
      <Stack.Screen
        name="EditExpense"
        component={ExpenseFormScreen}
        options={{ title: 'Edit expense' }}
      />
    </Stack.Navigator>
  );
}
