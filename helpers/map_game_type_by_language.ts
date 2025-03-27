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

export const mapGameTypeToVietnamese = (gameType: string): string => {
  switch (gameType) {
    case "chess":
      return "Cờ vua";
    case "xiangqi":
      return "Cờ tướng";
    case "go":
      return "Cờ vây";
    default:
      return gameType;
  }
};
