function loadMainInfo(cardObj) {

    if(cardObj) { return cardObj}
    
    let tempCard = document.createElement('div')
    tempCard.classList.add('card-body');
    tempCard.textContent = "main Info";

    // console.log(tempCard)
    cardObj = tempCard;

    return cardObj
}
