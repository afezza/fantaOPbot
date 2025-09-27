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
                <div class="card-body">
                    <p class="h5 text-center">posizione in classfica</p>
                    <p class="h6 text-center">Posizione questa settimana</p>
                </div>
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
                    <p class="h5 text-center">Pie chart dei risultati dei capitoli</p>
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
            </div>
        </div>`
    
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

