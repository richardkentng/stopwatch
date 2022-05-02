const stopwatches = {};

const addBtn = document.body.querySelector(".add-btn");
addBtn.onclick = onAdd;
addBtn.click();

function onAdd() {
  const id = generateId();
  const elements = constructStopwatch(id); //returns { toggleBtn, displayEl }
  stopwatches[id] = Object.assign(
    {
      intervalId: null,
      startTime: null,
      pauseTime: null,
      elapsedPauseTime: 0,
    },
    elements
  );
  //prettier-ignore
  function generateId() {
    return "a" + Math.random().toString().replace(/[^0-9]/g, "")
  }
}

function constructStopwatch(id) {
  //create html for current stopwatch
  const div = document.createElement("div");
  div.classList.add("stopwatch");

  const displayEl = document.createElement("p");
  displayEl.textContent = "00:00:00:00";
  div.appendChild(displayEl);

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "start / stop";
  toggleBtn.id = id;
  toggleBtn.onclick = onStart;
  div.appendChild(toggleBtn);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "reset";
  resetBtn.id = id;
  resetBtn.onclick = onReset;
  div.appendChild(resetBtn);

  document.body.appendChild(div);

  return { toggleBtn, displayEl };
}

function onStart() {
  const sw = stopwatches[this.id]; //'sw' stands for 'stopwatch'
  sw.toggleBtn.onclick = onStop;
  if (sw.startTime === null) sw.startTime = Date.now();
  if (sw.pauseTime) {
    sw.elapsedPauseTime += Date.now() - sw.pauseTime;
    sw.pauseTime = null;
  }
  sw.intervalId = setInterval(() => {
    const elapsedTime = Date.now() - sw.startTime - sw.elapsedPauseTime;
    sw.displayEl.textContent = formatElapsedTime(elapsedTime);
  }, 20);
}

function onStop() {
  const sw = stopwatches[this.id]; //'sw' stands for 'stopwatch'
  clearInterval(sw.intervalId);
  sw.toggleBtn.onclick = onStart;
  sw.pauseTime = Date.now();
}

function onReset() {
  const sw = stopwatches[this.id]; //'sw' stands for 'stopwatch'
  clearInterval(sw.intervalId);
  sw.toggleBtn.onclick = onStart;
  sw.startTime = null;
  sw.pauseTime = null;
  sw.elapsedPauseTime = 0;
  sw.displayEl.textContent = "00:00:00.00";
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
