import { SymptomsEntry } from "@/lib/features/symptoms/models";
import { formatTime, formatDate } from "@/lib/utils/dateUtils";
import { Box, Typography, Chip } from "@mui/material";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";

export const SymptomHistoryEntryComponent = ({
  symptom,
}: {
  symptom: SymptomsEntry;
}) => {
  return (
    <Box
      //   key={`symptom-${index}-${entry.dateTime}`}
      my={2}
      p={2}
      border={1}
      borderRadius={3}
      bgcolor={"#f8f0f0"} // Light reddish background for symptoms
    >
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
        <MedicalInformationIcon sx={{ mr: 1, color: "#d32f2f" }} />
        <span title={formatTime(symptom.dateTime)}>Symptoms</span>
        <span title={new Date(symptom.dateTime).toLocaleDateString()}>
          &nbsp;{formatDate(symptom.dateTime)}
        </span>
      </Typography>
      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
        {symptom.symptoms.map((symptom: string, idx: number) => (
          <Chip
            key={`${symptom}-${idx}`}
            label={symptom}
            color="error"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
};
