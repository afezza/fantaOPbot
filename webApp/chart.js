const data = [{"x":"Fascismo e libertà","value":246,"details":{"1123":"23.0","1124":"42.0","1125":"5.0","1126":"49.0","1127":"44.0","1128":"20.0","1129":"34.0","1130":"29.0"}},{"x":"Quello porco","value":225.5,"details":{"1123":"47.5","1124":"34.5","1125":"0","1126":"45.0","1127":"26.0","1128":"18.5","1129":"19.5","1130":"34.5"}},{"x":"L'amianto D. Bagnoli","value":177,"details":{"1123":"20.0","1124":"14.0","1125":"9.0","1126":"26.0","1127":"38.0","1128":"40.0","1129":"20.0","1130":"10.0"}},{"x":"cisisniffaingiro","value":114.5,"details":{"1123":"22.0","1124":"22.0","1125":"4.0","1126":"43.0","1127":"0","1128":"2.0","1129":"0","1130":"21.5"}},{"x":"Mmandint appiomb","value":110.5,"details":{"1123":"10.5","1124":"18.0","1125":"10.0","1126":"19.0","1127":"16.0","1128":"20.0","1129":"12.0","1130":"5.0"}},{"x":"EUSTASS-YA!","value":98.5,"details":{"1123":"16.0","1124":"15.0","1125":"14.0","1126":"37.0","1127":"0","1128":"0","1129":"0","1130":"16.5"}}];

// Create a column chart
const columnChart = anychart.column();

// Set the data
columnChart.data(data);

// Set the chart title
columnChart.title('Classifica Fanta OP');

// Set the x-axis title
columnChart.xAxis().title('Squadre');

// Set the y-axis title
columnChart.yAxis().title('Punteggio');

// Customize the column color
columnChart.palette(['#7C00FE']); // Dark violet color

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
    donutChart.title('Dettaglio di ' + details.x);

    donutChart.innerRadius("75%");

    // set the position of labels and format them
    donutChart.labels().format('{%value}{decimalsCount:1,zeroFillDecimals:true}');
    donutChart.labels().position("outside");

    // configure connectors
    donutChart.connectorStroke({color: "#595959", thickness: 2, dash:"2 2"});

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
