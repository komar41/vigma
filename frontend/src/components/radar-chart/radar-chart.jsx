import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const sampleData = [
    { // Dataset 1
      label: "Healthy patients",
      values: {
        timeLSwing: 0.8,
        timeRSwing: 0.7,
        LstepLength: 0.9,
        RstepLength: 0.85,
        GaitSpeed: 0.9,
        timeLgait: 0.75,
        timeRgait: 0.8
      }
    },
    { // Dataset 2
      label: "Stroke Patients",
      values: {
        timeLSwing: 0.7,
        timeRSwing: 0.65,
        LstepLength: 0.8,
        RstepLength: 0.75,
        GaitSpeed: 0.85,
        timeLgait: 0.7,
        timeRgait: 0.75
      }
    }
  ];


  const sampleData2 = {
    "df1": [
      {
        "GaitSpeed": 1.1503880597014924, 
        "LstepLength": 1.3708086433917193, 
        "RstepLength": 1.2928251600195417, 
        "sid": "083117ji", 
        "timeLgait": 1.1649999999999998, 
        "timeLswing": 0.7183999999999997, 
        "timeRgait": 1.1117, 
        "timeRswing": 0.7782999999999998, 
        "trial": 49
      }, 
      {
        "GaitSpeed": 1.1882666666666666, 
        "LstepLength": 1.425799440164638, 
        "RstepLength": 1.4226670064093445, 
        "sid": "083117ji", 
        "timeLgait": 1.1517000000000002, 
        "timeLswing": 0.7049999999999998, 
        "timeRgait": 1.1150000000000002, 
        "timeRswing": 0.7267000000000001, 
        "trial": 50
      }, 
      {
        "GaitSpeed": 1.0968510638297873, 
        "LstepLength": 1.5105830193407654, 
        "RstepLength": 1.484200222660881, 
        "sid": "090717jg", 
        "timeLgait": 1.2616999999999998, 
        "timeLswing": 0.8184, 
        "timeRgait": 1.1617000000000002, 
        "timeRswing": 0.7817000000000003, 
        "trial": 42
      }, 
      {
        "GaitSpeed": 1.1452727272727272, 
        "LstepLength": 1.5840575181267738, 
        "RstepLength": 1.2281682847943574, 
        "sid": "090717jg", 
        "timeLgait": 1.0866999999999998, 
        "timeLswing": 0.7116999999999998, 
        "timeRgait": 1.0917000000000003, 
        "timeRswing": 0.7250000000000001, 
        "trial": 43
      }, 
      {
        "GaitSpeed": 1.0605671641791043, 
        "LstepLength": 1.2140818831060023, 
        "RstepLength": 1.4065018588396774, 
        "sid": "091917yd", 
        "timeLgait": 1.1216000000000002, 
        "timeLswing": 0.7150000000000001, 
        "timeRgait": 1.1083000000000003, 
        "timeRswing": 0.7366000000000001, 
        "trial": 47
      }, 
      {
        "GaitSpeed": 1.0669846153846156, 
        "LstepLength": 1.2853249973382854, 
        "RstepLength": 1.4098156339630896, 
        "sid": "091917yd", 
        "timeLgait": 1.0833, 
        "timeLswing": 0.6749999999999998, 
        "timeRgait": 1.0699999999999998, 
        "timeRswing": 0.7183000000000002, 
        "trial": 50
      }
    ], 
    "df1_mnmx": null, 
    "df2": [
      {
        "GaitSpeed": 0.885, 
        "LstepLength": 1.1237619830932177, 
        "RstepLength": 1.2053790208089077, 
        "sid": "011918ds", 
        "timeLgait": 0.875, 
        "timeLswing": 0.5300000000000002, 
        "timeRgait": 1.12, 
        "timeRswing": 0.6550000000000002, 
        "trial": 20
      }, 
      {
        "GaitSpeed": 0.7807441860465116, 
        "LstepLength": 1.0607374171471056, 
        "RstepLength": 1.2172053959075981, 
        "sid": "011918ds", 
        "timeLgait": 1.275, 
        "timeLswing": 0.9117000000000002, 
        "timeRgait": 1.0699999999999994, 
        "timeRswing": 0.6882999999999999, 
        "trial": 21
      }, 
      {
        "GaitSpeed": 0.50456, 
        "LstepLength": 0.9177993758877026, 
        "RstepLength": 0.48458296597659456, 
        "sid": "012518cm", 
        "timeLgait": 1.2502, 
        "timeLswing": 0.8502000000000001, 
        "timeRgait": 1.2383000000000002, 
        "timeRswing": 0.9467000000000003, 
        "trial": 23
      }, 
      {
        "GaitSpeed": 0.5585806451612904, 
        "LstepLength": 0.6117139915188001, 
        "RstepLength": 0.762465967808424, 
        "sid": "012518cm", 
        "timeLgait": 1.3041999999999998, 
        "timeLswing": 1.0385999999999997, 
        "timeRgait": 1.2865999999999995, 
        "timeRswing": 0.9582999999999999, 
        "trial": 24
      }, 
      {
        "GaitSpeed": 0.6916129032258065, 
        "LstepLength": 1.1097190244016586, 
        "RstepLength": 0.8173569631841441, 
        "sid": "081017bf", 
        "timeLgait": 1.5399999999999996, 
        "timeLswing": 0.9765999999999999, 
        "timeRgait": 1.7516000000000003, 
        "timeRswing": 1.3833000000000002, 
        "trial": 20
      }, 
      {
        "GaitSpeed": 0.9473684210526315, 
        "LstepLength": 1.5627863736373595, 
        "RstepLength": 0.7960508591589658, 
        "sid": "081017bf", 
        "timeLgait": 1.2515999999999998, 
        "timeLswing": 0.7599999999999998, 
        "timeRgait": 1.7083, 
        "timeRswing": 1.3767, 
        "trial": 21
      }, 
      {
        "GaitSpeed": 0.8460338983050848, 
        "LstepLength": 1.1977669224403782, 
        "RstepLength": 1.3476808050284041, 
        "sid": "082317tc", 
        "timeLgait": 1.6484000000000005, 
        "timeLswing": 1.1869000000000005, 
        "timeRgait": 1.467, 
        "timeRswing": 0.9468999999999999, 
        "trial": 10
      }, 
      {
        "GaitSpeed": 0.800282608695652, 
        "LstepLength": 1.1980982330022327, 
        "RstepLength": 1.298516382998648, 
        "sid": "082317tc", 
        "timeLgait": 1.787, 
        "timeLswing": 1.2935999999999996, 
        "timeRgait": 1.5203000000000007, 
        "timeRswing": 0.9468000000000005, 
        "trial": 11
      }, 
      {
        "GaitSpeed": 0.42355263157894735, 
        "LstepLength": 0.23017277139677034, 
        "RstepLength": 0.7015608028039176, 
        "sid": "092817fj", 
        "timeLgait": 1.2601000000000004, 
        "timeLswing": 1.0801000000000007, 
        "timeRgait": 1.1867, 
        "timeRswing": 0.6984000000000004, 
        "trial": 22
      }, 
      {
        "GaitSpeed": 0.4397692307692307, 
        "LstepLength": 0.38164427476239554, 
        "RstepLength": 0.7308782058719027, 
        "sid": "092817fj", 
        "timeLgait": 1.2915, 
        "timeLswing": 1.0514000000000001, 
        "timeRgait": 1.1367000000000003, 
        "timeRswing": 0.7149999999999999, 
        "trial": 23
      }, 
      {
        "GaitSpeed": 0.28706666666666675, 
        "LstepLength": 0.11080278125096713, 
        "RstepLength": 0.9576561174457618, 
        "sid": "100417la", 
        "timeLgait": 1.6393000000000004, 
        "timeLswing": 1.3437000000000001, 
        "timeRgait": 1.4933999999999994, 
        "timeRswing": 1.0999999999999996, 
        "trial": 21
      }, 
      {
        "GaitSpeed": 0.31193617021276593, 
        "LstepLength": 0.5489795787021097, 
        "RstepLength": 0.5517020310655063, 
        "sid": "100417la", 
        "timeLgait": 1.5629, 
        "timeLswing": 1.3238000000000003, 
        "timeRgait": 1.7267000000000001, 
        "timeRswing": 1.1983000000000006, 
        "trial": 22
      }, 
      {
        "GaitSpeed": 0.924447204968944, 
        "LstepLength": 1.1808749465515682, 
        "RstepLength": 1.152864804770647, 
        "sid": "102617mm", 
        "timeLgait": 1.3217, 
        "timeLswing": 0.8634000000000002, 
        "timeRgait": 1.3283, 
        "timeRswing": 0.8799999999999999, 
        "trial": 17
      }, 
      {
        "GaitSpeed": 0.8966369426751594, 
        "LstepLength": 1.2300000242773264, 
        "RstepLength": 1.0370071997526973, 
        "sid": "102617mm", 
        "timeLgait": 1.335, 
        "timeLswing": 0.9199999999999999, 
        "timeRgait": 1.2933000000000003, 
        "timeRswing": 0.8833000000000002, 
        "trial": 18
      }, 
      {
        "GaitSpeed": 0.9242500000000001, 
        "LstepLength": 1.0712465048203934, 
        "RstepLength": 1.1141065635953655, 
        "sid": "110717ch", 
        "timeLgait": 1.2000000000000002, 
        "timeLswing": 0.7067000000000001, 
        "timeRgait": 1.1883, 
        "timeRswing": 0.8300000000000001, 
        "trial": 18
      }, 
      {
        "GaitSpeed": 0.9203758389261747, 
        "LstepLength": 1.1138875048145784, 
        "RstepLength": 1.273892261293567, 
        "sid": "110717ch", 
        "timeLgait": 1.1949999999999998, 
        "timeLswing": 0.7266999999999997, 
        "timeRgait": 1.2367000000000004, 
        "timeRswing": 0.8600000000000003, 
        "trial": 19
      }, 
      {
        "GaitSpeed": 1.0604788732394363, 
        "LstepLength": 1.3228511634293425, 
        "RstepLength": 1.1803731932839772, 
        "sid": "111517mp", 
        "timeLgait": 1.1566, 
        "timeLswing": 0.7716000000000003, 
        "timeRgait": 1.1749999999999998, 
        "timeRswing": 0.7866, 
        "trial": 17
      }, 
      {
        "GaitSpeed": 1.10256338028169, 
        "LstepLength": 1.3020195553747596, 
        "RstepLength": 1.3425413488100535, 
        "sid": "111517mp", 
        "timeLgait": 1.1716000000000002, 
        "timeLswing": 0.77, 
        "timeRgait": 1.1750000000000003, 
        "timeRswing": 0.8033000000000001, 
        "trial": 18
      }, 
      {
        "GaitSpeed": 0.5493584905660377, 
        "LstepLength": 0.5671918880568785, 
        "RstepLength": 1.025846647197344, 
        "sid": "122017jv", 
        "timeLgait": 1.3162000000000003, 
        "timeLswing": 1.0589000000000004, 
        "timeRgait": 1.3333, 
        "timeRswing": 0.8183000000000002, 
        "trial": 29
      }, 
      {
        "GaitSpeed": 0.5494285714285714, 
        "LstepLength": 0.534637430352335, 
        "RstepLength": 0.8877557831185949, 
        "sid": "122017jv", 
        "timeLgait": 1.1969999999999996, 
        "timeLswing": 0.9895, 
        "timeRgait": 1.2732999999999999, 
        "timeRswing": 0.8099999999999996, 
        "trial": 30
      }
    ], 
    "df2_mnmx": null
  }
  

// Function to calculate mean values for each measurement across a dataset
function calculateMeans(dataset) {
  const totals = {};
  console.log("dataset",dataset);
  let count = dataset.length;

  // Initialize totals
  dataset.forEach(entry => {
    for (let key in entry) {
      if (typeof entry[key] === 'number') { // Ensure we're only processing numeric values
        totals[key] = totals[key] ? totals[key] + entry[key] : entry[key];
      }
    }
  });

  // Calculate means
  for (let key in totals) {
    totals[key] = totals[key] / count;
  }

  return totals;
}



const RadarChart = ({ chartData }) => {




  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;


    // Calculate means for each dataset
    chartData = chartData.response;
    
    if (!chartData) return ;
    console.log("radar chartData",chartData);
  const meansDf1 = calculateMeans(chartData.df1);
  const meansDf2 = calculateMeans(chartData.df2);
  
  
  // Map the means back into a structure similar to sampleData
  const updatedSampleData = [
    {
      label: "Healthy patients",
      values: meansDf1
    },
    {
      label: "Stroke Patients",
      values: meansDf2
    }
  ];
  
  
  
  console.log("updated Log",updatedSampleData);



    const parameters = ['timeLswing', 'timeRswing', 'LstepLength', 'RstepLength', 'GaitSpeed', 'timeLgait', 'timeRgait'];
    const numAxes = parameters.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const radius = Math.min(dimensions.width / 2, dimensions.height / 2);
    const radarChartCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radarGroup = svg.append("g")
      .attr("transform", `translate(${radarChartCenter.x}, ${radarChartCenter.y})`);

    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, 1]); // Assuming your data is normalized

    // Draw axes
    parameters.forEach((param, i) => {
      const angle = angleSlice * i;
      radarGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", rScale(1) * Math.cos(angle))
        .attr("y2", rScale(1) * Math.sin(angle))
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");
    });

    // Function to draw radar chart area
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Data normalization and plotting function here...
    // You would normalize your data and call the radarLine function for each dataset




    // Draw concentric circles
const levels = 5; // Number of concentric circles
const levelFactor = radius / levels;
for (let i = 0; i <= levels; i++) {
  radarGroup.selectAll(".levels")
    .data([1]) // Dummy data for circle
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", levelFactor * i)
    .style("fill", "none")
    .style("stroke", "grey")
    .style("stroke-opacity", "0.5")
    .style("stroke-width", "0.5px");
}

parameters.forEach((param, i) => {
    const sliceAngle = Math.PI * 2 / parameters.length;
    const angle = sliceAngle * i;
    const lineLength = radius; // Assuming 'radius' is the length of your axis lines
    const textOffset = -5; // Adjust this value as needed
  
    const textPosition = {
      x: Math.cos(angle) * (lineLength ),
      y: Math.sin(angle) * (lineLength + textOffset)
    };
  
    // Adjust text anchor based on the angle to improve readability
    let textAnchor = "middle";
    if (textPosition.x > 0) {
      textAnchor = "start";
    } else if (textPosition.x < 0) {
      textAnchor = "end";
    }
  
    // Append the text for the parameter name to radarGroup instead of svg
    radarGroup.append("text")
      .attr("x", textPosition.x)
      .attr("y", textPosition.y)
      .attr("dy", "0.35em") // Vertically center text
      .style("text-anchor", textAnchor)
      .text(param)
      .attr("fill", "Grey")
      .style("font-size", "12px");
  });
  


// Convert the sample data to a format suitable for the radarLine function
const radarChartData = updatedSampleData.map(dataSet => ({
    label: dataSet.label,
    values: parameters.map(param => ({ axis: param, value: dataSet.values[param] }))
  }));

console.log("radarChartData");
console.log(radarChartData);

// Plot the radar chart data
radarChartData.forEach((data, i) => {
    radarGroup.append("path")
      .datum(data.values.map(v => ({ value: v.value })))
      .attr("d", radarLine)
      .style("stroke-width", "2px")
      .style("stroke", i === 0 ? "#ffb4a2" : "#87A922")
      .style("fill", i === 0 ? "#ffb4a2" : "#87A922")
      .style("fill-opacity", 0.1);
  
    // Add legend
    svg.append("text")
      .attr("x", dimensions.width / 8 - 10)
      .attr("y", dimensions.height /4 + 30  + (i * 20))
      .text(data.label)
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle")
      .style("fill", i === 0 ?  "red" : "green");
  });



  }, [chartData, dimensions]); // Redraw when chartData or dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default RadarChart;
