import React, {useState, useEffect } from "react";
import { Grid, Button, TextField, FormControl, Select, MenuItem, OutlinedInput, InputLabel, FormControlLabel, Checkbox } from '@mui/material';import "./load-data.css";
import axios from 'axios';
import MultipleSelect from "./subComponents/multipleSelect";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};



// LoadData component
export const LoadData = (props) => {
  const [tempFileLocation, setTempFileLocation] = useState("");
  const [fileLocation, setFileLocation] = useState("");

  const [pInput, setPInput] = useState("");
  const [patientId, setPatientId] = useState("");
  const [panelNo, setPanelNo] = useState("");


  const [trialIdx, setTrialIdx] = useState("");

  const [dataType, setDataType] = useState("");


  const [trialGroup1, setTrialGroup1] = useState([]);
  const [trialGroup2, setTrialGroup2] = useState([]);
  const [trialGroup3, setTrialGroup3] = useState("");

  const [textInputValue, setTextInputValue] = useState('');

  const handleInputChange = (event) => {
    setTextInputValue(event.target.value);
  };


  const [panelOptions, setPanelOptions] = useState('');
  const [group, setGroup] = useState('');
  const [footing, setFooting] = useState('');

  const [gaitCycle, setGaitCycle] = useState('');


  const [isChecked, setIsChecked] = useState(false);

  const [folderNames, setFolderNames] = useState(["Empty Folder List"]);


  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };



  useEffect(() => {
    const handleSubmit = async () => {
      try {
        const response = await axios.post('http://localhost:5000/send-data', { fileLocation });
        console.log(response.data); // Handle response from Flask backend
        setFolderNames(response.data);
      } catch (error) {
        console.error('Error sending data to backend:', error);
      }
    };

    handleSubmit();
    
  }, [fileLocation]);


  const names = [
    1,2,3,4,5
  ];
  
  const handleChange = (event, stateVariable) => {
    const {
      target: { value },
    } = event;
    stateVariable(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };


  // Load first data upon set patient
  const loadPatientData = async () => {
    console.log(`http://localhost:5000/check_patient_exists?file_location=${fileLocation}&patient_id=${pInput}`)
    let check = await fetch(
      `http://localhost:5000/check_patient_exists?file_location=${fileLocation}&patient_id=${pInput}`
    );

    check = await check.json();

    if (!check) {
      alert(
        "Patient does not exist!\nCheck file location/patient ID and try again."
      );
      setPInput(patientId);
      return;
    } else {
      // console.log("Patient exists!")
      let patientId = pInput;

      const flask_url = `http://localhost:5000/get_patient_data?`;
      const data_url =
        flask_url +
        `file_location=${fileLocation}&patient_id=${patientId}&trial_id=${parseInt(
          trialIdx
        )}&data_type=${dataType}`;

      const response = await fetch(data_url);
      let data = await response.json();
      
      if(data.length === 0){
        alert("No data available for this trial!");
        return;
      }

      props.onDataLoaded(data);
      props.onDataTypeChanged(dataType);
      props.onPatientIDChanged(patientId);
      props.onTrialIDChanged(trialIdx);
      props.onPanelNoChange(panelNo);
    }
  };

  const handlePanelChange = (event) => {
    setPanelOptions(event.target.value);
  };



  return (
<Grid container spacing={3}>
  <Grid item xs={8}>
  <TextField
          placeholder="Enter file location"
          label="File Location" variant="outlined"
          fullWidth
          size="medium"
          value={tempFileLocation}
          onChange={(e) => setTempFileLocation(e.target.value)}
        />
        </Grid>
  <Grid item xs={4}>
  <Button
  variant="contained"
  onClick={() => setFileLocation(tempFileLocation)}
>
  Submit
</Button>
  </Grid>
  <Grid item xs={6}>
  <MultipleSelect
          title="Group 1"
          options={folderNames}
          selectedValue={trialGroup1}
          multiple={true}
          onChange={(selected) => setTrialGroup1(selected)} 
          />
  </Grid>
  <Grid item xs={6}>
  <MultipleSelect
          title="Group 2"
          options={folderNames}
          selectedValue={trialGroup2}
          multiple={true}
          onChange={(selected) => setTrialGroup2(selected)} 
          />
  </Grid>
  <Grid item xs={6}>
  <MultipleSelect
          title="Group Label"
          options={names}
          selectedValue={trialGroup3}
          onChange={ setTrialGroup3} 
          />
  </Grid>

  {/* <Grid item xs={6}>
    <TextField
      label="Stroke Patients"
      variant="standard"
      fullWidth
      size="medium"
      value={textInputValue}
      onChange={handleInputChange}
    /> 
  </Grid>*/}
  <Grid item xs={12}>
    <FormControl fullWidth >
      <InputLabel id="panel-options-label">Select plot options for panel :</InputLabel>
      <Select
        labelId="panel-options-label"
        id="panel-options-select"
        value={panelOptions}
        onChange={handlePanelChange}
      >
        {[1, 2, 3, 4, 5].map((number) => (
          <MenuItem key={number} value={number}>
            {number}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  <Grid item xs={6}>
    <InputLabel id="demo-multiple-name-label">Group</InputLabel>
    <Select
            fullWidth
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            value={group}
            onChange={(e)=>handleChange(e, setGroup)}
            input={<OutlinedInput label="Name"  />}
            MenuProps={MenuProps}
          >
            {names.map((name) => (
              <MenuItem
                key={name}
                value={name}
              >
                {name}
              </MenuItem>
            ))}
    </ Select>  
  </Grid>
  <Grid item xs={6}>
    <InputLabel id="demo-multiple-name-label">Footing</InputLabel>
    <Select
            fullWidth
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            value={footing}
            onChange={(e)=>handleChange(e, setFooting)}
            input={<OutlinedInput label="Name"  />}
            MenuProps={MenuProps}
          >
            {names.map((name) => (
              <MenuItem
                key={name}
                value={name}
              >
                {name}
              </MenuItem>
            ))}
    </ Select>  
  </Grid>

  <Grid item xs={6}>
    <InputLabel id="demo-multiple-name-label">Gait Cycle</InputLabel>
    <Select
            fullWidth
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            value={gaitCycle}
            onChange={(e)=>handleChange(e, setGaitCycle)}
            input={<OutlinedInput label="Name"  />}
            MenuProps={MenuProps}
          >
            {names.map((name) => (
              <MenuItem
                key={name}
                value={name}
              >
                {name}
              </MenuItem>
            ))}
    </ Select>  
  </Grid>
  <Grid item xs={6}   >
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              id="checkboxExample"
            />
          }
          label="Show Spread"
        />
      </Grid>
  
      

</Grid>
    
  );
};
