import "./control-panel.css";
import { DistributionNumeric } from "./distribution-numeric";

export const ControlPanel = (props) => {
  // console.log(props);
  return (
    <>
      <div
        className="col-md-4 text-dark"
        style={{ minWidth: "400px", height: "100%", overflow: "auto" }}
      >
        <div className="row">
          <div className="col-6">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ marginTop: "10px" }}
            >
              Add trial
            </button>
            <ul className="dropdown-menu">
              <li>
                <span className="dropdown-item">010405sb</span>
              </li>
              <li>
                <span className="dropdown-item">010505mm</span>
              </li>
            </ul>

            <button
              className="btn btn-success dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ marginTop: "10px", marginLeft: "10px" }}
            >
              Select trial
            </button>
            <ul className="dropdown-menu checkbox-menu allow-focus">
              <li>
                <label>
                  <input type="checkbox" /> 010405sb
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" /> 010505mm
                </label>
              </li>
            </ul>

            <div>
              <h5 style={{ textDecoration: "underline", marginTop: "10px" }}>
                Filter options
              </h5>
            </div>

            <div>
              <p className="d-inline-block">Sex: </p>
              <div
                className="form-check form-check-inline"
                style={{ marginLeft: "10px" }}
              >
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={props.panelId + "inlineCheckbox1"}
                />
                <label className="form-check-label" htmlFor="inlineCheckbox1">
                  Male
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={props.panelId + "inlineCheckbox2"}
                />
                <label className="form-check-label" htmlFor="inlineCheckbox2">
                  Female
                </label>
              </div>
            </div>
          </div>

          <div className="col-6">
            <h5 style={{ marginTop: "10px" }}>Data Type: </h5>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={props.panelId + "flexRadioDefault"}
                id={props.panelId + "flexRadioDefault1"}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Ground Reaction Forces
              </label>
            </div>
            <div className="form-check d-inline-block">
              <input
                className="form-check-input"
                type="radio"
                name={props.panelId + "flexRadioDefault"}
                id={props.panelId + "flexRadioDefault2"}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Joint Angles
              </label>
            </div>
          </div>
        </div>

        <div>
          <DistributionNumeric var="Age" color={props.boxPlotColor} />
          <DistributionNumeric var="Height" color={props.boxPlotColor} />
          <DistributionNumeric var="Weight" color={props.boxPlotColor} />
          <DistributionNumeric var="Thigh" color={props.boxPlotColor} />
          <DistributionNumeric var="Shank" color={props.boxPlotColor} />
          <DistributionNumeric var="Foot" color={props.boxPlotColor} />
        </div>
      </div>
    </>
  );
};

// export default ControlPanel;
