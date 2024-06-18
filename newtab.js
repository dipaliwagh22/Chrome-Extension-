document.addEventListener('DOMContentLoaded', () => {

  let canvas = document.getElementById('scribble-canvas');
  let ctx = canvas.getContext('2d');
  let scribbleContainer = document.getElementById('scribble-container');
  let noteTextarea = document.getElementById('note-textarea');
  let scribbleHeadingInput = document.getElementById('scribble-heading');
  let savedScribblesContainer = document.getElementById('saved-scribbles-container');
  let isDrawing = false;
  let editingIndex = -1;

  canvas.width = scribbleContainer.clientWidth;
  canvas.height = scribbleContainer.clientHeight;

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  document.getElementById('clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    noteTextarea.value = '';
    scribbleHeadingInput.value = '';
    editingIndex = -1; 
  });

  document.getElementById('save-canvas').addEventListener('click', () => {
    let scribbleData = {
      heading: scribbleHeadingInput.value,
      note: noteTextarea.value,
      image: canvas.toDataURL()
    };

    saveScribble(scribbleData);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    noteTextarea.value = '';
    scribbleHeadingInput.value = '';
    editingIndex = -1; 
  });

  function saveScribble(scribbleData) {
    let savedScribbles = JSON.parse(localStorage.getItem('savedScribbles')) || [];

    if (editingIndex !== -1) {
      savedScribbles[editingIndex] = scribbleData;
      editingIndex = -1; 
    } else {
      savedScribbles.push(scribbleData);
    }

    localStorage.setItem('savedScribbles', JSON.stringify(savedScribbles));
    displaySavedScribbles();
  }


  let pomodoroMinutesInput = document.getElementById('pomodoroMinutes');
  let setTimeButton = document.getElementById('setTimeButton');
  let startButton = document.getElementById('startButton');
  let pauseButton = document.getElementById('pauseButton');
  let resetButton = document.getElementById('resetButton');
  let timerDisplay = document.getElementById('timer');
  let interval;
  let pomodoroTime = 25 * 60; 

  setTimeButton.addEventListener('click', setPomodoroTime);
  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);

  function setPomodoroTime() {
    let minutes = parseInt(pomodoroMinutesInput.value);
    if (!isNaN(minutes) && minutes > 0) {
      pomodoroTime = minutes * 60;
      timerDisplay.textContent = formatTime(pomodoroTime);
    }
  }

  function startTimer() {
    interval = setInterval(() => {
      pomodoroTime--;
      timerDisplay.textContent = formatTime(pomodoroTime);
      if (pomodoroTime <= 0) {
        clearInterval(interval);
        pomodoroTime = 0;
        timerDisplay.textContent = formatTime(pomodoroTime);
        alert('Pomodoro session ended!');
      }
    }, 1000);

    startButton.disabled = true;
    pauseButton.disabled = false;
  }

  function pauseTimer() {
    clearInterval(interval);
    startButton.disabled = false;
    pauseButton.disabled = true;
  }

  function resetTimer() {
    clearInterval(interval);
    pomodoroTime = 25 * 60; 
    timerDisplay.textContent = formatTime(pomodoroTime);
    startButton.disabled = false;
    pauseButton.disabled = true;
  }

  function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  
  function displaySavedScribbles() {
    let savedScribbles = JSON.parse(localStorage.getItem('savedScribbles')) || [];
    savedScribblesContainer.innerHTML = '';
    
    savedScribbles.forEach((scribble, index) => {
      let savedScribbleDiv = document.createElement('div');
      savedScribbleDiv.classList.add('saved-scribble');

      let headingDiv = document.createElement('div');
      headingDiv.textContent = scribble.heading;

      let img = new Image();
      img.src = scribble.image;
      img.onload = function () {
        savedScribbleDiv.appendChild(img);
      };

      let editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', function () {
        loadScribbleForEdit(index);
      });

      let deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function () {
        deleteScribble(index);
      });

      savedScribbleDiv.appendChild(headingDiv);
      savedScribbleDiv.appendChild(editButton);
      savedScribbleDiv.appendChild(deleteButton);

      savedScribblesContainer.appendChild(savedScribbleDiv);
    });
  }

  function deleteScribble(index) {
    let savedScribbles = JSON.parse(localStorage.getItem('savedScribbles')) || [];
    savedScribbles.splice(index, 1);
    localStorage.setItem('savedScribbles', JSON.stringify(savedScribbles));
    displaySavedScribbles();
  }

  function loadScribbleForEdit(index) {
    let savedScribbles = JSON.parse(localStorage.getItem('savedScribbles')) || [];
    let scribble = savedScribbles[index];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    img.src = scribble.image;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
    noteTextarea.value = scribble.note;
    scribbleHeadingInput.value = scribble.heading;
    editingIndex = index; 
  }


  displaySavedScribbles();


  let taskList = document.getElementById('task-list');
  let addTaskInput = document.getElementById('add-task-input');
  let addTaskButton = document.getElementById('add-task-button');

  
  addTaskButton.addEventListener('click', addNewTask);

  taskList.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-task')) {
      deleteTask(event.target.parentElement);
    } else if (event.target.type === 'radio') {
      updateRating(event.target);
    }
  });

  function addNewTask() {
    let taskName = addTaskInput.value.trim();
    if (taskName !== '') {
      addTask(taskName);
      addTaskInput.value = ''; 
    }
  }

  function addTask(taskName) {
    let li = document.createElement('li');
    li.classList.add('task-item');
    li.innerHTML = `
      <span>${taskName}</span>
      <div class="star-rating">
        <input type="radio" id="${taskName}-star5" name="${taskName}-rating" value="5" />
        <label for="${taskName}-star5">&#9733;</label>
        <input type="radio" id="${taskName}-star4" name="${taskName}-rating" value="4" />
        <label for="${taskName}-star4">&#9733;</label>
        <input type="radio" id="${taskName}-star3" name="${taskName}-rating" value="3" />
        <label for="${taskName}-star3">&#9733;</label>
        <input type="radio" id="${taskName}-star2" name="${taskName}-rating" value="2" />
        <label for="${taskName}-star2">&#9733;</label>
        <input type="radio" id="${taskName}-star1" name="${taskName}-rating" value="1" />
        <label for="${taskName}-star1">&#9733;</label>
      </div>
      <button class="delete-task">Delete</button>
    `;
    taskList.appendChild(li);
  }

  function deleteTask(taskElement) {
    taskElement.remove();
  }

  function updateRating(radioInput) {
    let starLabels = radioInput.parentElement.querySelectorAll('label');
    starLabels.forEach(label => {
      label.style.color = '#ccc'; 
    });
    let currentLabel = radioInput.nextElementSibling;
    while (currentLabel) {
      currentLabel.style.color = '#ffa500'; 
      currentLabel = currentLabel.nextElementSibling;
    }
  }
});