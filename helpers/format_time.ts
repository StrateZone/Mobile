export const formatDateTime = (isoString: string) => {
  const fixedIsoString = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  const dateObj = new Date(fixedIsoString);

  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const year = dateObj.getUTCFullYear();
  const date = `${day}/${month}/${year}`;
  const hours = String(dateObj.getUTCHours()).padStart(2, "0");
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;
  return { date, time };
};
