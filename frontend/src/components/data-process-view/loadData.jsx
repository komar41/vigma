import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, FormControl, Select, MenuItem, InputLabel, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogActions  } from '@mui/material';
import axios from 'axios';

import { TreeSelect } from "primereact/treeselect";
import  NodeService  from "./service/NodeService";

import {Paper} from '@mui/material';


import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";


export const LoadData = (props) => {



const [formData, setFormData] = useState({
  temp1FileLocation: "",
  fileLocation: "",
  group1SelectedFiles: [],
  group2SelectedFiles: [],
  selectedColumn: "",
  group1Label: "",
  group2Label: "",
  selectedFooting1: "",
  selectedCycle1: "",
  selectedFooting2: "",
  selectedCycle2: "",
  isGroup1Checked: false,
  isGroup2Checked: false,
  panelOptions: "",
  // Any other fields you might have
});




  const panelOptions = [1, 2, 3, 4, 5]; 
  const selectedColumnOptions = ['foot', 'shank', 'thigh', 'trunk', 'hipx', 'AP', 'ML', 'VT'];
  const [dynamicFootingOptions, setDynamicFootingOptions] = useState(["Left", "Right"]);
  const [isFootingDisabled, setIsFootingDisabled] = useState(false);
  const gaitCycleOptions = ["Left","Right"]; // Assuming 'names' are used for multiple selects


  const [nodesGroup1, setNodesGroup1] = useState(null);
  const [selectedNodeKeysGroup1, setSelectedNodeKeysGroup1] = useState(null);

  
  const [nodesGroup2, setNodesGroup2] = useState(null);
  const [selectedNodeKeysGroup2, setSelectedNodeKeysGroup2] = useState(null);


  const [openDialog, setOpenDialog] = React.useState(false);
const [errorMessage, setErrorMessage] = React.useState('');

  
  useEffect(() => {
    const fetchFolders = async () => {
      if (formData.fileLocation) {
        try {
          const response = await axios.post('http://localhost:5000/send-data', { fileLocation: formData.fileLocation });
          console.log("Flask Response",response.data); // Handle response from Flask backend
          NodeService.updateData(response.data);
          // Retrieve the updated tree structure
          NodeService.getTreeNodes().then((data) => setNodesGroup1(data));
          NodeService.getTreeNodes().then((data) => setNodesGroup2(data));
        } catch (error) {
          console.error('Error sending data to backend:', error);
        }
      }
    };
    fetchFolders();
    
  }, [formData.fileLocation]);



  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    console.log("Name", name);
    console.log("Value", value);
    console.log("Checked", checked);
    console.log("Type", type);

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));

    console.log("Form Data", formData);
    console.log(name=== 'selectedColumn');
    if (name === 'selectedColumn') {

    if (['AP', 'ML', 'VT'].includes(value)) {
        setDynamicFootingOptions(["Left", "Right", "Aggregate"]);
        setIsFootingDisabled(false);
    } else if (['trunk', 'hipx'].includes(value)) {
        setDynamicFootingOptions([]);
        setIsFootingDisabled(true);
    } else {
        setDynamicFootingOptions(["Left", "Right"]);
        setIsFootingDisabled(false);
    }
}
  };
  

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target; // Destructure name and checked from the event target
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked, // Use computed property name based on the checkbox name
    }));
};



function getCheckedFileTitles(selectedNodeKeys) {
  // Regex to match the specific format (folderName/insideFolder_trialNumber)
  const regex = /\/.+\_.+$/;

  // Filter entries based on the regex and the checked status, then extract the keys
  const checkedFileTitles = Object.entries(selectedNodeKeys)
    .filter(([key, value]) => {
      // Check both the key format and the `checked` status
      return regex.test(key) && value.checked === true && value.partialChecked === false;
    })
    .map(([key, _]) => key); // Extract just the titles (keys)

  console.log("Checked Files", checkedFileTitles);
  return checkedFileTitles;
}



const handleSubmitForm = async (e) => {

  e.preventDefault();
  try {
    if (!formData.temp1FileLocation) {
      setErrorMessage('File location is not entered');
      setOpenDialog(true);
      return;
  }


    // Checking if Group 1 files are selected
    if (!selectedNodeKeysGroup1 || Object.keys(selectedNodeKeysGroup1).length === 0) {
      setErrorMessage('Group 1 files are not selected');
      setOpenDialog(true);
      return;
  }


      // Checking if Group 1 files are selected
      if (!selectedNodeKeysGroup2 || Object.keys(selectedNodeKeysGroup2).length === 0) {
        setErrorMessage('Group 2 files are not selected');
        setOpenDialog(true);
        return;
    }
  


      if (!formData.selectedColumn) {
        setErrorMessage('selectedColumn is not selected');
        setOpenDialog(true);
        return;
      }



      if (!formData.group1Label) {
        setErrorMessage('Group 1 label is not entered');
        setOpenDialog(true);
        return;
    }

    if (!formData.group2Label) {
      setErrorMessage('Group 2 label is not entered');
      setOpenDialog(true);
      return;
  }

  if ( !isFootingDisabled & !formData.selectedFooting1) {
    setErrorMessage('Group 1 footing is not selected');
    setOpenDialog(true);
    return;
    }

    if ( !isFootingDisabled & !formData.selectedFooting2) {
      setErrorMessage('Group 2 footing is not selected');
      setOpenDialog(true);
      return;
    }

    if (!formData.selectedCycle1) {
      setErrorMessage('Group 1 gait cycle is not selected');
      setOpenDialog(true);
      return;
    }

    if (!formData.selectedCycle2) {
      setErrorMessage('Group 2 gait cycle is not selected');
      setOpenDialog(true);
      return;
    }

    if (!formData.panelOptions) {
      setErrorMessage('Panel option is not selected');
      setOpenDialog(true);
      return;
    }


    const convertFootingValue = (Value) => {
      if(isFootingDisabled){
        return 'NA';
      }

      switch (Value) {
        case 'Left': return 'L';
        case 'Right': return 'R';
        case 'Aggregate': return 'Agg';
        default: return 'NA'; // Just in case there are other unhandled values
      }
    };


    const convertCycleValue = (Value) => {

      switch (Value) {
        case 'Left': return 'L';
        case 'Right': return 'R';

        default: return 'NA'; // Just in case there are other unhandled values
      }
    };

    const newForm = {
      ...formData, // Spread the existing formData to copy its properties
      // Apply conversions
      selectedFooting1: convertFootingValue(formData.selectedFooting1),
      selectedFooting2: convertFootingValue(formData.selectedFooting2),
      selectedCycle1: convertCycleValue(formData.selectedCycle1),
      selectedCycle2: convertCycleValue(formData.selectedCycle2),
      // Ensure getCheckedFileTitles function is defined and accessible here
      group1SelectedFiles: getCheckedFileTitles(selectedNodeKeysGroup1),
      group2SelectedFiles: getCheckedFileTitles(selectedNodeKeysGroup2),

      fileLocation: formData.fileLocation.replace(/\\/g, "/"),
      temp1FileLocation: formData.temp1FileLocation.replace(/\\/g, "/"),
    };

    console.log('New Form Data:', newForm);
      // Send the data (you can pass this to another component or perform another action)
      await props.handleFormSubmitParent(newForm);
  } catch (error) {
      console.error('Error submitting data:', error);
  }
};



  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '2vh', paddingLeft: '1vh', paddingRight: '1vh' }}>
    <Grid container spacing={0}  >
      <Grid item xs={10}>
          <TextField
            name="temp1FileLocation"
            placeholder="Group1 file location"
            label="File Location"
            variant="standard"
            fullWidth
            value={formData.temp1FileLocation}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setFormData({ ...formData, fileLocation: formData.temp1FileLocation })}
          >
            Set
          </Button>
        </Grid>
     <Grid item xs={12} sm = {6}  style={{ paddingTop: '30px' }} >
        <span className="p-float-label">
        
        <TreeSelect
            value={selectedNodeKeysGroup1}
            onChange={(e) => setSelectedNodeKeysGroup1(e.value)}
            options={nodesGroup1}
            metaKeySelection={false}
            className="w-full"
            selectionMode="checkbox"
            display="chip"
            placeholder="Group 1 Items"
          ></TreeSelect>
          <label htmlFor="treeselect">Group 1 Files</label>
          </span>
        </Grid> 

        <Grid item xs={12} sm = {6}  style={{ paddingTop: '30px' }}>
        <span className="p-float-label">

        <TreeSelect
            value={selectedNodeKeysGroup2}
            onChange={(e) => setSelectedNodeKeysGroup2(e.value)}
            options={nodesGroup2}
            metaKeySelection={false}
            className="w-full"
            selectionMode="checkbox"
            display="chip"
            placeholder="Group 2 Items"
          ></TreeSelect>
        <label htmlFor="treeselect">Group 2 Files</label>

          </span>
      </Grid>

        <Grid item xs={12} sm ={6}  >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="selectedColumn-label">Select selectedColumn</InputLabel>
            <Select
              name="selectedColumn"
              labelId="selectedColumn-label"
              id="selectedColumn-select"
              value={formData.selectedColumn}
              onChange={handleChange}
            >
              {selectedColumnOptions.map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        </Grid>

      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  aria-labelledby="alert-dialog-title"
>
  <DialogTitle id="alert-dialog-title">{"Missing Input"}</DialogTitle>
  <div style={{ padding: '20px' }}>{errorMessage}</div>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} color="primary" autoFocus>
      Okay
    </Button>
  </DialogActions>
</Dialog>
    

      <Grid container spacing={1} style={{ paddingTop: '10px'}}>



        <Grid item xs={12} sm ={6}  >
        <TextField
            name="group1Label"
            placeholder="group 1 label"
            label="Group 1 Label"
            variant="standard"
            fullWidth
            value={formData.group1Label}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm ={6}  >
      <TextField
          name="group2Label"
          placeholder="group 2 label"
          label="Group 2 Label"
          variant="standard"
          fullWidth
          value={formData.group2Label}
          onChange={handleChange}
        />
      </Grid>


        <Grid item xs={6}  >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group1-footing-label">Group 1 Footing</InputLabel>
            <Select
              name="selectedFooting1"
              labelId="group1-footing-label"
              id="group1-footing-select"
              value={formData.selectedFooting1}
              onChange={handleChange}
              // MenuProps={MenuProps}
              disabled={isFootingDisabled}
            >
   {dynamicFootingOptions.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}  >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group2-footing-label">Group 2 Footing</InputLabel>
            <Select
              name="selectedFooting2"
              labelId="group2-footing-label"
              id="group2-footing-select"
              value={formData.selectedFooting2}
              onChange={handleChange}
              // MenuProps={MenuProps}
              disabled={isFootingDisabled}
            >
   {dynamicFootingOptions.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}  >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="group1-gait-cycle-label">Group 1 Gait Cycle</InputLabel>
            <Select
              name="selectedCycle1"
              labelId="group1-gait-cycle-label"
              id="group1-gait-cycle-select"
              value={formData.selectedCycle1}
              onChange={handleChange}
              // MenuProps={MenuProps}
            >
              {gaitCycleOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}  >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="group2-gait-cycle-label">Group 2 Gait Cycle</InputLabel>
            <Select
              name="selectedCycle2"
              labelId="group2-gait-cycle-label"
              id="group2-gait-cycle-select"
              value={formData.selectedCycle2}
              onChange={handleChange}
              // MenuProps={MenuProps}
            >
              {gaitCycleOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} >
          <FormControlLabel
            control={<Checkbox checked={formData.isGroup1Checked} onChange={handleCheckboxChange} name="isGroup1Checked" />}
            label="Group1 Spread"
          />
        </Grid>
        <Grid item xs={6} >
          <FormControlLabel
            control={<Checkbox checked={formData.isGroup2Checked} onChange={handleCheckboxChange} name="isGroup2Checked" />}
            label="Group2 Spread"
          />
        </Grid>
 
        <Grid item xs={6}  >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="panel-options-label">Select plot No:</InputLabel>
            <Select
              name="panelOptions"
              labelId="panel-options-label"
              id="panel-options-select"
              value={formData.panelOptions}
              onChange={handleChange}
              // MenuProps={MenuProps}
              size="small"
            >
              {panelOptions.map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <Button type="submit" variant="contained" size="small" onClick={(e) =>handleSubmitForm(e)}>
            Submit
          </Button>
        </Grid>
        {props.lgMatch && (
        <Grid item style={{ width: '100%', height: '100%' }}>
          <Paper>
            {/* You can put additional content here or leave it empty */}
          </Paper>
        </Grid>
      )}
        </Grid>

    </div>
  );
};
