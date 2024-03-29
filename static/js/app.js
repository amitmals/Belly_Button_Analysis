function buildMetadata(sample) {

  d3.json(`/metadata/${sample}`).then(function(metadataSample){
    console.log(`Sample: ${sample}`);
    console.log(metadataSample);

    var panelMeta = d3.select("#sample-metadata");
    panelMeta.html("");

    Object.entries(metadataSample).forEach(([data,entry]) => {
      panelMeta.append("h6").text(`${data} : ${entry}`).append("hr");
    });
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    // Build Guage https://com2m.de/blog/technology/gauge-charts-with-plotly/


    var level = parseFloat(metadataSample.WFREQ)*(180/9)-10;

    // Trig to calc meter point
    var degrees = 180 - level;
    var radius = 0.5;
    var radians = (degrees * Math.PI) / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';

    // Path: may have to change to create a better triangle
    var mainPath = path1,
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    //console.log(path);

    let guageData = [  {
      type: "scatter",
      x: [0],
      y: [0],
      marker: { size: 14, color: "850000" },
      showlegend: false,
      text: metadataSample.WFREQ,
      hoverinfo: "text"
    },
    {
      values: [50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50],
      rotation: 90,
      text: ["8-9","7-8","6-7","5-6","4-5","3-4","2-3","1-2","0-1",""],
      textinfo: "text",
      textposition: "inside",
      value: metadataSample.WFREQ, 
      type: "indicator", 
      mode: "gauge",
      hole: .5,
      type: "pie",
      name: metadataSample.WFREQ,
      hoverinfo: "text",
      marker: {
        colors: [
        "rgba(110, 154, 22, 1)",
        "rgba(110, 154, 22, .9)",
        "rgba(110, 154, 22, .8",
        "rgba(110, 154, 22, .7)",
        "rgba(110, 154, 22, .6)",
        "rgba(110, 154, 22, .5)",
        "rgba(110, 154, 22, .4)",
        "rgba(110, 154, 22, .3)",
        "rgba(110, 154, 22, .2)",
        "rgba(255, 255, 255, 0)"
      ]},
      showlegend: false
    }];

    let guageLayout = {
      title: "<b>Belly Button Washing Frequency</b> <br>Scrubs per Week",
      xaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      },
      yaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      },
      shapes: [
        {
          type: "path",
          path: path,
          fillcolor: "850000",
          line: {
            color: "850000"
          }
        }
      ],
    height: 400,
    width: 400,
    };

    

    Plotly.react("gauge",guageData,guageLayout);
  });
};

function buildCharts(sample) {

  d3.json(`/samples/${sample}`).then(function(pieSample) {
    let otu_ids = pieSample.otu_ids;
    let otu_labels = pieSample.otu_labels;
    let sample_values = pieSample.sample_values;

    // Build a Bubble Chart using the sample data
    //https://plot.ly/python/bubble-charts/
    let bubbleData = [{
      mode: "markers",
      marker: { 
        size: sample_values, 
        color: otu_ids,
        //https://community.plot.ly/t/what-colorscales-are-available-in-plotly-and-which-are-the-default/2079
        colorscale: "Picnic"},
      x: otu_ids,
      y: sample_values,
      hovertext: otu_labels,
      hovername: otu_ids,
      hoverinfo: "hovername + hovertext"
    }];

    var bubbleLayout = {
      xaxis: {title: "OTU ID"}
    };
    //https://plot.ly/javascript/plotlyjs-function-reference/
    Plotly.react("bubble",bubbleData, bubbleLayout);

    // Build a Pie Chart using the sample data

    let pieData = [{
      type: "pie",
      values: sample_values.slice(0,10),
      labels: otu_ids.slice(0,10),
      hovertext: otu_labels.slice(0,10)
    }];

    Plotly.react("pie",pieData);

  });



}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
