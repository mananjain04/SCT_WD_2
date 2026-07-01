let startTime;
let updatedTime;
let difference = 0;
let tInterval;
let running = false;
let lapCount = 1;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsList = document.getElementById('lapsList');

function formatTime(time) {
    let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    let milliseconds = Math.floor((time % 1000) / 10);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function updateDisplay() {
    updatedTime = new Date().getTime();
    let currentDifference = updatedTime - startTime + difference;
    display.innerHTML = formatTime(currentDifference);
}

startBtn.onclick = function() {
    if (!running) {
        startTime = new Date().getTime();
        tInterval = setInterval(updateDisplay, 10);
        running = true;
    }
};

pauseBtn.onclick = function() {
    if (running) {
        clearInterval(tInterval);
        difference += new Date().getTime() - startTime;
        running = false;
    }
};

resetBtn.onclick = function() {
    clearInterval(tInterval);
    running = false;
    difference = 0;
    display.innerHTML = "00:00:00.00";
    lapsList.innerHTML = "";
    lapCount = 1;
};

lapBtn.onclick = function() {
    if (running) {
        let currentDifference = new Date().getTime() - startTime + difference;
        let li = document.createElement('li');
        li.innerText = "Lap " + lapCount + ": " + formatTime(currentDifference);
        lapsList.appendChild(li);
        lapCount++;
    }
};
