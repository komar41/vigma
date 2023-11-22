import React, {useState } from "react";

export const LoadData = (props) => {
  const [fileLocation, setFileLocation] = useState("");

  const [pInput, setPInput] = useState("");
  const [patientId, setPatientId] = useState("");
  const [panelNo, setPanelNo] = useState("");


  const [trialIdx, setTrialIdx] = useState("");

  const [dataType, setDataType] = useState("");


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

  return (
    <>
      <div style={{ marginTop: "10px" }}>
        

        <div className="input-group mb-3">
          <span className="input-group-text">File Location</span>
          <input
            type="text"
            className="form-control"
            id="file_location"
            name="file_location"
            required
            value={fileLocation}
            onChange={(e) => setFileLocation(e.target.value)}
          />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text">Patient Id</span>
          <input
            type="text"
            className="form-control"
            required
            value={pInput}
            onChange={(e) => setPInput(e.target.value)}
          />
        </div>


            <div className="d-flex align-items-center">
              <div className="input-group" >
                <span className="input-group-text">Trial Id</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ textAlign: "center" }}
                  id="trial_id"
                  value={trialIdx}
                  onChange={(e) => setTrialIdx(e.target.value)}
                />
              </div>

              
            </div>

            <div className="row" style={{ marginTop: "10px" }}>
              <h6 className="col-md-4" style={{ textDecoration: "underline" }}>
                Data Type
              </h6>
            </div>

            <div style={{}}>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  value="macro"
                  checked={dataType === "macro"}
                  onChange={(e) => {
                    setDataType(e.target.value);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="inlineRadio1"
                  // style={{ width: "100px" }}
                >
                  Macros (Z)
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  checked={dataType === "grf"}
                  value="grf"
                  onChange={(e) => {
                    setDataType(e.target.value);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="inlineRadio2"
                  // style={{ minWidth: "150px" }}
                >
                  Ground Reaction Force
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  checked={dataType === "jnt"}
                  value="jnt"
                  onChange={(e) => {
                    setDataType(e.target.value);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="inlineRadio3"
                  // style={{ width: "100px" }}
                >
                  Joint Angles
                </label>
              </div>
            </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Panel No.</span>
            <input
                type="text"
                className="form-control"
                id="panel_id"
                name="panel_id"
                // disabled={!toggleSetPatient}
                // required
                // value={pInput}
                onChange={(e) => setPanelNo(e.target.value)}
            />

            <input
              type="button"
              className="btn btn-primary"
              value="set"
              onClick={() => {
                loadPatientData();
                
              }}
            />
          </div>
          
        

        
      </div>
    </>
  );
};
