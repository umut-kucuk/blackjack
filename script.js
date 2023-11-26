"use strict";

const valueCard = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "Q", "K"];
const valueSymbol = ["H", "D", "S", "C"];
let gameCards = [];
let inGameCards = [];
let payerHand = [];
let bankHand = [];
let tokens;
let account = 50;
let currentlyBet = 0;
let out;
let bank;

const random = (max=1, min=0) => Math.floor(Math.random() * (max - min) + min);

const accountUpdate = () =>  document.getElementById('outaccount').innerText = account + " $";

const betUpdate = () =>  document.getElementById('betupdate').innerText = currentlyBet + "$";

const displayFlex = (id) =>  document.getElementById(id).style.display = "flex";

const displayNone = (id) =>  document.getElementById(id).style.display = "none";

const askReby = () => displayFlex('tryagain');

const getSymbol = (id) => { 
	return id=="H" ? "heart" : id == "D" ? "diamond" : id == "S" ? "spades" : "clubs";
};

const createGameCards = () =>{
	for(let a=0 ; a<valueCard.length; a++){
		for(let b=0 ; b<valueSymbol.length; b++){
			let car = valueCard[a] + ',' + valueSymbol[b];
			gameCards.push(car.split(','));
		}
	}
};

const setEventToken = () => {
	for(let i=0; i<tokens.length; i++){
		tokens[i].addEventListener("click", function(){
			setBet(tokens[i], tokens[i].innerText)
		});
	}
};

const selectToken = (token) => {
	token.style.transform  = "scale(1.2)";
	document.getElementById('betupdate').style.transform  = "scale(1.2)";
	setTimeout(function() { 
		token.style.transform  = "scale(1)";
		 document.getElementById('betupdate').style.transform  = "scale(1)";
	}, 150);
	
};


const setBet = (token, val) => {
		let value = parseInt(val);
		if(val=="all"){
			currentlyBet += account;
			account = 0;
		}
		else if(val=="C"){
			account += currentlyBet;
			currentlyBet = 0;
		}
		else if(account>0&&value>0){
			if(value>account){
				currentlyBet += value - account;
				account = 0;
			}
			else{
				account -= value;
				currentlyBet += value;
			}
		}
		else if(currentlyBet>0&&value<0){
			if(currentlyBet+value>=0){
				account -= value;
				currentlyBet += value;
			}
			else if(currentlyBet+value<0){
				account += currentlyBet;
				currentlyBet = 0;
			}
		}
		if(account===0&&currentlyBet===0)  askReby();
		if(token)selectToken(token);
		accountUpdate();
		betUpdate();
};

const doubleBet = () =>  {
	setBet(0, currentlyBet);
	hit();
	displayNone('double');
};

const init = () => {
	out = document.getElementById('out');
	bank = document.getElementById('bank');
	tokens = document.getElementsByClassName('token');
	createGameCards();
	setEventToken();
};
  
const newCard = (output, id, i) => {
	let card = gameCards[random(gameCards.length)];
	let newDiv = document.createElement("div");
	while(inGameCards.includes(card)){
		card = gameCards[random(gameCards.length)];
	}
	inGameCards.push(card);
	id.push(card);
	let value  = card[0];
	let symbol = getSymbol(card[1]) ;
	if(i==1){
		value="";
		symbol = "cardBack";
		newDiv.setAttribute("id", "secondCard");
		newDiv.setAttribute("class", "card cardBack");
	}
	else newDiv.setAttribute("class", "card " + getSymbol(card[1]) )
	newDiv.textContent = value;
	output.appendChild(newDiv);
};

const start = () => {
	if(currentlyBet>0){
		for(let i=0; i<2; i++){
			newCard(out, payerHand);
			newCard(bank, bankHand, i);
		}
		for(let j=0; j<tokens.length; j++){
			   tokens[j].style.display = "none";
		}
		displayNone('play');
		displayFlex('again');
		if(account>0)displayFlex('double');
		displayFlex('end');
	}
	else if(account>0){
		displayFlex('infos');
		document.getElementById('info').innerHTML = "PLACE YOUR BET";
		setTimeout(function() { 
			displayNone('infos');
		}, 2000);
	}
	else askReby();
	if(cptPoints(payerHand)==21)stand();
};

const hit = () => {
	displayNone('double');
	newCard(out, payerHand);
	let cptPlayer = cptPoints(payerHand);
	if(cptPlayer>21)stand();
	if(cptPlayer==21)stand();
};

const cptPoints = (id) => {
	let cptA1 = 0;
	let cptA11 = 0;
	let cptA11B = false;
	for(let a=0; a<id.length; a++){
		if(id[a][0]=="V"||id[a][0]=="Q"||id[a][0]=="K") cptA1+=10;
		else if(id[a][0]=="A")cptA1+=1;
		else cptA1+=parseInt(id[a][0]);
	}
	for(let b=0; b<id.length; b++){
		if(id[b][0]=="V"||id[b][0]=="Q"||id[b][0]=="K") cptA11+=10;
		else if(id[b][0]=="A"&&!cptA11B){
			cptA11+=11;
			cptA11B = true;
		}
		else if(id[b][0]=="A"&&cptA11B){
			cptA11+=1;
		}
		else cptA11+=parseInt(id[b][0]);
	}
	if(cptA11<=21){
		return cptA11;
	}
	else  return cptA1;
};

const stand =() => {
	let second = document.getElementById('secondCard');
	let cptPlayer = cptPoints(payerHand);
	let cptBank = cptPoints(bankHand);
	while(cptBank<cptPlayer&&cptPlayer<=21&&cptBank<16){
		newCard(bank, bankHand);
		cptBank = cptPoints(bankHand);
	}
	let symbol = getSymbol(bankHand[1][1]) ;
	second.innerText = bankHand[1][0];
	second.setAttribute("class", "card " + getSymbol(bankHand[1][1]));
	displayFlex('infos');
	if(cptPlayer<=21&&(cptBank<cptPlayer||cptBank>21)){
		if(cptPlayer==21){
			document.getElementById('info').innerHTML = "BLACK JACK WON " + (currentlyBet*3) +" $";
			account += currentlyBet*3;
		}
		else {
			document.getElementById('info').innerHTML = "WON " + (currentlyBet*2) +" $";
			account += currentlyBet*2;
		}
	}
	else if (cptPlayer == cptBank){
		document.getElementById('info').innerHTML = "IT'S A DRAW !";
		account += currentlyBet;
	}
	else document.getElementById('info').innerHTML = "WON 0 $";
	displayNone('again');
	displayNone('double');
	displayNone('end');
	setTimeout(function() { 
		reinit();
	}, 4000);
};

const reinit = () => {
	for(let i=0; i<tokens.length; i++){
		tokens[i].style.display = "flex";
	}
	displayNone('infos');
	inGameCards = [];
	payerHand = [];
	bankHand = [];
	currentlyBet = 0;
	out.innerHTML  = "";
	bank.innerHTML  = "";
	accountUpdate();
	betUpdate();
	displayFlex('play');
};

const reBy = () => {
	displayNone('tryagain');
	account = 50;
	accountUpdate();
};


window.onload = init;
