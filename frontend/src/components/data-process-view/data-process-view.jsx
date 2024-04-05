import React, { useState } from "react";
import { LoadData } from "./loadData";
import { Grid } from '@mui/material';
import {Paper} from '@mui/material';
import axios from 'axios';
import  LineChart  from '../lineChart/lineChart';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import RadarChart from "../radar-chart/radar-chart";
import BoxChart from "../box-chart/box-chart";
import BoxTitle from "../box-chart/box-title";


export const DataProcessView = (props) => {

  const [formDataP, setFormDataP] = useState({}); // To collect the form data and use in DataProcessView

  const [lineChartsData, setLineChartsData] = useState([
    { active: false,  plotNumber:2 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', selectedFooting1: '', selectedFooting2: '' , selectedCycle1: '' , selectedCycle2 : '' }, // Chart 2
    { active: false,  plotNumber:1 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', selectedFooting1: '', selectedFooting2: '' , selectedCycle1: '' , selectedCycle2 : '' }, // Chart 1
    { active: false,  plotNumber:3 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', selectedFooting1: '', selectedFooting2: '' , selectedCycle1: '' , selectedCycle2 : '' }, // Chart 3
    { active: false,  plotNumber:4 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', selectedFooting1: '', selectedFooting2: '' , selectedCycle1: '' , selectedCycle2 : '' }, // Chart 4
    { active: false,  plotNumber:5 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', selectedFooting1: '', selectedFooting2: '' , selectedCycle1: '' , selectedCycle2 : '' }, // Chart 5
    // Add more objects as neede for additional charts
  ]);


    const handleFormDataSubmit = async (formData) => {
      try {
        // Perform PUT request with formData, responseType 'blob' is crucial for binary data
        setFormDataP(formData);
        console.log("Form Data", formDataP);

        const response = await axios.post('http://localhost:5000/process_form_data', formData);

        
        console.log("Response", response.data);

        const group1Data = response.data.df1;
        const group2Data = response.data.df2;

        console.log("Group1 Data", group1Data);
        console.log("Group2 Data", group2Data);


        setLineChartsData(currentData => {
          const newData = [...currentData]; // Create a shallow copy of the array
          const chartIndex = formData.panelOptions - 1; // Assuming panelOptions is 1-based
          const newChartData = { ...newData[chartIndex] }; // Assume chartIndex is defined and points to the chart data to update
          
          // Here, update the chart data properties based on the formData and response
          newChartData.active = true; // Example of setting chart as active, adapt as necessary
          newChartData.parameter = formData.selectedColumn; // Assuming this is the parameter to use
          newChartData.group1Data = group1Data; // Update with actual data from the response
          newChartData.group2Data = group2Data; // Update with actual data from the response
          newChartData.group1Spread = formData.isGroup1Checked;
          newChartData.group2Spread = formData.isGroup2Checked;
          newChartData.group1Label = formData.group1Label;
          newChartData.group2Label = formData.group2Label;
          newChartData.group1Footing = formData.selectedFooting1; // Assuming these fields exist in formData
          newChartData.group2Footing = formData.selectedFooting2;
          newChartData.group1GaitCycle = formData.selectedCycle1;
          newChartData.group2GaitCycle = formData.selectedCycle2;
    
          newData[chartIndex] = newChartData; // Update the array with the modified chart data
          
          return newData; // Return the updated array to set the state
        });





      } catch (error) {
        console.error('Error while processing form data:', error);
      }
    };
    

    const theme = useTheme();
  const isLgOrLarger = useMediaQuery(theme.breakpoints.up('lg'));

  const loadDataStyle = {
    height: isLgOrLarger ? '66vh' : 'auto', // Applies '66vh' height for 'md' and larger screens, 'auto' for smaller
  };

  const boxPlotStyle = {
    height:'33vh', // Applies '33vh' height for 'md' and larger screens, 'auto' for smaller
  };

  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

   

  return (



<Grid container>
  <Grid item xs={12} md={6} lg={4} style={loadDataStyle}>
         <LoadData     
             handleFormSubmitParent={handleFormDataSubmit}
           /> 
  </Grid>
  
  <Grid item xs={12} md={6} lg={4} container   direction={isMdOrLarger ? "column" : "row" }>
    <Grid item xs={12} sm={6} style={{ height: isMdOrLarger ? '50%' : '33vh' }}>
    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[0]} />
    </Grid>
    <Grid item xs={12} sm={6} style={{ height: isMdOrLarger ? '50%' : '33vh' }}>

    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[1]} />
    </Grid>
  </Grid>

  <Grid item xs={12} sm = {12} lg={4} container direction={isLgOrLarger ? "column" : "row" } >
  <Grid item xs={12} sm={6} style={{ height: isLgOrLarger ? '50%' : '33vh' }}>
    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[2]} />
    </Grid>
    <Grid item xs={12} sm={6} style={{ height: isLgOrLarger ? '50%' : '33vh' }}>

    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[3]} />
    </Grid>
  </Grid>

  <Grid item container  style={{marginTop : '1%'}}>
    <Grid item container xs={12} lg={8}>
      <Grid item xs={12} style={{ height:  '5vh' }} >
        <BoxTitle></BoxTitle>
      </Grid>
      <Grid item xs={12} sm={6} md={3} style={{ height:  '33vh' }} >
        <BoxChart attribute={"LstepLength"}></BoxChart>
      </Grid>
      <Grid item xs={12} sm={6} md={3}  style={{ height:  '33vh' }}>
        <BoxChart attribute={"timeRgait"}></BoxChart>
      </Grid>
      <Grid item xs={12} sm={6} md={3}   style={{ height:  '33vh' }}>
        <BoxChart attribute={"RstepLength"}></BoxChart>
      </Grid>
      <Grid item xs={12} sm={6} md={3}   style={{ height:  '33vh' }}>
        <BoxChart attribute={"GaitSpeed"}></BoxChart>
      </Grid>
    </Grid>
  <Grid item xs={12} lg={4} style={{ height:  '33vh'}} >
  <Grid item xs={12} style={{ height:  '5vh' }} >
        <BoxTitle></BoxTitle>
      </Grid>
  <Grid item xs ={12}  style={{ height:  '33vh', padding: '10px'}} >
    <RadarChart    style={{ boxSizing: 'border-box' }}></RadarChart>
  </Grid>
    </Grid>
  </Grid>
</Grid>



    );
};