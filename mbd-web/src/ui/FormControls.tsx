import { Box, Button, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

export const FormControls = ({
  disabled = false,
  saving,
  onSave,
  onClear,
  saveLabel = "Save",
  clearLabel = "Clear",
  color = "primary",
}: {
  disabled?: boolean;
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
  saveLabel?: string;
  clearLabel?: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<DeleteIcon />}
        onClick={onClear}
        disabled={saving}
      >
        {clearLabel}
      </Button>
      <Button
        variant="contained"
        color={color}
        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        onClick={onSave}
        disabled={
          disabled
          //   saving ||
          //   !entryName ||
          //   !date ||
          //   mergedSelectedItems.filter((f) => f.selected).length === 0
        }
      >
        {saving ? "Saving..." : saveLabel}
      </Button>
    </Box>
  );
};
