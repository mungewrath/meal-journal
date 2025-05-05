export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
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

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
