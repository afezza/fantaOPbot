
// The chapters array, which holds the data
const chapters = //CHAPTER_DATA;
let currentSelectedPlayer = null;
let currentSelectedTeam = null;
let currentSelectedLi = null;
let currentChapterIndex = null;
const scoresList = document.querySelector('.scores-list');
const scoreSelect = document.getElementById('scoreSelect');
const playerSelect = document.getElementById('playerSelect');
const tabPanel = document.getElementById('tabPanel');
const chapterTitle = document.getElementById('chapterTitle'); // Reference to the chapter title

// Dropdown Items
const dropdownItems = {"AppFl":{"value":"4","description":"Il personaggio appare in un Flashback"},"AppTag":{"value":"7","description":"Il personaggio appare in una taglia"},"AppUltPag":{"value":"1","description":"Il personaggio appare nell'ultima pagina"},"App":{"value":"3","description":"Il personaggio appare nel capitolo"},"AppCover":{"value":"4","description":"Il personaggio appare nella cover"},"App1Pag":{"value":"1","description":"Il personaggio appare nella prima pagina"},"CadAcq":{"value":"-5","description":"Il personaggio cade in acqua"},"Ener":{"value":"20","description":"Il personaggio fa la Ener Face"},"Occhi":{"value":"3","description":"Il personaggio ha la forma degli occhi particolare"},"Sta":{"value":"-3","description":"Il personaggio è stanco/inerme"},"Strate":{"value":"3","description":"Il personaggio escogita una strategia (deve essere chiara o spiegata da qualcuno)"},"Den":{"value":"3","description":"Il personaggio parla al Lumacofono (o qualsiasi dispositivo simile)"},"Ride":{"value":"3","description":"Il personaggio ride (risata caratteristica)"},"Bru":{"value":"-3","description":"Il personaggio subisce una bruciatura"},"Nom":{"value":"1","description":"Il personaggio viene nominato (ma non appare)"},"Tit":{"value":"3","description":"Il Titolo fa riferimento al personaggio"},"ManFru":{"value":"10","description":"Il personaggio mangia un frutto del Diavolo"},"Muo":{"value":"-20","description":"Il personaggio muore"},"ParSc":{"value":"1","description":"Il personaggio partecipa ad uno scontro"},"PerSc":{"value":"-4","description":"Il personaggio perde uno scontro"},"Pian":{"value":"-2","description":"Il personaggio piange"},"App0p":{"value":"5","description":"Il personaggio è il primissimo personaggio ad apparire"},"SalvQual":{"value":"3","description":"Il personaggio salva qualcuno"},"Trasf":{"value":"6","description":"Il personaggio si trasforma"},"SubCol":{"value":"-2","description":"Il personaggio subisce un colpo"},"Svie":{"value":"-4","description":"Il personaggio sviene"},"MVP":{"value":"5","description":"Il personaggio è l'MVP del capitolo"},"Kill":{"value":"10","description":"Il personaggio uccide qualcuno"},"AppUlt":{"value":"5","description":"Il personaggio è l'ultimo personaggio ad apparire"},"Haki":{"value":"3","description":"Il personaggio utilizza l'Haki"},"UtTec":{"value":"1","description":"Il personaggio utilizza una tecnica"},"Avvel":{"value":"-4","description":"Il personaggio viene avvelenato"},"Catt":{"value":"-3","description":"Il personaggio viene catturato/imprigionato"},"Fer":{"value":"-5","description":"Il personaggio viene ferito"},"Mut":{"value":"-7","description":"Il personaggio viene mutilato"},"Scop":{"value":"-2","description":"Il personaggio viene scoperto"},"Vinc":{"value":"7","description":"Il personaggio vince uno scontro"}};
// Function to populate chapter tabs
function createTabs() {
    currentChapterIndex = -1; 
    chapters.forEach((chapter, index) => {
        // Check if the chapter data exsist
        if(chapter.state === "None"){
            return;
        }
        // For valid chapters change the scores into an empty object
        chapter.squads.forEach(team => {
            team.players.forEach(player => {
                if (player.score === "None") {
                    player.score = {};
                }
            });
        });
        // Count the current index
        currentChapterIndex += 1;
        const tabItem = document.createElement('div');
        tabItem.classList.add('tab-item');
        tabItem.textContent = `Chapter ${chapter.chapter}`;
        tabItem.setAttribute('data-index', index);

        tabItem.addEventListener('click', () => selectChapter(index));
        tabPanel.appendChild(tabItem);
        // Update chapter title dynamically
        chapterTitle.textContent = `Chapter ${chapters[index].chapter}`;
    });
    selectChapter(currentChapterIndex);
}

// Function to handle selecting a chapter
function selectChapter(index) {
    // Update the active tab
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab-item[data-index="${index}"]`).classList.add('active');

    // Update the current chapter index
    currentChapterIndex = index;

    // Update chapter title dynamically
    chapterTitle.textContent = `Chapter ${chapters[index].chapter}`;

    // Update the player list for the selected chapter
    updatePlayersDropdown();
    updateSelectedPlayer();
    updateScoresList();
}

// Function to log and copy JSON to clipboard
document.getElementById('saveButton').addEventListener('click', function() {
    // Convert empty objects to None
    chapters.forEach(chapter => {
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
        jsonData: JSON.stringify(chapters)
    };

    // Make the POST request using fetch
    fetch('https://utaxx3uzbb.execute-api.eu-north-1.amazonaws.com/rank_validation', {
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
    chapters.forEach(chapter => {
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

function updatePlayersDropdown(){
    
    const chapter = chapters[currentChapterIndex];

    playerSelect.innerHTML = '<option value="">-- Select a Player --</option>'; // Clear the player dropdown

    chapter.squads.forEach(teamData => {
        teamData.players.forEach(player => {
            // Add players to the player dropdown
            const playerOption = document.createElement('option');
            playerOption.value = player.name;
            playerOption.textContent = player.name;
            playerSelect.appendChild(playerOption);
        });
    });
}

// Function to update the player list and dropdown for the selected chapter
function updateScoresList() {
    const chapter = chapters[currentChapterIndex];

    // Clear the existing content
    scoresList.innerHTML = '';
    scoreSelect.innerHTML = '<option value="">-- Select an item --</option>';

    // Populate the names list
    chapter.squads.forEach(teamData => {
        const teamDiv = document.createElement('div');
        const teamIdSpan = document.createElement('span');
        teamIdSpan.style.fontWeight = 'bold';
        teamData.total_score = calculateTotalScore(teamData.players);
        teamIdSpan.textContent = `Team ID: ${teamData.team_id} | Total Score: ${teamData.total_score} `;
        teamDiv.appendChild(teamIdSpan);
        teamDiv.setAttribute('team-id', teamData.team_id);
        scoresList.appendChild(teamDiv);

        teamData.players.forEach(player => {
            const li = document.createElement('li');
            const playerScore = calculatePlayerScore(player);
            li.textContent = `${player.name} (${player.role}) ${playerScore}`;
            if (player.role === "Capitano") {
                li.textContent += " x 2 => " + (playerScore*2);
            } else if (player.role === "Vice") {
                li.textContent += " x 1.5 => " + (playerScore*1.5); 
            }
            li.setAttribute('data-name', player.name);
            li.setAttribute('team-id', teamData.team_id);
            if (playerScore === 0) {
                li.setAttribute('class', "hide");
            }
            teamDiv.appendChild(li);
            addScoresToList(player.name, teamData.team_id);
        });
    });

    // Populate the scores dropdown
    Object.entries(dropdownItems).forEach(([key, item]) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.description + ` ` + item.value;
        option.setAttribute('data-key', key);
        scoreSelect.appendChild(option);
    });
}

// Function to calculate the score for a player
function calculatePlayerScore(player) {
    let playerScore = 0;

    Object.entries(player.score).forEach(([key, value]) => {
        if (dropdownItems[key]) {
            let scoreValue = parseFloat(dropdownItems[key].value) || 0;
            playerScore += scoreValue;
        }
    });

    return playerScore;
}

// Function to calculate the total score for a team
function calculateTotalScore(players) {
    let totalScore = 0;

    players.forEach(player => {
        Object.entries(player.score).forEach(([key, value]) => {
            if (dropdownItems[key]) {
                let scoreValue = parseFloat(dropdownItems[key].value) || 0;

                // Apply role-based multiplier
                if (player.role === "Capitano") {
                    scoreValue *= 2; // Double the score for Capitano
                } else if (player.role === "Vice") {
                    scoreValue *= 1.5; // Multiply by 1.5 for Vice
                }

                totalScore += scoreValue;
            }
        });
    });

    return totalScore;
}

// Function to update the selected player when the user selects a player from the dropdown
function updateSelectedPlayer() {
    const selectedPlayer = playerSelect.value;

    if (selectedPlayer) {
        currentSelectedPlayer = selectedPlayer;
        console.log(`Player selected: ${selectedPlayer}`);
        
        // Clear selection for all list items
        document.querySelectorAll('.scores-list li').forEach(li => li.classList.remove('selected'));
        
        // Mark the selected item as selected
        const playerLi = document.querySelector(`[data-name="${selectedPlayer}"]`);
        playerLi.classList.add('selected');
        currentSelectedLi = playerLi;  // Keep reference to the clicked li
        currentSelectedTeam = playerLi.getAttribute('team-id');
        // Update dropdown to reflect current selection
        updateScoresDropdown();
    } else {
        currentSelectedPlayer = null; // Reset if no player is selected
    }
}

// Event delegation for deleting sub-elements (associated items)
scoresList.addEventListener('click', function(e) {
    // Handle trash bin click
    if (e.target && e.target.classList.contains('trash-bin')) {
        const trashBin = e.target;  // The trash button itself
        const associatedLi = trashBin.parentElement;  // The li that the trash bin belongs to

        // Get the associated name and key
        const associatedName = associatedLi.getAttribute('data-associated-name');
        const associatedItemKey = associatedLi.getAttribute('data-associated-key');
        const associatedTeam = associatedLi.parentElement.getAttribute('team-id');

        // Remove the associated item from the player's score map
        const player = chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === associatedTeam)
            .players.find(player => player.name === associatedName);
        delete player.score[associatedItemKey];

        // Remove the associated item from the DOM
        associatedLi.remove();

        // Re-enable the item in the dropdown
        enableItemInDropdown(associatedItemKey);

        // Update the total score
        updateScoresList();
        updateSelectedPlayer();

        // Print updated associations
        console.log(`Updated score for ${associatedName}:`, player.score);
    }
});

// Function to add scores to a player's list
function addScoresToList(playerName, teamId) {
    const player = chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === teamId)
        .players.find(player => player.name === playerName);

    if (player && player.score) {
        const playerScores = player.score;

        const playerLi = document.querySelector(`[data-name="${playerName}"]`);

        if (playerLi) {
            Object.entries(playerScores).forEach(([key, value]) => {
                let itemDescription;
                if (dropdownItems[key]) {
                    itemDescription = dropdownItems[key].description + ` ` + dropdownItems[key].value;
                } else {
                    itemDescription = 'Unknown Item';
                }
                
                const scoreLi = document.createElement('li');
                scoreLi.textContent = itemDescription;

                scoreLi.setAttribute('data-associated-name', playerName);
                scoreLi.setAttribute('data-associated-key', key);

                scoreLi.classList.add('associated-item');

                const trashBin = document.createElement('button');
                trashBin.textContent = '🗑️';
                trashBin.classList.add('trash-bin');
                scoreLi.appendChild(trashBin);

                playerLi.appendChild(scoreLi);
            });
        }
    }
}

function addNameToList() {
    const selectedItemValue = document.getElementById("scoreSelect").value;
    const selectedItemKey = document.getElementById("scoreSelect").selectedOptions[0].getAttribute('data-key');  // Get the key of the selected item

    if (currentSelectedPlayer && selectedItemValue) {
        // Check if the item is already added to the player's score map
        const player = chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === currentSelectedTeam).players.find(p => p.name === currentSelectedPlayer);
        if (player.score[selectedItemKey]) {
            alert("This item has already been added.");
            return;
        }

        // Create a new associated item and append to the selected player's list
        const associatedLi = document.createElement("li");
        associatedLi.textContent = dropdownItems[selectedItemKey].description;

        // Add the associated name as a custom attribute to the li
        associatedLi.setAttribute('data-associated-name', currentSelectedPlayer);
        associatedLi.setAttribute('data-associated-key', selectedItemKey);

        // Create a trash bin button and append it to the associated item
        const trashBin = document.createElement('button');
        trashBin.textContent = '🗑️';  // Trash bin icon
        trashBin.classList.add('trash-bin');
        associatedLi.appendChild(trashBin);

        associatedLi.classList.add("associated-item");

        // Add the associated item to the selected player's score map
        chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === currentSelectedTeam).players.find(player => player.name === currentSelectedPlayer).score[selectedItemKey] = dropdownItems[selectedItemKey].value;

        // Add the associated item to the selected player's list in the DOM
        currentSelectedLi.appendChild(associatedLi);

        // Update dropdown state to disable the selected item for this player
        removeItemFromDropdown(selectedItemKey);

        // Clear the dropdown after selection
        document.getElementById("scoreSelect").value = "";

        updateScoresDropdown();
        updateScoresList();
        updateSelectedPlayer();
        console.log(`Updated score for ${currentSelectedPlayer}:`, chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === currentSelectedTeam).players.find(player => player.name === currentSelectedPlayer).score);

    } else {
        updateScoresList();
        alert("Please select a player on the left and an item from the dropdown.");
    }
}

function removeItemFromDropdown(itemKey) {
    const options = scoreSelect.options;
    for (let i = 1; i < options.length; i++) {
        if (options[i].getAttribute('data-key') === itemKey) {
            options[i].disabled = true;
            options[i].style.color = "gray";
            break;
        }
    }
    console.log(chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === currentSelectedTeam).players);
}

function enableItemInDropdown(itemKey) {
    const options = scoreSelect.options;
    for (let i = 1; i < options.length; i++) {
        if (options[i].getAttribute('data-key') === itemKey) {
            options[i].disabled = false;
            options[i].style.color = "black";
            break;
        }
    }
}

function updateScoresDropdown() {
    const options = scoreSelect.options;

    // Re-enable all options before updating
    for (let i = 1; i < options.length; i++) {
        options[i].disabled = false;
        options[i].style.color = "black";
    }

    // Disable items already selected for the current player using key
    if (currentSelectedPlayer) {
        const player = chapters[currentChapterIndex].squads.find(teamData => teamData.team_id === currentSelectedTeam).players.find(p => p.name === currentSelectedPlayer);
        Object.keys(player.score).forEach(key => {
            for (let i = 1; i < options.length; i++) {
                if (options[i].getAttribute('data-key') === key) {
                    options[i].disabled = true;
                    options[i].style.color = "gray";
                    break;
                }
            }
        });
    }
}

// Initialize the page
createTabs();
updateScoresList();
updatePlayersDropdown();
