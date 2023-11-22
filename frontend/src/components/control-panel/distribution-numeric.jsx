import { BoxPlot } from "./box-plot";
import { DensityPlot } from "./density-plot";

export const DistributionNumeric = (props) => {
  // console.log(props);
  return (
    <div>
      <p className="d-inline-block input-label-text">{props.var + ":"}</p>

      <input
        className="d-inline-block form-control"
        type="text"
        id={props.var + "inlineCheckbox3"}
        placeholder="0"
        style={{ width: "55px", textAlign: "center" }}
      />
      <div className="d-inline-block">
        <BoxPlot color={props.color} />
      </div>
      <input
        className="d-inline-block float-end form-control"
        type="text"
        id={props.var + "inlineCheckbox4"}
        placeholder="65"
        style={{ width: "55px", textAlign: "center" }}
      />
    </div>
  );
};
