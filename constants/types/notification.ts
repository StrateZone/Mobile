export type Notification = {
  id: number;
  title: string;
  content: string;
  toUser: number;
  tablesAppointmentId: number | null;
  orderId: number | null;
  tournamentId: number | null;
  status: number;
  type: number;
  createdAt: string;
  toUserNavigation: any | null;
};
