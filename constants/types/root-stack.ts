export type RootStackParamList = {
  //auth
  login: undefined;
  Otp: { email: string };
  Register: undefined;
  //profile
  profile: undefined;
  appointment_history: undefined;
  deposit: { returnUrl: string };
  appointment_detail: { appointmentId: number };
  balance_movement_history: undefined;
  //appointment
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
