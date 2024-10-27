// Create a data set for the column chart
const data = [
    { x: 'Category 1', value: 70, details: { a: 20, b: 30, c: 20 } },
    { x: 'Category 2', value: 50, details: { a: 15, b: 20, c: 15 } },
    { x: 'Category 3', value: 90, details: { a: 30, b: 30, c: 30 } },
    { x: 'Category 4', value: 30, details: { a: 10, b: 10, c: 10 } },
];

// Create a column chart
const columnChart = anychart.column();

// Set the data
columnChart.data(data);

// Set the chart title
columnChart.title('Column Chart Example');

// Set the x-axis title
columnChart.xAxis().title('Categories');

// Set the y-axis title
columnChart.yAxis().title('Values');

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
    const donutData = Object.entries(details).map(([key, value]) => ({ x: key, value }));
    console.log("Donut chart data:", donutData); // Log donut chart data

    // Set data and title for the donut chart
    donutChart.data(donutData);
    donutChart.title('Details of Selected Category');

    // Draw the donut chart
    donutChart.container('donut-container');
    donutChart.draw();
}

// Set up the click event on the column chart
columnChart.listen('pointClick', function (e) {
    const clickedPoint = e.point;
    const categoryIndex = clickedPoint.index; // Get index of the clicked point
    console.log("Clicked point index:", categoryIndex); // Log clicked index

    const categoryDetails = data[categoryIndex].details; // Get details of the clicked category
    console.log("Category details:", categoryDetails); // Log details of the clicked category

    drawDonutChart(categoryDetails); // Draw the donut chart with the details
});
