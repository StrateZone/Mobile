export type RootStackParamList = {
  //auth
  login: undefined;
  LoginByOtp: undefined;
  Otp: { email: string };
  Register: undefined;
  ForgotPassword: undefined;
  Auth: {
    screen: "login";
  };
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
  reward_history: undefined;
  invitations: undefined;
  profile: undefined;
  appointment_history: undefined;
  appointment_ongoing: undefined;
  deposit: { returnUrl: string };
  appointment_detail: { appointmentId: number };
  appointment_ongoing_detail: { appointmentId: number };
  balance_movement_history: undefined;
  change_password: undefined;
  invitations_detail: {
    invitationId: number;
    avatarUrl: string;
    fullName: string;
    email: string;
    phone: string;
    tableId: number;
    roomId: number;
    roomName: string;
    gameType: string;
    roomType: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    fromUserId: number;
    appointmentId: number;
    cancellingTableId: number;
    isPaid: boolean;
  };
  //appointment
  home_booking: undefined;
  find_opponents: {
    tableId: number;
    startDate: string;
    endDate: string;
    tablePrice: number;
  };
  voucher_exchange: undefined;
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
  create_thread?: { draftThread: any };
  my_threads: undefined;
  friend_managerment: undefined;
  friend_detail: { friendId: number };
  edit_thread: { thread: any };
  edit_drafted_thread: { thread: any };
  //clause
  clause: undefined;
  //monthly booking
  home_monthly_booking: undefined;
  list_table_monthly: {
    fromDate: string;
    toDate: string;
    daysOfWeek: string[];
    StartTime: string;
    EndTime: string;
    roomTypes: string;
    gameType: string;
  };
  booking_detail_monthly: undefined;
  find_opponents_monthly: {
    tableId: number;
    startDate: string;
    endDate: string;
    tablePrice: number;
  };
  opponent_invited_monthly: {
    tableId: number;
    startDate: string;
    endDate: string;
  };
  voucher_exchange_monthly: undefined;
  payment_successful_monthly: undefined;
  table_detail_monthly: {
    tableId: number;
    startDate: string;
    endDate: string;
  };
};
