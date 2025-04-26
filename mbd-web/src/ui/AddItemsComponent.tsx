import { useState } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  IconButton,
  createFilterOptions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Item {
  id: string;
  name: string;
  isNew?: boolean;
  suggested: boolean;
  selected: boolean;
}

// Temporary placeholder data - will be replaced with API call
const placeholderItems: Record<string, Item[]> = {
  food: [
    { id: "1", name: "Apple", suggested: false, selected: true },
    { id: "2", name: "Banana", suggested: false, selected: true },
    { id: "3", name: "Chicken", suggested: false, selected: true },
    { id: "4", name: "Rice", suggested: false, selected: true },
    { id: "5", name: "Salmon", suggested: false, selected: true },
    { id: "6", name: "Broccoli", suggested: false, selected: true },
  ],
  symptom: [
    { id: "1", name: "Headache", suggested: false, selected: true },
    { id: "2", name: "Nausea", suggested: false, selected: true },
    { id: "3", name: "Fatigue", suggested: false, selected: true },
    { id: "4", name: "Bloating", suggested: false, selected: true },
    { id: "5", name: "Dizziness", suggested: false, selected: true },
    { id: "6", name: "Heartburn", suggested: false, selected: true },
  ],
};

interface AddItemsComponentProps {
  items: Item[];
  onChange: (items: Item[]) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  type?: "food" | "symptom";
}

const filter = createFilterOptions<Item>();

export const AddItemsComponent = ({
  items,
  onChange,
  disabled = false,
  placeholder = "Type to search...",
  label = "Item",
  type = "food",
}: AddItemsComponentProps) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleSuggestedItemClick = (item: Item) => {
    if (!item.selected) {
      onChange([
        ...items.filter((selectedItem) => selectedItem.id !== item.id),
        { ...item, selected: true },
      ]);
    } else {
      onChange(items.filter((selectedItem) => selectedItem.id !== item.id));
    }
  };

  const handleDelete = (itemToDelete: Item) => () => {
    onChange(items.filter((item) => item.id !== itemToDelete.id));
  };

  // Filter out already selected items from options
  const getFilteredOptions = () => {
    const selectedIds = new Set(items.map((item) => item.id));
    return placeholderItems[type].filter((item) => !selectedIds.has(item.id));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Get the current filtered options
      const options = getFilteredOptions();
      const filtered = filter(options, {
        inputValue,
        getOptionLabel: (option) => option.name,
      });

      // If there are any options, select the first one
      if (filtered.length > 0) {
        const option = filtered[0];
        if (!items.some((item) => item.id === option.id)) {
          onChange([...items, option]);
          setInputValue("");
          setOpen(false);
        }
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disabled={disabled}
        multiple
        value={items}
        onChange={(_, newValue) => {
          onChange(newValue);
          setOpen(false);
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={getFilteredOptions()}
        getOptionLabel={(option) => {
          if (option.isNew) {
            return `Add "${option.name}"`;
          }
          return option.name;
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Check if the input matches any existing item (case insensitive)
          const isExisting = options.some(
            (option) => option.name.toLowerCase() === inputValue.toLowerCase()
          );
          // Check if the input matches any selected item (case insensitive)
          const isSelected = items.some(
            (item) => item.name.toLowerCase() === inputValue.toLowerCase()
          );

          // Only suggest creating a new value if it doesn't match any existing or selected item
          if (inputValue !== "" && !isExisting && !isSelected) {
            filtered.push({
              name: inputValue,
              id: `new-${inputValue}`,
              isNew: true,
              suggested: false,
              selected: true,
            });
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        autoComplete
        autoSelect
        autoHighlight
        disableCloseOnSelect={false}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              {option.isNew ? `Add "${option.name}"` : option.name}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
          />
        )}
        renderTags={() => null} // Hide the default tags
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {items.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            color={item.selected ? "primary" : "default"}
            variant={item.selected ? "filled" : "outlined"}
            onClick={() => handleSuggestedItemClick(item)}
            onDelete={handleDelete(item)}
            deleteIcon={
              <IconButton size="small">
                <DeleteIcon />
              </IconButton>
            }
          />
        ))}
      </Box>
    </Box>
  );
};
