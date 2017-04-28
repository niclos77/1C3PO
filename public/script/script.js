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
  if (botMode) {
    modeBotEtat.innerText = "Bouton ON   : L'humain doit répondre";
  } else {
    modeBotEtat.innerText = "Bouton OFF  : Le bot est activé et répond";
  }
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

  var myHeaders = new Headers();
  var myInit = { method: 'GET',
                 headers: myHeaders,
                 mode: 'cors',
                 cache: 'default' };

  // fetch('https://one-c3po.herokuapp.com/switchMode', myInit)
  fetch('https://localhost:3000/switchMode', myInit)
  .then(function(response) {
    console.log(response);
  })
}
