export type RootStackParamList = {
  login: undefined;
  Otp: { email: string };
  Profile: undefined;
  Register: undefined;
  home_booking: undefined;
  booking_detail: undefined;
  list_table: {
    gameType: string;
    roomTypes: string[];
    selectedDate: string;
    StartTime: string;
    EndTime: string;
  };
};
