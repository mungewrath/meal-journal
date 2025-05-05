import { Box, TextField } from "@mui/material";

export const DateTimeSelectorControls = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled,
}: {
  date: string;
  time: string;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <TextField
        label="Date"
        type="date"
        value={date}
        onChange={onDateChange}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ flexGrow: 1 }}
        disabled={disabled}
      />
      <TextField
        label="Time"
        type="time"
        value={time}
        onChange={onTimeChange}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ flexGrow: 1 }}
        disabled={disabled}
      />
    </Box>
  );
};
