import React, {useState } from "react";
import { Dropdown, Container, Row, Col, InputGroup, FormControl, Form, Button, DropdownButton} from 'react-bootstrap';
import "./load-data.css";

// LoadData component
export const LoadData = (props) => {
  const [fileLocation, setFileLocation] = useState("");

  const [pInput, setPInput] = useState("");
  const [patientId, setPatientId] = useState("");
  const [panelNo, setPanelNo] = useState("");


  const [trialIdx, setTrialIdx] = useState("");

  const [dataType, setDataType] = useState("");

  const [trialGroup1, setTrialGroup1] = useState('');
  const [trialGroup2, setTrialGroup2] = useState('');
  const [trialGroup3, setTrialGroup3] = useState('');

  const [textInputValue, setTextInputValue] = useState('');

  const handleInputChange = (event) => {
    setTextInputValue(event.target.value);
  };


  const [panelOptions, setPanelOptions] = useState('');
  const [group, setGroup] = useState('');
  const [footing, setFooting] = useState('');

  const [gaitCycle, setGaitCycle] = useState('');


  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };


  const getParagraphStyle = () => ({
    fontSize: window.innerWidth < 576 ? '10px' : '16px',
  });



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

  return (

    <Container fluid style={{ marginTop: '10px' }}>
      <Row>
        <Col>
          <InputGroup lg={3}>
            <InputGroup.Text>File Location</InputGroup.Text>
            <FormControl
              placeholder="Enter file location"
              value={fileLocation}
              onChange={(e) => setFileLocation(e.target.value)}
            />
          </InputGroup>
          </Col>
      </Row>

      <Row>
      <Col lg={6}>

      <InputGroup >
        <InputGroup.Text style={{ width: 'auto', getParagraphStyle}}>Group 1:</InputGroup.Text>
        <DropdownButton 
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={trialGroup1 || "Select"}
          id="input-group-dropdown-1"
          alignRight
        >
          {[1, 2, 3, 4, 5].map((nulger) => (
            <Dropdown.Item key={nulger} onClick={() => setTrialGroup1(nulger)}>
              {nulger}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>

      </Col>

          <Col lg={6}>

          <InputGroup >
            <InputGroup.Text style={{ width: 'auto' }}>Group 2:</InputGroup.Text>
            <DropdownButton 
              as={InputGroup.Prepend}
              variant="outline-secondary"
              title={trialGroup2 || "Select"}
              id="input-group-dropdown-1"
              alignRight
            >
              {[1, 2, 3, 4, 5].map((nulger) => (
                <Dropdown.Item key={nulger} onClick={() => setTrialGroup2(nulger)}>
                  {nulger}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </InputGroup>

          </Col>
      </Row>
      <Row>
      <Col lg={6}>

      <InputGroup >
        <InputGroup.Text style={{ width: 'auto' }}>Group 3:</InputGroup.Text>
        <DropdownButton 
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={trialGroup3 || "Select"}
          id="input-group-dropdown-1"
          alignRight
        >
          {[1, 2, 3, 4, 5].map((nulger) => (
            <Dropdown.Item key={nulger} onClick={() => setTrialGroup3(nulger)}>
              {nulger}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>

      </Col>
      <Col lg={6}>
    
        <InputGroup >
          <FormControl
            id="textInput"
            placeholder="Stroke Patients"
            aria-label="Text input"
            aria-describedby="basic-addon1"
            value={textInputValue}
            onChange={handleInputChange}
          />
        </InputGroup>
      </Col>

      </Row>
      <Row>
      <InputGroup >
        <InputGroup.Text >Select plot options for panel :</InputGroup.Text>
        <DropdownButton 
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={panelOptions || "Select"}
          id="input-group-dropdown-1"
          alignRight
        >
          {[1, 2, 3, 4, 5].map((nulger) => (
            <Dropdown.Item key={nulger} onClick={() => setPanelOptions(nulger)}>
              {nulger}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>
    
      </Row>

      <Row>
      <Col lg={6}>

      <InputGroup >
        <InputGroup.Text style={{ width: '40%' }}>Group:</InputGroup.Text>
        <DropdownButton 
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={group || "Select"}
          id="input-group-dropdown-1"
          alignRight
        >
          {[1, 2, 3, 4, 5].map((nulger) => (
            <Dropdown.Item key={nulger} onClick={() => setGroup(nulger)}>
              {nulger}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>

      </Col>

          <Col lg={6}>

          <InputGroup >
            <InputGroup.Text style={{ width: '40%' }}>Footing:</InputGroup.Text>
            <DropdownButton 
              as={InputGroup.Prepend}
              variant="outline-secondary"
              title={footing || "Select"}
              id="input-group-dropdown-1"
              alignRight
            >
              {[1, 2, 3, 4, 5].map((nulger) => (
                <Dropdown.Item key={nulger} onClick={() => setFooting(nulger)}>
                  {nulger}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </InputGroup>

          </Col>
      </Row>

      
      <Row>
      <Col lg={6}>

      <InputGroup >
        <InputGroup.Text style={{ width: '40%' }}>Gait Cycle:</InputGroup.Text>
        <DropdownButton 
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={gaitCycle || "Select"}
          id="input-group-dropdown-1"
          alignRight
        >
          {[1, 2, 3, 4, 5].map((nulger) => (
            <Dropdown.Item key={nulger} onClick={() => setGaitCycle(nulger)}>
              {nulger}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>

      </Col>

          <Col lg={6} className="d-flex align-items-end">

          <Form.Check
        type="checkbox"
        id="checkboxExample"
        label="Show Spread"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />

          </Col>
      </Row>



    </Container>
  );
};
