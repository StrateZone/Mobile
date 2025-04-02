import { ChessTable } from "./chess_table";

export type Apointment = {
  appointmentId: number;
  userId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  tablesAppointments: ChessTable[];
};
