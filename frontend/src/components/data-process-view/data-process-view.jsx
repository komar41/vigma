import React, { useState } from "react";
import { LoadData } from "./loadData";
import { Grid } from '@mui/material';
import {Paper} from '@mui/material';
import axios from 'axios';
import  LineChart  from '../lineChart/lineChart';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';



export const DataProcessView = (props) => {

  const [formDataP, setFormDataP] = useState({}); // To collect the form data and use in DataProcessView

  const [csvData, setCSVData] = useState({}); // Array to store all parsed CSV data

  const [lineChartsData, setLineChartsData] = useState([
    { active: false, plotNumber:1 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', group1Footing: '', group2Footing: '' , group1GaitCycle: '' , group2GaitCycle : '' }, // Chart 1
    { active: false, plotNumber:2 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', group1Footing: '', group2Footing: '' , group1GaitCycle: '' , group2GaitCycle : '' }, // Chart 2
    { active: false, plotNumber:3 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', group1Footing: '', group2Footing: '' , group1GaitCycle: '' , group2GaitCycle : '' }, // Chart 3
    { active: false, plotNumber:4 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', group1Footing: '', group2Footing: '' , group1GaitCycle: '' , group2GaitCycle : '' }, // Chart 4
    { active: false, plotNumber:5 , group1Data: [], group2Data: [], group1Spread: false, group2Spread: false, group1Label: '', group2Label: '', group1Footing: '', group2Footing: '' , group1GaitCycle: '' , group2GaitCycle : '' }, // Chart 5
    // Add more objects as neede for additional charts
  ]);


    const handleFormDataSubmit = async (formData) => {
      try {
        // Perform PUT request with formData, responseType 'blob' is crucial for binary data
        setFormDataP(formData);
        console.log("Form Data", formDataP);

        const response = await axios.put('http://localhost:5000/process-form-data', formData, { responseType: 'blob' });
  
        // Create a new Blob object using the response data
        const blob = new Blob([response.data], { type: 'application/zip' });
        const zip = new JSZip();
  
        // Unzip the blob
        const contents = await zip.loadAsync(blob);

        setCSVData(contents.files);
        console.log("CSV Data", csvData);
      } catch (error) {
        console.error('Error while processing form data:', error);
      }
    };
    
    const handleFormDataSubmit3 = async (formData) => {
      // Logic to process form data and obtain chart data...
      // Assume you have a function to determine which chart the data belongs to, returning an index
      const chartIndex = formData.panelOptions - 1; // You need to implement this function based on your logic

      console.log("Group 1 Footing", formData.group1Footing);
      console.log("Group 1 Cycle", formData.group1GaitCycle);
      console.log("Group 2 Footing", formData.group2Footing);
      console.log("Group 2 Cycle", formData.group2GaitCycle);

      const filenames = [
        `df_${formData.group1Footing === "Left" ? "L_" : "R_"}${formData.group1GaitCycle === "Left" ? "Lcycle_1.csv" : "Rcycle_1.csv"}`,
        `df_${formData.group2Footing === "Left" ? "L_" : "R_"}${formData.group2GaitCycle === "Left" ? "Lcycle_2.csv" : "Rcycle_2.csv"}`,
        // Add more filenames based on your requirements //         df_L_Rcycle_2.csv
    ];

    const extractCSVData = async (fileIndex) => {
      const filename = filenames[fileIndex];
      const file = csvData[filename];

      console.log("File Name", filename);
  
      if (file && !file.dir) { // Check if file exists and is not a directory
          const fileContent = await file.async("string"); // Get the file content as string
          // Parse CSV data
          const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
          return parsedData.data; // Return parsed data
      } else {
          console.error(`File ${filename} does not exist.`);
          return []; // Return empty array if file does not exist or is a directory
      }
  };
  
    const loadData = async () => {
      // Update the specific chart data based on the chartIndex
      const processedGroup1Data = await extractCSVData(0);
      const processedGroup2Data = await extractCSVData(1);
      setLineChartsData(currentData => {
        const newData = [...currentData]; // Create a shallow copy of the array
        const newChartData = { ...newData[chartIndex] }; // Create a copy of the chart data object to modify
        // Assume you have processed the formData and have the new data ready
        newChartData.active = true; // Set the chart as active
        newChartData.parameter = formData.parameter;
        newChartData.group1Data = processedGroup1Data; // Replace with actual processed data
        newChartData.group2Data = processedGroup2Data;
        newChartData.group1Spread = formData.isGroup1Checked;
        newChartData.group2Spread = formData.isGroup2Checked;
        newChartData.group1Label = formData.group1Label;
        newChartData.group2Label = formData.group2Label;
        newChartData.group1Footing = formData.group1Footing;
        newChartData.group2Footing = formData.group2Footing;
        newChartData.group1GaitCycle = formData.group1GaitCycle;
        newChartData.group2GaitCycle = formData.group2GaitCycle;        

      
        
        newData[chartIndex] = newChartData; // Update the array with the modified chart data
        
        return newData; // Return the updated array to set the state
      });

    };


    loadData();

    console.log("Line Chart Data", lineChartsData);
    };

    const theme = useTheme();
  const isLgOrLarger = useMediaQuery(theme.breakpoints.up('lg'));

  const loadDataStyle = {
    height: isLgOrLarger ? '66vh' : 'auto', // Applies '66vh' height for 'md' and larger screens, 'auto' for smaller
  };

  const boxPlotStyle = {
    height: isLgOrLarger ? '33vh' : 'auto', // Applies '33vh' height for 'md' and larger screens, 'auto' for smaller
  };

  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const grid1Height = isLgOrLarger ? '66vh' : 'auto'; // Applies '30%' height for 'md' and larger screens, 'auto' for smaller

  const isSmOrLarger = useMediaQuery(theme.breakpoints.up('sm'));

  
    

  return (



<Grid container>
  <Grid item xs={12} md={6} lg={4} style={loadDataStyle}>
         <LoadData     
             handleFormSubmitParent={handleFormDataSubmit}
             handleFormSubmitParent2={handleFormDataSubmit3}
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
    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[0]} />
    </Grid>
    <Grid item xs={12} sm={6} style={{ height: isLgOrLarger ? '50%' : '33vh' }}>

    <LineChart  style={{ height: '100%', margin: '1%',  boxSizing: 'border-box' }} chartData={lineChartsData[1]} />
    </Grid>
  </Grid>

  <Grid item container style={boxPlotStyle}>
  <Grid item xs ={12} lg={8} >
    <Paper style={{ height: '100%',margin: '1%', boxSizing: 'border-box' }}>
      Box Plot
    </Paper>
  </Grid>
  <Grid item xs ={12} lg={4} >
    <Paper style={{ height: '100%', margin: '1%', boxSizing: 'border-box' }}>
      Spider Plot
    </Paper>
  </Grid>
  </Grid>
</Grid>



    );
};



// Working Code

{/* <Grid container spacing={2}>
  {/* First Column *\/}
  <Grid item xs={4} style={{  height: '66vh'}}>
         <LoadData     
             handleFormSubmitParent={handleFormDataSubmit}
             handleFormSubmitParent2={handleFormDataSubmit3}
           /> 
  </Grid>
  
  <Grid item xs={4} container direction="column" spacing={2}>
    <Grid item xs={6}>
    <LineChart  style={{ height: '30%', marginBottom: '1%', padding: '5px', boxSizing: 'border-box' }} chartData={lineChartsData[0]} />
    </Grid>
    <Grid item xs={6}>
    <LineChart  style={{ height: '30%', marginBottom: '1%', padding: '5px', boxSizing: 'border-box' }} chartData={lineChartsData[2]} />
    </Grid>
  </Grid>

  <Grid item xs={4} container direction="column" spacing={2}>
    <Grid item xs={6}>
      <LineChart  style={{ height: '30%', marginBottom: '1%', padding: '5px', boxSizing: 'border-box' }} chartData={lineChartsData[1]} />
    </Grid>
    <Grid item xs={6}>
      <LineChart  style={{ height: '30%', marginBottom: '1%', padding: '5px', boxSizing: 'border-box' }} chartData={lineChartsData[3]} />
    </Grid>
  </Grid>


  <Grid item xs={8} style={{ height: '33vh' }}>
    <Paper style={{ height: '100%', padding: '20px', boxSizing: 'border-box' }}>
      Box Plot
    </Paper>
  </Grid>
  <Grid item xs={4} style={{ height: '33vh' }}>
    <Paper style={{ height: '100%', padding: '20px', boxSizing: 'border-box' }}>
      Spider Plot
    </Paper>
  </Grid>
</Grid> */}