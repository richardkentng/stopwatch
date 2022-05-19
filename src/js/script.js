const elements = {}; //stores four elements per stopwatch.  eg {a2398498595: {displayEl, toggleBtn, nameInput, stopwatch}, ...}
let sw = null; //sw stands for the stopwatch that is focused ('focus' as defined here, occurs when any button on a stopwatch is clicked)
let el = null; //el stands for the elements that are focused (consists of elements: displayEl and toggleBtn)
const addForm = document.body.querySelector(".add-stopwatch-form");
const LS = localStorage;

//=========================================================
//                     EVENT LISTENERS
addForm.onsubmit = onSubmit_addStopwatch;
addForm.expandBtn.onclick = () => {
  const showedForm = !addForm.classList.toggle("hide-targets");
  LS.setItem("showAddStopwatchForm", showedForm ? "1" : "0");
};
addForm.autoStartCb.onchange = function () {
  LS.setItem("autoStartAddedStopwatch", this.checked ? "1" : "0");
};
//=========================================================
//                    LOAD LOCAL STORAGE

//load checkbox status of input.auto-start
if ("01".includes(LS.autoStartAddedStopwatch)) {
  addForm.autoStartCb.checked = parseInt(LS.autoStartAddedStopwatch);
}
//load display status of .add-stopwatch-form
if ("01".includes(LS.showAddStopwatchForm)) {
  const addOrRemove = parseInt(LS.showAddStopwatchForm) ? "remove" : "add";
  addForm.classList[addOrRemove]("hide-targets");
}

loadStopwatches();

function loadStopwatches() {
  const stopwatches = getStopwatches();
  if (Object.keys(stopwatches).length) {
    for (let id in stopwatches) {
      constructStopwatch({ ...stopwatches[id], id });
      updateTimeOrStartInterval(id);
    }
  }
}
//=========================================================

function onSubmit_addStopwatch(e) {
  e.preventDefault();
  const id = generateId();

  //create and save a stopwatch to local storage
  const stopwatches = getStopwatches();
  stopwatches[id] = { ...getDefaultStopwatch(), name: this.nameInput.value };
  setStopwatches(stopwatches);

  constructStopwatch({ ...stopwatches[id], id }); //create stopatch HTML
  if (this.autoStartCb.checked) elements[id].toggleBtn.click(); //conditionally start stopwatch
  this.nameInput.value = ""; //reset .name-input
}

function constructStopwatch(stopwatch) {
  //create html for current stopwatch
  const div = document.createElement("div");
  div.classList.add("stopwatch");
  div.id = stopwatch.id;
  document.querySelector(".stopwatches").appendChild(div);

  const topRow = document.createElement("div");
  topRow.classList.add("top-row");
  div.appendChild(topRow);

  const nameInput = document.createElement("input");
  nameInput.classList.add("name-input");
  nameInput.id = stopwatch.id;
  nameInput.value = stopwatch.name;
  nameInput.oninput = onNameInput;
  topRow.appendChild(nameInput);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.id = stopwatch.id;
  deleteBtn.onclick = onDelete;
  topRow.appendChild(deleteBtn);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");
  div.appendChild(contentDiv);

  const toggleBtn = document.createElement("button");
  toggleBtn.id = stopwatch.id;
  toggleBtn.onclick = onStart;
  const play = document.createElement("i");
  play.classList.add("bi-play-fill");
  const pause = document.createElement("i");
  pause.classList.add("bi-pause-fill", "display-none");
  toggleBtn.appendChild(play);
  toggleBtn.appendChild(pause);
  contentDiv.appendChild(toggleBtn);

  const displayEl = document.createElement("span");
  displayEl.classList.add("elapsed-time");
  contentDiv.appendChild(displayEl);

  const resetBtn = document.createElement("button");
  resetBtn.classList.add("bi-backspace");
  resetBtn.id = stopwatch.id;
  resetBtn.onclick = onReset;
  contentDiv.appendChild(resetBtn);

  elements[stopwatch.id] = { displayEl, toggleBtn, nameInput, stopwatch: div };
}

function updateTimeOrStartInterval(id) {
  //***** update time display once or continuously, based on whether stopwatch was last paused
  focusStopwatch(id);
  //if stopwatch was ever started since creation or since a reset
  if (sw.startTime) {
    updateDisplayWithElapsedTime(); //uses data from focused stopwatch
    // if stopwatch was not paused (still ongoing), then click to start the setInterval
    if (!sw.pauseTime) el.toggleBtn.click();
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
  updateDisplayWithElapsedTime(); //this will immediately update displayed elapsed time instead of waiting for interval to start. <--benefits noticeable when a stopwatch displaying '', upon being started, immediately displays '0s'
  const { displayEl, startTime, elapsedPauseTime } = { ...sw, ...el }; //this prevents the setInterval from focusing the wrong stopwatch data and elements when the global variables 'sw' and 'el' are overwritten
  sw.intervalId = setInterval(
    () =>
      updateDisplayWithElapsedTime({
        displayEl,
        startTime,
        elapsedPauseTime,
      }),
    1000
  );
  updateStopwatch(this.id);
  el.stopwatch.classList.add("playing");
}

function onStop() {
  focusStopwatch(this.id);
  clearInterval(sw.intervalId);
  el.toggleBtn.onclick = onStart;
  sw.pauseTime = Date.now();
  updateStopwatch(this.id);
  el.stopwatch.classList.remove("playing");
}

function onReset() {
  focusStopwatch(this.id);
  clearInterval(sw.intervalId);
  sw = { ...getDefaultStopwatch(), name: el.nameInput.value };
  el.toggleBtn.onclick = onStart;
  el.displayEl.textContent = "";
  updateStopwatch(this.id);
  el.stopwatch.classList.remove("playing");
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
  formattedResult = formattedResult.trimStart();
  return formattedResult ? formattedResult : "0s";
}

function updateDisplayWithElapsedTime(
  { displayEl, startTime, elapsedPauseTime, pauseTime } = { ...sw, ...el }
) {
  let elapsedTime = Date.now() - startTime - elapsedPauseTime;
  elapsedTime = pauseTime
    ? elapsedTime - (Date.now() - pauseTime)
    : elapsedTime;
  displayEl.textContent = formatElapsedTime(elapsedTime);
}

function focusStopwatch(id) {
  sw = getStopwatches()[id];
  el = elements[id];
}

function getDefaultStopwatch() {
  return {
    intervalId: null,
    startTime: null,
    pauseTime: null,
    elapsedPauseTime: 0,
    name: "",
  };
}

// LOCAL STORAGE FUNCTIONS

function getStopwatches() {
  return JSON.parse(LS.getItem("stopwatches")) || {};
}
function setStopwatches(stopwatches) {
  LS.setItem("stopwatches", JSON.stringify(stopwatches));
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
