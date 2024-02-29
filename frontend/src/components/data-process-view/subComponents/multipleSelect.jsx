import React from 'react';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

const MultipleSelect = ( { title, options, selectedValue, onChange, multiple = false }) => {
    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: 48 * 4.5 + 8,
          width: 250,
        },
      },
    };
  
    // Adjusted the `onChange` handler to accommodate both single and multiple selections
    const handleChange = (event) => {
  // For multiple selects, event.target.value is already an array of selected values.
  onChange(event.target.value); // Pass the array or single value to the parent's onChange handler.
    };
  
    return (
      <FormControl fullWidth>
        <InputLabel id={`${title}-label`}>{title}</InputLabel>
        <Select
          labelId={`${title}-label`}
          id={`${title}-select`}
          multiple={multiple}
          value={selectedValue}
          onChange={handleChange}
          input={<OutlinedInput label="Name" />}
          MenuProps={MenuProps}
        >
          {options.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );


  };

export default MultipleSelect;
