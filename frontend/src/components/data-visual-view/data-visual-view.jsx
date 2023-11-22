import React, { useState, useEffect } from "react";
import { ControlPanel } from "../control-panel/control-panel";
import { LineChart } from "../line-chart/line-chart";
import { ParaCoord } from "../para-coord/para-coord";

export const DataVisualView = (props) => {
  return (
    <div
      className="tab-pane fade"
      id="nav-profile"
      role="tabpanel"
      aria-labelledby="nav-profile-tab"
      style={{ height: "100%" }}
    >
      <div className="container-fluid" style={{ height: "100%" }}>
        <div className="row row-container">
          <ControlPanel panelId="panel_1" boxPlotColor="#b3e2cd" />
          {/* <LineChart title="Left Foot" color="#d95f02" />
          <LineChart title="Right Foot" color="#7570b3" /> */}
        </div>
        <div className="row row-container">
          <ControlPanel panelId="panel_2" boxPlotColor="#9ecae1" />
          {/* <LineChart title="Left Foot" color="#d95f02" />
          <LineChart title="Right Foot" color="#7570b3" /> */}
        </div>

        <div className="row row-container">
          <ParaCoord />
        </div>
      </div>
    </div>
  );
};
