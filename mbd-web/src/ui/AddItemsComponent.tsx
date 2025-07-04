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
    {
      id: crypto.randomUUID(),
      name: "Apple",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Banana",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Chicken",
      suggested: false,
      selected: true,
    },
    { id: crypto.randomUUID(), name: "Rice", suggested: false, selected: true },
    {
      id: crypto.randomUUID(),
      name: "Salmon",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Broccoli",
      suggested: false,
      selected: true,
    },
  ],
  symptom: [
    {
      id: crypto.randomUUID(),
      name: "Headache",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Nausea",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Fatigue",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Bloating",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Dizziness",
      suggested: false,
      selected: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Heartburn",
      suggested: false,
      selected: true,
    },
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
  const getUnselectedOptions = () => {
    const selectedIds = new Set(items.map((item) => item.id));
    return placeholderItems[type].filter((item) => !selectedIds.has(item.id));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed, inputValue:", inputValue);
      event.preventDefault();
      const filtered = filter(getUnselectedOptions(), {
        inputValue,
        getOptionLabel: (option) => option.name,
      });

      // If there are any options, select the first one
      if (filtered.length > 0) {
        const firstOption = filtered[0];
        if (!items.some((item) => item.id === firstOption.id)) {
          onChange([...items, firstOption]);
          setInputValue("");
          setOpen(false);
        }
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Autocomplete
        noOptionsText="Already added or suggested"
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
        options={getUnselectedOptions()}
        getOptionLabel={(option) => {
          if (option.isNew) {
            return `Add "${option.name}"`;
          }
          return option.name;
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          const trimmmedInput = inputValue.trim();
          // Check if the input matches any existing item (case insensitive)
          const isExisting = options.some(
            (option) => option.name.toLowerCase() === trimmmedInput.toLowerCase()
          );
          // Check if the input matches any selected item (case insensitive)
          const isSelected = items.some(
            (item) => item.name.toLowerCase() === trimmmedInput.toLowerCase()
            // && item.selected // TODO: This allows it to be selected, but duplicates the suggested chip
          );

          // Only suggest creating a new value if it doesn't match any existing or selected item
          if (trimmmedInput !== "" && !isExisting && !isSelected) {
            filtered.push({
              name: trimmmedInput,
              id: crypto.randomUUID(),
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
