function loadClassificationInfo() {
    
    // Generate the content 
    pageContent = 
    `<div class="row">
        <div class="page-element col-sm-6">
            <div class="card shadow">
            <div class="card-body">
                <h4 class="card-title">Il campione di questa settimana</h4>
                <div class="row">
                    <img src="" class="img-fluid rounded float-start" alt="Jolly roger" id="last-chap-champ-jolly">
                </div>
                <div class="row">
                    <p class="h5 text-center" id="last-chap-champ-name"></p>
                    <p class="h6 text-center" id="last-chap-champ-pts"></p>
                </div>
            </div>
            </div>
        </div>
        <div class="page-element col-sm-6">
            <div class="card shadow">
            <div class="card-body">
                <h4 class="card-title">Il campione del torneo</h4>
                <div class="row">
                    <img src="" class="img-fluid rounded float-start" alt="Jolly roger" id="glob-champ-jolly">
                </div>
                <div class="row">
                    <p class="h5 text-center" id="glob-champ-name"></p>
                    <p class="h6 text-center" id="glob-champ-pts"></p>
                </div>
            </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="page-element col-sm-12">
            <div class="card shadow">
            <div class="card-body">
                <h4 class="card-title">Classifica</h4>
                <div style="height: 400px;" id="classification-card"></div>
            </div>
            </div>
        </div>
    </div>`
    
    let containerObj = document.createElement('div')
    containerObj.classList.add('container');
    containerObj.innerHTML = pageContent.trim();

    return containerObj
}

function createClassificationChart(){

    // Create the collection for the team classification
    let team_name_collection = {};
    for (let team in teamsData) //returns the index
    {
        team_name_collection[teamsData[team]['team_id']] =
            {
            x: teamsData[team]['team_name'],
            value : 0.0,
            details : {}
            }
    }

    // Store last chapter champion
    last_chap_champ = { name: "", score: 0.0};
    // Check all the completed chapter and calculate the scores
    for (let match in matchesData)
    {
        if(matchesData[match]['state'] != "COMPLETED") {break;}
    
        // Clean the last chapter champion info for the new chapter 
        last_chap_champ.name = "";
        last_chap_champ.score = 0.0;

        for (let team in matchesData[match]['squads'])
        {   
            team_name_collection[matchesData[match]['squads'][team]['team_id']]['details'][matchesData[match]['chapter']] = matchesData[match]['squads'][team]['total_score']
            team_name_collection[matchesData[match]['squads'][team]['team_id']]['value'] += parseFloat(matchesData[match]['squads'][team]['total_score'])
            
            if(parseFloat(matchesData[match]['squads'][team]['total_score']) > last_chap_champ.score)
            {
                last_chap_champ.score = parseFloat(matchesData[match]['squads'][team]['total_score']);
                last_chap_champ.name = team_name_collection[matchesData[match]['squads'][team]['team_id']]['x'];
            }
        }
    }

    // Create an ordered array with the team classification
    let data = []
    teams_classification = []
    for (let team in team_name_collection)
    {
        data.push(team_name_collection[team]);
        teams_classification.push({
            id : team,
            value : team_name_collection[team].value,
            details : team_name_collection[team].details
        });
    }
    data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    teams_classification.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    // Update the champions cards
    for (let team in teamsData) //returns the index
    {
        if(teamsData[team]['team_name'] === data[0].x)
        {
            document.getElementById("glob-champ-jolly").src = teamsData[team]['jolly_roger']
        } 
        if(teamsData[team]['team_name'] === last_chap_champ.name)
        {
            document.getElementById("last-chap-champ-jolly").src = teamsData[team]['jolly_roger']
        }
    }
    document.getElementById("glob-champ-name").innerText = data[0].x;
    document.getElementById("glob-champ-pts").innerText = data[0].value + " punti";
    document.getElementById("last-chap-champ-name").innerText = last_chap_champ.name;
    document.getElementById("last-chap-champ-pts").innerText = last_chap_champ.score + " punti";

    // Create a column chart
    const columnChart = anychart.bar();

    // Set the data, hide the axis label and show the value labels inside the bar
    let series = columnChart.bar(data);
    columnChart.labels().enabled(true).anchor("right-center").position("right-center").fontColor('#FFFFFF');
    columnChart.xAxis().labels().enabled(false);

    // Set tooltip to show chapters specification
    var tooltip = columnChart.tooltip();
    tooltip.positionMode("point");
    tooltip.titleFormat("{%x}: {%value}");
    tooltip.format((e) => {
        toolTipText = ""; 
        Object.keys(data[e.index].details).forEach(key => {
            toolTipText += `${key}: ${data[e.index].details[key]}\n`;
            });

        return toolTipText
    });

    // Draw the column chart
    columnChart.container('classification-card');
    columnChart.draw();
}
