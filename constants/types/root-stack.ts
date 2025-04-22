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
  appointment_ongoing: undefined;
  deposit: { returnUrl: string };
  appointment_detail: { appointmentId: number };
  appointment_ongoing_detail: { appointmentId: number };
  balance_movement_history: undefined;
  invitations_detail: {
    invitationId: number;
    avatarUrl: string;
    fullName: string;
    email: string;
    phone: string;
    tableId: number;
    roomId: number;
    roomName: string;
    roomType: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    status: string;
  };
  //appointment
  home_booking: undefined;
  find_opponents: {
    tableId: number;
    startDate: string;
    endDate: string;
    tablePrice: number;
  };
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
  //community
  not_member: undefined;
  home_community: undefined;
  community_detail: { threadId: number };
  create_thread: undefined;
  my_threads: undefined;
  friend_managerment: undefined;
  friend_detail: undefined;
};
