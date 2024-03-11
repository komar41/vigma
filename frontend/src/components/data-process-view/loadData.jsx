import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, FormControl, Select, MenuItem, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';

import { TreeSelect } from "primereact/treeselect";
import  NodeService  from "./service/NodeService";

import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width:250,
    },
  },
};

export const LoadData = (props) => {
//   const [formData, setFormData] = useState({
//     temp1FileLocation: "",
//     file1Location: "",
//     group1SelectedFiles: [],
//     group2SelectedFiles: [],
//     group1Label: "",
//     group2Label: "",
//     panelOptions: "",
//     parameter: "",
//     group1Footing: "",
//     group1GaitCycle: "",
//     group2Footing: "",
//     group2GaitCycle: "",
//     isGroup1Checked: false,
//     isGroup2Checked: false,
//   });

const [processFormData, setProcessFormData] = useState({
  temp1FileLocation: "",
  file1Location: "",
  group1SelectedFiles: [],
  group2SelectedFiles: [],
  parameter: "",
});

const [submitFormData, setSubmitFormData] = useState({
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
  const parameterOptions = ['foot', 'shank', 'thigh', 'trunk', 'hipx']; 
  const footingOptions = ["left","right"]; // Assuming 'names' are used for multiple selects
  const gaitCycleOptions = ["left","right"]; // Assuming 'names' are used for multiple selects


  const [nodesGroup1, setNodesGroup1] = useState(null);
  const [selectedNodeKeysGroup1, setSelectedNodeKeysGroup1] = useState(null);

  
  const [nodesGroup2, setNodesGroup2] = useState(null);
  const [selectedNodeKeysGroup2, setSelectedNodeKeysGroup2] = useState(null);

  
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


  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  //   console.log("Form Data",formData);
  // };

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


// const handleFormSubmitChild = async (e) => {
//     e.preventDefault();
//     try {

//       const updatedFormData = {
//         ...formData,
//         group1SelectedFiles: selectedNodeKeysGroup1,
//         group2SelectedFiles: selectedNodeKeysGroup2,
//       };
    
//       console.log("Form Data Child", updatedFormData);
//       await props.handleFormSubmitParent(updatedFormData);



//     } catch (error) {
//       console.error('Error sending form data to parent:', error);
//     }
//   };

const handleProcessSubmit = async (e) => {
  e.preventDefault();
  try {
      const updatedFormData = {
          ...processFormData,
          group1SelectedFiles: selectedNodeKeysGroup1,
          group2SelectedFiles: selectedNodeKeysGroup2,
      };
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
      // Send the data (you can pass this to another component or perform another action)
      await props.handleFormSubmitParent2(submitFormData);
  } catch (error) {
      console.error('Error submitting data:', error);
  }
};



  return (
    <>
      <Grid container spacing={1}>
      <Grid item xs={10}>
          <TextField
            name="temp1FileLocation"
            placeholder="Group1 file location"
            label="File Location"
            variant="filled"
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

        <Grid item xs={6}  style={{ paddingTop: '30px' }} >
        <span className="p-float-label w-full">
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

        <Grid item xs={6}  style={{ paddingTop: '30px' }}>
        <span className="p-float-label w-full">

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

        <Grid item xs={6} >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="parameter-label">Select Parameter</InputLabel>
            <Select
              name="parameter"
              labelId="parameter-label"
              id="parameter-select"
              value={processFormData.parameter}
              onChange={handleProcessChange}
              MenuProps={MenuProps}
            >
              {parameterOptions.map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      <Grid item xs={6} style={{ paddingTop: '10px' }}>
          <Button variant="contained" size="small"
          onClick={(e) => handleProcessSubmit(e)}
          >
            Process
          </Button>
        </Grid>
      </Grid>       

      <Grid container spacing={1} style={{ paddingTop: '10px' }}>



        <Grid item xs={6} >
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

        <Grid item xs={6} >
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


        <Grid item xs={6} >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group1-footing-label">Group 1 Footing</InputLabel>
            <Select
              name="group1Footing"
              labelId="group1-footing-label"
              id="group1-footing-select"
              value={submitFormData.group1Footing}
              onChange={handleSubmitChange}
              MenuProps={MenuProps}
            >
              {footingOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group2-footing-label">Group 2 Footing</InputLabel>
            <Select
              name="group2Footing"
              labelId="group2-footing-label"
              id="group2-footing-select"
              value={submitFormData.group2Footing}
              onChange={handleSubmitChange}
              MenuProps={MenuProps}
            >
              {footingOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} >
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="group1-gait-cycle-label">Group 1 Gait Cycle</InputLabel>
            <Select
              name="group1GaitCycle"
              labelId="group1-gait-cycle-label"
              id="group1-gait-cycle-select"
              value={submitFormData.group1GaitCycle}
              onChange={handleSubmitChange}
              MenuProps={MenuProps}
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
          <FormControl  variant="standard" fullWidth>
            <InputLabel id="group2-gait-cycle-label">Group 2 Gait Cycle</InputLabel>
            <Select
              name="group2GaitCycle"
              labelId="group2-gait-cycle-label"
              id="group2-gait-cycle-select"
              value={submitFormData.group2GaitCycle}
              onChange={handleSubmitChange}
              MenuProps={MenuProps}
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
 
        <Grid item xs={6} >
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
        </Grid>
    </>
  );
};
