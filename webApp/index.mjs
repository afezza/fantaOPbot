import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const classification_body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnyChart Column and Donut Chart</title>
    <script src="https://cdn.anychart.com/releases/8.10.0/js/anychart-bundle.min.js"></script>
    <style>
        #column-container, #donut-container {
            width: 100%;
            height: 50vh;
        }
        body {
            overflow: hidden; /* Hide both horizontal and vertical scrollbars */
        }
    </style>
</head>
<body>
    <div id="column-container"></div>
    <div id="donut-container"></div>
    
    <!-- <script src="chart.js"></script> -->
    <script>

    const data = //COLUMN_DATA;

    // Create a column chart
    const columnChart = anychart.column();

    // Set the data
    columnChart.data(data);

    // Set the chart title
    columnChart.title('Classifica Fanta OP');

    // Customize the column color
    columnChart.palette(['#7C00FE']); // Dark violet color

    // tooltip settings
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
        toolTipText = "dal primo: " + statistics.first + "\\ndal precedente: " + statistics.before;
        toolTipText +="\\ndal successivo: " + statistics.after + "\\ndall'ultimo: " + statistics.last;
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

        // set the position of labels and format them
        donutChart.labels().format('{%value}{decimalsCount:1,zeroFillDecimals:true}');
        donutChart.labels().position("outside");

        // configure connectors
        donutChart.connectorStroke({color: "#595959", thickness: 2, dash:"2 2"});

        // create and configure a label
        var label = anychart.standalones.label();
        let maxVal = 0;
        let minVal = 1000;
        donutData.forEach((value,key) => {
            if(Number(value.value) > Number(maxVal)){maxVal = value.value;}
            if(Number(value.value) < Number(minVal)){minVal = value.value;}
        });
        label.text("Max: " + maxVal + "\\nMin: " + minVal);
        label.fontColor("#60727b");
        label.fontSize(15);
        label.width("100%");
        label.height("100%");
        label.hAlign("center");
        label.vAlign("middle");

        // set the label as the center content
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
    </script>
</body>
</html>
`

export const handler = async (event) => {

    const command = new GetCommand({
    TableName: "FantaOP",
    Key: {
        edition_key: "-1002194179581",
    },
    });

    const db_entry = await docClient.send(command);
    // console.log(db_entry); // TODO: is not working

    // Create a list for the matches and the teams from db entry
    let match_list = JSON.parse(db_entry['Item']['match_list']); 
    let team_list = JSON.parse(db_entry['Item']['teams']);

    let team_name_collection = {};
    for (let team in team_list) //returns the index
    {
        team_name_collection[team_list[team]['team_id']] =
            {
            x: team_list[team]['team_name'],
            value : 0.0,
            details : {}
            }
    }

    for (let match in match_list)
    {
        if(match_list[match]['state'] != "COMPLETED") {break;}
    
        for (let team in match_list[match]['squads'])
        {   
            team_name_collection[match_list[match]['squads'][team]['team_id']]['details'][match_list[match]['chapter']] = match_list[match]['squads'][team]['total_score']
            team_name_collection[match_list[match]['squads'][team]['team_id']]['value'] += parseFloat(match_list[match]['squads'][team]['total_score'])
        }
    }
    console.log(team_name_collection);

    let team_name_list = []
    for (let team in team_name_collection)
    {
        team_name_list.push(team_name_collection[team]);
    }
    team_name_list.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    console.log(team_name_list);
    let text_str = '';
    text_str += JSON.stringify(team_name_list);

    // Put the data in the js code to send to the client
    let text_query = "//COLUMN_DATA";
    let index_data = classification_body.indexOf(text_query);
    let body_text = classification_body.slice(0, index_data) + text_str + classification_body.slice(index_data+text_query.length);

    let response = {
        'statusCode': 200,
        'headers': {"Content-Type": "text/html",},
        'body': body_text
    }
    return response;
};
