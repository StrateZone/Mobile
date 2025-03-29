export type RootStackParamList = {
  login: undefined;
  Otp: { email: string };
  Profile: undefined;
  Register: undefined;
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
};
