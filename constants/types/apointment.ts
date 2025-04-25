import { ChessTable } from "./chess_table";
import { GameType } from "./game_type";

export type TablesAppointment = {
  id: number;
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomDescription: string;
  gameTypeId: number;
  gameType: GameType;
  scheduleTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  gameTypePrice: number;
  roomTypePrice: number;
  durationInHours: number;
  price: number;
  table: ChessTable;
  status: string;
  totalPrice: number;
};

export type Apointment = {
  id: number;
  tablesCount: number;
  appointmentId: number;
  userId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  tablesAppointments: TablesAppointment[];
};
