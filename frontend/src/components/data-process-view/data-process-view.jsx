import React, { useState, useEffect } from "react";
import { LoadData } from "./load-data";
import { LineChart } from "../line-chart/line-chart";
import { BoxChart } from "../box-chart/box-chart";

export const DataProcessView = (props) => {
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState("");
  const [patientId, setPatientId] = useState("");
  const [trialId, setTrialId] = useState("");

  const [data1, setData1] = useState([]);
  const [dataType1, setDataType1] = useState("");
  const [patientId1, setPatientId1] = useState("");
  const [trialId1, setTrialId1] = useState("");

  const [data2, setData2] = useState([]);
  const [dataType2, setDataType2] = useState("");
  const [patientId2, setPatientId2] = useState("");
  const [trialId2, setTrialId2] = useState("");

  const [data3, setData3] = useState([]);
  const [dataType3, setDataType3] = useState("");
  const [patientId3, setPatientId3] = useState("");
  const [trialId3, setTrialId3] = useState("");

  const [data4, setData4] = useState([]);
  const [dataType4, setDataType4] = useState("");
  const [patientId4, setPatientId4] = useState("");
  const [trialId4, setTrialId4] = useState("");

  const [panelNo, setPanelNo] = useState("");

  useEffect(() => {
    if (panelNo == 1) {
      console.log("panelNo 1");
      setData1(data);
      setDataType1(dataType);
      setPatientId1(patientId);
      setTrialId1(trialId);
    } else if (panelNo == 2) {
      setData2(data);
      setDataType2(dataType);
      setPatientId2(patientId);
      setTrialId2(trialId);
    } else if (panelNo == 3) {
      setData3(data);
      setDataType3(dataType);
      setPatientId3(patientId);
      setTrialId3(trialId);
    } else if (panelNo == 4) {
      setData4(data);
      setDataType4(dataType);
      setPatientId4(patientId);
      setTrialId4(trialId);
    }
  }, [panelNo]);
  

  const handleDataLoaded = (loadedData) => {
    // Handle the loaded data here
    // console.log("Data loaded:", loadedData);
    setData(loadedData);
  };

  const handleDataTypeChange = (pickedDataType) => {
    // Handle the data type change here
    // console.log("Data type changed:", pickedDataType);
    setDataType(pickedDataType);
  };

  const handlePatientIDChange = (pickedPatientID) => {
    // Handle the patient ID change here
    // console.log("Patient ID changed:", pickedPatientID);
    setPatientId(pickedPatientID);
  };

  const handleTrialIDChange = (pickedTrialID) => {
    // Handle the trial ID change here
    // console.log("Trial ID changed:", pickedTrialID);
    setTrialId(pickedTrialID);
  };

  const handlePanelNoChange = (pickedPanelNo) => {
    // Handle the panel number change here
    // console.log("Panel number changed:", pickedPanelNo);
    setPanelNo(pickedPanelNo);
  }

  return (
    <>
      <div
        // className="tab-pane fade show active"
        // id="nav-home"
        // role="tabpanel"
        // aria-labelledby="nav-home-tab"
        // style={{ height: "100%" }}
      >
        <div className="container-fluid" style={{ height: "100%" }}>
          <div className="row" style={{ marginTop: "5px" }}>
            <div className="col-lg-2">
              <LoadData
                onDataLoaded={handleDataLoaded}
                onDataTypeChanged={handleDataTypeChange}
                onPatientIDChanged={handlePatientIDChange}
                onTrialIDChanged={handleTrialIDChange}
                onPanelNoChange={handlePanelNoChange}
              />
            </div>
            <div className="col-lg-5">
              <LineChart
                color="#d95f02"
                data={data1}
                dataType={dataType1}
                patientId={patientId1}
                trialId={trialId1}
              />
            </div>
            <div className="col-lg-5">
              <LineChart
                color="#7570b3"
                data={data2}
                dataType={dataType2}
                patientId={patientId2}
                trialId={trialId2}
              />
            </div>


            <div className="col-lg-5 offset-lg-2">
              <LineChart
                color="#d95f02"
                data={data3}
                dataType={dataType3}
                patientId={patientId3}
                trialId={trialId3}
              />
            </div>
            <div className="col-lg-5">
              <LineChart
                color="#7570b3"
                data={data4}
                dataType={dataType4}
                patientId={patientId4}
                trialId={trialId4}
              />
            </div>

            <div className="col-lg-7 offset-lg-2">
              <BoxChart
                color="#d95f02"
                data={data}
                dataType={dataType}
                patientId={patientId}
                trialId={trialId}
              />
            </div>
            <div className="col-lg-3">
              <BoxChart
                color="#7570b3"
                data={data}
                dataType={dataType}
                patientId={patientId}
                trialId={trialId}
              />
            </div>  
          </div>
        </div>
      </div>
    </>
  );
};
