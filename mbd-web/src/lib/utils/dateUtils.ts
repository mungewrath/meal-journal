export const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    })}`;
  } else {
    return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleDateString(
      "en-US",
      {
        month: "numeric",
        day: "numeric",
      }
    )}`;
  }
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const convertToApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// TODO: Can be simplified to just use ISO strings once backend has had existing entries migrated to the correct timezone
export const convertToApiDateTime = (date: Date): string => {
  const formattedDate = `${convertToApiDate(date)}T${
    date.toTimeString().split(" ")[0]
  }`;

  return formattedDate;
};

// Takes sample dates like "2025-05-04T09:35:00+00:00" from the API, and standardizes it to pacific time.
// TODO: This is a temporary fix. We should handle time zones properly in the future.
export const convertFromApiDate = (dateString: string): string => {
  return new Date(dateString.replace("+00:00", "-07:00")).toISOString();
};
