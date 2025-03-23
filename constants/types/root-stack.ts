export type RootStackParamList = {
  login: undefined;
  home_booking: undefined;
  booking_detail: undefined;
  FilterTableScreen: {
    gameType: string;
    startTime: string;
    endTime: string;
    roomTypes: string[];
    onApplyFilters: (filters: {
      gameType: string;
      startTime: string;
      endTime: string;
      roomTypes: string[];
    }) => void;
  };
  Otp: { email: string };
  Profile: undefined;
  Register: undefined;
  ListTable: { gameType: string };
};
