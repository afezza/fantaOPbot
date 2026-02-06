var isScoresRequired = false;
var chapterSelected = 0;
let user_team_id = '';

function loadSquadsInfo() {

    // Generate the content 
    pageContent = 
    `<div class="row">
        <div class="page-element col-sm-12">
            <div class="card shadow">
            <div class="card-body">
                <div class="row">
                    <h4 class="card-title col">Seleziona il capitolo</h4>
                    <div class="form-check form-switch col">
                        <div class="row justify-content-center"><label class="form-check-label col text-center " for="flexSwitchCheckScores">Mostra punteggi</label></div>
                        <div class="row justify-content-center" style="padding-left: 40px;"><input class="form-check-input" type="checkbox" id="flexSwitchCheckScores" onchange="chapterSquadsScoreSelect(this.checked,chapterSelected)"></div>
                    </div>`
                    let selectHtlm = `<select class="form-select col" aria-label="Chapter selection" id="squad-chapter-selection" onchange="chapterSquadsScoreSelect(isScoresRequired,this.value)">`
                    for (let match = matchesData.length-1; match >= 0; match--)
                    {
                        if(matchesData[match]['state'] === "None") {continue;}
                    
                        selectHtlm += `<option value="${matchesData[match]['chapter']}">${matchesData[match]['chapter']}</option>`
    
                    }
                    selectHtlm += `</select>`
                    
                    pageContent += selectHtlm +`
                </div>
            </div>
            </div>
        </div>
    </div>
    <div class="row" id="squads-summary"></div>`
    
    let containerObj = document.createElement('div')
    containerObj.classList.add('container');
    containerObj.innerHTML = pageContent.trim();

    return containerObj
}

function chapterSquadsScoreSelect(scoresReq,chapterReq){
    isScoresRequired = scoresReq;
    chapterSelected = chapterReq;

    for (let match in matchesData)
    {
        if(matchesData[match]['chapter'] != chapterReq) {continue;}

        if (matchesData[match]['state'] === "WAIT_RANKING") {
            return chapterSquadsInsertSelection(match);
        }
        else
        {
            if (isScoresRequired) {
                return chapterScoresSelection(match);
            }
            else 
            {
                return chapterSquadsSelection(match);
            }
        }
    }
}

function chapterSquadsSelection(match){

    squadSummary = document.getElementById("squads-summary");
    squadSummary.innerHTML = ''
    
    for (let team in matchesData[match]['squads'])
    {   
        let pageElemObj = document.createElement('div')
        pageElemObj.classList.add('page-element');
        pageElemObj.classList.add('col-sm-6');
        pageElem =`<div class="card shadow">
                <div class="card-header row gx-0">
                <h4 class="col-9">${teams_names.get(matchesData[match]['squads'][team]['team_id'])}</h4>
                <h5 class="col-3 text-center">${matchesData[match]['squads'][team]['total_score']}</h5>
                </div>
                <ul class="list-group list-group">`
                for (let player in matchesData[match]['squads'][team]['players']){
                    pageElem += `<li class="list-group-item">
                    <div class="row">
                    <div class="col-10" data-bs-toggle="offcanvas" href="#charStatOffcanvas" role="button" aria-controls="charStatOffcanvas" onclick="loadPlayerOffcanvas('${matchesData[match]['squads'][team]['players'][player]['name']}')"> 
                    ${matchesData[match]['squads'][team]['players'][player]['name']}</div>
                    <div class="col-2"> `
                    if(matchesData[match]['squads'][team]['players'][player]['role'] === "Capitano"){
                        pageElem += `<img src="https://i.ibb.co/w2JvZMW/captain-Icon.png" style="height: 20px" alt="Straw hat" data-bs-toggle="tooltip" data-bs-placement="top" title="Capitano">`
                    } 
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "Vice"){
                        pageElem += `<img src="https://i.ibb.co/PfP2zjs/viceIcon.png" style="height: 25px" alt="Gun" data-bs-toggle="tooltip" data-bs-placement="top" title="Vice">`
                    }
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "1° riserva"){
                        pageElem += `<span class="badge bg-warning text-dark" data-bs-toggle="tooltip" data-bs-placement="top" title="1° riserva">R1</span>`
                    }
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "2° riserva"){
                        pageElem += `<span class="badge bg-warning text-dark" data-bs-toggle="tooltip" data-bs-placement="top" title="2° riserva">R2</span>`
                    }
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "3° riserva"){
                        pageElem += `<span class="badge bg-warning text-dark" data-bs-toggle="tooltip" data-bs-placement="top" title="3° riserva">R3</span>`
                    }
                    pageElem += `</div></div></li>`;
                } 
                    
                pageElem += `</ul></div>`
        pageElemObj.innerHTML = pageElem.trim();
        squadSummary.appendChild(pageElemObj);
    }
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function chapterScoresSelection(match){

    scoreSummary = document.getElementById("squads-summary");
    scoreSummary.innerHTML = ''
    
    for (let team in matchesData[match]['squads'])
    {   
        let optimal_res = [];
        for (let player in matchesData[match]['squads'][team]['players']){
            if(matchesData[match]['squads'][team]['players'][player]['score'] === 'None'){ // TODO: change with correct style
                matchesData[match]['squads'][team]['players'][player]['score'] = {};
            }

            total_player_score = 0;
            Object.keys(matchesData[match]['squads'][team]['players'][player]['score']).forEach(key => {
                total_player_score += parseFloat(matchesData[match]['squads'][team]['players'][player]['score'][key]);
            });
            optimal_res.push({"name" :  matchesData[match]['squads'][team]['players'][player]['name'],
                            "score" : total_player_score})
        }
        optimal_res.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        optimal_res[0].score *= 2.0;
        optimal_res[1].score *= 1.5;
        let total_opt_score = 0.0;
        let counter = 0;
        for (let score in optimal_res)
        {
            if (counter > 7) {
                break;
            }
            total_opt_score += parseFloat(optimal_res[score]["score"]);
            counter += 1;
            console.log(total_opt_score)
        }

        let pageElemObj = document.createElement('div')
        pageElemObj.classList.add('page-element');
        pageElemObj.classList.add('col-sm-6');
        pageElem =`<div class="card shadow">
                <div class="card-header row gx-0">
                <h4 class="col-9">${teams_names.get(matchesData[match]['squads'][team]['team_id'])}</h4>
                <h5 class="col-3 text-center" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" title="Ottimo: ${total_opt_score}<br>Scarto: ${(total_opt_score-matchesData[match]['squads'][team]['total_score'])}">
                ${matchesData[match]['squads'][team]['total_score']}</h5>
                </div>
                <ul class="list-group list-group"  style="height: 413px; max-height: 413px; overflow-y: scroll">`
                counter = 0;
                for (let player in matchesData[match]['squads'][team]['players']){
                    if(matchesData[match]['squads'][team]['players'][player]['score'] === 'None'){ // TODO: change with correct style
                        matchesData[match]['squads'][team]['players'][player]['score'] = {};
                    }
                    pageElem += `<li class="list-group-item">
                    <div class="row">
                    <div class="col-5" data-bs-toggle="offcanvas" href="#charStatOffcanvas" role="button" aria-controls="charStatOffcanvas" onclick="loadPlayerOffcanvas('${matchesData[match]['squads'][team]['players'][player]['name']}')">
                    ${matchesData[match]['squads'][team]['players'][player]['name']} `

                    // Create the score part to calculate the total score of the player
                    total_player_score = 0;
                    scoreElem = `<div class="col-7">`
                    Object.keys(matchesData[match]['squads'][team]['players'][player]['score']).forEach(key => {
                        if(matchesData[match]['squads'][team]['players'][player]['score'][key] > 0){
                            scoreElem += `<span class="badge bg-success me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${scoresData[key]['description']}">
                            ${key} ${matchesData[match]['squads'][team]['players'][player]['score'][key]}</span>`
                        }
                        else {
                            scoreElem += `<span class="badge bg-danger me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${scoresData[key]['description']}">
                            ${key} ${matchesData[match]['squads'][team]['players'][player]['score'][key]}</span>`
                        }
                        total_player_score += parseFloat(matchesData[match]['squads'][team]['players'][player]['score'][key]);
                    });
                    scoreElem += `</div>`;

                    if (total_player_score > 0) {
                        counter += 1;
                    }

                    if(matchesData[match]['squads'][team]['players'][player]['role'] === "Capitano"){
                        pageElem += `<span class="badge bg-primary">x2</span> <span class="badge bg-secondary">${total_player_score*2}</span>`
                    } 
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "Vice"){
                        pageElem += `<span class="badge bg-info text-dark">x1.5</span> <span class="badge bg-secondary">${total_player_score*1.5}</span>`
                    }
                    else if(matchesData[match]['squads'][team]['players'][player]['role'] === "Titolare"){
                        pageElem += `<span class="badge bg-secondary">${total_player_score}</span>`
                    } 
                    else{
                        if (counter > 7) {
                            pageElem += `<span class="badge bg-secondary">0</span>`
                        }
                        else {
                            pageElem += `<span class="badge bg-secondary">${total_player_score}</span>`
                        }
                    }
                    pageElem += `</div>` + scoreElem + `</li>`;
                } 
                    
                pageElem += `</ul></div>`
        pageElemObj.innerHTML = pageElem.trim();
        scoreSummary.appendChild(pageElemObj);
    }
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function chapterSquadsInsertSelection(match){

    squadSummary = document.getElementById("squads-summary");
    squadSummary.innerHTML = ''

    // Find the team id using the owner username
    for (let team in teamsData)
    {
        if (teamsData[team]["owner"] === ('@' + Telegram.WebApp.initDataUnsafe.user.username) ) {
            user_team_id = teamsData[team]["team_id"];
            break;
        }
    }

    for (let team in matchesData[match]['squads'])
    {   
        if (matchesData[match]['squads'][team]['team_id'] !== user_team_id) {continue;}

        let pageElemObj = document.createElement('div')
        pageElemObj.classList.add('page-element');
        pageElemObj.classList.add('col-sm-6');
        pageElem =`<div class="card shadow">
                <div class="card-header row gx-0">
                <h4 class="col-9">${teams_names.get(matchesData[match]['squads'][team]['team_id'])}</h4>
                <div class="col-3">`
                    if (match > 0) {
                        pageElem += `<button type="button" class="btn btn-outline-primary btn-sm" onclick="loadLastChapSquad(${match},${team})"><i class="bi bi-arrow-clockwise"></i></button>`
                    }
                    pageElem += `<button type="button" class="btn btn-outline-primary btn-sm" onclick="storeUserSquad()"><i class="bi bi-floppy2-fill"></i></button>
                </div></div>
                <ul class="list-group list-group">`
                for (let player in matchesData[match]['squads'][team]['players']){
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "None") {
                        matchesData[match]['squads'][team]['players'][player]['role'] = "Titolare"
                    }
                    pageElem += `<li class="list-group-item">
                    <div class="row">
                    <div class="col-6" data-bs-toggle="offcanvas" href="#charStatOffcanvas" role="button" aria-controls="charStatOffcanvas" onclick="loadPlayerOffcanvas('${matchesData[match]['squads'][team]['players'][player]['name']}')"> 
                    ${matchesData[match]['squads'][team]['players'][player]['name']}</div>
                    <div class="col-6"> 
                    <select class="form-select col" aria-label="Player role selection" id="player-role-selection" onchange="playerRoleSelect(${match},${team},${player},this.value)">`
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "Capitano") {
                        pageElem += `<option value="Capitano" selected>Capitano</option>`
                    }
                    else
                    {
                        pageElem += `<option value="Capitano">Capitano</option>`
                    }
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "Vice") {
                        pageElem += `<option value="Vice" selected>Vice</option>`
                    }
                    else
                    {
                        pageElem += `<option value="Vice">Vice</option>`
                    }
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "Titolare") {
                        pageElem += `<option value="Titolare" selected>Titolare</option>`
                    }
                    else
                    {
                        pageElem += `<option value="Titolare">Titolare</option>`
                    }
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "1° riserva") {
                        pageElem += `<option value="1° riserva" selected>1° riserva</option>`
                    }
                    else
                    {
                        pageElem += `<option value="1° riserva">1° riserva</option>`
                    }
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "2° riserva") {
                        pageElem += `<option value="2° riserva" selected>2° riserva</option>`
                    }
                    else
                    {
                        pageElem += `<option value="2° riserva">2° riserva</option>`
                    }
                    if (matchesData[match]['squads'][team]['players'][player]['role'] === "3° riserva") {
                        pageElem += `<option value="3° riserva" selected>3° riserva</option>`
                    }
                    else
                    {
                        pageElem += `<option value="3° riserva">3° riserva</option>`
                    }
                    pageElem += `</select></div></div></li>`;
                } 
                    
                pageElem += `</ul></div>`
        pageElemObj.innerHTML = pageElem.trim();
        squadSummary.appendChild(pageElemObj);
    }
}

function playerRoleSelect(match, team, player, selectedRole){
    matchesData[match]['squads'][team]['players'][player]['role'] = selectedRole;
}

function loadLastChapSquad(match,team) {
    let prevTeam;
    for (prevTeam in matchesData[match-1]['squads']) {
        if (matchesData[match]['squads'][team]['team_id'] === matchesData[match-1]['squads'][prevTeam]['team_id']){break;}
    }
    for (let player in matchesData[match]['squads'][team]['players']) {
        matchesData[match]['squads'][team]['players'][player]['role'] = matchesData[match-1]['squads'][prevTeam]['players'][player]['role'];
    }
    chapterSquadsInsertSelection(match)
}

function storeUserSquad() {
    
    let user_squad;

    for (let match = matchesData.length-1; match >= 0; match--)
    {
        if(matchesData[match]['state'] !== "WAIT_RANKING") {continue;}
    
        for (let team in matchesData[match]['squads'])
        {
            if (matchesData[match]['squads'][team]["team_id"]===user_team_id) {
                user_squad = matchesData[match]['squads'][team];
                break;
            }
        }
        break;  // Only need to find the first completed chapter
    }

    // Check if the roles are in the correct amount
    if (user_squad['players'].filter(el => el['role'] === "Capitano").length > 1)
    {
        window.alert("Capitano selezionato troppe volte");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "Capitano").length < 1)
    {
        window.alert("Seleziona il Capitano");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "Vice").length > 1)
    {
        window.alert("Vice selezionato troppe volte");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "Vice").length < 1)
    {
        window.alert("Seleziona il Vice");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "1° riserva").length > 1)
    {
        window.alert("1° riserva selezionata troppe volte");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "1° riserva").length < 1)
    {
        window.alert("Seleziona la 1° riserva");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "2° riserva").length > 1)
    {
        window.alert("2° riserva selezionata troppe volte");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "2° riserva").length < 1)
    {
        window.alert("Seleziona la 2° riserva");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "3° riserva").length > 1)
    {
        window.alert("3° riserva selezionata troppe volte");
        return;
    }
    if (user_squad['players'].filter(el => el['role'] === "3° riserva").length < 1)
    {
        window.alert("Seleziona la 3° riserva");
        return;
    }

    const dataToSend = {
        initData: Telegram.WebApp.initData,
        command: "store_squad_info",
        squadData: JSON.stringify(user_squad)
    };

    // Make the POST request using fetch
    fetch('https://lhkbtday6kadh4pmzfnemlpqzq0plkki.lambda-url.eu-north-1.on.aws/web_interface', {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    .then(response => response.json()) // Assuming the response is JSON
    .then(data => {
        window.alert(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
