const scores = //SCORES_ARRAY;
let matchesData = //CHAPTER_DATA;
let teamsData = //TEAMS_DATA;
// let teamsData = [{"team_name":"Gli animaletti del bosco","team_id":"9346","owner":"@Skizzo_lucido","tokens_left":"0","jolly_roger":"https://i.ibb.co/PZ2Rq3sJ/photo-5829911947175380908-c.jpg","players":[{"name":"Saint Sommers","price":"50"},{"name":"Bijorn","price":"35"},{"name":"Mag","price":"38"},{"name":"Brogy","price":"67"},{"name":"Chopper","price":"49"},{"name":"Sasaki","price":"8"},{"name":"Franky","price":"50"},{"name":"Ylva","price":"1"},{"name":"Johanna","price":"1"},{"name":"Im","price":"1"}],"swap":[{"sell":"Akainu","buy":"Johanna","price":"46"},{"sell":"Otama","buy":"Bijorn","price":"46"},{"sell":"Speed","buy":"Mag","price":"46"}]},{"team_name":"Piggy Squad","team_id":"10607","owner":"@Saccottone","tokens_left":"14","jolly_roger":"https://i.ibb.co/ycJc393x/photo-6023753033948709990-c.jpg","players":[{"name":"Nami","price":"32"},{"name":"Goldberg","price":"21"},{"name":"Stansen","price":"21"},{"name":"Yamato","price":"51"},{"name":"Re Harald","price":"20"},{"name":"Gunko","price":"54"},{"name":"Dory","price":"51"},{"name":"Page One","price":"20"},{"name":"Karsee","price":"12"},{"name":"Scaldi","price":"4"}],"swap":[{"sell":"Kiba","buy":"Page One","price":"46"},{"sell":"Blade","buy":"Scaldi","price":"46"}]},{"team_name":"Kaizoku D. Parutenope","team_id":"10620","owner":"@UncleSamma","tokens_left":"10","jolly_roger":"https://i.ibb.co/YB7MRYHX/photo-5913526443508354127-y.jpg","players":[{"name":"Jinbe","price":"29"},{"name":"Nico Robin","price":"60"},{"name":"Road","price":"29"},{"name":"Hajrudin","price":"86"},{"name":"Zoro","price":"50"},{"name":"Brook","price":"31"},{"name":"Morgans","price":"1"},{"name":"Morley","price":"2"},{"name":"Nekomamushi","price":"1"},{"name":"Dragon","price":"1"}],"swap":"None"},{"team_name":"è tutto sbagliato","team_id":"9034","owner":"@zii_fons","tokens_left":"19","jolly_roger":"https://i.ibb.co/C3pL6By4/0078xvda.png","players":[{"name":"Ulti","price":"4"},{"name":"Saint Kiringam","price":"41"},{"name":"Sanji","price":"50"},{"name":"Sauro","price":"71"},{"name":"Usopp","price":"51"},{"name":"Shamrock Figarland","price":"11"},{"name":"Ange","price":"29"},{"name":"Oimo","price":"15"},{"name":"Koron","price":"8"},{"name":"Bibi","price":"1"}],"swap":[{"sell":"Who's who","buy":"Ulti","price":"46"}]},{"team_name":"I pirati di Picchiatello","team_id":"6095","owner":"@Tonyosuke","tokens_left":"52","jolly_roger":"https://i.ibb.co/WWGMN8X4/60083ca9-b820-42b3-9857-37c2910fb014.jpg","players":[{"name":"Scopper Gaban","price":"30"},{"name":"Ripley","price":"21"},{"name":"Luffy","price":"210"},{"name":"Orso Bartolomew","price":"1"},{"name":"Jewerly Bonney","price":"1"},{"name":"Shanks","price":"5"},{"name":"Lilith (Punk 02)","price":"12"},{"name":"Barbanera","price":"8"},{"name":"Buggy","price":"1"},{"name":"Kuzan - Aokiji","price":"1"}],"swap":[{"sell":"Mihawk","buy":"Buggy","price":"46"}]},{"team_name":"Kyojin Gomblottari","team_id":"9359","owner":"@bombo_100","tokens_left":"8","jolly_roger":"https://i.ibb.co/b5G53Fdj/photo-5915486009452250849-x.jpg","players":[{"name":"Karin","price":"11"},{"name":"Jarul","price":"38"},{"name":"Loki","price":"201"},{"name":"Karasu","price":"1"},{"name":"Sabo","price":"1"},{"name":"Gerd","price":"27"},{"name":"Black Maria","price":"5"},{"name":"Kawamatsu","price":"6"},{"name":"Mosa","price":"1"},{"name":"Ryokugyu - Toro Verde","price":"1"}],"swap":[{"sell":"Seraphim Doflamingo","buy":"Karin","price":"46"},{"sell":"Saint Shepherd Ju Peter","buy":"Sabo","price":"46"},{"sell":"Raizou","buy":"Karasu","price":"46"}]}];

const roles = ["Capitano", "Vice", "Titolare", "1° riserva", "2° riserva", "3° riserva"];

function populateTabs() {
    const tabPanel = document.getElementById("tabPanel");
    tabPanel.innerHTML = "";
    
    matchesData.forEach(chapter => {
        if(chapter.squads == 'None')
        {
            chapter.squads = [];
            teamsData.forEach(team => {
                let actualTeamData = {"team_id":team.team_id, "total_score":0.0, "players":[]};
                team.players.forEach(player => {
                    actualTeamData.players.push({"name":player.name,"role":"Titolare","score":"None"});
                });
                chapter.squads.push(actualTeamData);
            });
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
    document.getElementById("chapterTitle").textContent = "Chapter " + chapter.chapter;
    document.getElementById("chapterStatus").value = chapter.state || "None";
    document.getElementById("chapterStatus").onchange = function() {
        chapter.state = this.value;
    };
    const teamsContainer = document.getElementById("teamsContainer");
    teamsContainer.innerHTML = "";
    chapter.squads.forEach(team => {
        const teamDiv = renderTeams(chapter,team);
        teamsContainer.appendChild(teamDiv);
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

function renderTeams(chapter,team) {
    const teamDiv = document.createElement("div");
    teamDiv.classList.add("team");
    // teamDiv.innerHTML = `<h2>Team ${team.team_id} - Score: ${team.total_score}</h2>`;
    const playerList = document.createElement("ul");
    playerList.classList.add("player-list");

    players_score_counter = 0;
    team.total_score = 0;
    team.players.forEach(player => {
        let totalScore = Object.values(player.score || {}).reduce((a, b) => a + parseFloat(b || 0), 0);
        if (Object.keys(player.score).length > 0) { // if player hasn't scored skip this part
            players_score_counter += 1;
            // totalScore = Object.values(player.score || {}).reduce((a, b) => a + parseFloat(b || 0), 0);
            if (player.role === "Capitano") {
                totalScore *= 2;
            } else if (player.role === "Vice") {
                totalScore *= 1.5;
            } else if (player.role.includes("riserva") && players_score_counter > 7) {
                totalScore = 0;
            }
        }
        team.total_score += totalScore; // Add the player total score to the team total score
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
            <span class="total-score">Total: ${totalScore}</span>
            </div>
            <ul class="score-list">
                ${Object.entries(player.score || {}).map(([key, value]) => `<li>${scores[key]["description"]}: ${value} 
                    <button class="trash-bin" onclick="deleteScore('${chapter.chapter}','${player.name}','${key}')">🗑️</button></li>`).join('')}
                </ul>
                `;
        playerItem.querySelector(".role-dropdown").addEventListener("change", function() {
            player.role = this.value;
        });
        playerList.appendChild(playerItem);
    });
    teamDiv.innerHTML = `<h2>Team ${team.team_id} - Score: ${team.total_score}</h2>`;
    teamDiv.appendChild(playerList);
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
    let scoreQuery = "score-" + chapterId + "-" + playerName;
    const scoreKey = document.getElementById(scoreQuery).value;

    console.log(chapterId + " => adding {" + scoreKey + "} to " + playerName);
    matchesData.forEach(chapter => {
        if (chapterId === chapter.chapter) {
            chapter.squads.forEach(team => {
                team.players.forEach(player => {
                    if (playerName === player.name) {
                        player.score[scoreKey] = scores[scoreKey].value;
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
    // Convert empty objects to None
    matchesData.forEach(chapter => {
        // Check if the chapter data exsist
        if(chapter.state === "None"){
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

    // Make the POST request using fetch
    fetch('https://lhkbtday6kadh4pmzfnemlpqzq0plkki.lambda-url.eu-north-1.on.aws/rank_validation', {
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

populateTabs();
