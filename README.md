# [Stopwatches](https://stopwatches.netlify.app/)

![thumbnail](./github_images/v6.png)

## Description

Keep track of how long all your tasks are taking with multiple stopwatches! Just click to add a new stopwatch. Stopwatches can be run simulaneously. Each stopwatch can be given a unique name too!

## Technologies

HTML, CSS, JavaScript, Local Storage

## How My Stopwatch Works In Code

A stopwatch needs certain variables to work with...

- startTime
  - the time when the stopwatch was started. If you subtract the current time from the start time, then you get the elapsed time! If pauses did not exist, then that would be it...
- pauseTime
  - the time when the stopwatch was paused. Works with:
- elapsedPauseTime
  - the sum of all the paused durations. When you pause a stopwatch, pauseTime is assigned to the current time. When a stopwatch is continued after a pause, it will subtract the pauseTime from the current time. The resultant duration is how long the last pause took. It gets added to elapsedPauseTime.
    To put it all together, the code for continuously updating an active stopwatch is...

```
//simplified code:
  //if a stopwatch is started, and pauseTime exists:
  if (pauseTime) {
    elapsedPauseTime += Date.now() - pauseTime;
    pauseTime = null;
  }
  //continuously update elapsed time:
  setInterval(() => {
    const elapsedTime = Date.now() - startTime - elapsedPauseTime;
    displayEl.textContent = format(elapsedTime);
  }, 20);
```

## Tasks

- [x] a user can click a button to create as many stopwatches as desired
- [x] a user can refresh the page and still see stopwatches (local storage)
- [x] a user can delete stopwatches
- [ ] a user can give each stopwatch a name
- [ ] change display format from 00:00:00 to 00h 00m 00s
- [ ] a user can click a drag a stopwatch to reorder it

## Thoughts

- More Comfortable Using Git
  - I enjoyed creating new branches before working on new features. This way, if my implementation of the feature is a mess, then I can simply delete the feature branch, and still have the main branch untouched. After all, the main branch should be reserved for tested code that is ready for deployment.

## Evolution

![version 1](./github_images/v1.png)

- single stopwatch
- hard-coded HTML

![version 2](./github_images/v2.png)

- dynamically generated HTML based on array of stopwatch objects

![version 3](./github_images/v3.png)

- click to create desired amount of stopwatches

![version 4](./github_images/v4.png)

- restyled

![version 5](./github_images/v5.png)

- adds X button to delete a stopwatch

![version 6](./github_images/v6.png)

- name-able stopwatches
