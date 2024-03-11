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
  const [lineChartData1Group1Data, setlineChartData1Group1Data] = useState([]); // Add state for group 1 data
  const [lineChartData2Group1Data, setlineChartData2Group1Data] = useState([]); // Add state for group 2 data
  const [lineChartData3Group1Data, setlineChartData3Group1Data] = useState([]); // Add state for group 1 data
  const [lineChartData4Group1Data, setlineChartData4Group1Data] = useState([]); // Add state for group 2 data
  const [lineChartData5Group1Data, setlineChartData5Group1Data] = useState([]); // Add state for group 1 data
  

  const [lineChartData1Group2Data, setlineChartData1Group2Data] = useState([]); // Add state for group 1 data
  const [lineChartData2Group2Data, setlineChartData2Group2Data] = useState([]); // Add state for group 2 data
  const [lineChartData3Group2Data, setlineChartData3Group2Data] = useState([]); // Add state for group 1 data
  const [lineChartData4Group2Data, setlineChartData4Group2Data] = useState([]); // Add state for group 2 data
  const [lineChartData5Group2Data, setlineChartData5Group2Data] = useState([]); // Add state for group 1 data

  const [lineChartData1Group1Spread, setlineChartData1Group1Spread] = useState(); // Add state for group 1 data
  const [lineChartData2Group1Spread, setlineChartData2Group1Spread] = useState(); // Add state for group 2 data
  const [lineChartData3Group1Spread, setlineChartData3Group1Spread] = useState(); // Add state for group 1 data
  const [lineChartData4Group1Spread, setlineChartData4Group1Spread] = useState(); // Add state for group 2 data
  const [lineChartData5Group1Spread, setlineChartData5Group1Spread] = useState(); // Add state for group 1 data
  const [lineChartData1Group2Spread, setlineChartData1Group2Spread] = useState(); // Add state for group 1 data
  const [lineChartData2Group2Spread, setlineChartData2Group2Spread] = useState(); // Add state for group 2 data
  const [lineChartData3Group2Spread, setlineChartData3Group2Spread] = useState(); // Add state for group 1 data
  const [lineChartData4Group2Spread, setlineChartData4Group2Spread] = useState(); // Add state for group 2 data
  const [lineChartData5Group2Spread, setlineChartData5Group2Spread] = useState(); // Add state for group 1 data


  const [lineChartData1Group1Label, setlineChartData1Group1Label] = useState(); // Add state for group 1 data
  const [lineChartData2Group1Label, setlineChartData2Group1Label] = useState(); // Add state for group 2 data
  const [lineChartData3Group1Label, setlineChartData3Group1Label] = useState(); // Add state for group 1 data
  const [lineChartData4Group1Label, setlineChartData4Group1Label] = useState(); // Add state for group 2 data
  const [lineChartData5Group1Label, setlineChartData5Group1Label] = useState(); // Add state for group 1 data
  const [lineChartData1Group2Label, setlineChartData1Group2Label] = useState(); // Add state for group 1 data
  const [lineChartData2Group2Label, setlineChartData2Group2Label] = useState(); // Add state for group 2 data
  const [lineChartData3Group2Label, setlineChartData3Group2Label] = useState(); // Add state for group 1 data
  const [lineChartData4Group2Label, setlineChartData4Group2Label] = useState(); // Add state for group 2 data
  const [lineChartData5Group2Label, setlineChartData5Group2Label] = useState(); // Add state for group 1 data


  const [lineChartData1Group1Footing, setlineChartData1Group1Footing] = useState(); // Add state for group 1 data
  const [lineChartData2Group1Footing, setlineChartData2Group1Footing] = useState(); // Add state for group 2 data
  const [lineChartData3Group1Footing, setlineChartData3Group1Footing] = useState(); // Add state for group 1 data
  const [lineChartData4Group1Footing, setlineChartData4Group1Footing] = useState(); // Add state for group 2 data
  const [lineChartData5Group1Footing, setlineChartData5Group1Footing] = useState(); // Add state for group 1 data
  const [lineChartData1Group2Footing, setlineChartData1Group2Footing] = useState(); // Add state for group 1 data
  const [lineChartData2Group2Footing, setlineChartData2Group2Footing] = useState(); // Add state for group 2 data
  const [lineChartData3Group2Footing, setlineChartData3Group2Footing] = useState(); // Add state for group 1 data
  const [lineChartData4Group2Footing, setlineChartData4Group2Footing] = useState(); // Add state for group 2 data
  const [lineChartData5Group2Footing, setlineChartData5Group2Footing] = useState(); // Add state for group 1 data




    const handleFormDataSubmit = async (formData) => {
      try {
        // Perform PUT request with formData, responseType 'blob' is crucial for binary data
        setFormDataP(formData);
        console.log("Form Data", formDataP);

        // if (formData.panelOptions ===1){
        //   setLineChartData1(formData);
        // }
        // else if (formData.panelOptions ===2){
        //   setLineChartData2(formData);
        // }
        // else if (formData.panelOptions ===3){
        //   setLineChartData3(formData);  
        // }
        // else if (formData.panelOptions ===4){
        //   setLineChartData4(formData);
        // }
        // else {
        //   setLineChartData5(formData);
        // }

        const response = await axios.put('http://localhost:5000/process-form-data', formData, { responseType: 'blob' });
  
        // Create a new Blob object using the response data
        const blob = new Blob([response.data], { type: 'application/zip' });
        const zip = new JSZip();
  
        // Unzip the blob
        const contents = await zip.loadAsync(blob);
  
        let allCsvData = []; // Array to store data from all CSVs

        let group1File = "df_";
        let group2File = "df_";

        group1File += formDataP.group1Footing === "left" ? "L_" : "R_";
        group1File += formDataP.group1Cycle === "left"? "Lcycle_1.csv": "Rcycle_1.csv";
        console.log("Group 1 File", group1File);

        group2File += formDataP.group2Footing === "left" ? "L_" : "R_";
        group2File += formDataP.group2Cycle === "left"? "Lcycle_2.csv": "Rcycle_2.csv";
        console.log("Group 2 File", group2File);

  
        // Iterate over each file in the ZIP
        for (const [filename, file] of Object.entries(contents.files)) {
          if (!file.dir && filename.endsWith('.csv')) {
            const fileContent = await file.async("string"); // Get the file content as string
            
            // Parse CSV data
            const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
            allCsvData.push({ filename, data: parsedData.data });
             if (filename === group1File) {
              // setGroup1Data(parsedData.data);
              console.log("form Data Panel", formData.panelOptions);
              if (formData.panelOptions ===1){
                console.log("Group1 Data")
                
                setlineChartData1Group1Data(parsedData.data);
                setlineChartData1Group1Spread(formData.isGroup1Checked);
                setlineChartData1Group1Label(formData.group1Label);
                setlineChartData1Group1Footing(formData.group1Footing);
              }
              else if (formData.panelOptions ===2){
                setlineChartData2Group1Data(parsedData.data);
                setlineChartData2Group1Spread(formData.isGroup1Checked);
                setlineChartData2Group1Label(formData.group1Label);
                setlineChartData2Group1Footing(formData.group1Footing);
                
              }
              else if (formData.panelOptions ===3){
                setlineChartData3Group1Data(parsedData.data);  
                setlineChartData3Group1Spread(formData.isGroup1Checked);
                setlineChartData3Group1Label(formData.group1Label);
                setlineChartData3Group1Footing(formData.group1Footing);
              }
              else if (formData.panelOptions ===4){
                setlineChartData4Group1Data(parsedData.data);
                setlineChartData4Group1Spread(formData.isGroup1Checked);
                setlineChartData4Group1Label(formData.group1Label);
                setlineChartData4Group1Footing(formData.group1Footing);
              }
              else {
                setlineChartData5Group1Data(parsedData.data);
                setlineChartData5Group1Spread(formData.isGroup1Checked);
                setlineChartData5Group1Label(formData.group1Label);
                setlineChartData5Group1Footing(formData.group1Footing);
              }
      
              console.log("Group 1 Data", parsedData.data);
          }
          if (filename === group2File) {
            // setGroup2Data(parsedData.data);
            
            console.log("Group 2 Data", parsedData.data);


            if (formData.panelOptions ===1){
              setlineChartData1Group2Data(parsedData.data);
              setlineChartData1Group2Spread(formData.isGroup2Checked);
              setlineChartData1Group2Label(formData.group2Label);
              setlineChartData1Group2Footing(formData.group2Footing);

              console.log("Group2 Data")
              console.log("Group 2 Data", lineChartData1Group2Data);
            }
            else if (formData.panelOptions ===2){
              setlineChartData2Group2Data(parsedData.data);
              setlineChartData2Group2Spread(formData.isGroup2Checked);
              setlineChartData2Group2Label(formData.group2Label);
              setlineChartData2Group2Footing(formData.group2Footing);
            }
            else if (formData.panelOptions ===3){
              setlineChartData3Group2Data(parsedData.data);  
              setlineChartData3Group2Spread(formData.isGroup2Checked);
              setlineChartData3Group2Label(formData.group2Label);
              setlineChartData3Group2Footing(formData.group2Footing);
            }
            else if (formData.panelOptions ===4){
              setlineChartData4Group2Data(parsedData.data);
              setlineChartData4Group2Spread(formData.isGroup2Checked);
              setlineChartData4Group2Label(formData.group2Label);
              setlineChartData4Group2Footing(formData.group2Footing);
            }
            else {
              setlineChartData5Group2Data(parsedData.data);
              setlineChartData5Group2Spread(formData.isGroup2Checked);
              setlineChartData5Group2Label(formData.group2Label);
              setlineChartData5Group2Footing(formData.group2Footing);
            }
        }

        }
      }
  
        // Update state with all parsed CSV data
        // setCsvData(allCsvData);
        console.log("CSV Data", allCsvData);
  
      } catch (error) {
        console.error('Error while processing form data:', error);
      }
    };



  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4} style={{  padding: '20px' }}>

           <LoadData style={{  padding: '20px' }}
           handleFormSubmitParent={handleFormDataSubmit}
          /> 
        </Grid>
 
        <Grid item xs={12} md={6} lg={4} style={{ padding: '20px' }}>
          <LineChart group1Data={lineChartData1Group1Data} group2Data={lineChartData1Group2Data} 
          group1Label={lineChartData1Group1Label} group2Label={lineChartData1Group2Label} 
          group1Footing={lineChartData1Group1Footing} group2Footing={lineChartData1Group2Footing}
          group1Spread={lineChartData1Group1Spread} group2Spread={lineChartData1Group2Spread} />
          </Grid>
          <Grid item xs={12} md={6} lg={4} style={{  padding: '20px' }}>
          <LineChart group1Data={lineChartData2Group1Data} group2Data={lineChartData2Group2Data} 
          group1Label={lineChartData2Group1Label} group2Label={lineChartData2Group2Label} 
          group1Footing={lineChartData2Group1Footing} group2Footing={lineChartData2Group2Footing}
          group1Spread={lineChartData2Group1Spread} group2Spread={lineChartData2Group2Spread} />
          </Grid>

          <Grid item xs={12} md={6} lg={4} style={{ padding: '20px' }}>
          <LineChart group1Data={lineChartData3Group1Data} group2Data={lineChartData3Group2Data} 
          group1Label={lineChartData3Group1Label} group2Label={lineChartData3Group2Label} 
          group1Footing={lineChartData3Group1Footing} group2Footing={lineChartData3Group2Footing}
          group1Spread={lineChartData3Group1Spread} group2Spread={lineChartData3Group2Spread} />
          </Grid>

          <Grid item xs={12} md={6} lg={4} style={{  padding: '20px' }}>
          <LineChart group1Data={lineChartData4Group1Data} group2Data={lineChartData4Group2Data} 
          group1Label={lineChartData4Group1Label} group2Label={lineChartData4Group2Label} 
          group1Footing={lineChartData4Group1Footing} group2Footing={lineChartData4Group2Footing}
          group1Spread={lineChartData4Group1Spread} group2Spread={lineChartData4Group2Spread} />
          </Grid>

          <Grid item xs={12} md={6} lg={4} style={{ padding: '20px' }}>
          <LineChart group1Data={lineChartData5Group1Data} group2Data={lineChartData5Group2Data} 
          group1Label={lineChartData5Group1Label} group2Label={lineChartData5Group2Label} 
          group1Footing={lineChartData5Group1Footing} group2Footing={lineChartData5Group2Footing}
          group1Spread={lineChartData5Group1Spread} group2Spread={lineChartData5Group2Spread} />
          </Grid>


      </Grid>
    );
};
