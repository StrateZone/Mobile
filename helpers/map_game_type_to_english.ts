export const mapGameTypeToEnglish = (gameType: string): string => {
  switch (gameType) {
    case "Cờ vua":
      return "chess";
    case "Cờ tướng":
      return "xiangqi";
    case "Cờ vây":
      return "go";
    default:
      return gameType;
  }
};
