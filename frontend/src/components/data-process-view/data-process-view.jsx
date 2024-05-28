import React, { useState } from "react";
import { LoadData } from "./loadData";
import { Grid } from "@mui/material";
import axios from "axios";
import LineChart from "../lineChart/lineChart";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RadarChart from "../radar-chart/radar-chart";
import BoxChart from "../box-chart/box-chart";
import BoxTitle from "../box-chart/box-title";

export const DataProcessView = (props) => {
  const [activeGroupsRadar, setActiveGroupsRadar] = useState([true, true]);
  const [activeGroupsBox, setActiveGroupsBox] = useState([true, true]);

  const [lineChartsData, setLineChartsData] = useState([
    {
      active: false,
      plotNumber: 2,
      group1Data: [],
      group2Data: [],
      group1AllData: [],
      group2AllData: [],
      group1Label: "",
      group2Label: "",
      selectedFooting1: "",
      selectedFooting2: "",
      selectedCycle1: "",
      selectedCycle2: "",
      spreadOption: "",
      groupExploration: false,
    }, // Chart 2
    {
      active: false,
      plotNumber: 1,
      group1Data: [],
      group2Data: [],
      group1AllData: [],
      group2AllData: [],
      group1Label: "",
      group2Label: "",
      selectedFooting1: "",
      selectedFooting2: "",
      selectedCycle1: "",
      selectedCycle2: "",
      spreadOption: "",
      groupExploration: false,
    }, // Chart 1
    {
      active: false,
      plotNumber: 3,
      group1Data: [],
      group2Data: [],
      group1AllData: [],
      group2AllData: [],
      group1Label: "",
      group2Label: "",
      selectedFooting1: "",
      selectedFooting2: "",
      selectedCycle1: "",
      selectedCycle2: "",
      spreadOption: "",
      groupExploration: false,
    }, // Chart 3
    {
      active: false,
      plotNumber: 4,
      group1Data: [],
      group2Data: [],
      group1AllData: [],
      group2AllData: [],
      group1Label: "",
      group2Label: "",
      selectedFooting1: "",
      selectedFooting2: "",
      selectedCycle1: "",
      selectedCycle2: "",
      spreadOption: "",
      groupExploration: false,
    }, // Chart 4
    {
      active: false,
      plotNumber: 5,
      group1Data: [],
      group2Data: [],
      group1AllData: [],
      group2AllData: [],
      group1Label: "",
      group2Label: "",
      selectedFooting1: "",
      selectedFooting2: "",
      selectedCycle1: "",
      selectedCycle2: "",
      spreadOption: "",
      groupExploration: false,
    }, // Chart 5
    // Add more objects as neede for additional charts
  ]);

  const [boxChartData, setBoxChartData] = useState({});
  const [boxChartParams, setBoxChartParams] = useState({});
  const [boxGroupExploration, setBoxGroupExploration] = useState(false);

  // convert boxChartParams to array named definedParams
  const definedAttributes = Object.values(boxChartParams);

  const [boxChartLabels, setBoxChartLabels] = useState({
    label1: "",
    label2: "",
  });
  // Define base grid size for the container and items
  const containerGridSize = {
    xs: 12,
    sm: 12,
    md: 12,
    justifyContent: definedAttributes.length <= 3 ? "center" : "flex-start",
  };

  const chartGridSize = {
    xs: 12 / Math.max(definedAttributes.length, 1), // Fallback to full width if there's one or no chart
    sm: definedAttributes.length <= 2 ? undefined : 6,
    md:
      definedAttributes.length <= 2 ? undefined : 12 / definedAttributes.length,
  };

  const handleFormDataSubmit = async (formData) => {
    try {
      // console.log("Form data submitted:", formData);
      const response = await axios.post(
        "http://localhost:5000/process_form_data",
        formData
      );
      // console.log(formData.spreadOption);
      const group1Data = response.data.df1;
      const group2Data = response.data.df2;

      const group1AllData = response.data.df1_data;
      const group2AllData = response.data.df2_data;

      if (response.status !== 200) {
        console.error("Error while processing form data:", response);
        return;
      }

      // if (group2Data === undefined) {
      //   setGroupExploration(false);
      // } else {
      //   setGroupExploration(true);
      // }

      if (formData.selectedColumn === "STP") {
        setBoxChartData({
          response: response.data,
        });

        setBoxChartParams(formData.stpparams);

        setBoxChartLabels({
          label1: formData.group1Label,
          label2: formData.group2Label,
        });

        setBoxGroupExploration(formData.groupExploration);
      } else {
        setLineChartsData((currentData) => {
          const newData = [...currentData]; // Create a shallow copy of the array
          const chartIndex = formData.panelOptions - 1; // Assuming panelOptions is 1-based
          const newChartData = { ...newData[chartIndex] }; // Assume chartIndex is defined and points to the chart data to update

          // Here, update the chart data properties based on the formData and response
          newChartData.active = true; // Example of setting chart as active, adapt as necessary
          newChartData.parameter = formData.selectedColumn; // Assuming this is the parameter to use
          newChartData.group1Data = group1Data; // Update with actual data from the response
          newChartData.group2Data = group2Data; // Update with actual data from the response
          // newChartData.group1Spread = formData.isGroup1Checked;
          // newChartData.group2Spread = formData.isGroup2Checked;
          newChartData.group1Label = formData.group1Label;
          newChartData.group2Label = formData.group2Label;
          newChartData.group1Footing = formData.selectedFooting1; // Assuming these fields exist in formData
          newChartData.group2Footing = formData.selectedFooting2;
          newChartData.group1GaitCycle = formData.selectedCycle1;
          newChartData.group2GaitCycle = formData.selectedCycle2;
          newChartData.group1AllData = group1AllData;
          newChartData.group2AllData = group2AllData;
          newChartData.spreadOption = formData.spreadOption;
          newChartData.groupExploration = formData.groupExploration;

          newData[chartIndex] = newChartData; // Update the array with the modified chart data

          return newData; // Return the updated array to set the state
        });
      }
    } catch (error) {
      console.error("Error while processing form data:", error);
    }
  };

  const theme = useTheme();
  const isLgOrLarger = useMediaQuery(theme.breakpoints.up("lg"));

  const loadDataStyle = {
    height: isLgOrLarger ? "66vh" : "auto", // Applies '66vh' height for 'md' and larger screens, 'auto' for smaller
    padding: "2.5px",
  };

  const isMdOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Grid container>
      <Grid item xs={12} md={6} lg={3} style={loadDataStyle}>
        <LoadData handleFormSubmitParent={handleFormDataSubmit} />
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        lg={4.5}
        container
        direction={isMdOrLarger ? "column" : "row"}
      >
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: isMdOrLarger ? "50%" : "33vh" }}
        >
          <LineChart
            style={{ height: "100%", boxSizing: "border-box" }}
            chartData={lineChartsData[0]}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: isMdOrLarger ? "50%" : "33vh" }}
        >
          <LineChart
            style={{ height: "100%", boxSizing: "border-box" }}
            chartData={lineChartsData[1]}
          />
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        sm={12}
        lg={4.5}
        container
        direction={isLgOrLarger ? "column" : "row"}
      >
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: isLgOrLarger ? "50%" : "33vh" }}
        >
          <LineChart
            style={{ height: "100%", boxSizing: "border-box" }}
            chartData={lineChartsData[2]}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: isLgOrLarger ? "50%" : "33vh" }}
        >
          <LineChart
            style={{ height: "100%", boxSizing: "border-box" }}
            chartData={lineChartsData[3]}
          />
        </Grid>
      </Grid>

      <Grid
        item
        container
        {...containerGridSize}
        lg={8}
        style={{ display: "flex" }}
      >
        <Grid item xs={12} style={{ height: "10vh", padding: 0, margin: 0 }}>
          <BoxTitle
            title={"Spatiotemporal Distributions"}
            labels={boxChartLabels}
            chartData={boxChartData}
            activeGroups={activeGroupsBox}
            setActiveGroups={setActiveGroupsBox}
            groupExploration={boxGroupExploration}
          ></BoxTitle>
        </Grid>
        {definedAttributes.map((attribute, index) => (
          <Grid
            key={index}
            item
            {...chartGridSize}
            style={{
              height: "26vh",
              marginTop: "-30px",
              maxWidth: definedAttributes.length <= 3 ? "300px" : "none", // Set a max width if 1 or 2 charts
              flexGrow: 0, // Prevent stretching
            }}
          >
            <BoxChart
              chartData={boxChartData}
              attribute={attribute}
              labels={boxChartLabels}
              activeGroups={activeGroupsBox}
              groupExploration={boxGroupExploration}
            ></BoxChart>
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12} lg={4}>
        <Grid item xs={12} style={{ height: "10vh" }}>
          <BoxTitle
            title="Spatiotemporal Comparison"
            labels={boxChartLabels}
            chartData={boxChartData}
            activeGroups={activeGroupsRadar}
            setActiveGroups={setActiveGroupsRadar}
            groupExploration={boxGroupExploration}
          ></BoxTitle>
        </Grid>
        <Grid item xs={12} style={{ height: "26vh", marginTop: "-30px" }}>
          <RadarChart
            chartData={boxChartData}
            labels={boxChartLabels}
            style={{ boxSizing: "border-box" }}
            activeGroups={activeGroupsRadar}
            groupExploration={boxGroupExploration}
          ></RadarChart>
        </Grid>
      </Grid>
    </Grid>
  );
};
