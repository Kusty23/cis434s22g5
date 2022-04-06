var playing = false;
//var currentPlayer; 
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

//Add a leading zero to numbers less than 10
const padZero = function(number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}
