const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDateInput = document.getElementById('task-date-input');
const taskLists = document.querySelectorAll('.task-list');

let draggedCard = null;

document.addEventListener('DOMContentLoaded', loadTasks);

// Evento de envio do formulário
taskForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o F5 da página

  const text = taskInput.value.trim();
  const dueDate = taskDateInput ? taskDateInput.value : '';
  
  if (!text) return;

  const id = Date.now().toString();
  
  // Cria o card e salva no localStorage
  createTaskCard(id, text, dueDate, 'todo');
  saveState();

  // Limpa os campos
  taskInput.value = '';
  if (taskDateInput) taskDateInput.value = '';
});

function isOverdue(dueDateStr, status) {
  if (!dueDateStr || status === 'done') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [year, month, day] = dueDateStr.split('-');
  const dueDate = new Date(year, month - 1, day);
  
  return dueDate < today;
}

function formatDate(dueDateStr) {
  if (!dueDateStr) return '';
  const [year, month, day] = dueDateStr.split('-');
  return `${day}/${month}/${year}`;
}

function createTaskCard(id, text, dueDate, status) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = id;
  card.dataset.dueDate = dueDate || '';

  if (isOverdue(dueDate, status)) {
    card.classList.add('overdue');
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'task-content';

  const span = document.createElement('span');
  span.textContent = text;
  span.title = 'Clique duas vezes para editar';

  span.addEventListener('dblclick', () => {
    const newText = prompt('Editar tarefa:', span.textContent);
    if (newText !== null && newText.trim() !== '') {
      span.textContent = newText.trim();
      saveState();
    }
  });

  contentDiv.appendChild(span);

  if (dueDate) {
    const dateSpan = document.createElement('small');
    dateSpan.className = 'task-date';
    dateSpan.textContent = `📅 ${formatDate(dueDate)}`;
    contentDiv.appendChild(dateSpan);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.type = 'button'; // Garante que não acione submit ao clicar
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    card.remove();
    saveState();
  });

  card.appendChild(contentDiv);
  card.appendChild(deleteBtn);

  // Drag & Drop
  card.addEventListener('dragstart', (e) => {
    draggedCard = card;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', id);
  });

  card.addEventListener('dragend', () => {
    draggedCard = null;
    card.classList.remove('dragging');
    saveState();
  });

  const targetColumn = document.getElementById(status) || document.getElementById('todo');
  targetColumn.appendChild(card);
}

// Configuração das colunas
taskLists.forEach(list => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    list.classList.add('drag-over');
  });

  list.addEventListener('dragleave', () => {
    list.classList.remove('drag-over');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    list.classList.remove('drag-over');
    if (draggedCard) {
      list.appendChild(draggedCard);

      const status = list.parentElement.dataset.status;
      const dueDate = draggedCard.dataset.dueDate;
      
      if (isOverdue(dueDate, status)) {
        draggedCard.classList.add('overdue');
      } else {
        draggedCard.classList.remove('overdue');
      }

      saveState();
    }
  });
});

function saveState() {
  const tasks = [];

  document.querySelectorAll('.kanban-column').forEach(column => {
    const status = column.dataset.status;
    const list = column.querySelector('.task-list');
    const cards = list.querySelectorAll('.task-card');

    const countElem = document.getElementById(`count-${status}`);
    if (countElem) countElem.textContent = cards.length;

    cards.forEach(card => {
      const textSpan = card.querySelector('.task-content span');
      tasks.push({
        id: card.dataset.id,
        text: textSpan ? textSpan.textContent : '',
        dueDate: card.dataset.dueDate || '',
        status: status
      });
    });
  });

  localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
  tasks.forEach(task => createTaskCard(task.id, task.text, task.dueDate, task.status));
  saveState();
}