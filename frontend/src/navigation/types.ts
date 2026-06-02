export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Home: { month?: string } | undefined;
  AddExpense: undefined;
  EditExpense: { id: number };
  MonthlyInsights: undefined;
};
