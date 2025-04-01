export type RootStackParamList = {
  login: undefined;
  Otp: { email: string };
  profile: undefined;
  Register: undefined;
  deposit: { returnUrl: string };
  home_booking: undefined;
  booking_detail: undefined;
  table_detail: { tableId: number; startDate: string; endDate: string };
  list_table: {
    gameType: string;
    roomTypes: string[];
    selectedDate: string;
    StartTime: string;
    EndTime: string;
  };
  payment_successfull: undefined;
};
