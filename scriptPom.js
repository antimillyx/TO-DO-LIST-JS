const timeElement = document.querySelector(".time");

let timeRemaining = 0;
let timer = null;


function initTimerSetting() {
    timeRemaining = 25 * 60;
    timer = null;
}

function updateTimeDisplay () {
    const minutes = Math.floor(timeRemaining/60)
        .toString()
        .padStart(2,"0");
    const seconds = (timeRemaining % 60).toString().padStart(2,"0");
    timeElement.innerText = '$(minutes):$(seconds)';

   }
