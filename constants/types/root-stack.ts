export type RootStackParamList = {
  //auth
  login: undefined;
  Otp: { email: string };
  Register: undefined;
  //profile
  Profile: {
    screen:
      | "profile"
      | "appointment_history"
      | "appointment_detail"
      | "balance_movement_history"
      | "deposit"
      | "invitations";
  };
  invitations: undefined;
  profile: undefined;
  appointment_history: undefined;
  deposit: { returnUrl: string };
  appointment_detail: { appointmentId: number };
  balance_movement_history: undefined;
  //appointment
  home_booking: undefined;
  find_opponents: { tableId: number; startDate: string; endDate: string };
  opponent_invited: { tableId: number; startDate: string; endDate: string };
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
