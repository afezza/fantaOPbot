function loadTeamInfo(cardObj) {

    if(cardObj) { return cardObj}
    
    let tempCard = document.createElement('div')
    tempCard.classList.add('card-body');
    tempCard.textContent = "team Info";

    // console.log(tempCard)
    cardObj = tempCard;

    return cardObj
}
