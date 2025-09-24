function loadScoresInfo() {

    // Generate the content 
    pageContent = 
    `<div class="row">
        <div class="page-element col-sm-12">
            <div class="card shadow">
            <div class="card-body">
                <div class="row">
                    <h4 class="card-title col">Seleziona il capitolo</h4>`
                    
                    let selectHtlm = `<select class="form-select col" aria-label="Chapter selection" id="score-chapter-selection" onchange="chapterScoresSelection(this.value)">`
                    for (let match = matchesData.length-1; match > 0; match--)
                    {
                        if(matchesData[match]['state'] != "COMPLETED") {continue;}
                    
                        selectHtlm += `<option value="${matchesData[match]['chapter']}">${matchesData[match]['chapter']}</option>`
                    
                    }
                    selectHtlm += `</select>`
                    
                    pageContent += selectHtlm +`
                </div>
            </div>
            </div>
        </div>
    </div>
    <div class="row" id="score-summary"></div>`
    
    let containerObj = document.createElement('div')
    containerObj.classList.add('container');
    containerObj.innerHTML = pageContent.trim();

    return containerObj
}

function chapterScoresSelection(value){

    scoreSummary = document.getElementById("score-summary");
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
                    <div class="card-header row">
                    <h4 class="col-9">${teams_names.get(matchesData[match]['squads'][team]['team_id'])}</h4>
                    <h5 class="col-3 text-center">${matchesData[match]['squads'][team]['total_score']}</h5>
                    </div>
                    <ul class="list-group list-group"  style="height: 250px; max-height: 250px; overflow-y: scroll">`
                    for (let player in matchesData[match]['squads'][team]['players']){
                        if(matchesData[match]['squads'][team]['players'][player]['score'] === 'None'){ // TODO: change with correct style
                            continue;
                        }
                        pageElem += `<li class="list-group-item">
                        <div class="row">
                        <div class="col-5">${matchesData[match]['squads'][team]['players'][player]['name']} `
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
