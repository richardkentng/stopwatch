const addBtn = document.body.querySelector(".add-btn");
addBtn.onclick = onAdd;

const displayElAndToggleBtn = {}; //stores two elements per stopwatch.  eg {a2398498595: {displayEl, toggleBtn}, ...}
let sw = null; //sw stands for the stopwatch that is focused ('focus' as defined here, occurs when any button on a stopwatch is clicked)
let el = null; //el stands for the elements that are focused (consists of elements: displayEl and toggleBtn)

const defaultStopwatch = {
  intervalId: null,
  startTime: null,
  pauseTime: null,
  elapsedPauseTime: 0,
};

const stopwatches = getStopwatches();
//if stopwatch data is detected in local storage
if (Object.keys(stopwatches).length) {
  //construct stopwatch html from data
  for (let id in stopwatches) {
    constructStopwatch(id);
    //Display the elapsed time once, or continuously update it
    updateTimeOrStartInterval(id);
  }
} else {
  //add one stopwatch
  addBtn.click();
}

function onAdd() {
  const id = generateId();
  constructStopwatch(id); //create html for stopwatch

  //save default stopwatch data to local storage
  const stopwatches = getStopwatches();
  stopwatches[id] = defaultStopwatch;
  setStopwatches(stopwatches);
}

function constructStopwatch(id) {
  //create html for current stopwatch
  const div = document.createElement("div");
  div.classList.add("stopwatch");
  document.querySelector(".stopwatches").appendChild(div);

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

  displayElAndToggleBtn[id] = { displayEl, toggleBtn };
}

function updateTimeOrStartInterval(id) {
  //***** update time display once or continuously, based on whether stopwatch was last paused
  focusStopwatch(id);
  //if stopwatch was ever started since creation or since a reset
  if (sw.startTime) {
    // if stopwatch was paused
    if (sw.pauseTime) {
      //display elapsed time
      const elapsedTime =
        Date.now() -
        sw.startTime -
        sw.elapsedPauseTime -
        (Date.now() - sw.pauseTime);
      el.displayEl.textContent = formatElapsedTime(elapsedTime);
    } else {
      //since stopwatch was not paused, continue stopwatch interval
      el.toggleBtn.click();
    }
  }
}

function onStart() {
  focusStopwatch(this.id);
  el.toggleBtn.onclick = onStop;
  if (sw.startTime === null) sw.startTime = Date.now();
  if (sw.pauseTime) {
    sw.elapsedPauseTime += Date.now() - sw.pauseTime;
    sw.pauseTime = null;
  }
  const [staticSw, staticEl] = [sw, el]; //this prevents the update interval from focusing the wrong stopwatch when 'sw' or 'el' are overwritten<--this occurs when another stopwatch is focused
  sw.intervalId = setInterval(() => {
    const elapsedTime =
      Date.now() - staticSw.startTime - staticSw.elapsedPauseTime;
    staticEl.displayEl.textContent = formatElapsedTime(elapsedTime);
  }, 20);
  updateStopwatch(this.id);
}

function onStop() {
  focusStopwatch(this.id);
  clearInterval(sw.intervalId);
  el.toggleBtn.onclick = onStart;
  sw.pauseTime = Date.now();
  updateStopwatch(this.id);
}

function onReset() {
  focusStopwatch(this.id);
  clearInterval(sw.intervalId);
  sw = defaultStopwatch;
  el.toggleBtn.onclick = onStart;
  el.displayEl.textContent = "00:00:00.00";
  updateStopwatch(this.id);
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

function focusStopwatch(id) {
  sw = getStopwatches()[id];
  el = displayElAndToggleBtn[id];
}

// LOCAL STORAGE FUNCTIONS

function getStopwatches() {
  return JSON.parse(localStorage.getItem("stopwatches")) || {};
}
function setStopwatches(stopwatches) {
  localStorage.setItem("stopwatches", JSON.stringify(stopwatches));
}
function updateStopwatch(id) {
  const stopwatches = getStopwatches();
  stopwatches[id] = sw;
  setStopwatches(stopwatches);
}

// UTLITY FUNCTIONS

function generateId() {
  return (
    "a" +
    Math.random()
      .toString()
      .replace(/[^0-9]/g, "")
  );
}
