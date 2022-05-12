const addBtn = document.body.querySelector(".add-btn");
addBtn.onclick = onAdd;

const elements = {}; //stores three elements per stopwatch.  eg {a2398498595: {displayEl, toggleBtn, nameInput}, ...}
let sw = null; //sw stands for the stopwatch that is focused ('focus' as defined here, occurs when any button on a stopwatch is clicked)
let el = null; //el stands for the elements that are focused (consists of elements: displayEl and toggleBtn)

const defaultStopwatch = {
  intervalId: null,
  startTime: null,
  pauseTime: null,
  elapsedPauseTime: 0,
  name: "",
};

const stopwatches = getStopwatches();
//if stopwatch data is detected in local storage
if (Object.keys(stopwatches).length) {
  //construct stopwatch html from data
  for (let id in stopwatches) {
    constructStopwatch({ ...stopwatches[id], id });
    //Display the elapsed time once, or continuously update it
    updateTimeOrStartInterval(id);
  }
} else {
  //add one stopwatch
  addBtn.click();
}

function onAdd() {
  const id = generateId();

  //create and save a stopwatch to local storage
  const stopwatches = getStopwatches();
  stopwatches[id] = defaultStopwatch;
  setStopwatches(stopwatches);

  constructStopwatch({ ...stopwatches[id], id }); //create html for stopwatch
}

function constructStopwatch(stopwatch) {
  //create html for current stopwatch
  const div = document.createElement("div");
  div.classList.add("stopwatch");
  div.id = stopwatch.id;
  document.querySelector(".stopwatches").appendChild(div);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.id = stopwatch.id;
  deleteBtn.onclick = onDelete;
  div.appendChild(deleteBtn);

  const nameInput = document.createElement("input");
  nameInput.classList.add("name-input");
  nameInput.id = stopwatch.id;
  nameInput.value = stopwatch.name;
  nameInput.oninput = onNameInput;
  div.appendChild(nameInput);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");
  div.appendChild(contentDiv);

  const displayEl = document.createElement("p");
  displayEl.textContent = "...";
  contentDiv.appendChild(displayEl);

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "start / stop";
  toggleBtn.id = stopwatch.id;
  toggleBtn.onclick = onStart;
  contentDiv.appendChild(toggleBtn);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "reset";
  resetBtn.id = stopwatch.id;
  resetBtn.onclick = onReset;
  contentDiv.appendChild(resetBtn);

  elements[stopwatch.id] = { displayEl, toggleBtn, nameInput };
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
  } else {
    el.displayEl.textContent = "0";
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
  }, 1000);
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
  sw = { ...defaultStopwatch, name: el.nameInput.value };
  el.toggleBtn.onclick = onStart;
  el.displayEl.textContent = "0";
  updateStopwatch(this.id);
}

function onDelete() {
  focusStopwatch(this.id);
  clearInterval(sw.intervalId);
  //remove stopwatch from local storage
  const stopwatches = getStopwatches();
  delete stopwatches[this.id];
  setStopwatches(stopwatches);
  //remove stopwatch from html
  document.querySelector(`.stopwatch#${this.id}`).remove();
}

function onNameInput() {
  //handler for when a user types in a stopwatch input
  const stopwatches = getStopwatches();
  stopwatches[this.id].name = this.value;
  setStopwatches(stopwatches);
}

function formatElapsedTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000);
  let remTime = milliseconds % 3600000;
  const minutes = Math.floor(remTime / 60000);
  remTime = milliseconds % 60000;
  const seconds = Math.floor(remTime / 1000);

  let formattedResult = "";
  let display = false;
  [
    [hours, "h"],
    [minutes, "m"],
    [seconds, "s"],
  ].forEach(([duration, unit]) => {
    if (duration !== 0) display = true;
    if (display) formattedResult += ` ${duration}${unit}`;
  });
  return formattedResult.trimStart();
}

function focusStopwatch(id) {
  sw = getStopwatches()[id];
  el = elements[id];
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
