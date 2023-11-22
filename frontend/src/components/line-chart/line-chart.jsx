import React, { useState, useRef, useEffect } from "react";
import "./line-chart.css";
import * as d3 from "d3";

export const LineChart = (props) => {
  const [resetToggle, setResetToggle] = useState(false); // on getting new data, reset the chart and again check the checkboxes
  const [dataToPlot, setDataToPlot] = useState([]); // from checkboxes which lines to plot (ex: [L-VT, L-AP])
  const [toggleDrawLines, setToggleDrawLines] = useState(false); // after checking the checkboxes, draw the lines

  // checkbox states
  const [cbox1, setCbox1] = useState(false);
  const [cbox2, setCbox2] = useState(false);
  const [cbox3, setCbox3] = useState(false);
  const [cbox4, setCbox4] = useState(false);

  // chart axis limits
  const [maxX, setMaxX] = useState("");
  const [maxY, setMaxY] = useState("");
  const [minX, setMinX] = useState("");
  const [minY, setMinY] = useState("");

  // line chart container
  const lineChartContainer = useRef(null);
  const [width, setWidth] = useState();
  const margin = { top: 30, right: 30, bottom: 40, left: 70 };
  const height = 250 - margin.top - margin.bottom;

  // This function calculates width and height of the container
  const getSvgContainerSize = () => {
    let width =
      lineChartContainer.current.clientWidth - margin.left - margin.right;
    // console.log(newWidth);
    setWidth(width);
  };

  useEffect(() => {
    // detect 'width' and 'height' on render
    getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener("resize", getSvgContainerSize);
    // cleanup event listener
    return () => window.removeEventListener("resize", getSvgContainerSize);
  }, []);

  // color dictionary for the lines in line chart
  const colorDict = {
    VT: "#1b9e77",
    AP: "#d95f02",
    ML: "#7570b3",
    foot: "#e7298a",
    thigh: "#66a61e",
    shank: "#e6ab02",
    trunk: "#a6761d",
  };

  // ref for svg
  const svgRef = useRef();

  // step 1: check if new data received. if yes, then have checkbox1 true and then goto useffect for checkboxes
  useEffect(() => {
    setResetToggle(!resetToggle);

    d3.select(svgRef.current).selectAll(".saved-line").remove();

    if (!cbox1 && !cbox2 && !cbox3 && !(cbox4 && props.dataType === "jnt")) {
      setCbox1(true);
    }
  }, [props.data]);

  // step 2: check if checkboxes are changed. if yes, reset chart, gather which data to plot, set axis limits, and then goto useffect for drawing lines
  useEffect(() => {
    // console.log(props.data);
    // remove line charts and the axis
    d3.select(svgRef.current).selectAll(".line-charts").remove();

    let MX = -Infinity,
      mX = Infinity,
      MY = -Infinity,
      mY = Infinity;

    let linesToPlot = [];
    let foot = props.title === "Left side" ? "L" : "R";
    let hyphen = props.dataType === "grf" ? "-" : "";
    let dLines = false;

    const processCheckbox = (cbox, grf_line, jnt_line) => {
      let dType;
      if (cbox) {
        if (jnt_line === "trunk") {
          dType = jnt_line;
          linesToPlot.push(dType);
        } else {
          dType = props.dataType === "grf" ? grf_line : jnt_line;
          linesToPlot.push(foot + hyphen + dType);
        }
        MX = Math.max(
          MX,
          d3.max(props.data, (d) => d.time)
        );
        mX = Math.min(
          mX,
          d3.min(props.data, (d) => d.time)
        );
        MY = Math.max(
          MY,
          d3.max(props.data, (d) =>
            jnt_line === "trunk" ? d[dType] : d[foot + hyphen + dType]
          )
        );
        mY = Math.min(
          mY,
          d3.min(props.data, (d) =>
            jnt_line === "trunk" ? d[dType] : d[foot + hyphen + dType]
          )
        );
        dLines = true;
      }
    };

    if (props.data !== undefined && props.data.length > 0) {
      processCheckbox(cbox1, "VT", "foot");
      processCheckbox(cbox2, "AP", "shank");
      processCheckbox(cbox3, "ML", "thigh");
      if (props.dataType === "jnt") processCheckbox(cbox4, "", "trunk");
    }

    setMaxX(MX);
    setMaxY(MY);
    setMinX(mX);
    setMinY(mY);

    setDataToPlot(linesToPlot);
    if (dLines) {
      setToggleDrawLines(!toggleDrawLines);
    } else {
      // console.log("no lines to plot");

    }
  }, [cbox1, cbox2, cbox3, cbox4, resetToggle, width]);

  // step 3: draw lines
  useEffect(() => {
    if (props.data !== undefined && props.data.length > 0) {

      const svg = d3
        .select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class", "line-charts")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain([minX, maxX]).range([0, width]);
      const y = d3
        .scaleLinear()
        .domain([Math.min(0, minY), maxY])
        .range([height, 0]);

      const xAxisTicks = x.ticks().filter((tick) => Number.isInteger(tick));
      if (!xAxisTicks.includes(0)) {
        xAxisTicks.push(0); // Add 0 to the tick values if it's not present
      }

      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .style("font-size", "14")
        .style("font-family", "sans-serif")
        .call(
          d3.axisBottom(x).tickValues(xAxisTicks).tickFormat(d3.format("d"))
        );

      svg
        .append("g")
        .attr("class", "y-axis")
        .style("font-family", "sans-serif")
        .style("font-size", "14")
        .call(d3.axisLeft(y).ticks(5));

      // gridlines

      // svg
      //   .append("g")
      //   .attr("class", "y-gridlines")
      //   .call(d3.axisLeft(y).tickSize(-width).ticks(5).tickFormat(""))
      //   .selectAll(".tick line")
      //   .attr("stroke-opacity", 0.2);

      svg.select(".y-gridlines .domain").remove(); // Remove the extra line

      svg
        .append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 4)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "16px")
        .text("time (sec)");

      svg
        .append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "sans-serif")
        .text(
          props.dataType === "grf" ? "Ground Reaction Forces" : "Joint Angles"
        );

      for (let i = 0; i < dataToPlot.length; i++) {
        let str =
          dataToPlot[i] !== "trunk" ? dataToPlot[i].slice(1) : dataToPlot[i];
        // remove any hyphen
        str = str.replace("-", "");
        const color = colorDict[str];

        svg
          .append("path")
          .datum(props.data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("class", "line")
          .attr(
            "d",
            d3
              .line()
              .x(function (d) {
                return x(d.time);
              })
              .y(function (d) {
                return y(d[dataToPlot[i]]);
              })
              .curve(d3.curveMonotoneX)
          );
      }
    }
  }, [toggleDrawLines]);






  return (
    <div
      ref={lineChartContainer}
      style={{ textAlign: "center", minWidth: "400", marginTop: "10px" }}
    >
      {/* show title and checkboxes only if props.data available */}
      {/* reduce the else code */}

      {props.data !== undefined && props.data.length > 0 ? (
        <>
          {/* <h5>{props.title}</h5> */}

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              value={props.dataType === "grf" ? "VT" : "foot"}
              style={{
                backgroundColor: cbox1
                  ? colorDict[props.dataType === "grf" ? "VT" : "foot"]
                  : "#fff",
              }}
              checked={cbox1}
              onChange={() => {
                setCbox1(!cbox1);
              }}
            />
            <label className="form-check-label">
              {props.dataType === "grf" ? "Vertical" : "Foot"}
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              style={{
                backgroundColor: cbox2
                  ? colorDict[props.dataType === "grf" ? "AP" : "shank"]
                  : "#fff",
              }}
              value={props.dataType === "grf" ? "AP" : "shank"}
              checked={cbox2}
              onChange={() => {
                setCbox2(!cbox2);
              }}
            />
            <label className="form-check-label">
              {props.dataType === "grf" ? "Asterior-Posterior" : "Shank"}
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              style={{
                backgroundColor: cbox3
                  ? colorDict[props.dataType === "grf" ? "ML" : "thigh"]
                  : "#fff",
              }}
              value={props.dataType === "grf" ? "ML" : "thigh"}
              checked={cbox3}
              onChange={() => {
                setCbox3(!cbox3);
              }}
            />
            <label className="form-check-label">
              {props.dataType === "grf" ? "Medio-Lateral" : "Thigh"}
            </label>
          </div>

          <div className="form-check form-check-inline">
            {props.dataType === "jnt" ? (
              <>
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{
                    backgroundColor: cbox4 ? colorDict["trunk"] : "#fff",
                  }}
                  value="trunk"
                  checked={cbox4}
                  onChange={() => {
                    setCbox4(!cbox4);
                  }}
                />
                <label className="form-check-label">Trunk</label>
              </>
            ) : (
              <></>
            )}
          </div>

          {/* add touch down, add lift off buttons */}

          <svg ref={svgRef}></svg>

          
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
