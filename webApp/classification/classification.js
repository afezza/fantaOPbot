// Function to reload the page to a specified URL
function reloadToUrl(url) {
    window.location.href = url;  // This will reload the page to the specified URL
}

const data = //COLUMN_DATA;

// Create a column chart
const columnChart = anychart.bar();

// Set the data and show the labels on top of the bar
let series = columnChart.bar(data);
columnChart.labels().enabled(true).anchor("left-center").position("right-center");

// Set tooltip to show statistics
var tooltip = columnChart.tooltip();
tooltip.positionMode("point");
tooltip.titleFormat("{%x}: {%value}");
tooltip.format((e) => {
    statistics = {first: 0.0, before: 0.0, after: 0.0, last: 0.0};
    if(e.index > 0) 
    {
        statistics.first = data[0].value - data[e.index].value;  // Check the first classified
        statistics.before = data[e.index-1].value - data[e.index].value; // Check the one classified before
    }
    if(e.index < data.length-1) 
    {
        statistics.after = data[e.index].value - data[e.index+1].value; // Check the one classified after 
        statistics.last = data[e.index].value - data[data.length-1].value; // Check the last classified
    }
    toolTipText = "dal primo: " + statistics.first + "\ndal precedente: " + statistics.before;
    toolTipText +="\ndal successivo: " + statistics.after + "\ndall'ultimo: " + statistics.last;
    console.log("Team " + data[e.index].x + " statistics: Total:" + data[e.index].value, statistics); // Log details being passed

    return toolTipText
});

// Draw the column chart
columnChart.container('column-container');
columnChart.draw();

// Create a variable for the donut chart
let donutChart;

// Function to draw the donut chart
function drawDonutChart(details) {
    console.log("Drawing donut chart with details:", details); // Log details being passed

    // If a donut chart already exists, dispose of it
    if (donutChart) {
        console.log("Disposing existing donut chart."); // Log disposal of old chart
        donutChart.dispose(); // Dispose the existing donut chart
    }

    // Create a new donut chart
    donutChart = anychart.pie();

    // Convert details object to array format for the donut chart
    const donutData = Object.entries(details.details).map(([key, value]) => ({ x: key, value }));
    console.log("Donut chart data:", donutData); // Log donut chart data

    // Set data and title for the donut chart
    donutChart.data(donutData);
    donutChart.title(details.x);
    donutChart.innerRadius("75%");

    // Set the position of labels and format them
    donutChart.labels().format('{%value}{decimalsCount:1,zeroFillDecimals:true}');
    donutChart.labels().position("outside");
    donutChart.connectorStroke({color: "#595959", thickness: 2, dash:"2 2"});

    // Create and configure a custom label
    var label = anychart.standalones.label();
    let maxVal = 0;
    let minVal = 1000;
    donutData.forEach((value,key) => {
        if(Number(value.value) > Number(maxVal)){maxVal = value.value;}
        if(Number(value.value) < Number(minVal)){minVal = value.value;}
    });
    label.text("Max: " + maxVal + "\nMin: " + minVal);
    label.fontColor("#60727b");
    label.fontSize(15);
    label.width("100%");
    label.height("100%");
    label.hAlign("center");
    label.vAlign("middle");

    // Set the label as the center content
    donutChart.center().content(label);

    // Shows the chapters with 0 total points in the legend
    var legend = donutChart.legend();
    legend.itemsFormatter(function () {
        let colors = ["#2196F3", "#F44336", "#4CAF50", "#FFEB3B"];
        let legendItems = [];
        donutData.forEach((value,key) => {
            if(value.value == '0')
            {
                legendItems.push({text: value.x, iconFill: colors[Math.ceil(3*Math.random())] ,iconType: "circle"});
            }
        });
        console.log(legendItems);
        return legendItems;        
    });

    // Draw the donut chart
    donutChart.container('donut-container');
    donutChart.draw();
}

// Set up the click event on the column chart
columnChart.listen('pointClick', function (e) {
    const clickedPoint = e.point;
    const categoryIndex = clickedPoint.index; // Get index of the clicked point
    console.log("Clicked point index:", categoryIndex); // Log clicked index

    const categoryDetails = data[categoryIndex]; // Get the clicked category

    drawDonutChart(categoryDetails); // Draw the donut chart with the details
});
