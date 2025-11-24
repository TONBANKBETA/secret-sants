// Initialize Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// Global state
let currentPriority = 0;
let currentUser = {
    id: 'user-' + Date.now(),
    name: 'Пользователь',
    wishes: []
};

let allUsers = [];
let currentFilter = 'all';
let selectedUserId = null;

// Initialize app
function initApp() {
    loadData();
    renderWishes();
    renderPeople();
    updateProfileStats();
    selectPriority(0);
    
    // Simulate real-time updates
    setInterval(() => {
        simulateUserUpdates();
    }, 5000);
}

// Load data from memory (simulating localStorage)
function loadData() {
    // In a real app, this would load from localStorage
    // But since localStorage is blocked, we'll keep everything in memory
    
    // Initialize with current user
    if (!currentUser.name || currentUser.name === 'Пользователь') {
        currentUser.name = 'Я';
    }
    
    // Initialize demo users
    if (allUsers.length === 0) {
        allUsers = [
            {
                id: currentUser.id,
                name: currentUser.name,
                wishes: currentUser.wishes
            },
            {
                id: 'user-demo-1',
                name: 'Анна',
                wishes: [
                    {
                        id: 'wish-demo-1',
                        title: 'Набор для рисования',
                        article: 'ART-2024',
                        description: 'Профессиональный набор акриловых красок',
                        category: 'can-give',
                        priority: 2,
                        timestamp: Date.now() - 3600000
                    },
                    {
                        id: 'wish-demo-2',
                        title: 'Животные',
                        article: '',
                        description: 'Пожалуйста, не дарите живых животных',
                        category: 'cannot-give',
                        priority: 0,
                        timestamp: Date.now() - 7200000
                    }
                ]
            },
            {
                id: 'user-demo-2',
                name: 'Дмитрий',
                wishes: [
                    {
                        id: 'wish-demo-3',
                        title: 'Механическая клавиатура',
                        article: 'KB-MX-2024',
                        description: 'С синими переключателями',
                        category: 'can-give',
                        priority: 1,
                        timestamp: Date.now() - 1800000
                    }
                ]
            },
            {
                id: 'user-demo-3',
                name: 'Елена',
                wishes: [
                    {
                        id: 'wish-demo-4',
                        title: 'Книга по психологии',
                        article: 'ISBN 978-5-17-123456-7',
                        description: 'Даниэль Канеман - Думай медленно... решай быстро',
                        category: 'can-give',
                        priority: 1,
                        timestamp: Date.now() - 5400000
                    },
                    {
                        id: 'wish-demo-5',
                        title: 'Алкоголь',
                        article: '',
                        description: 'Не употребляю алкоголь',
                        category: 'cannot-give',
                        priority: 0,
                        timestamp: Date.now() - 9000000
                    }
                ]
            }
        ];
    }
    
    // Update current user in allUsers
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
    }
}

// Save data (simulating async save)
function saveData() {
    showSyncIndicator();
    
    // Update current user in allUsers
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = {...currentUser, wishes: [...currentUser.wishes]};
    } else {
        allUsers.push({...currentUser, wishes: [...currentUser.wishes]});
    }
    
    // Simulate network delay
    setTimeout(() => {
        hideSyncIndicator();
        renderPeople();
        updateProfileStats();
    }, 800);
}

// Show sync indicator
function showSyncIndicator() {
    const indicator = document.getElementById('syncIndicator');
    indicator.classList.add('visible');
}

// Hide sync indicator
function hideSyncIndicator() {
    const indicator = document.getElementById('syncIndicator');
    indicator.classList.remove('visible');
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Refresh data when switching to people tab
    if (tabName === 'people') {
        renderPeople();
    }
    
    // Update profile stats when switching to profile tab
    if (tabName === 'profile') {
        updateProfileStats();
        document.getElementById('userName').value = currentUser.name;
    }
}

// Select priority
function selectPriority(priority) {
    currentPriority = priority;
    
    // Update UI
    for (let i = 0; i <= 2; i++) {
        const element = document.getElementById('priority-' + i);
        if (i === priority) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    }
}

// Add wish
function addWish(event) {
    event.preventDefault();
    
    const title = document.getElementById('wishTitle').value.trim();
    const article = document.getElementById('wishArticle').value.trim();
    const description = document.getElementById('wishDescription').value.trim();
    const category = document.getElementById('wishCategory').value;
    
    if (!title || !description) {
        return;
    }
    
    const wish = {
        id: 'wish-' + Date.now(),
        title,
        article,
        description,
        category,
        priority: currentPriority,
        timestamp: Date.now()
    };
    
    currentUser.wishes.unshift(wish);
    
    // Reset form
    document.getElementById('wishForm').reset();
    selectPriority(0);
    
    // Save and render
    saveData();
    renderWishes();
}

// Delete wish
function deleteWish(wishId) {
    currentUser.wishes = currentUser.wishes.filter(w => w.id !== wishId);
    saveData();
    renderWishes();
}

// Get priority stars
function getPriorityStars(priority) {
    if (priority === 1) return '⭐';
    if (priority === 2) return '⭐⭐';
    return '';
}

// Get category badge HTML
function getCategoryBadge(category) {
    if (category === 'can-give') {
        return '<span class="wish-badge badge-can-give">✅ Можно дарить</span>';
    }
    return '<span class="wish-badge badge-cannot-give">❌ Нельзя дарить</span>';
}

// Render wishes
function renderWishes() {
    const container = document.getElementById('wishList');
    
    if (currentUser.wishes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎁</div>
                <div class="empty-state-text">У вас пока нет желаний.<br>Добавьте первое!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentUser.wishes.map(wish => `
        <div class="wish-item">
            <div class="wish-header">
                <div class="wish-title">${escapeHtml(wish.title)}</div>
                <div class="wish-priority">${getPriorityStars(wish.priority)}</div>
            </div>
            <div class="wish-meta">
                ${getCategoryBadge(wish.category)}
            </div>
            ${wish.article ? `<div class="wish-article">Артикул: ${escapeHtml(wish.article)}</div>` : ''}
            <div class="wish-description">${escapeHtml(wish.description)}</div>
            <div class="wish-actions">
                <button class="btn-small btn-delete" onclick="deleteWish('${wish.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Render people
function renderPeople() {
    const container = document.getElementById('peopleList');
    
    // Filter out current user and show others
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
    
    if (otherUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">Пока нет других участников</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = otherUsers.map(user => {
        const canGive = user.wishes.filter(w => w.category === 'can-give').length;
        const cannotGive = user.wishes.filter(w => w.category === 'cannot-give').length;
        const initial = user.name.charAt(0).toUpperCase();
        
        return `
            <div class="person-card" onclick="openUserModal('${user.id}')">
                <div class="person-header">
                    <div class="person-avatar">${initial}</div>
                    <div class="person-info">
                        <div class="person-name">${escapeHtml(user.name)}</div>
                        <div class="person-stats">
                            ${user.wishes.length} желаний • 
                            ✅ ${canGive} • 
                            ❌ ${cannotGive}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open user modal
function openUserModal(userId) {
    selectedUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) return;
    
    document.getElementById('modalUserName').textContent = user.name;
    currentFilter = 'all';
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-all').classList.add('active');
    
    renderModalWishes(user.wishes);
    document.getElementById('userModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('userModal').classList.remove('active');
    selectedUserId = null;
}

// Filter wishes in modal
function filterWishes(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-' + filter).classList.add('active');
    
    const user = allUsers.find(u => u.id === selectedUserId);
    if (!user) return;
    
    let filteredWishes = user.wishes;
    if (filter !== 'all') {
        filteredWishes = user.wishes.filter(w => w.category === filter);
    }
    
    renderModalWishes(filteredWishes);
}

// Render wishes in modal
function renderModalWishes(wishes) {
    const container = document.getElementById('modalWishList');
    
    if (wishes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎁</div>
                <div class="empty-state-text">Нет желаний в этой категории</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = wishes.map(wish => `
        <div class="wish-item">
            <div class="wish-header">
                <div class="wish-title">${escapeHtml(wish.title)}</div>
                <div class="wish-priority">${getPriorityStars(wish.priority)}</div>
            </div>
            <div class="wish-meta">
                ${getCategoryBadge(wish.category)}
            </div>
            ${wish.article ? `<div class="wish-article">Артикул: ${escapeHtml(wish.article)}</div>` : ''}
            <div class="wish-description">${escapeHtml(wish.description)}</div>
        </div>
    `).join('');
}

// Update profile stats
function updateProfileStats() {
    const total = currentUser.wishes.length;
    const canGive = currentUser.wishes.filter(w => w.category === 'can-give').length;
    const cannotGive = currentUser.wishes.filter(w => w.category === 'cannot-give').length;
    
    document.getElementById('totalWishes').textContent = total;
    document.getElementById('canGiveCount').textContent = canGive;
    document.getElementById('cannotGiveCount').textContent = cannotGive;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
}

// Save profile
function saveProfile() {
    const name = document.getElementById('userName').value.trim();
    
    if (name) {
        currentUser.name = name;
        saveData();
        updateProfileStats();
    }
}

// Simulate real-time updates from other users
function simulateUserUpdates() {
    // Randomly update a demo user's wishes
    const demoUsers = allUsers.filter(u => u.id !== currentUser.id && u.id.startsWith('user-demo'));
    
    if (demoUsers.length === 0) return;
    
    // Small chance to add a new wish to a random user
    if (Math.random() < 0.1) {
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        const templates = [
            { title: 'Новая книга', category: 'can-give', priority: 1 },
            { title: 'Настольная игра', category: 'can-give', priority: 0 },
            { title: 'Сертификат в магазин', category: 'can-give', priority: 2 }
        ];
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        randomUser.wishes.unshift({
            id: 'wish-auto-' + Date.now(),
            title: template.title,
            article: '',
            description: 'Автоматически добавлено',
            category: template.category,
            priority: template.priority,
            timestamp: Date.now()
        });
        
        // Update people list if we're on that tab
        const peopleTab = document.getElementById('people-tab');
        if (peopleTab.classList.contains('active')) {
            renderPeople();
        }
        
        // Update modal if it's open for this user
        if (selectedUserId === randomUser.id) {
            filterWishes(currentFilter);
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app on load
window.addEventListener('DOMContentLoaded', initApp);