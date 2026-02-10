export const formatDate = (dateInput) => {
  if (!dateInput) return "-";

  const date = new Date(dateInput);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (dateInput) => {
  if (!dateInput) return "-";

  const date = new Date(dateInput);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
