function loadSquadsInfo() {

    // Generate the content 
    pageContent = 
    `<div class="row">
        <div class="page-element col-sm-12">
            <div class="card shadow">
            <div class="card-body">
                <div class="row">
                    <h4 class="card-title col">Seleziona il capitolo</h4>`
                    
                    let selectHtlm = `<select class="form-select col" aria-label="Chapter selection" id="squad-chapter-selection" onchange="chapterSquadsSelection(this.value)">`
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
                    <div class="card-header">
                    <h4 class="text-center">${teams_names.get(matchesData[match]['squads'][team]['team_id'])}</h4>
                    </div>
                    <ul class="list-group list-group">`
                    for (let player in matchesData[match]['squads'][team]['players']){
                        pageElem += `<li class="list-group-item">
                        <div class="row">
                        <div class="col-10">${matchesData[match]['squads'][team]['players'][player]['name']}</div>
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
