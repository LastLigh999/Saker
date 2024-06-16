let gameElement = document.querySelector("#Game");
let names = ["bla", "saba", "test", "aratest"];
let modal = document.querySelector("#userInput");
let resultModal = document.querySelector("#userTakes");
let lockinButton = document.querySelector("#lockin");
let resultButton = document.querySelector("#runResults");
let noneAudio = new Audio("./public/audio/none.m4a");
let bidingStage = true;
let elapsedRound = 0;

let lockedin = false;

class Player {
	constructor(name, htmlElement, id, redoTheBidfunc) {
		this.name = name;
		this.score = 0;
		this.id = id;
		this.redoTheResultFunc = redoTheResult;
		this.redoTheBidfunc = redoTheBidfunc;
		this.currentBid;
		this.currentBidHtml;
		this.hasPlacedBid = false;
		this.pastRounds = [];
		this.pastBids = [];
		this.pastResults = [];
		this.column = htmlElement;
		this.reSelectBidBound = this.reSelectBid.bind(this);
		this.initiateColumn();
	}

	//Crate Game
	initiateColumn() {
		let header = document.createElement("h2");
		header.textContent = this.name;
		this.column.appendChild(header);
		let body = document.createElement("div");
		this.column.appendChild(body);
		let score = document.createElement("div");
		score.classList.add("scoreBoard");
		let bids = document.createElement("bid");
		bids.classList.add("bid");

		body.appendChild(bids);
		body.appendChild(score);
		this.scoreboard = score;
		this.bids = bids;
	}
	generateBody() {
		for (let i = 0; i < this.pastBids.length; i++) {
			this.addBidUi(this.pastBids[i]);
		}
		for (let i = 0; i < this.pastResults.length; i++) {
			this.addScoreUi(this.pastResults[i]);
		}
	}

	//Update bits
	addBidUi(number) {
		let tempele = document.createElement("div");
		tempele.textContent = number;
		this.currentBidHtml = tempele;
		this.bids.appendChild(tempele);
		tempele.addEventListener("click", () => this.reSelectBidBound(tempele));
	}
	reSelectBid(tempele) {
		if (lockedin == true || bidingStage == false) {
			return;
		}
		this.bids.removeChild(tempele);
		this.redoTheBidfunc(this.id);
		this.hasPlacedBid = false;
	}

	//Update Scores
	addScoreUi(number) {
		let tempele = document.createElement("div");
		tempele.textContent = number;
		this.scoreboard.appendChild(tempele);
	}
	incrementSocre(number, takes, round = elapsedRound) {
		this.pastResults.push(number);
		this.pastRounds[round][1] = takes;
		this.addScoreUi(number);
		this.score += number;
	}

	//handlePlayerInput
	placeBid(number, round = elapsedRound) {
		this.pastBids.push(number);
		this.addBidUi(number);
		this.pastRounds[round][0] = number;
		this.currentBid = number;
		this.hasPlacedBid = true;
		if (number == 0) {
			noneAudio.play();
		}
		return number;
	}
	handResult(takes, round) {
		if (takes == this.currentBid) {
			if (takes == round) {
				this.incrementSocre(100 * takes, takes);
			} else {
				let incrementammount = 50;
				for (let i = 0; i < takes; i++) {
					incrementammount += 50;
				}
				this.incrementSocre(incrementammoun, takes);
			}
		} else {
			if (takes == 0) {
				this.incrementSocre(-200, takes);
			} else {
				let incrementammount = 0;
				for (let i = 0; i < takes; i++) {
					incrementammount += 10;
				}
				this.incrementSocre(incrementammount, takes);
			}
		}
		this.hasPlacedBid = false;
		console.log(this.pastRounds);
	}

	//SetResults
	setResult() {
		let tempele = document.createElement("h2");
		tempele.textContent = (this.score / 100).toFixed(1);
		this.scoreboard.appendChild(tempele);
	}
}

class JockerGame {
	constructor(
		gameRunning = false,
		players = [],
		currentRound = 0,
		totalRounds = 0
	) {
		this.players = players;
		this.canBePlayed = false;
		this.gameIsOngoing = gameRunning;
		this.currentBidPool = 0;
		this.currentRound = currentRound;
		this.totalRounds = totalRounds;
		this.queuedrounds = [];
		this.playerQueue = [];
		this.currentQueue = [];
		this.redoTheBid = this.redoTheBid.bind(this);
		this.redoTheResult = this.redoTheResult.bind(this);
		this.totalTakes = 0;
		this.startTheGame();
	}

	//playGame
	startTheGame() {
		for (let i = 0; i < 4; i++) {
			let playerColumn = document.createElement("div");
			playerColumn.classList.add("playerColumn");
			gameElement.appendChild(playerColumn);
			this.players.push(new Player(names[i], playerColumn, i, this.redoTheBid));
		}
		if (this.gameIsOngoing) {
			if (this.totalRounds <= 8) {
				this.sets(1);
				this.resumeGame();
			} else if (this.totalRounds < 13) {
				this.nines();
				this.resumeGame();
			} else if (this.totalRounds < 21) {
				this.sets(-1);
				this.resumeGame();
			} else if (this.totalRounds < 25) {
				this.nines();
				this.resumeGame();
			} else {
				alert("something went wrong");
			}
		} else {
			this.gameIsOngoing = true;
			this.sets(1);
			this.currentRound++;
			this.totalRounds++;
		}
	}
	startRound() {
		this.currentRound++;
		this.totalRounds++;
		this.queuedrounds.shift();
		this.playerQueue.shift();
		this.totalTakes = 0;
		this.currentBidPool = 0;
		this.canBePlayed = false;
		if (this.queuedrounds.length == 0) {
			for (let i = 0; i < this.players.length; i++) {
				this.players[i].setResult();
			}
			return;
		}
		bidingStage = true;
		lockinButtonFunc();
		this.getBids();
	}

	//Queue results
	sets(order) {
		if (order == 1) {
			for (let i = 0; i < 8; i++) {
				this.queuedrounds.push(i + 1);
			}
		} else {
			for (let i = 8; i > 0; i--) {
				this.queuedrounds.push(i);
			}
		}
		this.playerQueue = [3, 0, 1, 2, 3, 0, 1, 2];
	}
	nines() {
		this.queuedrounds = [9, 9, 9, 9];
		this.playerQueue = [3, 0, 1, 2];
	}
	generateQueue() {
		switch (this.playerQueue[0]) {
			case 3:
				this.currentQueue = [0, 1, 2, 3];
				break;
			case 0:
				this.currentQueue = [1, 2, 3, 0];
				break;
			case 1:
				this.currentQueue = [2, 3, 0, 1];
				break;
			default:
				this.currentQueue = [3, 0, 1, 2];
				break;
		}
	}

	//Redo The MistakenValue
	async redoTheBid(id) {
		this.currentBidPool -= this.players[id].currentBid;
		let bid = await this.generateModal(this.players[id].name, true);
		this.currentBidPool += this.players[id].placeBid(bid);
		this.checkIfReady();
	}
	async redoTheResult(id) {
		let takes = await this.generateModalResults(
			this.players[this.currentQueue[i]].name
		);
		this.totalTakes += takes;
		this.players[this.currentQueue[i]].handResult(takes, this.queuedrounds[0]);
		this.checkIfReady();
	}

	//Get Values from players
	async getBids() {
		this.generateQueue();
		for (let i = 0; i < 4; i++) {
			let bid;

			if (i == 3) {
				bid = await this.generateModal(
					this.players[this.currentQueue[i]].name,
					true
				);
			} else {
				bid = await this.generateModal(this.players[this.currentQueue[i]].name);
			}

			this.currentBidPool += this.players[this.currentQueue[i]].placeBid(bid);
		}
		this.checkIfReady();
	}
	async getResults() {
		this.generateQueue();
		lockinButtonFunc();
		bidingStage = false;
		this.checkIfReady();
		for (let i = 0; i < 4; i++) {
			let takes = await this.generateModalResults(
				this.players[this.currentQueue[i]].name
			);
			this.totalTakes += takes;
			this.players[this.currentQueue[i]].handResult(
				takes,
				this.queuedrounds[0]
			);
		}

		this.checkIfReady();
	}

	//Generate Inputs
	generateModal(name, lastone = false) {
		return new Promise((resolve) => {
			let selectedNumber;
			let numberhasbeenselected = false;
			let selectedNumberDisplay = modal.querySelector("h2");
			let selectorDisplay = modal.querySelector(".selectorDisplay");
			modal.querySelector(".PlayerName").textContent = name;
			selectedNumberDisplay.innerHTML = "&nbsp;";
			selectorDisplay.innerHTML = "";
			modal.showModal();
			for (let i = 0; i <= 9; i++) {
				let selector = document.createElement("div");
				if (i <= this.currentRound) {
					if (lastone == true && this.currentBidPool + i != this.currentRound) {
						selector.textContent = i;

						selector.dataset.number = i;
						selector.addEventListener("click", () => {
							selectedNumber = parseInt(selector.dataset.number);
							selectedNumberDisplay.textContent = selectedNumber;
							numberhasbeenselected = true;
						});
					} else if (lastone == false) {
						selector.textContent = i;

						selector.dataset.number = i;
						selector.addEventListener("click", () => {
							selectedNumber = parseInt(selector.dataset.number);
							selectedNumberDisplay.textContent = selectedNumber;
							numberhasbeenselected = true;
						});
					}
				}

				selector.classList.add("selector");

				selectorDisplay.appendChild(selector);
			}
			let button = modal.querySelector("button");
			const handleClick = () => {
				if (!numberhasbeenselected) {
					return;
				}
				button.removeEventListener("click", () => handleClick());
				resolve(selectedNumber);
				numberhasbeenselected = false;
				modal.close();
			};

			button.addEventListener("click", () => handleClick());
		});
	}
	generateModalResults(name, lastone = false) {
		return new Promise((resolve) => {
			let selectedNumber;
			let numberhasbeenselected = false;
			let selectedNumberDisplay = resultModal.querySelector("h2");
			let selectorDisplay = resultModal.querySelector(".selectorDisplay");
			resultModal.querySelector(".PlayerName").textContent = name;
			selectedNumberDisplay.innerHTML = "&nbsp;";
			selectorDisplay.innerHTML = "";
			resultModal.showModal();
			for (let i = 0; i <= 9; i++) {
				let selector = document.createElement("div");
				if (i <= this.currentRound - this.totalTakes) {
					if (lastone == true && this.currentBidPool + i != this.currentRound) {
						selector.textContent = i;

						selector.dataset.number = i;
						selector.addEventListener("click", () => {
							selectedNumber = parseInt(selector.dataset.number);
							selectedNumberDisplay.textContent = selectedNumber;
							numberhasbeenselected = true;
						});
					} else if (lastone == false) {
						selector.textContent = i;

						selector.dataset.number = i;
						selector.addEventListener("click", () => {
							selectedNumber = parseInt(selector.dataset.number);
							selectedNumberDisplay.textContent = selectedNumber;
							numberhasbeenselected = true;
						});
					}
				}

				selector.classList.add("selector");

				selectorDisplay.appendChild(selector);
			}
			let button = resultModal.querySelector("button");
			const handleClick = () => {
				if (!numberhasbeenselected) {
					return;
				}
				button.removeEventListener("click", () => handleClick());
				numberhasbeenselected = false;
				resolve(selectedNumber);
				resultModal.close();
			};

			button.addEventListener("click", () => handleClick());
		});
	}

	//Check if game can be played
	checkIfReady() {
		if (bidingStage == true) {
			let bids = true;
			for (let i = 0; i < 4; i++) {
				if (this.players[i].hasPlacedBid == false) {
					bids = false;
				}
			}
			if (bids == true) {
				this.canBePlayed = true;
			} else {
				this.canBePlayed = false;
			}
			lockinButton.classList.toggle("unavailable", !this.canBePlayed);
		} else {
			if (this.totalTakes != this.queuedrounds[0]) {
				this.canBePlayed = false;
			} else {
				this.canBePlayed = true;
			}
			lockinButton.classList.toggle("unavailable", !this.canBePlayed);
		}
	}

	resumeGame() {
		for (let i = 0; i < this.currentRound - 1; i++) {
			this.queuedrounds.shift();
			this.playerQueue.shift();
		}
	}
}
let jocker = new JockerGame();
jocker.getBids();

function lockinButtonFunc() {
	lockedin == true ? (lockedin = false) : (lockedin = true);
	lockinButton.querySelector("img").classList.toggle("active", lockedin);
	resultButton.classList.toggle("active");
}
function resultButtonFunc() {
	if (bidingStage == true) {
		jocker.getResults();
		return;
	}
	jocker.startRound();
}

lockinButton.addEventListener("click", lockinButtonFunc);
resultButton.addEventListener("click", resultButtonFunc);
