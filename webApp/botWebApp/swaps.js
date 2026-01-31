var swap_status = "None";

function showSwapButton() {
    if (is_origin_telegram === true && swap_status !== "None") {
        navbar_elem = document.getElementById("navbar-elements");
        swapBtnContent = `<button type="button" class="btn btn-warning" href="#"
                            data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show"
                            onclick="loadPage('Scambi')"><span>Scambi</span></button>`
        let swapBtnObj = document.createElement('li')
        swapBtnObj.classList.add('nav-item');
        swapBtnObj.innerHTML = swapBtnContent.trim();
        navbar_elem.appendChild(swapBtnObj);
    }
}

function playerSwapSelect(selected_team, player_name, value) {
    if (value === "None") {
        let temp_arr = [];
        for (let swap in teamsData[selected_team]['swap']) {
            if (teamsData[selected_team]['swap'][swap]['sell'] !== player_name) {
                temp_arr.push(teamsData[selected_team]['swap'][swap])
            }
        }
        teamsData[selected_team]['swap'] = temp_arr
        if (teamsData[selected_team]['swap'].length === 0) { teamsData[selected_team]['swap'] = "None" }
    }
    else {
        actual_swap = {
            "sell": player_name,
            "buy": "",
            "price": "",
            "old_price": ""
        }
        for (let player in teamsData[selected_team]['players']) {
            if (teamsData[selected_team]['players'][player]['name'] === player_name) {
                actual_swap["old_price"] = teamsData[selected_team]['players'][player]['price'];
            }
        }
        if (teamsData[selected_team]['swap'] === "None") {
            teamsData[selected_team]['swap'] = [actual_swap]
        }
        else {
            teamsData[selected_team]['swap'].push(actual_swap)
        }
    }
}

function loadSwapsInfo() {
    let selected_team = 0;
    // Find the team id using the owner username
    for (let team in teamsData) {
        if (teamsData[team]["owner"] === ('@' + Telegram.WebApp.initDataUnsafe.user.username)) {
            user_team_id = teamsData[team]["team_id"];
            selected_team = team;
            break;
        }
    }

    let pageElemObj = document.createElement('div')
    pageElemObj.classList.add('page-element');
    pageElemObj.classList.add('col-sm-6');
    let pageElem = '';

    if (swap_status === "Svincola") {
        pageElem = `
        <div class="card shadow">
        <div class="card-header row gx-0">
        <h4 class="col-9 text-center">Rimanenti ${teamsData[selected_team]['tokens_left']} berries</h4>
        <div class="col-3">
        <button type="button" class="btn btn-outline-primary btn-sm" onclick="storeUserSwaps(${selected_team})"><i class="bi bi-floppy2-fill"></i></button>
        </div></div>
        <ul class="list-group list-group">`

        for (let player in teamsData[selected_team]['players']) {
            pageElem += `<li class="list-group-item">
            <div class="row">
            <div class="col-6" data-bs-toggle="offcanvas" href="#charStatOffcanvas" role="button" aria-controls="charStatOffcanvas" onclick="loadPlayerOffcanvas('${teamsData[selected_team]['players'][player]['name']}')">
            ${teamsData[selected_team]['players'][player]['name']}</div>
            <div class="col-6"> 
            <select class="form-select" aria-label="Player swap selection" id="player-swap-selection" onchange="playerSwapSelect(${selected_team},'${teamsData[selected_team]['players'][player]['name']}',this.value)">`
            if (teamsData[selected_team]['swap'] === "None") {
                pageElem += `<option value="None" selected></option><option value="Svincola">Svincola</option>`
            }
            else {
                let swap_found = false;
                for (let swap in teamsData[selected_team]['swap']) {
                    if (teamsData[selected_team]['swap'][swap]['sell'] === teamsData[selected_team]['players'][player]['name']) {
                        pageElem += `<option value="None"></option><option value="Svincola" selected>Svincola</option>`
                        swap_found = true;
                    }
                }
                if (swap_found === false) {
                    pageElem += `<option value="None" selected></option><option value="Svincola">Svincola</option>`
                }
            }
            pageElem += `</select></div></div></li>`;
        }
        pageElem += `</ul></div>`
    }
    else if (swap_status === "Offri") {
        if (teamsData[selected_team]['swap'] !== "None") {
            pageElem = `
                <div class="card shadow">
                <div class="card-header row gx-0">
                <h4 class="col-9 text-center">Rimanenti ${parseInt(teamsData[selected_team]['tokens_left']) + teamsData[selected_team]['swap'].length} berries</h4>
                <div class="col-3">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="storeUserOffers(${selected_team})"><i class="bi bi-floppy2-fill"></i></button>
                </div></div>
                <ul class="list-group list-group">`
            for (let i = 0; i < teamsData[selected_team]['swap'].length; i++) {
                if (teamsData[selected_team]['swap'][i]['buy'] != "") {
                    continue
                }
                pageElem += `<li class="list-group-item">
                    <input type="text" class="form-control" id="nameInput-${i}" placeholder="Nome personaggio">
                    <input type="number" class="form-control" id="offertInput-${i}" placeholder="Offerta">
                    </li>`
            }
            pageElem += `</ul></div>`
        }
    }

    pageElemObj.innerHTML = pageElem.trim();
    return pageElemObj;
}

function storeUserSwaps(selected_team) {

    const dataToSend = {
        initData: Telegram.WebApp.initData,
        command: "store_team_swap",
        swapData: JSON.stringify(teamsData[selected_team]['swap'])
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

function storeUserOffers(selected_team) {

    let offerts_value = 0;
    let send_text = '';
    for (let i = 0; i < teamsData[selected_team]['swap'].length; i++) {
        offerts_value += parseInt(document.getElementById(`offertInput-${i}`).value);
        send_text += document.getElementById(`nameInput-${i}`).value + " " + document.getElementById(`offertInput-${i}`).value + "\n";
    }
    if (offerts_value > (parseInt(teamsData[selected_team]['tokens_left']) + teamsData[selected_team]['swap'].length)) {
        window.alert("Berries insufficienti. Controlla le offerte e riprova.");
        return;
    }

    const dataToSend = {
        initData: Telegram.WebApp.initData,
        command: "store_team_offerts",
        swapData: send_text
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
