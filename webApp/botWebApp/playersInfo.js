var players_statistics;

function loadPlayersInfo() {

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

function generatePlayersStatistics()
{
    // Create a Map
    players_statistics = new Map();

    for (let match in matchesData)
    {
        if(matchesData[match]['state'] !== "COMPLETED") {continue;}

        for (let team in matchesData[match]['squads'])
        {
            for (let player in matchesData[match]['squads'][team]['players'])
            {
                let player_statistics;
                // Check if the player already exsist in the statistics list
                if (players_statistics.has(matchesData[match]['squads'][team]['players'][player]['name'])) 
                {
                    player_statistics = players_statistics.get(matchesData[match]['squads'][team]['players'][player]['name']);
                }
                else
                {
                    player_stat = new Map();
                    player_stat.set('chaper_value_score', []);
                    player_stat.set('chaper_value_score_raw', []);
                    player_stat.set('chaper_value_score_pos', []);
                    player_stat.set('chaper_value_score_neg', []);
                    Object.keys(scoresData).forEach(key => { 
                        player_stat.set(key,[]);
                    });
                    
                    players_statistics.set(matchesData[match]['squads'][team]['players'][player]['name'], player_stat);
                    player_statistics = players_statistics.get(matchesData[match]['squads'][team]['players'][player]['name'])
                }
                
                player_statistics.forEach((value, key) => {
                    value.push(0);
                });
                // console.log(player_statistics);

                let player_chapter_score_list = matchesData[match]['squads'][team]['players'][player]['score'];
                if(player_chapter_score_list === 'None'){
                    matchesData[match]['squads'][team]['players'][player]['score'] = {};
                }
                // Loop to calc total score
                let player_score_raw = 0;
                let player_score_pos = 0;
                let player_score_neg = 0;
                Object.keys(matchesData[match]['squads'][team]['players'][player]['score']).forEach(key => {
                    // Calculate partial raw score for this chaper
                    let numeric_val = parseFloat(matchesData[match]['squads'][team]['players'][player]['score'][key])
                    player_score_raw += numeric_val;
                    
                    // Calculate partial positive and negative scores for this chaper
                    if (numeric_val > 0) {
                        player_score_pos += numeric_val;
                    } else {
                        player_score_neg += Math.abs(numeric_val);
                    }

                    // Count this score in the stats
                    let val = player_statistics.get(key);
                    val[val.length - 1] = 1;
                    player_statistics.set(key, val); 
                });

                // Store in the statistics the calculated values 
                let val = player_statistics.get('chaper_value_score');
                if(matchesData[match]['squads'][team]['players'][player]['role'] === "Capitano"){
                    val[val.length - 1] += (player_score_raw * 2);
                } 
                else if(matchesData[match]['squads'][team]['players'][player]['role'] === "Vice"){
                    val[val.length - 1] += (player_score_raw * 1.5);
                }
                else {
                    val[val.length - 1] += player_score_raw;
                }
                player_statistics.set('chaper_value_score', val); 
                val = player_statistics.get('chaper_value_score_raw');
                val[val.length - 1] = player_score_raw;
                player_statistics.set('chaper_value_score_raw', val); 
                val = player_statistics.get('chaper_value_score_pos');
                val[val.length - 1] = player_score_pos;
                player_statistics.set('chaper_value_score_pos', val); 
                val = player_statistics.get('chaper_value_score_neg');
                val[val.length - 1] = player_score_neg;
                player_statistics.set('chaper_value_score_neg', val); 
            } 
        }
    }
    // console.log(players_statistics);
}

function loadPlayerOffcanvas(player)
{
    let playerOffcanvas = document.getElementById("charStatOffcanvas");
    playerOffcanvas.removeChild(playerOffcanvas.children[0]);

    // Generate the header content 
    let offcanvasContent = 
        `<h5 class="offcanvas-title" id="charStatOffcanvasLabel">${player}</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>`
    
    let offcanvasHead = document.createElement('div')
    offcanvasHead.classList.add('offcanvas-header');
    offcanvasHead.innerHTML = offcanvasContent.trim();
    playerOffcanvas.appendChild(offcanvasHead);

    playerOffcanvas.removeChild(playerOffcanvas.children[0]);

    // Generate the body content 
    offcanvasContent = `<ul class="list-group list-group">`

    let player_score_raw = 0;
    let player_score_pos = 0;
    let player_score_neg = 0;
    players_statistics.get(player).forEach((value, key)=>{
        let jstat = this.jStat(value); 
        if (key === 'chaper_value_score') {
            offcanvasContent += `<li class="list-group-item">
                <div class="row">
                    <div class="col-10">Punti totali </div>
                    <div class="col-2" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" 
                    title="Media ${jstat.mean().toFixed(2)}<br>Varianza ${jstat.stdev().toFixed(2)}">${jstat.sum()}</div>
                </div>
            </li>`
            jstat = this.jStat(value.slice(-3));
            offcanvasContent += `<li class="list-group-item">
                <div class="row">
                    <div class="col-10">Punti totali (ultimi 3 capitoli)</div>
                    <div class="col-2" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" 
                    title="Media ${jstat.mean().toFixed(2)}<br>Varianza ${jstat.stdev().toFixed(2)}">${jstat.sum()}</div>
                </div>
            </li>`
        } 
        else if (key === 'chaper_value_score_raw') {
            player_score_raw = jstat.sum();
            offcanvasContent += `<li class="list-group-item">
                <div class="row">
                    <div class="col-10">Punti totali (senza Capitano e Vice)</div>
                    <div class="col-2" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" 
                    title="Media ${jstat.mean().toFixed(2)}<br>Varianza ${jstat.stdev().toFixed(2)}">${player_score_raw}</div>
                </div>
            </li>`
        } 
        else if (key === 'chaper_value_score_pos') {
            player_score_pos = jstat.sum();
        } 
        else if (key === 'chaper_value_score_neg') {
            player_score_neg = jstat.sum();
            let total_points = player_score_pos+player_score_neg;
            offcanvasContent += `<li class="list-group-item">
                <div class="row">
                    <div class="col-10">Punti totali positivi</div>
                    <div class="col-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${((player_score_pos/total_points)*100).toFixed(1)}% del totale">
                    ${player_score_pos}</div>
                </div>
            </li>
            <li class="list-group-item">
                <div class="row">
                    <div class="col-10">Punti totali negativi</div>
                    <div class="col-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${((player_score_neg/total_points)*100).toFixed(1)}% del totale">
                    ${player_score_neg}</div>
                </div>
            </li>`
        } 
        else {
            let actual_val = jstat.sum();
            if (actual_val !== 0) {
                offcanvasContent += `<li class="list-group-item">
                    <div class="row">
                        <div class="col-10">${scoresData[key]['description']}</div>
                        <div class="col-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${((jstat.sum()/value.length)*100).toFixed(1)}% del totale">
                        ${actual_val}</div>
                    </div>
                </li>`
            }
        }
    });
    offcanvasContent += `</ul>`;
    
    let offcanvasBody = document.createElement('div')
    offcanvasBody.classList.add('offcanvas-body');
    offcanvasBody.innerHTML = offcanvasContent.trim();

    playerOffcanvas.appendChild(offcanvasBody);

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}
