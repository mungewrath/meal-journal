import { AddItemsComponent } from "./AddItemsComponent";
import { DateTimeSelectorControls } from "./DateTimeSelectorControls";
import { FormControls } from "./FormControls";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "react-oidc-context";
import {
  saveSymptomsEntry,
  selectSaving as selectSymptomSaving,
  selectSaveError,
} from "@/lib/features/symptoms/symptomsSlice";

interface Symptom {
  name: string;
  selected: boolean;
}

export const AddSymptomComponent = ({}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedItems, setSelectedItems] = useState<Symptom[]>([]);

  const saving = useAppSelector(selectSymptomSaving);
  const saveError = useAppSelector(selectSaveError);

  useEffect(() => {
    // Set the default date to today's date in Pacific Time
    const today = new Date();
    const pacificOffset = -7 * 60; // Pacific Time is UTC-7
    const pacificDate = new Date(today.getTime() + pacificOffset * 60 * 1000);
    const formattedDate = pacificDate.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  const handleClear = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setSelectedItems([]);
  };

  const handleSave = async () => {
    if (!auth.user?.id_token) {
      console.error("No ID token available");
      return;
    }

    const dateTime = `${date}T${time || "00:00"}`;
    console.log("Saving symptoms 4", {
      dateTime,
      selectedItems,
    });
    dispatch(
      saveSymptomsEntry({
        symptomsEntry: {
          symptoms: selectedItems
            .filter((symptom) => symptom.selected)
            .map((item) => item.name),
          dateTime,
        },
        idToken: auth.user.id_token,
      })
    );

    // TODO: Is this going to catch errors correctly? Looks like the dispatch is async and this won't be updated
    if (!saveError) {
      handleClear();
    }
  };

  return (
    <>
      <DateTimeSelectorControls
        date={date}
        time={time}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        disabled={saving}
      />
      <AddItemsComponent
        items={selectedItems.map((item) => ({
          ...item,
          id: item.name,
          suggested: false,
          selected: item.selected,
        }))}
        onChange={setSelectedItems}
        disabled={saving}
        placeholder="Search for symptoms or add a new one..."
        label="Symptom"
        type="symptom"
      />
      <FormControls
        disabled={
          saving ||
          !date ||
          !time ||
          selectedItems.filter((f) => f.selected).length === 0
        }
        saving={saving}
        onSave={handleSave}
        onClear={handleClear}
      />
    </>
  );
};
