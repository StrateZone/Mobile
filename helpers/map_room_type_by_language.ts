export const mapRoomTypesToVietnamese = (roomTypes: string[]): string[] => {
  return roomTypes.map((roomType) => {
    switch (roomType) {
      case "basic":
        return "Phòng cơ bản";
      case "openspaced":
        return "Phòng không gian mở";
      case "premium":
        return "Phòng cao cấp";
      default:
        return roomType;
    }
  });
};

export const mapRoomTypesToEnglish = (roomTypes: string[]): string[] => {
  return roomTypes.map((roomType) => {
    switch (roomType) {
      case "Phòng cơ bản":
        return "basic";
      case "Phòng không gian mở":
        return "openspaced";
      case "Phòng cao cấp":
        return "premium";
      default:
        return roomType;
    }
  });
};
