var isScoresRequired = false;
var chapterSelected = 0;

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

    if (isScoresRequired) {
        return chapterScoresSelection(chapterSelected);
    }
    else 
    {
        return chapterSquadsSelection(chapterSelected);
    }
}

function chapterSquadsSelection(value){

    squadSummary = document.getElementById("squads-summary");
    squadSummary.innerHTML = ''
    
    for (let match in matchesData)
    {
        if(matchesData[match]['chapter'] != value) {continue;}
        
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
    }
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function chapterScoresSelection(value){

    scoreSummary = document.getElementById("squads-summary");
    scoreSummary.innerHTML = ''
    
    for (let match in matchesData)
    {
        if(matchesData[match]['chapter'] != value) {continue;}
        
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
                    <ul class="list-group list-group"  style="height: 413px; max-height: 413px; overflow-y: scroll">`
                    for (let player in matchesData[match]['squads'][team]['players']){
                        if(matchesData[match]['squads'][team]['players'][player]['score'] === 'None'){ // TODO: change with correct style
                            matchesData[match]['squads'][team]['players'][player]['score'] = {};
                        }
                        pageElem += `<li class="list-group-item">
                        <div class="row">
                        <div class="col-5" data-bs-toggle="offcanvas" href="#charStatOffcanvas" role="button" aria-controls="charStatOffcanvas" onclick="loadPlayerOffcanvas('${matchesData[match]['squads'][team]['players'][player]['name']}')">
                        ${matchesData[match]['squads'][team]['players'][player]['name']} `
                        if(matchesData[match]['squads'][team]['players'][player]['role'] === "Capitano"){
                            pageElem += `<span class="badge bg-primary">x2</span>`
                        } 
                        else if(matchesData[match]['squads'][team]['players'][player]['role'] === "Vice"){
                            pageElem += `<span class="badge bg-info text-dark">x1.5</span>`
                        }
                        pageElem += `</div><div class="col-7">`
                        Object.keys(matchesData[match]['squads'][team]['players'][player]['score']).forEach(key => {
                            if(matchesData[match]['squads'][team]['players'][player]['score'][key] > 0){
                                pageElem += `<span class="badge bg-success me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${scoresData[key]['description']}">
                                ${key} ${matchesData[match]['squads'][team]['players'][player]['score'][key]}</span>`
                            }
                            else {
                                pageElem += `<span class="badge bg-danger me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${scoresData[key]['description']}">
                                ${key} ${matchesData[match]['squads'][team]['players'][player]['score'][key]}</span>`
                            }
                            });
                        
                        pageElem += `</div></div></li>`;
                    } 
                        
                    pageElem += `</ul></div>`
            pageElemObj.innerHTML = pageElem.trim();
            scoreSummary.appendChild(pageElemObj);
        }
    }
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}
