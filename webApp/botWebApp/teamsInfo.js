function loadTeamsInfo(team_id) {

    // Select the team based on the id
    let selected_team = 0;
    for (let team in teamsData) //returns the index
    {
        if(team_id === teamsData[team]['team_id']) {
            selected_team = team;
            break;
        }
    }

    // Generate the content 
    pageContent = `
        <div class="row">
            <div class="page-element col-sm-6">
                <div class="card shadow">
                <div class="card-body">
                    <div class="row">
                        <img src="${teamsData[selected_team]['jolly_roger']}" class="img-fluid rounded float-start" alt="Jolly roger">
                    </div>
                    <div class="row">
                        <p class="h5 text-center">${teamsData[selected_team]['team_name']}</p>
                        <p class="h6 text-center">${teamsData[selected_team]['owner']}</p>
                    </div>
                </div>
                </div>
            </div>
            <div class="page-element col-sm-6">
                <div class="card shadow">
                <div class="card-header">
                    <h5>Punteggi capitoli</h5>
                </div>
                <div class="card-body" id="donut-container" style="height: 450px; width: 100%;"></div>
                </div>
            </div>
            <div class="page-element col-sm-6">
                <div class="card shadow">
                <div class="card-body">
                    <p class="h5 text-center">Distanze tra prima e ultima</p>
                </div>
                </div>
            </div>
            <div class="page-element col-sm-6">
                <div class="card shadow">
                <div class="card-body">
                    <h4 class="col text-center">Rimanenti ${teamsData[selected_team]['tokens_left']} berries</h4>
                </div>
                <ul class="list-group list-group">`
                    for (let player in teamsData[selected_team]['players']){
                        pageContent += `<li class="list-group-item">
                        <div class="row">
                        <div class="col-10">${teamsData[selected_team]['players'][player]['name']}</div>
                        <div class="col-2"> ${teamsData[selected_team]['players'][player]['price']}</div>
                        </div></li>`;
                    } 
                pageContent += `</ul></div>
            </div>`
            if(teamsData[selected_team]['swap'] !== "None")
            {
                pageContent += `<div class="page-element col-sm-6">
                    <div class="card shadow">
                        <div class="card-body">
                            <h4 class="col text-center">Scambi effettuati</h4>
                        </div>
                        <ul class="list-group list-group"  style="height: 250px; max-height: 250px; overflow-y: scroll">`
                        for (let player in teamsData[selected_team]['swap']){
                            pageContent += `<li class="list-group-item">
                            <div class="row">
                            <div class="col-5 text-center">${teamsData[selected_team]['swap'][player]['sell']}</div>
                            <div class="col-1" style="padding-left: 5px;"><span class="badge bg-info text-dark">${teamsData[selected_team]['swap'][player]['old_price']}</span></div>
                            <div class="col-2"><img src="https://i.ibb.co/v4bt3jJz/swap.png" style="height: 40px" alt="swap" border="0"> </div>
                            <div class="col-4 text-center">${teamsData[selected_team]['swap'][player]['buy']}</div>
                            </div></li>`;
                        } 
                        pageContent += `</ul>
                    </div>
                </div>`
            }
        pageContent += `</div>`
    
    let containerObj = document.createElement('div')
    containerObj.classList.add('container');
    containerObj.innerHTML = pageContent.trim();

    return containerObj
}

function generateNavbarTeamsDropdown(){

    teamsList = document.getElementById("teams-dropdown");
    teamsList.innerHTML = '';
    
    let listText = '';
    teams_names.forEach((value, key) => {
        listText += `<li><a class="dropdown-item" href="#" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show" onclick="loadPage('${key}')">${value}</a></li>` 
    });

    teamsList.innerHTML = listText.trim();
}

// Function to draw the donut chart
function createTeamCaptersSummaryChart(team_id) { 

    // Create a new donut chart
    donutChart = anychart.pie();

    // Convert details object to array format for the donut chart
    for (let team in teams_classification) //returns the index
    {
        if(team_id === teams_classification[team]['id']) {
            selected_team = team;
            break;
        }
    }

    let donutData = [];
    for (let match in matchesData){

        if(matchesData[match]['state'] != "COMPLETED") {continue;}

        match_collection =
        {
            x: matchesData[match]["chapter"],
            value : teams_classification[selected_team]["details"][matchesData[match]["chapter"]], // scored points 
            details : matchesData[match]['squads'].findIndex(item => item.team_id === team_id)+1 // classification for that match
        }
        donutData.push(match_collection);
        console.log(teams_classification[selected_team]["details"][matchesData[match]["chapter"]])
    }
    // console.log("Donut data:", donutData); // Log donut chart data

    // Set data and title for the donut chart
    donutChart.data(donutData);
    donutChart.title(teams_classification[selected_team].details.x);
    donutChart.innerRadius("75%");

    // Set the position of labels and format them
    donutChart.labels().format('{%value}{decimalsCount:1,zeroFillDecimals:true}');
    donutChart.labels().position("inside");
    donutChart.connectorStroke({color: "#595959", thickness: 2, dash:"2 2"});

    // Create and configure a custom label
    var label = anychart.standalones.label();
    label.text(`${parseInt(selected_team)+1}\u00B0\nclassificato`);
    label.fontColor("#60727b");
    label.fontSize(24);
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
        // console.log(legendItems);
        if (legendItems.length > 0) legendItems.unshift({text: "Capitoli con 0 punti: ", iconFill: "white", iconType: "circle"})
        return legendItems;        
    });

    // Set tooltip to show chapters specification
    var tooltip = donutChart.tooltip();
    tooltip.titleFormat("{%x}");
    tooltip.format((e) => {
        toolTipText = `Totalizzato ${donutData[e.index].value} punti
        Classificato ${donutData[e.index].details}\u00B0 posto`; 
        return toolTipText
    });

    // Draw the donut chart
    donutChart.container('donut-container');
    donutChart.draw();
}
