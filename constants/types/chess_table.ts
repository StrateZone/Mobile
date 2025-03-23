import { GameType } from "./game_type";

export type ChessTable = {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  gameTypeId: string;
  gameType: GameType;
  startDate: string;
  endDate: string;
  gameTypePrice: number;
  roomTypePrice: number;
  durationInHours: number;
  totalPrice: number;
};
