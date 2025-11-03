'use strict';

class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {

        this.navbarToggle = document.querySelector('.navbar-toggle');
        this.navbarMenu = document.querySelector('.navbar-menu');
        this.addBtn = document.getElementById('addBtn');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskCount = document.getElementById('taskCount');
        this.completedCount = document.getElementById('completedCount');
        this.emptyState = document.getElementById('emptyState');
    }

    attachEventListeners() {

        this.navbarToggle.addEventListener('click', () => this.toggleNavbar());
        
    
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
   
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        //temas da pagina
      
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        }); //filtros
    }

    toggleNavbar() {
        this.navbarToggle.classList.toggle('active');
        this.navbarMenu.classList.toggle('active');
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (taskText === '') {
            this.showNotification('Digite uma tarefa!', 'warning');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.showNotification('Tarefa adicionada!', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.render();
        this.showNotification('Tarefa removida!', 'error');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // botões de filtro
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Atualizar os contadores
        this.taskCount.textContent = this.tasks.length;
        this.completedCount.textContent = this.tasks.filter(t => t.completed).length;
        
        // Renderizar a lista
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item" data-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="app.toggleTask(${task.id})">
                    </div>
                    <span class="task-text ${task.completed ? 'completed' : ''}">
                        ${this.escapeHtml(task.text)}
                    </span>
                    <div class="task-actions">
                        <button class="delete-btn" onclick="app.deleteTask(${task.id})" 
                                aria-label="Excluir tarefa">
                            🗑️
                        </button>
                    </div>
                </li>
            `).join('');
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        
        const isDark = document.body.classList.contains('dark-theme');
        this.themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    showNotification(message, type) {
        // notificação simples.
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(savedTheme + '-theme');
        this.themeToggle.querySelector('.theme-icon').textContent = 
            savedTheme === 'dark' ? '☀️' : '🌙';
    }
}


const app = new TodoApp();
app.loadTheme();

document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        app.navbarToggle.classList.remove('active');
        app.navbarMenu.classList.remove('active');
    });
});