// var bouton = document.querySelector('.switch');
// bouton.on('click', function () {
//   alert('Click !');
// });

window.onload = init;

function init () {
  console.log('Init');

  var caseACocher = document.querySelector('.switch input');
  botMode = caseACocher.checked;
  // console.dir(caseACocher);

  var modeBotEtat = document.querySelector('#modeBotEtat');
  modeBotEtat.innerText = "Bouton OFF  : Le bot est activé et répond";
}

function switchMode () {
  var modeBotEtat = document.querySelector('#modeBotEtat');
  //console.dir(modeBotEtat);
  botMode = !botMode;

  if (botMode) {
    modeBotEtat.innerText = "Bouton ON   : L'humain doit répondre";
  } else {
    modeBotEtat.innerText = "Bouton OFF  : Le bot est activé et répond";
  }
  console.log(botMode);
}
