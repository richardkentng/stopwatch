console.log("sanity check");

const toggleBtn = document.body.querySelector(".toggle-btn");
const resetBtn = document.body.querySelector(".reset-btn");
const stopwatchEl = document.body.querySelector(".stopwatch");
let stopwatchId = null;
let startTime = null;
let pauseTime = null;
let elapsedPauseTime = 0;

toggleBtn.onclick = onStart;
resetBtn.onclick = onReset;

function onStart() {
  toggleBtn.onclick = onStop;

  if (startTime === null) startTime = Date.now();
  if (pauseTime) {
    elapsedPauseTime += Date.now() - pauseTime;
    pauseTime = null;
  }

  stopwatchId = setInterval(() => {
    const elapsedTime = Date.now() - startTime - elapsedPauseTime;
    stopwatchEl.textContent = formatElapsedTime(elapsedTime);
  }, 20);
}

function onStop() {
  clearInterval(stopwatchId);
  toggleBtn.onclick = onStart;
  pauseTime = Date.now();
}

function onReset() {
  clearInterval(stopwatchId);
  toggleBtn.onclick = onStart;
  startTime = null;
  pauseTime = null;
  elapsedPauseTime = 0;
  stopwatchEl.textContent = "00:00:00.00";
}

function formatElapsedTime(milliseconds) {
  const hours = normalizeZeros(Math.floor(milliseconds / 3600000));
  let remTime = milliseconds % 3600000;
  const minutes = normalizeZeros(Math.floor(remTime / 60000));
  remTime = milliseconds % 60000;
  const seconds = normalizeZeros(Math.floor(remTime / 1000));
  remTime = milliseconds % 1000;
  const partialSecond = normalizeZeros(Math.round((remTime / 1000) * 100));
  return `${hours}:${minutes}:${seconds}.${partialSecond}`;

  function normalizeZeros(num) {
    const str = num.toString();
    return str.length === 1 ? `0${str}` : str;
  }
}
