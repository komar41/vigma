import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, FormControl, Select, MenuItem, OutlinedInput, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';
import MultipleSelect from "./subComponents/multipleSelect";

import { TreeSelect } from "primereact/treeselect";
import { NodeService } from "./service/NodeService";

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

  const [folder1Names, setFolder1Names] = useState(["Empty Folder List"]);
  const [folder2Names, setFolder2Names] = useState(["Empty Folder List"]);
  const [fileteredFolder1Names, setfileteredFolder1Names] = useState(["Empty Folder List"]);
  const [fileteredFolder2Names, setfileteredFolder2Names] = useState(["Empty Folder List"]);
  const panelOptions = [1, 2, 3, 4, 5]; 
  const parameterOptions = ['foot', 'shank', 'thigh', 'trunk', 'hipx']; 
  const footingOptions = ["left","right"]; // Assuming 'names' are used for multiple selects
  const gaitCycleOptions = ["left","right"]; // Assuming 'names' are used for multiple selects

  useEffect(() => {
    const fetchFolders = async () => {
      if (formData.file1Location) {
        try {
          const response = await axios.post('http://localhost:5000/send-data', { fileLocation: formData.file1Location });
          console.log(response.data); // Handle response from Flask backend
          setFolder1Names(response.data);
          setfileteredFolder1Names(folder1Names.map(path => path.split('\\').pop()));
          console.log("Filtered Folder 1 Names",fileteredFolder1Names);
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
          console.log(response.data); // Handle response from Flask backend
          setFolder2Names(response.data);
          setfileteredFolder2Names(folder2Names.map(path => path.split('\\').pop()).filter(fileName => fileName.endsWith('.csv')));
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
  };

  const handleGroupChange = (value, groupName) => {
    setFormData((prevState) => ({
      ...prevState,
      [groupName]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target; // Destructure name and checked from the event target
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked, // Use computed property name based on the checkbox name
    }));
};


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Form Data Parent",formData);
      const response = await axios.put('http://localhost:5000/process-form-data', formData);
      console.log("Form Response",response.data); // Handle response from Flask backend
    } catch (error) {
      console.error('Error sending form data to backend:', error);
    }
  };
  

  const handleFormSubmitChild = async (e) => {
    e.preventDefault();
    try {
      console.log("Form Data Child",formData);
      await props.handleFormSubmitParent(formData); // Call parent function with form data
    } catch (error) {
      console.error('Error sending form data to parent:', error);
    }
  };


  const directGridItemStyle = {
    maxWidth: '400px',
    margin: '0 0',
  };

  const paths = [
'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\.DS_Store', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\081517ap\\081517apstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\081517ap\\081517ap_8_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\081517ap\\081517ap_8_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\081517ap\\081517ap_9_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\081517ap\\081517ap_9_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\.DS_Store', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\083117jistep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\083117ji_49_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\083117ji_49_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\083117ji_50_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\083117ji\\083117ji_50_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\090717jg\\090717jgstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\090717jg\\090717jg_42_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\090717jg\\090717jg_42_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\090717jg\\090717jg_43_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\090717jg\\090717jg_43_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\091917yd\\091917ydstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\091917yd\\091917yd_47_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\091917yd\\091917yd_47_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\091917yd\\091917yd_50_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\091917yd\\091917yd_50_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100217jw\\100217jwstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100217jw\\100217jw_10_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100217jw\\100217jw_10_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100217jw\\100217jw_9_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100217jw\\100217jw_9_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100317wt\\100317wtstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100317wt\\100317wt_39_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100317wt\\100317wt_39_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100317wt\\100317wt_40_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\100317wt\\100317wt_40_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101117th\\101117thstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101117th\\101117th_31_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101117th\\101117th_31_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101117th\\101117th_32_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101117th\\101117th_32_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101217al\\101217alstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101217al\\101217al_29_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101217al\\101217al_29_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101217al\\101217al_30_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101217al\\101217al_30_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101317mm\\101317mmstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101317mm\\101317mm_78_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101317mm\\101317mm_78_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101317mm\\101317mm_79_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101317mm\\101317mm_79_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101617lw\\101617lwstep.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101617lw\\101617lw_30_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101617lw\\101617lw_30_jnt.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101617lw\\101617lw_31_grf.csv', 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls\\101617lw\\101617lw_31_jnt.csv'
  ];

  const [nodes, setNodes] = useState(null);
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);

  useEffect(() => {
    NodeService.getTreeNodes().then((data) => setNodes(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  

  return (
    <form onSubmit={handleFormSubmitChild}>
      <Grid container spacing={1}>
      <Grid item xs={6} >
          <FormControl fullWidth>
            <InputLabel id="panel-options-label">Select plot No:</InputLabel>
            <Select
              name="panelOptions"
              labelId="panel-options-label"
              id="panel-options-select"
              value={formData.panelOptions}
              onChange={handleChange}
              MenuProps={MenuProps}
            >
              {panelOptions.map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} >
          <FormControl fullWidth>
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
        <Grid item xs={10}>
          <TextField
            name="temp1FileLocation"
            placeholder="Group1 file location"
            label="Group1 File Location"
            variant="filled"
            fullWidth
            value={formData.temp1FileLocation}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setFormData({ ...formData, file1Location: formData.temp1FileLocation })}
          >
            Set
          </Button>
        </Grid>
        <Grid item xs={10}>
          <TextField
            name="temp2FileLocation"
            placeholder="Group2 file location"
            label="Group 2 File Location"
            variant="filled"
            fullWidth
            value={formData.temp2FileLocation}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setFormData({ ...formData, file2Location: formData.temp2FileLocation })}
          >
            Set
          </Button>
        </Grid>
        </Grid>
        <Grid container spacing={2} columns={12}>
        <Grid item xs={6}  >
        <TreeSelect
            value={selectedNodeKeys}
            onChange={(e) => setSelectedNodeKeys(e.value)}
            options={nodes}
            metaKeySelection={false}
            className="w-full"
            selectionMode="checkbox"
            display="chip"
            placeholder="Select Items"
          ></TreeSelect>
        </Grid>

        <Grid item xs={6} >
      <MultipleSelect
        title="Group 2"
        options={fileteredFolder2Names}
        selectedValue={formData.trialGroup2}
        multiple={true}
        onChange={(selected) => handleGroupChange(selected, 'trialGroup2')} 
      />
    </Grid>



        <Grid item xs={6} >
        <TextField
            name="group1Label"
            placeholder="group 1 label"
            label="group 1 label"
            variant="outlined"
            fullWidth
            value={formData.group1Label}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6} >
      <TextField
          name="group2Label"
          placeholder="group 2 label"
          label="group 2 label"
          variant="outlined"
          fullWidth
          value={formData.group2Label}
          onChange={handleChange}
        />
      </Grid>


        <Grid item xs={6} >
          <FormControl fullWidth>
            <InputLabel id="group1-footing-label">Footing</InputLabel>
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
          <FormControl fullWidth>
            <InputLabel id="group2-footing-label">Footing</InputLabel>
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
          <FormControl fullWidth>
            <InputLabel id="group1-gait-cycle-label">Gait Cycle</InputLabel>
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
          <FormControl fullWidth>
            <InputLabel id="group2-gait-cycle-label">Gait Cycle</InputLabel>
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
            label="group1-Show Spread"
          />
        </Grid>
        <Grid item xs={6} >
          <FormControlLabel
            control={<Checkbox checked={formData.isGroup2Checked} onChange={handleCheckboxChange} name="isGroup2Checked" />}
            label="group2-Show Spread"
          />
        </Grid>
        </Grid>
        <Grid item xs={6}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Grid>
    </form>
  );
};

// <Grid item xs={12} md={6} style={directGridItemStyle}>
// <FolderFileList paths={paths} />
// </Grid>