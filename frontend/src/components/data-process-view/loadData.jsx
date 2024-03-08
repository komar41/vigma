import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, FormControl, Select, MenuItem, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';

import { TreeSelect } from "primereact/treeselect";
import  NodeService  from "./service/NodeService";

import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

//import FolderFileList from "./subComponents/FolderFileList";
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
  const [formData, setFormData] = useState({
    temp1FileLocation: "",
    temp2FileLocation: "",
    file1Location: "",
    file2Location: "",
    patientId: "",
    trialIdx: "",
    dataType: "",
    trialGroup1: [],
    trialGroup2: [],
    group1SelectedFiles: [],
    group2SelectedFiles: [],
    group1Label: "",
    group2Label: "",
    panelOptions: "",
    parameter: "",
    group1Footing: "",
    group1GaitCycle: "",
    group2Footing: "",
    group2GaitCycle: "",
    isGroup1Checked: false,
    isGroup2Checked: false,
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
      if (formData.file1Location) {
        try {
          const response = await axios.post('http://localhost:5000/send-data', { fileLocation: formData.file1Location });
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
    
  }, [formData.file1Location]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (formData.file2Location) {
        try {
          const response = await axios.post('http://localhost:5000/send-data', { fileLocation: formData.file2Location });
          NodeService.updateData(response.data);
          // Retrieve the updated tree structure
          NodeService.getTreeNodes().then((data) => setNodesGroup2(data));
        } catch (error) {
          console.error('Error sending data to backend:', error);
        }
      }
    };
    fetchFolders();
    
  }, [formData.file2Location]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log("Name",name);
    console.log("Value",value);
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("Form Data",formData);
  };


  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target; // Destructure name and checked from the event target
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked, // Use computed property name based on the checkbox name
    }));
};


  

  const handleFormSubmitChild = async (e) => {
    e.preventDefault();
    try {

      const updatedFormData = {
        ...formData,
        group1SelectedFiles: selectedNodeKeysGroup1,
        group2SelectedFiles: selectedNodeKeysGroup2,
      };
    
      console.log("Form Data Child", updatedFormData);
    
      // Now use updatedFormData instead of formData
      await props.handleFormSubmitParent(updatedFormData);


      // setFormData((prevState) => ({
      //   ...prevState,
      //   "group1SelectedFiles": selectedNodeKeysGroup1,
      // }));
  
      // setFormData((prevState) => ({
      //   ...prevState,
      //   "group2SelectedFiles": selectedNodeKeysGroup2,
      // }));

      // console.log("Form Data Child",formData);
      // await props.handleFormSubmitParent(formData); // Call parent function with form data
    } catch (error) {
      console.error('Error sending form data to parent:', error);
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
            value={formData.temp1FileLocation}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setFormData({ ...formData, file1Location: formData.temp1FileLocation })}
          >
            Set
          </Button>
        </Grid>



      {/* <Grid item xs={10} >
        <TextField
          name="temp2FileLocation"
          placeholder="Group2 file location"
          label="Group 2 File Location"
          variant="filled"
          fullWidth
          value={formData.temp2FileLocation}
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          size="small"
          onClick={() => setFormData({ ...formData, file2Location: formData.temp2FileLocation })}
        >
          Set
        </Button>
      </Grid> */}
      
        
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
              value={formData.parameter}
              onChange={handleChange}
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
          onClick={(e) => handleFormSubmitChild(e)}
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
            value={formData.group1Label}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6} >
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


        <Grid item xs={6} >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="group1-footing-label">Group 1 Footing</InputLabel>
            <Select
              name="group1Footing"
              labelId="group1-footing-label"
              id="group1-footing-select"
              value={formData.group1Footing}
              onChange={handleChange}
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
              value={formData.group2Footing}
              onChange={handleChange}
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
              value={formData.group1GaitCycle}
              onChange={handleChange}
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
              value={formData.group2GaitCycle}
              onChange={handleChange}
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
 
        <Grid item xs={6} >
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
          <Button type="submit" variant="contained" size="small">
            Submit
          </Button>
        </Grid>
        </Grid>
    </>
  );
};

// <Grid item xs={12} md={6} style={directGridItemStyle}>
// <FolderFileList paths={paths} />
// </Grid>