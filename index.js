let gameElement = document.querySelector("#Game");
let names = ["bla", "saba", "test", "aratest"];
let modal = document.querySelector("#userInput");
let resultModal = document.querySelector("#userTakes");
let lockinButton = document.querySelector("#lockin");
let resultButton = document.querySelector("#runResults");
let noneAudio = new Audio("./public/audio/none.m4a");
let wantAllAudio = new Audio("./public/audio/Yvela_minda.m4a");
let takeAllAudio = new Audio("./public/audio/Yvelas_wageba.m4a");
let takeNoneAudio = new Audio("./public/audio/Xishti_2.m4a");
let globalbidingStage = true;
let elapsedRound = 0;

let lockedin = false;

class Player {
	constructor(
		name,
		htmlElement,
		id,
		redoTheBidfunc,
		redoTheResultFunc,
		resumeGame = false,
		score = 0,
		pastRounds = []
	) {
		this.name = name;
		this.score = score;
		this.setScore = 0;
		this.id = id;
		this.currentTakes = 0;
		this.lastScore = 0;
		this.currentTakeshtml;
		this.redoTheResultFunc = redoTheResultFunc;
		this.redoTheBidfunc = redoTheBidfunc;
		this.resumeGame = resumeGame;

		this.currentBid;
		this.currentBidHtml;
		this.hasPlacedBid = false;
		this.pastRounds = pastRounds;
		this.pastBids = [];
		this.pastResults = [];
		this.tempround = [];
		this.column = htmlElement;
		this.reSelectBidBound = this.reSelectBid.bind(this);
		this.reSelectTakesBound = this.reSelectTakes.bind(this);
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
		if (this.resumeGame == true) {
			this.generateBody();
		}
	}
	generateBody() {
		let scoreUpToNow = 0;
		for (let i = 0; i < this.pastRounds.length; i++) {
			if (this.pastRounds[i] == true) {
				this.getSetResults(scoreUpToNow);
				continue;
			}
			this.resumeBidUi(this.pastRounds[i][0]);
			scoreUpToNow += this.resumeScoreUi(
				this.pastRounds[i][1],
				this.pastRounds[i][2],
				this.pastRounds[i][0]
			);
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
		if (lockedin == true || globalbidingStage == false) {
			return;
		}
		this.bids.removeChild(tempele);
		this.redoTheBidfunc(this.id);

		this.hasPlacedBid = false;
	}

	//Resume game UI
	resumeScoreUi(takes, round, bid) {
		let number = this.calculateScore(takes, round, bid); /* 
		console.log(`testing ${number}, ${round}, ${takes}`); */
		let tempele = document.createElement("div");
		tempele.textContent = number;
		this.scoreboard.appendChild(tempele);
		this.currentTakeshtml = tempele;
		return number;
	}
	resumeBidUi(number) {
		let tempele = document.createElement("div");
		tempele.textContent = number;
		this.currentBidHtml = tempele;
		this.bids.appendChild(tempele);
	}

	//Update Scores
	addScoreUi(number) {
		let tempele = document.createElement("div");
		tempele.textContent = number;
		this.currentTakeshtml = tempele;
		this.scoreboard.appendChild(tempele);
		tempele.addEventListener("click", () => this.reSelectTakes(tempele));
	}
	incrementSocre(number, takes, round = elapsedRound) {
		this.pastResults.push(number);
		this.lastScore = number;
		this.tempround[1] = takes; /* 
		this.pastRounds[round][1] = takes; */
		this.addScoreUi(number);
		this.score += number;
	}
	reSelectTakes(tempele) {
		if (lockedin == true || globalbidingStage == true) {
			return;
		}
		this.score -= this.lastScore;
		this.scoreboard.removeChild(tempele);
		this.redoTheResultFunc(this.id);
	}

	//handlePlayerInput
	placeBid(number, currentRound, round = elapsedRound) {
		this.pastBids.push(number);
		this.addBidUi(number);
		/* 
		this.pastRounds[round] = [number, 0]; */
		this.tempround[0] = number;

		this.currentBid = number;
		this.hasPlacedBid = true;
		if (number == 0) {
			noneAudio.play();
		} else if (number == currentRound) {
			wantAllAudio.play();
		}

		return number;
	}
	handResult(takes, round) {
		this.currentTakes = takes;
		this.incrementSocre(this.calculateScore(takes, round), takes);
		if (takes == 0 && this.currentBid != 0) {
			takeNoneAudio.play();
		} else if (takes == round && this.currentBid == round) {
			takeAllAudio.play();
		}
		this.hasPlacedBid = false;
	}
	calculateScore(takes, round, bid = this.currentBid) {
		if (takes == bid) {
			if (takes == round) {
				return 100 * takes;
			} else {
				let incrementamount = 50;
				for (let i = 0; i < takes; i++) {
					incrementamount += 50;
				}
				return incrementamount;
			}
		} else {
			if (takes == 0) {
				return -200;
			} else {
				let incrementamount = 0;
				for (let i = 0; i < takes; i++) {
					incrementamount += 10;
				}
				return incrementamount;
			}
		}
	}

	endRound(round) {
		this.currentBidHtml.style["pointerEvents"] = "none";
		this.currentTakeshtml.style["pointerEvents"] = "none";
		this.tempround[2] = round;
		let temparr = [...this.tempround];
		this.pastRounds.push(temparr);
		let saveData = {
			name: this.name,
			score: this.score,
			pastRounds: this.pastRounds,
		};
		localStorage.setItem(`player ${this.id + 1}`, JSON.stringify(saveData));
	}

	//SetResults
	setResult() {
		this.pastRounds.push(true);
		let saveData = {
			name: this.name,
			score: this.score,
			pastRounds: this.pastRounds,
		};
		localStorage.setItem(`player ${this.id + 1}`, JSON.stringify(saveData));
		this.getSetResults();
	}

	getSetResults(score = this.score) {
		let tempele = document.createElement("h2");
		tempele.textContent = (score / 100).toFixed(1);
		let tempele2 = document.createElement("h2");
		tempele2.textContent = "*";
		this.bids.appendChild(tempele2);
		this.scoreboard.appendChild(tempele);
	}
}

class JockerGame {
	constructor(
		gameIsOngoing = false,
		players = [],
		currentRound = 0,
		totalRounds = 0,
		queuedrounds = [],
		playerQueue = []
	) {
		this.players = players;
		this.gameIsOngoing = gameIsOngoing;

		this.bidingStage = true;
		this.canBePlayed = false;
		this.countSetScores = false;
		this.gameisResuming = false;

		this.currentBidPool = 0;
		this.totalTakes = 0;

		this.currentRound = currentRound;
		this.totalRounds = totalRounds;

		this.queuedrounds = queuedrounds;
		this.playerQueue = playerQueue;

		this.currentQueue = [];

		//Binds
		this.redoTheBid = this.redoTheBid.bind(this);
		this.redoTheResult = this.redoTheResult.bind(this);
		this.resultButtonFunc = this.resultButtonFunc.bind(this);

		gameIsOngoing ? this.resumeGame() : this.startTheGame();
	}

	//playGame
	startTheGame() {
		for (let i = 0; i < 4; i++) {
			let playerColumn = document.createElement("div");
			playerColumn.classList.add("playerColumn");
			let name = prompt("PlayerName: ");
			gameElement.appendChild(playerColumn);
			this.players.push(
				new Player(name, playerColumn, i, this.redoTheBid, this.redoTheResult)
			);
		}
		if (this.gameIsOngoing) {
			this.nextSet();
		} else {
			this.gameIsOngoing = true;
			this.sets(1);
			this.currentRound++;
			this.totalRounds++;
			this.getBids();
			console.log(this);
		}
	}
	resumeGame() {
		let players = [];
		for (let i = 0; i < 4; i++) {
			let playerColumn = document.createElement("div");
			playerColumn.classList.add("playerColumn");
			gameElement.appendChild(playerColumn);
			console.log(this.players[i]);
			players.push(
				new Player(
					this.players[i].name,
					playerColumn,
					i,
					this.redoTheBid,
					this.redoTheResult,
					true,
					this.players[i].score,
					this.players[i].pastRounds
				)
			);
		}
		console.log("resume Game");
		this.players = players;
		this.resumeSubFunction();
	}

	nextSet() {
		console.log(this);
		elapsedRound = 0;
		if (this.totalRounds <= 8) {
			this.sets(1);
		} else if (this.totalRounds < 13) {
			this.nines();
		} else if (this.totalRounds < 21) {
			this.sets(-1);
		} else if (this.totalRounds < 25) {
			this.nines();
		} else {
			alert("something went wrong");
		}
		this.bidingStage = true;
		globalbidingStage = this.bidingStage;
	}
	startRound() {
		console.log(this.queuedrounds[0]);
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].endRound(this.queuedrounds[0]);
		}
		this.queuedrounds.shift();
		this.playerQueue.shift();
		this.currentRound++;
		this.totalRounds++;
		let saveData = {
			gameIsOngoing: this.gameIsOngoing,
			players: this.players.map((e) => {
				return { name: e.name, pastRounds: e.pastRounds, score: e.score };
			}),
			currentRound: this.currentRound,
			totalRounds: this.totalRounds,
			queuedrounds: this.queuedrounds,
			playerQueue: this.playerQueue,
		};

		this.totalTakes = 0;
		this.currentBidPool = 0;
		this.canBePlayed = false;
		elapsedRound++;

		localStorage.setItem("JockerData-saker", JSON.stringify(saveData));
		if (this.queuedrounds.length == 0) {
			for (let i = 0; i < this.players.length; i++) {
				this.players[i].setResult();
			}
			this.countSetScores = true;
			lockinButtonFunc();
			return;
		}

		this.bidingStage = true;
		globalbidingStage = this.bidingStage;

		lockinButtonFunc();
		this.getBids();
	}
	resumeSubFunction() {
		this.totalTakes = 0;
		this.currentBidPool = 0;
		this.canBePlayed = false;

		if (this.queuedrounds.length == 0) {
			for (let i = 0; i < this.players.length; i++) {
				this.players[i].setResult();
			}
			this.countSetScores = true; /* 
			lockinButtonFunc(); */
			lockinButton.classList.toggle("unavailable", false);
			return;
		}
		lockinButton.classList.toggle("unavailable", false);
		/* 
		lockinButtonFunc(); */
		this.gameisResuming = true;
	}

	//Queue results
	sets(order) {
		this.currentRound = 0;
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
		this.currentRound = 0;
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
		this.currentBidPool += this.players[id].placeBid(bid, this.queuedrounds[0]);
		this.checkIfReady();
	}
	async redoTheResult(id) {
		this.totalTakes -= this.players[id].currentTakes;
		let takes = await this.generateModalResults(this.players[id].name);

		this.totalTakes += takes;
		this.players[id].handResult(takes, this.queuedrounds[0]);
		this.checkIfReady();
	}

	//Get Values from players
	async getBids() {
		this.gameisResuming = false;
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

			this.currentBidPool += this.players[this.currentQueue[i]].placeBid(
				bid,
				this.queuedrounds[0]
			);
		}
		this.checkIfReady();
	}
	async getResults() {
		this.generateQueue();
		lockinButtonFunc();
		this.bidingStage = false;

		globalbidingStage = this.bidingStage;
		this.checkIfReady();
		for (let i = 0; i < 4; i++) {
			let takes = await this.generateModalResults(
				this.players[this.currentQueue[i]].name,
				this.players[this.currentQueue[i]].currentBid
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
				if (i <= this.queuedrounds[0]) {
					if (
						lastone == true &&
						this.currentBidPool + i != this.queuedrounds[0]
					) {
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
	generateModalResults(name, playerBid, lastone = false) {
		return new Promise((resolve) => {
			let selectedNumber;
			let numberhasbeenselected = false;
			let selectedNumberDisplay = resultModal.querySelector("h2");
			let selectorDisplay = resultModal.querySelector(".selectorDisplay");
			resultModal.querySelector(".PlayerName").textContent = name;
			resultModal.querySelector(".PlayerBid").textContent = playerBid;
			selectedNumberDisplay.innerHTML = "&nbsp;";
			selectorDisplay.innerHTML = "";
			resultModal.showModal();
			for (let i = 0; i <= 9; i++) {
				let selector = document.createElement("div");
				if (i <= this.queuedrounds[0] - this.totalTakes) {
					if (
						lastone == true &&
						this.currentBidPool + i != this.queuedrounds[0]
					) {
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
		if (this.bidingStage == true) {
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

	//handle buttons
	resultButtonFunc() {
		if (this.bidingStage == true && this.gameisResuming == true) {
			lockinButtonFunc();
			lockinButton.classList.toggle("unavailable", true);
			this.getBids();

			return;
		} else if (this.countSetScores == true) {
			this.countSetScores = false;
			this.nextSet();
			lockinButtonFunc();
			this.getBids();
			console.log(this.countSetScores);
			return;
		} else if (this.bidingStage == true) {
			this.getResults();
			return;
		}
		this.startRound();
	}
}
let jocker;

if (localStorage.getItem("JockerData-saker") != null) {
	let pastGame = JSON.parse(localStorage.getItem("JockerData-saker"));
	jocker = new JockerGame(
		pastGame.gameIsOngoing,
		pastGame.players,
		pastGame.currentRound,
		pastGame.totalRounds,
		pastGame.queuedrounds,
		pastGame.playerQueue
	);
} else {
	jocker = new JockerGame();
}
function lockinButtonFunc() {
	lockedin == true ? (lockedin = false) : (lockedin = true);
	lockinButton.querySelector("img").classList.toggle("active", lockedin);
	resultButton.classList.toggle("active", lockedin);
}

lockinButton.addEventListener("click", lockinButtonFunc);
resultButton.addEventListener("click", jocker.resultButtonFunc);
