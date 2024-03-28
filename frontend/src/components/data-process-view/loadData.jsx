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


const [processFormData, setProcessFormData] = useState({
  temp1FileLocation: "",
  file1Location: "",
  group1SelectedFiles: [],
  group2SelectedFiles: [],
  parameter: "",
});

const [submitFormData, setSubmitFormData] = useState({
  parameter: "",
  group1Label: "",
  group2Label: "",
  group1Footing: "",
  group1GaitCycle: "",
  group2Footing: "",
  group2GaitCycle: "",
  isGroup1Checked: false,
  isGroup2Checked: false,
  panelOptions: "",
});



  const panelOptions = [1, 2, 3, 4, 5]; 
  const parameterOptions = ['Foot', 'Shank', 'Thigh', 'Trunk', 'Hipx', 'AP', 'ML', 'VT'];
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
      if (processFormData.file1Location) {
        try {
          const response = await axios.post('http://localhost:5000/send-data', { fileLocation: processFormData.file1Location });
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
    
  }, [processFormData.file1Location]);


  const handleProcessChange = (event) => {
    const { name, value } = event.target;
    setProcessFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
};

const handleSubmitChange = (event) => {
    const { name, value } = event.target;
    setSubmitFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
};

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target; // Destructure name and checked from the event target
    setSubmitFormData((prevState) => ({
      ...prevState,
      [name]: checked, // Use computed property name based on the checkbox name
    }));
};


const handleProcessSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!processFormData.temp1FileLocation) {
      setErrorMessage('File location is not entered');
      setOpenDialog(true);
      return;
  }

  console.log("Group 1 Files", selectedNodeKeysGroup1);
  console.log("Group 1 Files Length", selectedNodeKeysGroup1.length);
  console.log("Group 2 Files", selectedNodeKeysGroup2);

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
  





if (!processFormData.parameter) {
  setErrorMessage('Parameter is not selected');
  setOpenDialog(true);
  return;
}

submitFormData.parameter = processFormData.parameter;

      const updatedFormData = {
          ...processFormData,
          group1SelectedFiles: selectedNodeKeysGroup1,
          group2SelectedFiles: selectedNodeKeysGroup2,
      };

      if (['AP', 'ML', 'VT'].includes(updatedFormData.parameter)) {
        setDynamicFootingOptions(["Left", "Right", "Average"]);
        setIsFootingDisabled(false);
    } else if (['trunk', 'hipx'].includes(updatedFormData.parameter)) {
        setDynamicFootingOptions([]);
        setIsFootingDisabled(true);
    } else {
        setDynamicFootingOptions(["Left", "Right"]);
        setIsFootingDisabled(false);
    }
      // Process the data (similar to your existing functionality)
      console.log("Process Form Data", updatedFormData);
      // Assuming you want to keep similar functionality but for different purposes
      await props.handleFormSubmitParent(updatedFormData);
  } catch (error) {
      console.error('Error processing data:', error);
  }
};

const handleSubmitForm = async (e) => {
  e.preventDefault();
  try {
      // Similar structure to handleProcessSubmit
      console.log("Submit Form Data", submitFormData);

      if (!submitFormData.group1Label) {
        setErrorMessage('Group 1 label is not entered');
        setOpenDialog(true);
        return;
    }

    if (!submitFormData.group2Label) {
      setErrorMessage('Group 2 label is not entered');
      setOpenDialog(true);
      return;
  }

  if ( !isFootingDisabled & !submitFormData.group1Footing) {
    setErrorMessage('Group 1 footing is not selected');
    setOpenDialog(true);
    return;
}

if ( !isFootingDisabled & !submitFormData.group2Footing) {
  setErrorMessage('Group 2 footing is not selected');
  setOpenDialog(true);
  return;
}

if (!submitFormData.group1GaitCycle) {
  setErrorMessage('Group 1 gait cycle is not selected');
  setOpenDialog(true);
  return;
}

if (!submitFormData.group2GaitCycle) {
  setErrorMessage('Group 2 gait cycle is not selected');
  setOpenDialog(true);
  return;
}

if (!submitFormData.panelOptions) {
  setErrorMessage('Panel option is not selected');
  setOpenDialog(true);
  return;
}


      // Send the data (you can pass this to another component or perform another action)
      await props.handleFormSubmitParent2(submitFormData);
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
            value={processFormData.temp1FileLocation}
            onChange={handleProcessChange}
            size="small"
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setProcessFormData({ ...processFormData, file1Location: processFormData.temp1FileLocation })}
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
            <InputLabel id="parameter-label">Select Parameter</InputLabel>
            <Select
              name="parameter"
              labelId="parameter-label"
              id="parameter-select"
              value={processFormData.parameter}
              onChange={handleProcessChange}
            >
              {parameterOptions.map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      <Grid item xs={12} sm ={6}  style={{ paddingTop: '10px' }}>
          <Button variant="contained" size="small"
          onClick={(e) => handleProcessSubmit(e)}
          >
            Process
          </Button>
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
            value={submitFormData.group1Label}
            onChange={handleSubmitChange}
          />
        </Grid>

        <Grid item xs={12} sm ={6}  >
      <TextField
          name="group2Label"
          placeholder="group 2 label"
          label="Group 2 Label"
          variant="standard"
          fullWidth
          value={submitFormData.group2Label}
          onChange={handleSubmitChange}
        />
      </Grid>


        <Grid item xs={6}  >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group1-footing-label">Group 1 Footing</InputLabel>
            <Select
              name="group1Footing"
              labelId="group1-footing-label"
              id="group1-footing-select"
              value={submitFormData.group1Footing}
              onChange={handleSubmitChange}
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
              name="group2Footing"
              labelId="group2-footing-label"
              id="group2-footing-select"
              value={submitFormData.group2Footing}
              onChange={handleSubmitChange}
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
              name="group1GaitCycle"
              labelId="group1-gait-cycle-label"
              id="group1-gait-cycle-select"
              value={submitFormData.group1GaitCycle}
              onChange={handleSubmitChange}
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
              name="group2GaitCycle"
              labelId="group2-gait-cycle-label"
              id="group2-gait-cycle-select"
              value={submitFormData.group2GaitCycle}
              onChange={handleSubmitChange}
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
            control={<Checkbox checked={submitFormData.isGroup1Checked} onChange={handleCheckboxChange} name="isGroup1Checked" />}
            label="Group1 Spread"
          />
        </Grid>
        <Grid item xs={6} >
          <FormControlLabel
            control={<Checkbox checked={submitFormData.isGroup2Checked} onChange={handleCheckboxChange} name="isGroup2Checked" />}
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
              value={submitFormData.panelOptions}
              onChange={handleSubmitChange}
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
