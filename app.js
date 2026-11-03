const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskLists = document.querySelectorAll('.task-list');

let draggedCard = null;

// Carregar tarefas ao abrir a página
document.addEventListener('DOMContentLoaded', loadTasks);

// Adicionar nova tarefa (vai direto para a coluna "Novo")
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const id = Date.now().toString();
  createTaskCard(id, text, 'todo');
  saveState();

  taskInput.value = '';
});

// Criar o card da tarefa com eventos de Drag & Drop
function createTaskCard(id, text, status) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = id;

  const span = document.createElement('span');
  span.textContent = text;
  span.title = 'Clique duas vezes para editar';

  span.addEventListener('dbclick', () => {
    const newText = prompt('Editar tarefa:', span.textContent);
    if(newText !== NULL && NEWtEXT.trim() !== ''){
        span.textContent = newText.trim();
        saveState();
    }
  })

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    card.remove();
    saveState();
  });

  card.appendChild(span);
  card.appendChild(deleteBtn);

  // Eventos do Drag & Drop
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

  // Insere na coluna correta
  document.getElementById(status).appendChild(card);
}

// Configurar as zonas de soltar (colunas)
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
      saveState();
    }
  });
});

// Atualizar contadores e salvar no localStorage
function saveState() {
  const tasks = [];

  document.querySelectorAll('.kanban-column').forEach(column => {
    const status = column.dataset.status;
    const list = column.querySelector('.task-list');
    const cards = list.querySelectorAll('.task-card');

    // Atualizar contador da coluna
    document.getElementById(`count-${status}`).textContent = cards.length;

    cards.forEach(card => {
      tasks.push({
        id: card.dataset.id,
        text: card.querySelector('span').textContent,
        status: status
      });
    });
  });

  localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
  tasks.forEach(task => createTaskCard(task.id, task.text, task.status));
  saveState();
}