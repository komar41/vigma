import React, { useState, useEffect } from "react";
import {
  ListSubheader,
  Grid,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogActions,
  ListItemText,
  Input,
  FormLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import axios from "axios";

import { TreeSelect } from "primereact/treeselect";
import NodeService from "./service/NodeService";

import { Paper } from "@mui/material";

import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const names = [
  "RstepLength",
  "LstepLength",
  "timeRswing",
  "timeLswing",
  "timeRgait",
  "timeLgait",
  "GaitSpeed",
];

const dictStpParam = {
  RstepLength: "Step Length (R)",
  LstepLength: "Step Length (L)",
  timeRswing: "Swing Time (R)",
  timeLswing: "Swing Time (L)",
  timeRgait: "Gait Time (R)",
  timeLgait: "Gait Time (L)",
  GaitSpeed: "Gait Speed",
};

export const LoadData = (props) => {
  const [personName, setPersonName] = useState([]); // State for selected names
  // console.log(personName);

  const handleStpParam = (event) => {
    const {
      target: { value },
    } = event;

    const selectedNames = typeof value === "string" ? value.split(",") : value;

    if (selectedNames.length > 4) {
      setErrorMessage("You can select up to 4 parameters");
      setOpenDialog(true);
      return;
    }

    setPersonName(selectedNames);
  };

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
    // isGroup1Checked: false,
    // isGroup2Checked: false,
    panelOptions: "",
    spreadOption: "Spread",
    // Any other fields you might have
  });

  const panelOptions = [1, 2, 3, 4];
  const selectedColumnOptions = [
    "foot",
    "shank",
    "thigh",
    "trunk",
    "hipx",
    "AP",
    "ML",
    "VT",
    "STP",
  ];
  const dict = {
    foot: "Foot",
    shank: "Shank",
    thigh: "Thigh",
    trunk: "Trunk",
    hipx: "Hip",
    AP: "Asterior-Posterior",
    ML: "MedioLateral",
    VT: "Vertical",
    STP: "Spatiotemporal",
  };

  const [dynamicFootingOptions, setDynamicFootingOptions] = useState([
    "Left",
    "Right",
  ]);
  const [isFootingDisabled, setIsFootingDisabled] = useState(false);
  const [isCycleDisabled, setIsCycleDisabled] = useState(false);
  const [isSpreadDisabled, setIsSpreadDisabled] = useState(false);
  const [spreadOption, setSpreadOption] = useState("Spread");
  const [isPanelDisabled, setIsPanelDisabled] = useState(false);
  const [isStpOptionDisabled, setIsStpOptionDisabled] = useState(true);
  const gaitCycleOptions = ["Left", "Right"]; // Assuming 'names' are used for multiple selects

  const [nodesGroup1, setNodesGroup1] = useState(null);
  const [selectedNodeKeysGroup1, setSelectedNodeKeysGroup1] = useState(null);

  const [nodesGroup2, setNodesGroup2] = useState(null);
  const [selectedNodeKeysGroup2, setSelectedNodeKeysGroup2] = useState(null);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  function PlotOption() {
    let content;

    if (!isPanelDisabled) {
      // Prepare the JSX content for rendering if the panel is not disabled
      content = (
        <FormControl variant="standard" fullWidth>
          <InputLabel id="panel-options-label">Plot no</InputLabel>
          <Select
            name="panelOptions"
            labelId="panel-options-label"
            id="panel-options-select"
            value={formData.panelOptions}
            onChange={handleChange}
            // Optional: MenuProps={MenuProps}, size="small" for further customization
          >
            {panelOptions.map((number) => (
              <MenuItem key={number} value={number}>
                {number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      // If the panel is disabled, you might decide to render nothing or a placeholder
      content = null; // or <div>Panel is unavailable</div> for example
    }

    return content;
  }

  function LimbSideOption() {
    let content;
    if (!isFootingDisabled) {
      content = (
        <>
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="group1-footing-label">Group 1 limb</InputLabel>
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
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="group2-footing-label">Group 2 limb</InputLabel>
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
        </>
      );
    } else {
      content = null;
    }

    return content;
  }

  function GaitCycleOption() {
    let content;
    if (!isCycleDisabled) {
      content = (
        <>
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="group1-gait-cycle-label">
                Group 1 gait cycle
              </InputLabel>
              <Select
                name="selectedCycle1"
                labelId="group1-gait-cycle-label"
                id="group1-gait-cycle-select"
                value={formData.selectedCycle1}
                disabled={isCycleDisabled}
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
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="group2-gait-cycle-label">
                Group 2 gait cycle
              </InputLabel>
              <Select
                name="selectedCycle2"
                labelId="group2-gait-cycle-label"
                id="group2-gait-cycle-select"
                value={formData.selectedCycle2}
                disabled={isCycleDisabled}
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
        </>
      );
    } else {
      content = null;
    }

    return content;
  }

  function SpreadOption() {
    let content;

    if (!isSpreadDisabled) {
      content = (
        <>
          {/* <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isGroup1Checked}
                  onChange={handleCheckboxChange}
                  name="isGroup1Checked"
                />
              }
              label="Group 1 Spread"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isGroup2Checked}
                  onChange={handleCheckboxChange}
                  name="isGroup2Checked"
                />
              }
              label="Group 2 Spread"
            />
          </Grid> */}
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel
                component="legend"
                id="demo-row-radio-buttons-group-label"
                style={{ marginBottom: "-5px" }} // Reduced bottom margin
              >
                Plot option
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={spreadOption}
                onChange={handleRadioChange}
              >
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <FormControlLabel
                      value="Spread"
                      control={<Radio />}
                      label="Spread"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      value="All data"
                      control={<Radio />}
                      label="All data"
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </FormControl>
          </Grid>
        </>
      );
    } else {
      content = null;
    }

    return content;
  }

  useEffect(() => {
    const fetchFolders = async () => {
      if (formData.fileLocation) {
        try {
          const response = await axios.post("http://localhost:5000/send-data", {
            fileLocation: formData.fileLocation,
          });
          NodeService.updateData(response.data);
          // Retrieve the updated tree structure
          NodeService.getTreeNodes().then((data) => setNodesGroup1(data));
          NodeService.getTreeNodes().then((data) => setNodesGroup2(data));
        } catch (error) {
          console.error("Error sending data to backend:", error);
        }
      }
    };
    fetchFolders();
  }, [formData.fileLocation]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "selectedColumn") {
      if (["AP", "ML", "VT"].includes(value)) {
        setDynamicFootingOptions(["Left", "Right", "Aggregate"]);
        setIsFootingDisabled(false);
        setIsCycleDisabled(false);
        setIsPanelDisabled(false);
        setIsSpreadDisabled(false);
        setIsStpOptionDisabled(true);
      } else if (["trunk", "hipx"].includes(value)) {
        setDynamicFootingOptions([]);
        setIsFootingDisabled(true);
        setIsCycleDisabled(false);
        setIsPanelDisabled(false);
        setIsSpreadDisabled(false);
        setIsStpOptionDisabled(true);
      } else if (["STP"].includes(value)) {
        setDynamicFootingOptions([]);
        setIsFootingDisabled(true);
        setIsCycleDisabled(true);
        setIsPanelDisabled(true);
        setIsSpreadDisabled(true);
        setIsStpOptionDisabled(false);
      } else {
        setDynamicFootingOptions(["Left", "Right"]);
        setIsFootingDisabled(false);
        setIsCycleDisabled(false);
        setIsPanelDisabled(false);
        setIsSpreadDisabled(false);
        setIsStpOptionDisabled(true);
      }
    }
  };

  // const handleCheckboxChange = (event) => {
  //   const { name, checked } = event.target; // Destructure name and checked from the event target
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [name]: checked, // Use computed property name based on the checkbox name
  //   }));
  // };

  const handleRadioChange = (event) => {
    setSpreadOption(event.target.value);
  };

  function getCheckedFileTitles(selectedNodeKeys) {
    // Regex to match the specific format (folderName/insideFolder_trialNumber)
    const regex = /\/.+\_.+$/;

    // Filter entries based on the regex and the checked status, then extract the keys
    const checkedFileTitles = Object.entries(selectedNodeKeys)
      .filter(([key, value]) => {
        // Check both the key format and the `checked` status
        return (
          regex.test(key) &&
          value.checked === true &&
          value.partialChecked === false
        );
      })
      .map(([key, _]) => key); // Extract just the titles (keys)

    return checkedFileTitles;
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (!formData.temp1FileLocation) {
        setErrorMessage("File location is not entered");
        setOpenDialog(true);
        return;
      }

      // Checking if Group 1 files are selected
      if (
        !selectedNodeKeysGroup1 ||
        Object.keys(selectedNodeKeysGroup1).length === 0
      ) {
        setErrorMessage("Group 1 files are not selected");
        setOpenDialog(true);
        return;
      }

      // Checking if Group 1 files are selected
      if (
        !selectedNodeKeysGroup2 ||
        Object.keys(selectedNodeKeysGroup2).length === 0
      ) {
        setErrorMessage("Group 2 files are not selected");
        setOpenDialog(true);
        return;
      }

      if (!formData.selectedColumn) {
        setErrorMessage("selectedColumn is not selected");
        setOpenDialog(true);
        return;
      }

      if (!formData.group1Label) {
        setErrorMessage("Group 1 label is not entered");
        setOpenDialog(true);
        return;
      }

      if (!formData.group2Label) {
        setErrorMessage("Group 2 label is not entered");
        setOpenDialog(true);
        return;
      }

      if (!isFootingDisabled & !formData.selectedFooting1) {
        setErrorMessage("Group 1 footing is not selected");
        setOpenDialog(true);
        return;
      }

      if (!isFootingDisabled & !formData.selectedFooting2) {
        setErrorMessage("Group 2 footing is not selected");
        setOpenDialog(true);
        return;
      }

      if (!isCycleDisabled & !formData.selectedCycle1) {
        setErrorMessage("Group 1 gait cycle is not selected");
        setOpenDialog(true);
        return;
      }

      if (!isCycleDisabled & !formData.selectedCycle2) {
        setErrorMessage("Group 2 gait cycle is not selected");
        setOpenDialog(true);
        return;
      }

      if (!isPanelDisabled & !formData.panelOptions) {
        setErrorMessage("Panel option is not selected");
        setOpenDialog(true);
        return;
      }

      const convertFootingValue = (Value) => {
        if (isFootingDisabled) {
          return "NA";
        }

        switch (Value) {
          case "Left":
            return "L";
          case "Right":
            return "R";
          case "Aggregate":
            return "Agg";
          default:
            return "NA"; // Just in case there are other unhandled values
        }
      };

      const convertCycleValue = (Value) => {
        switch (Value) {
          case "Left":
            return "L";
          case "Right":
            return "R";

          default:
            return "NA"; // Just in case there are other unhandled values
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

        stpparams: personName,
        spreadOption: spreadOption,
      };

      // Send the data (you can pass this to another component or perform another action)
      await props.handleFormSubmitParent(newForm);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1vh",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 1)",
        border: "1px solid #bbb", // Adjust the border color and width as needed
        marginTop: "3vh",
        marginLeft: "1vh",
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={10} lg={10}>
          <TextField
            name="temp1FileLocation"
            placeholder="Group1 file location"
            label="File location"
            variant="standard"
            fullWidth
            value={formData.temp1FileLocation}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid item xs={2} lg={2}>
          <Button
            style={{
              marginTop: "15px",
              // width: "55px",
              height: "30px",
              minWidth: "55px",
            }}
            variant="contained"
            size="small"
            fullWidth
            onClick={() =>
              setFormData({
                ...formData,
                fileLocation: formData.temp1FileLocation,
              })
            }
          >
            Set
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{
            paddingTop: "2.5vh",
            paddingRight: "1vh",
            marginLeft: "-1px",
          }}
        >
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
            <label htmlFor="treeselect">Group 1 files</label>
          </span>
        </Grid>

        <Grid item xs={12} sm={6} style={{ paddingTop: "2.5vh" }}>
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
            <label htmlFor="treeselect">Group 2 files</label>
          </span>
        </Grid>

        <Grid item xs={12} sm={6} style={{ paddingRight: "1vh" }}>
          <TextField
            name="group1Label"
            placeholder="group 1 label"
            label="Group 1 label"
            variant="standard"
            fullWidth
            value={formData.group1Label}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="group2Label"
            placeholder="group 2 label"
            label="Group 2 label"
            variant="standard"
            fullWidth
            value={formData.group2Label}
            onChange={handleChange}
          />
        </Grid>

        <Grid
          item
          xs={6}
          sm={6}
          style={{ paddingRight: "1vh", paddingTop: "10px" }}
        >
          <FormControl variant="standard" fullWidth>
            <InputLabel id="selectedColumn-label">Select parameter</InputLabel>
            <Select
              name="selectedColumn"
              labelId="selectedColumn-label"
              id="selectedColumn-select"
              value={formData.selectedColumn}
              onChange={handleChange}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200, // Set maximum height
                    overflow: "auto", // Enable scrolling
                  },
                },
              }}
            >
              <ListSubheader
                style={{ textDecoration: "underline", fontSize: "1.1rem" }}
              >
                Joint Angle
              </ListSubheader>
              {selectedColumnOptions.slice(0, 5).map((option) => (
                <MenuItem key={option} value={option}>
                  {dict[option]}
                </MenuItem>
              ))}
              <ListSubheader
                style={{ textDecoration: "underline", fontSize: "1.1rem" }}
              >
                Ground Reaction Force
              </ListSubheader>
              {selectedColumnOptions.slice(5, 8).map((option) => (
                <MenuItem key={option} value={option}>
                  {dict[option]}
                </MenuItem>
              ))}
              <ListSubheader
                style={{ textDecoration: "underline", fontSize: "1.1rem" }}
              >
                Discrete Values
              </ListSubheader>
              {selectedColumnOptions.slice(8).map((option) => (
                <MenuItem key={option} value={option}>
                  {dict[option]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} lg={6} style={{ paddingTop: "10px" }}>
          {!isStpOptionDisabled && (
            <FormControl variant="standard" fullWidth>
              <InputLabel id="demo-mutiple-checkbox-label">
                Boxplots (up to 4)
              </InputLabel>
              <Select
                labelId="demo-mutiple-checkbox-label"
                id="demo-mutiple-checkbox"
                multiple
                value={personName}
                onChange={handleStpParam}
                input={<Input label="Names" />}
                renderValue={(selected) => {
                  // convert the selected array by dictStpParam
                  let selectedNames = selected.map(
                    (name) => dictStpParam[name]
                  );

                  return selectedNames.join(", ");
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Set maximum height
                      overflow: "auto", // Enable scrolling
                    },
                  },
                }}
              >
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={personName.indexOf(name) > -1} />
                    <ListItemText primary={dictStpParam[name]} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!isPanelDisabled && <PlotOption />}
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">{"Missing Input"}</DialogTitle>
        <div style={{ padding: "20px" }}>{errorMessage}</div>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            autoFocus
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={1} style={{ paddingTop: "10px" }}>
        <LimbSideOption />

        <GaitCycleOption />

        <SpreadOption />

        <Grid
          item
          xs={12}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            style={{ marginTop: "0vh" }}
            type="submit"
            variant="contained"
            size="large"
            onClick={(e) => handleSubmitForm(e)}
          >
            Submit
          </Button>
        </Grid>
        {props.lgMatch && (
          <Grid item style={{ width: "100%", height: "100%" }}>
            <Paper>
              {/* You can put additional content here or leave it empty */}
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
