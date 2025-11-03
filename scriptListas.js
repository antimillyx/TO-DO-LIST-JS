'use strict';

class ListsManager {
    constructor() {
        this.lists = JSON.parse(localStorage.getItem('savedLists')) || [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
      
        this.navbarToggle = document.querySelector('.navbar-toggle');
        this.navbarMenu = document.querySelector('.navbar-menu');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.newListBtn = document.getElementById('newListBtn');
        this.createFirstListBtn = document.getElementById('createFirstList');
        this.listModal = document.getElementById('listModal');
        this.closeModalBtn = document.querySelector('.close-modal'); 
        this.cancelBtn = document.querySelector('.btn-cancel');
        this.listForm = document.getElementById('listForm');
        this.listsGrid = document.getElementById('listsGrid');
        this.emptyLists = document.getElementById('emptyLists');
        this.searchInput = document.getElementById('searchInput');
        this.categoryBtns = document.querySelectorAll('.category-btn');
    }

    attachEventListeners() {
    
        this.navbarToggle.addEventListener('click', () => this.toggleNavbar());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.newListBtn.addEventListener('click', () => this.openModal());
        this.createFirstListBtn.addEventListener('click', () => this.openModal());
        
      
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        this.listForm.addEventListener('submit', (e) => this.createList(e));
   
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
        
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategory(e.target.dataset.category);
            });
        });
        
      
        this.listModal.addEventListener('click', (e) => {
            if (e.target === this.listModal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.listModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    toggleNavbar() {
        this.navbarToggle.classList.toggle('active');
        this.navbarMenu.classList.toggle('active');
    }

    openModal() {
        this.listModal.classList.add('active');
        document.getElementById('listName').focus();
        
 
        this.listForm.onsubmit = (e) => this.createList(e);
        document.querySelector('.modal-header h3').textContent = 'Criar Nova Lista';
        document.querySelector('.btn-create').textContent = 'Criar Lista';
        
        
        this.listForm.reset();
        
   
        const firstColor = document.querySelector('input[name="listColor"]');
        if (firstColor) firstColor.checked = true;
    }

    closeModal() {
        this.listModal.classList.remove('active');
        this.listForm.reset();
    }

    createList(e) {
        e.preventDefault();
        
        const listName = document.getElementById('listName').value.trim();
        const listCategory = document.getElementById('listCategory').value;
        const listColor = document.querySelector('input[name="listColor"]:checked')?.value || '#ff6b9d';
        
        if (!listName || !listCategory) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }

        const newList = {
            id: Date.now(),
            name: listName,
            category: listCategory,
            color: listColor,
            createdAt: new Date().toISOString(),
            items: [],
            completedItems: 0,
            totalItems: 0
        };

        this.lists.unshift(newList);
        this.saveLists();
        this.render();
        this.closeModal();
        this.showNotification('Lista criada com sucesso!', 'success');
    }

    setCategory(category) {
        this.currentCategory = category;
        
        this.categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.render();
    }

    //filtros de pesquisa
    getFilteredLists() {
        let filtered = this.lists;

    
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(list => list.category === this.currentCategory);
        }


        if (this.searchTerm) {
            filtered = filtered.filter(list => 
                list.name.toLowerCase().includes(this.searchTerm)
            );
        }

        return filtered;
    }

    render() {
        const filteredLists = this.getFilteredLists();
        
     
        if (filteredLists.length === 0) {
            this.listsGrid.innerHTML = '';
            this.emptyLists.style.display = 'block';
        } else {
            this.emptyLists.style.display = 'none';
            this.listsGrid.innerHTML = filteredLists.map(list => `
                <div class="list-card" style="--card-color: ${list.color}" onclick="listsManager.openList(${list.id})">
                    <div class="list-header">
                        <div>
                            <h3 class="list-title">${this.escapeHtml(list.name)}</h3>
                            <span class="list-category">${this.getCategoryIcon(list.category)} ${this.getCategoryName(list.category)}</span>
                        </div>
                    </div>
                    
                    <div class="list-stats">
                        <span>${list.completedItems || 0}/${list.totalItems || 0} itens</span>
                        <span>${this.formatDate(list.createdAt)}</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgress(list)}%"></div>
                    </div>
                    
                    <div class="list-actions">
                        <button class="list-action-btn" onclick="event.stopPropagation(); listsManager.editList(${list.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="list-action-btn" onclick="event.stopPropagation(); listsManager.deleteList(${list.id})" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    getProgress(list) {
        if (!list.totalItems || list.totalItems === 0) return 0;
        return Math.round((list.completedItems / list.totalItems) * 100);
    }

    getCategoryIcon(category) {
        const icons = {
            'compras': '🛒',
            'tarefas': '📋',
            'trabalho': '💼',
            'estudos': '📚',
            'casa': '🏠',
            'pessoal': '👤',
            'outro': '🔖'
        };
        return icons[category] || '📁';
    }

    getCategoryName(category) {
        const names = {
            'compras': 'Compras',
            'tarefas': 'Tarefas',
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'casa': 'Casa',
            'pessoal': 'Pessoal',
            'outro': 'Outro'
        };
        return names[category] || 'Outro';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    openList(listId) {
      
        this.showNotification(`Abrindo lista ${listId} - Página em desenvolvimento`, 'info');
    }

    editList(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (list) {
        
            document.getElementById('listName').value = list.name;
            document.getElementById('listCategory').value = list.category;
            
     
            const colorRadio = document.querySelector(`input[value="${list.color}"]`);
            if (colorRadio) colorRadio.checked = true;
            
         
            this.listForm.onsubmit = (e) => this.updateList(e, listId);
            document.querySelector('.modal-header h3').textContent = 'Editar Lista';
            document.querySelector('.btn-create').textContent = 'Atualizar Lista';
            
            this.openModal();
        }
    }

    updateList(e, listId) {
        e.preventDefault();
        
        const listIndex = this.lists.findIndex(l => l.id === listId);
        if (listIndex === -1) return;

        const listName = document.getElementById('listName').value.trim();
        const listCategory = document.getElementById('listCategory').value;
        const listColor = document.querySelector('input[name="listColor"]:checked')?.value || '#ff6b9d';
        
        this.lists[listIndex].name = listName;
        this.lists[listIndex].category = listCategory;
        this.lists[listIndex].color = listColor;

        this.saveLists();
        this.render();
        this.closeModal();
        this.showNotification('Lista atualizada com sucesso!', 'success');
    }

    deleteList(listId) {
        if (confirm('Tem certeza que deseja excluir esta lista?')) {
            this.lists = this.lists.filter(l => l.id !== listId);
            this.saveLists();
            this.render();
            this.showNotification('Lista excluída com sucesso!', 'error');
        }
    }

    saveLists() {
        localStorage.setItem('savedLists', JSON.stringify(this.lists));
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        
        const isDark = document.body.classList.contains('dark-theme');
        this.themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
//notifcação
    showNotification(message, type) {
       
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
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


const listsManager = new ListsManager();
listsManager.loadTheme();


document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        listsManager.navbarToggle.classList.remove('active');
        listsManager.navbarMenu.classList.remove('active');
    });
});

// animações 
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);