// 1. Seleção dos elementos do DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// 2. Evento para adicionar tarefa
taskForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o recarregamento da página

  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  addTask(taskText);
  taskInput.value = ''; // Limpa o input
});

// 3. Função para renderizar uma nova tarefa
function addTask(text) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = text;
  
  // Alternar estado de concluído ao clicar no texto
  span.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  
  // Remover tarefa ao clicar no botão
  deleteBtn.addEventListener('click', () => {
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}