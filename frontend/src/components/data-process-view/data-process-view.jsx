import React, { useState } from "react";
import { LoadData } from "./loadData";
//import { LineChart } from "../line-chart/line-chart";
import  LineChart  from "../lineChart/lineChart";
import { Grid } from '@mui/material';
import axios from 'axios';

import JSZip from 'jszip';
import Papa from 'papaparse';


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
        `df_${formData.group1Footing === "left" ? "L_" : "R_"}${formData.group1GaitCycle === "left" ? "Lcycle_1.csv" : "Rcycle_1.csv"}`,
        `df_${formData.group2Footing === "left" ? "L_" : "R_"}${formData.group2GaitCycle === "left" ? "Lcycle_2.csv" : "Rcycle_2.csv"}`,
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
    




    // const handleFormDataSubmit2 = async (formData) => {
    //   try {
    //     let group1File = "df_";
    //     let group2File = "df_";

    //     group1File += formDataP.group1Footing === "left" ? "L_" : "R_";
    //     group1File += formDataP.group1Cycle === "left"? "Lcycle_1.csv": "Rcycle_1.csv";
    //     console.log("Group 1 File", group1File);

    //     group2File += formDataP.group2Footing === "left" ? "L_" : "R_";
    //     group2File += formDataP.group2Cycle === "left"? "Lcycle_2.csv": "Rcycle_2.csv";
    //     console.log("Group 2 File", group2File);

  
    //     // Iterate over each file in the ZIP
    //     for (const [filename, file] of Object.entries(csvData)) {
    //       if (!file.dir && filename.endsWith('.csv')) {
    //         const fileContent = await file.async("string"); // Get the file content as string
            
    //         // Parse CSV data
    //         const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    //         // allCsvData.push({ filename, data: parsedData.data });
    //          if (filename === group1File) {
    //           // setGroup1Data(parsedData.data);
    //           console.log("form Data Panel", formData.panelOptions);
    //           if (formData.panelOptions ===1){
    //             console.log("Group1 Data")
                
    //             setlineChartData1Group1Data(parsedData.data);
    //             setlineChartData1Group1Spread(formData.isGroup1Checked);
    //             setlineChartData1Group1Label(formData.group1Label);
    //             setlineChartData1Group1Footing(formData.group1Footing);
    //           }
    //           else if (formData.panelOptions ===2){
    //             setlineChartData2Group1Data(parsedData.data);
    //             setlineChartData2Group1Spread(formData.isGroup1Checked);
    //             setlineChartData2Group1Label(formData.group1Label);
    //             setlineChartData2Group1Footing(formData.group1Footing);
                
    //           }
    //           else if (formData.panelOptions ===3){
    //             setlineChartData3Group1Data(parsedData.data);  
    //             setlineChartData3Group1Spread(formData.isGroup1Checked);
    //             setlineChartData3Group1Label(formData.group1Label);
    //             setlineChartData3Group1Footing(formData.group1Footing);
    //           }
    //           else if (formData.panelOptions ===4){
    //             setlineChartData4Group1Data(parsedData.data);
    //             setlineChartData4Group1Spread(formData.isGroup1Checked);
    //             setlineChartData4Group1Label(formData.group1Label);
    //             setlineChartData4Group1Footing(formData.group1Footing);
    //           }
    //           else {
    //             setlineChartData5Group1Data(parsedData.data);
    //             setlineChartData5Group1Spread(formData.isGroup1Checked);
    //             setlineChartData5Group1Label(formData.group1Label);
    //             setlineChartData5Group1Footing(formData.group1Footing);
    //           }
      
    //           console.log("Group 1 Data", parsedData.data);
    //       }
    //       if (filename === group2File) {
    //         // setGroup2Data(parsedData.data);
            
    //         console.log("Group 2 Data", parsedData.data);


    //         if (formData.panelOptions ===1){
    //           setlineChartData1Group2Data(parsedData.data);
    //           setlineChartData1Group2Spread(formData.isGroup2Checked);
    //           setlineChartData1Group2Label(formData.group2Label);
    //           setlineChartData1Group2Footing(formData.group2Footing);

    //           console.log("Group2 Data")
    //           console.log("Group 2 Data", lineChartData1Group2Data);
    //         }
    //         else if (formData.panelOptions ===2){
    //           setlineChartData2Group2Data(parsedData.data);
    //           setlineChartData2Group2Spread(formData.isGroup2Checked);
    //           setlineChartData2Group2Label(formData.group2Label);
    //           setlineChartData2Group2Footing(formData.group2Footing);
    //         }
    //         else if (formData.panelOptions ===3){
    //           setlineChartData3Group2Data(parsedData.data);  
    //           setlineChartData3Group2Spread(formData.isGroup2Checked);
    //           setlineChartData3Group2Label(formData.group2Label);
    //           setlineChartData3Group2Footing(formData.group2Footing);
    //         }
    //         else if (formData.panelOptions ===4){
    //           setlineChartData4Group2Data(parsedData.data);
    //           setlineChartData4Group2Spread(formData.isGroup2Checked);
    //           setlineChartData4Group2Label(formData.group2Label);
    //           setlineChartData4Group2Footing(formData.group2Footing);
    //         }
    //         else {
    //           setlineChartData5Group2Data(parsedData.data);
    //           setlineChartData5Group2Spread(formData.isGroup2Checked);
    //           setlineChartData5Group2Label(formData.group2Label);
    //           setlineChartData5Group2Footing(formData.group2Footing);
    //         }
    //     }

    //     }
    //   }
  
  
    //   } catch (error) {
    //     console.error('Error while processing form data:', error);
    //   }
    // };



  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4} style={{  padding: '40px' }}>

           <LoadData style={{  padding: '20px' }}
           handleFormSubmitParent={handleFormDataSubmit}
           handleFormSubmitParent2={handleFormDataSubmit3}
          /> 
        </Grid>


  {lineChartsData.map((chartData, index) => (
    <Grid item xs={12} md={6} lg={4} key={index} style={{ padding: '40px' }}>
      <LineChart chartData={chartData} />
    </Grid>
  ))}


      </Grid>
    );
};
