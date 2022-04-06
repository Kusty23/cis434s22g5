var playing = false;
var currentPlayer = 1; 
const timerPanel = document.getElementsByClassName("timer");

//Create a class for the timer
class Timer {
  constructor(player, minutes) {
    this.player = player;
    this.minutes = minutes;
  }
  
  getMinutes(timeId) {
    return document.getElementById(timeId).textContent;
  }
}



console.log(document.getElementById("min1").textContent);


// Create an instance of the timer for each player
var p1Time = new Timer("min1", document.getElementById("min1").textContent);
var p2Time = new Timer("min2", document.getElementById("min2").textContent);

//Add a leading zero to numbers less than 10
const padZero = function(number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}

//Swap player's timer after a move (player 1 (White) = 1, player 2 (Black) = 2)
const swapPlayer = function() {
  if (!playing) {
    return;
  }
  //Toggle the current player
  currentPlayer = currentPlayer === 1 ? 2 : 1; 
}

//Warn player if time drops below one minute
const timeWarning = function(player, min, sec) {
    //Change the numbers to red during the last 60 seconds
    if (min < 1 && sec <= 59) {
        if (player === 1) {
            document.querySelector(".player-1 .player__digits").style.color = "#CC0000";
        } else {
            document.querySelector(".player-2 .player__digits").style.color = "#CC0000";
        }
    }
}

//Start timer countdown to zero
const startTimer = function() {
    playing = true;
    var p1Sec = 60;
    var p2Sec = 60;

    var timerId = setInterval(function() {
        //Player 1
        if (currentPlayer === 1) {
            if (playing) {
                p1Time.minutes = parseInt(p1Time.getMinutes("min1"), 10);
                if (p1Sec === 60) {
                    p1Time.minutes = p1Time.minutes - 1;
                }
                p1Sec = p1Sec - 1;
                timeWarning(currentPlayer, p1Time.minutes, p1Sec);
                document.getElementById("sec1").textContent = padZero(p1Sec);
                document.getElementById("min1").textContent = padZero(p1Time.minutes);
                if (p1Sec === 0) {
                    //If minutes and seconds are zero stop timer with the clearInterval method
                    if (p1Sec === 0 && p1Time.minutes === 0) {
                        //Stop timer
                        clearInterval(timerId);
                        playing = false;
                    }
                    p1Sec = 60;
                }
            }
        } else {
        //Player 2
            if (playing) {
                p2Time.minutes = parseInt(p2Time.getMinutes("min2"), 10);
                if (p2Sec === 60) {
                    p2Time.minutes = p2Time.minutes - 1;
                }
                p2Sec = p2Sec - 1;
                timeWarning(currentPlayer, p2Time.minutes, p2Sec);
                document.getElementById("sec2").textContent = padZero(p2Sec);
                document.getElementById("min2").textContent = padZero(p2Time.minutes);
                if (p2Sec === 0) {
                    //If minutes and seconds are zero stop timer with the clearInterval method
                    if (p2Sec === 0 && p2Time.minutes === 0) {
                        // Stop timer
                        clearInterval(timerId);
                        playing = false;
                    }
                    p2Sec = 60;
                }
            }
        }
    }, 1000);
}

//Listen for a mouse click or tap on the screen to toggle between timers
timerPanel.addEventListener("click", swapPlayer);
