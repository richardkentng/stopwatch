console.log("sanity check");

const toggleBtn = document.body.querySelector(".start-stop-btn");
const stopwatchEl = document.body.querySelector(".stopwatch");
let stopwatchId = null;
let startTime = null;

toggleBtn.addEventListener("click", onStart);

function onStart() {
  toggleBtn.removeEventListener("click", onStart);
  toggleBtn.addEventListener("click", onStop);
  toggleBtn.textContent = "stop";

  if (startTime === null) startTime = Date.now();
  stopwatchId = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const hours = Math.floor(elapsedTime / 3600000);
    let remTime = elapsedTime % 3600000;
    const minutes = Math.floor(remTime / 60000);
    remTime = elapsedTime % 60000;
    const seconds = Math.floor(remTime / 1000);
    remTime = elapsedTime % 1000;
    const fractionOfSecond = Math.round(remTime / 10);
    stopwatchEl.textContent = `${hours}:${minutes}:${seconds}.${fractionOfSecond}`;
  }, 20);
}

function onStop() {
  toggleBtn.removeEventListener("click", onStop);
  toggleBtn.addEventListener("click", onStart);
  toggleBtn.textContent = "start";
  clearInterval(stopwatchId);
}
