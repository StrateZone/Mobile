export const roundToNearest30Minutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 30) * 30;
  date.setMinutes(roundedMinutes, 0, 0);
  return date;
};
