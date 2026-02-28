const scores = //SCORES_ARRAY;
let matchesData = //CHAPTER_DATA;
let teamsData = //TEAMS_DATA;

const roles = ["None", "Capitano", "Vice", "Titolare", "1° riserva", "2° riserva", "3° riserva"];

let teams_names = new Map();

function populateTabs() {
    const tabPanel = document.getElementById("tabPanel");
    tabPanel.innerHTML = "";

    for (let team in teamsData){
        teams_names.set(teamsData[team]['team_id'],teamsData[team]['team_name'])
    }
    
    matchesData.forEach(chapter => {
        if(chapter.squads == 'None')
        {
            chapter.squads = [];
            teamsData.forEach(team => {
                let actualTeamData = {"team_id":team.team_id, "total_score":0.0, "players":[]};
                team.players.forEach(player => {
                    actualTeamData.players.push({"name":player.name,"role":"None","score":"None"});
                });
                chapter.squads.push(actualTeamData);
            });
        }
        else 
        {
            chapter.squads.sort((a, b) => parseFloat(b.total_score) - parseFloat(a.total_score));
        }

        chapter.squads.forEach(team => {
            team.players.forEach(player => {
                if (player.score === "None") {
                    player.score = {};
                }
            });
        });

        const tab = document.createElement("div");
        tab.classList.add("tab-item");
        tab.textContent = "Chapter " + chapter.chapter;
        tab.onclick = () => {
            document.querySelectorAll(".tab-item").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            loadTeamsForChapter(chapter);
        };
        tabPanel.appendChild(tab);
    });
}

function loadTeamsForChapter(chapter) {
    // Collect chapter info
    document.getElementById("chapterTitle").textContent = "Chapter " + chapter.chapter;
    document.getElementById("chapterStatus").value = chapter.state || "None";
    document.getElementById("chapterStatus").onchange = function() {
        chapter.state = this.value;
    };
    // Get teams container and clean it's content
    const teamsContainer = document.getElementById("teamsContainer");
    teamsContainer.innerHTML = "";
    // Recalculate the scores and generate div content
    let teamsDivs = new Map();
    chapter.squads.forEach(team => {
        teamsDivs.set(team.team_id,renderTeams(chapter,team));
    });
    // Order the array based on total score
    chapter.squads.sort((a, b) => parseFloat(b.total_score) - parseFloat(a.total_score));
    // Add the content in the container
    chapter.squads.forEach(team => {
        teamsContainer.appendChild(teamsDivs.get(team.team_id));
    });
}

function orderTeamsPlayers(){
    
    matchesData.forEach(chapter => {

        chapter.squads.forEach(team => {

            for (let i = 0; i < team.players.length; i++) {
                if (team.players[i].role === "Capitano") {
                    let temp = team.players[0];
                    team.players[0] = team.players[i];
                    team.players[i] = temp;
                } else if (team.players[i].role === "Vice") {
                    let temp = team.players[1];
                    team.players[1] = team.players[i];
                    team.players[i] = temp;
                } else if (team.players[i].role.includes("1")) {
                    let temp = team.players[team.players.length - 3];
                    team.players[team.players.length - 3] = team.players[i];
                    team.players[i] = temp;
                } else if (team.players[i].role.includes("2")) {
                    let temp = team.players[team.players.length - 2];
                    team.players[team.players.length - 2] = team.players[i];
                    team.players[i] = temp;
                } else if (team.players[i].role.includes("3")) {
                    let temp = team.players[team.players.length - 1];
                    team.players[team.players.length - 1] = team.players[i];
                    team.players[i] = temp;
                }
            };
        });

    });
}

function calculatePlayerScore(player) {
    let playerScore = Object.values(player.score || {}).reduce((a, b) => a + parseFloat(b || 0), 0);
    if (Object.keys(player.score).length > 0) { // if player hasn't scored skip this part
        players_score_counter += 1;
        if (player.role === "Capitano") {
            playerScore *= 2;
        } else if (player.role === "Vice") {
            playerScore *= 1.5;
        } else if (player.role.includes("riserva") && players_score_counter > 7) {
            playerScore = 0;
        }
    }
    return playerScore;
}

function renderTeams(chapter,team) {
    const teamDiv = document.createElement("div");
    teamDiv.classList.add("team");
    const playerList = document.createElement("ul");
    playerList.classList.add("player-list");

    orderTeamsPlayers() // Reorder team player by role needs to correct calculate the final score

    players_score_counter = 0;
    team.total_score = 0;
    team.players.forEach(player => {
        player_score = calculatePlayerScore(player);
        team.total_score += player_score; // Add the player total score to the team total score
        const playerItem = document.createElement("li");
        playerItem.classList.add("player-item");
        playerItem.dataset.name = player.name.toLowerCase();
        playerItem.innerHTML = `
        <div class="player-info">
            <span>${player.name}</span>
            <select class="role-dropdown">
                ${roles.map(role => `<option value="${role}" ${player.role === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
            <div class="score-search">
                <datalist id="score-suggestions">
                    ${Object.entries(scores || {}).map(([key, value]) => `<option value="${key}">${scores[key].description}</option>`).join('')}
                </datalist>
                <input id="score-${chapter.chapter}-${player.name}" type="text" autoComplete="on" list="score-suggestions"/> 
                <button class="add-button" onclick="addScore('${chapter.chapter}','${player.name}')">+</button>
            </div>
            <span class="total-score" id="score-${chapter.chapter}-${player.name}-value">Total: ${player_score}</span>
            </div>
            <ul class="score-list" id="score-list-${chapter.chapter}-${player.name}">
                ${Object.entries(player.score || {}).map(([key, value]) => `<li>${scores[key]["description"]}: ${value} 
                    <button class="trash-bin" onclick="deleteScore('${chapter.chapter}','${player.name}','${key}')">🗑️</button></li>`).join('')}
                </ul>
                `;
        playerItem.querySelector(".role-dropdown").addEventListener("change", function() {
            player.role = this.value;
            team.total_score -= player_score;
            player_score = calculatePlayerScore(player);
            playerItem.querySelector(".total-score").innerText = `Total: ${player_score}`
        });
        playerList.appendChild(playerItem);
    });
    teamDiv.innerHTML = `<h2>${teams_names.get(team.team_id)} - Score: ${team.total_score}</h2>`;
    teamDiv.appendChild(playerList);

    let filter = document.getElementById("searchBox").value.toLowerCase();
    teamDiv.querySelectorAll(".player-item").forEach(player => {
        let playerTeamDiv = player.closest(".team");
        player.style.display = player.dataset.name.includes(filter) ? "block" : "none";
        playerTeamDiv.style.display = playerTeamDiv.querySelector(".player-item[style='display: block;']") ? "block" : "none";
    });

    return teamDiv;
}

function deleteScore(chapterId, playerName, scoreKey) {
    console.log(chapterId + " => removing {" + scoreKey + "} from " + playerName);
    matchesData.forEach(chapter => {
        if (chapterId === chapter.chapter) {
            chapter.squads.forEach(team => {
                team.players.forEach(player => {
                    if (playerName === player.name) {
                        delete player.score[scoreKey];
                        loadTeamsForChapter(chapter);
                        return;
                    }
                });
            });
        }
    });
}

function addScore(chapterId, playerName) {
    const scoreKey = document.getElementById(`score-${chapterId}-${playerName}`).value;

    // console.log(chapterId + " => adding {" + scoreKey + "} to " + playerName);
    matchesData.forEach(chapter => {
        if (chapterId === chapter.chapter) {
            chapter.squads.forEach(team => {
                team.players.forEach(player => {
                    if (playerName === player.name) {
                        if (player.role !== "None") {
                            player.score[scoreKey] = scores[scoreKey].value;
                        }
                        else {
                            player.score[scoreKey] = 0;
                        }
                        loadTeamsForChapter(chapter);
                        return;
                    }
                });
            });
        }
    });
}

document.getElementById("searchBox").addEventListener("input", function() {
    let filter = this.value.toLowerCase();
    document.querySelectorAll(".player-item").forEach(player => {
        let teamDiv = player.closest(".team");
        player.style.display = player.dataset.name.includes(filter) ? "block" : "none";
        teamDiv.style.display = teamDiv.querySelector(".player-item[style='display: block;']") ? "block" : "none";
    });
});

document.getElementById('saveButton').addEventListener('click', function() {
    // Check for chapters that have scores but are not marked as complete 
    let check_list = []
    matchesData.forEach(chapter => {
        // Ignore completed chapters
        if(chapter.state === "COMPLETED"){
            return;
        }
        // If one of the teams score is different than 0 report the chapter to check
        chapter.squads.some(team => {
            if (team.total_score !== 0) {
                check_list.push(chapter.chapter);
                return true;
            }
        });
    });

    // If there are chapter to check alert the user
    if (check_list.length > 0) {
        check_text = `The following chapters are not marked as completed but have scores saved.\n\n${check_list}`
        check_text += `\n\nDo you want to save anyway?`
        if(!window.confirm(check_text)){
            return;
        }
    }

    // Convert empty objects to None
    matchesData.forEach(chapter => {
        // Check if the chapter data exsist
        if(chapter.state === "None"){
            chapter.squads = "None"
            return;
        }
        // For valid chapters change the scores empty objects to None
        chapter.squads.forEach(team => {
            team.players.forEach(player => {
                if (Object.keys(player.score).length <= 0) {
                    player.score = "None";
                }
            });
        });
    });

    // console.log(JSON.stringify(chapters));
    // Get the token entered by the user
    const token = document.getElementById('inputToken').value;
    document.getElementById('inputToken').value = "";
    // Create the payload with the token and JSON data
    const dataToSend = {
        token: token,
        jsonData: JSON.stringify(matchesData)
    };

    let url_to_post = 'https://lhkbtday6kadh4pmzfnemlpqzq0plkki.lambda-url.eu-north-1.on.aws/rank_validation' + window.location.search;
    // Make the POST request using fetch
    fetch(url_to_post, {
        method: 'POST',
        // mode: 'no-cors',
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

    // Convert None to empty objects
    matchesData.forEach(chapter => {
        // Check if the chapter data exsist
        if(chapter.state === "None"){
            return;
        }
        // For valid chapters change the scores empty objects to None
        chapter.squads.forEach(team => {
            team.players.forEach(player => {
                if (player.score === "None") {
                    player.score = {};
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('inputToken').value = urlParams.get("token");  

    populateTabs();
});
