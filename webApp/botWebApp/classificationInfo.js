function loadClassificationInfo(containerObj) {
    
    if(containerObj) { return containerObj}
    
    let tempContainer = document.createElement('div')
    tempContainer.classList.add('container');

    let chaptersLBhtml = `<div id="chaptersLeaderboards" class="carousel slide" data-bs-ride="carousel" data-bs-interval="100000">
    <div class="carousel-indicators">`
    
    // Init the global leaderboard values
    let globalLB = [];
    for(team of matchesData[0].squads){
        // let teamInfo = new Map();
        // teamInfo.set('team_id', team.team_id);
        // teamInfo.set('total_score', 0);
        const teamInfo = {team_id: team.team_id, total_score: 0 };
        globalLB.push(teamInfo);
    }

    let carouselInnerHtml = ``;
    let carouselIndicatorsHtml = ``;
    let indicatorCounter = 1;
    for(match of matchesData)
    {
        if (match.state !== "COMPLETED"){continue;}

        carouselIndicatorsHtml += `<button type="button" data-bs-target="#chaptersLeaderboards" data-bs-slide-to="${indicatorCounter}" aria-label="Capitolo ${match.chapter}"></button>`
        indicatorCounter += 1;
        // Create carousel item with leaderboard and title from the chapter
        let carouselItemHtml = `
            <div class="carousel-item">
                <div class="container leaderboard">
                    <h1>Capitolo ${match.chapter}</h1>`
        
        let orderedTeamsList = match.squads;
        orderedTeamsList.sort((teamA, teamB) => teamB.total_score - teamA.total_score);

        for(team of orderedTeamsList){
            // Add the value to the global score 
            globalSBIndex = globalLB.findIndex(item => item.team_id === team.team_id);
            globalLB[globalSBIndex].total_score += Number(team.total_score);

            // Create the team element for the list and retrieve team info 
            let teamInfo = teamsData.find(item => item.team_id === team.team_id);
            let teamElemHtml = `
                <div class="container row team-elem">
                    <div class="col">
                        <img src="data:image/jpeg;base64,${teamInfo.jolly_roger}" class="rounded-circle mw-100" alt="..."></img> 
                    </div>
                    <div class="col-7 team-name">${teamInfo.team_name}</div>
                    <div class="col-2 team-score">${team.total_score}</div>
                </div>`
            // console.log(teamElemHtml)
            carouselItemHtml += teamElemHtml;
        }
        carouselItemHtml += `</div></div>`
        carouselInnerHtml = carouselItemHtml + carouselInnerHtml;
    }
    carouselInnerHtml += `</div>`;

    // Create carousel item for global leaderboard
    let globalItemHtml = `
        <div class="carousel-item active">
            <div class="container leaderboard">
                <h1>Classifica totale</h1>`
    
    globalLB.sort((teamA, teamB) => teamB.total_score - teamA.total_score);
    
    for(team of globalLB){
        // Create the team element for the list and retrieve team info 
        let teamInfo = teamsData.find(item => item.team_id === team.team_id);
        let teamElemHtml = `
            <div class="container row team-elem">
                <div class="col">
                    <img src="data:image/jpeg;base64,${teamInfo.jolly_roger}" class="rounded-circle mw-100" alt="..."></img> 
                </div>
                <div class="col-7 team-name">${teamInfo.team_name}</div>
                <div class="col-2 team-score">${team.total_score}</div>
            </div>`
        // console.log(teamElemHtml)
        globalItemHtml += teamElemHtml;
    }
    globalItemHtml += `</div></div>`
    carouselInnerHtml = globalItemHtml + carouselInnerHtml;

    carouselIndicatorsHtml = `<button type="button" data-bs-target="#chaptersLeaderboards" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Classifica totale"></button>`
                            + carouselIndicatorsHtml;
    carouselIndicatorsHtml += `</div><div class="carousel-inner">`

    chaptersLBhtml += carouselIndicatorsHtml + carouselInnerHtml;   
    chaptersLBhtml +=  
    `<button class="carousel-control-prev" type="button" data-bs-target="#chaptersLeaderboards" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#chaptersLeaderboards" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
    </button>
    </div>` // This close the carousel div

    tempContainer.innerHTML = chaptersLBhtml.trim();

    // console.log(tempContainer)
    containerObj = tempContainer;

    return containerObj
}
