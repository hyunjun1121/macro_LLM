// Threads Application JavaScript
class ThreadsApp {
    constructor() {
        this.currentView = 'home';
        this.currentUser = mockData.currentUser;
        this.threads = [...mockData.threads];
        this.users = [...mockData.users];
        this.activities = [...mockData.activities];
        this.suggestedAccounts = [...mockData.suggestedAccounts];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHomeView();
        this.loadSuggestedAccounts();
        this.updateUserProfile();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Post thread
        document.getElementById('post-thread').addEventListener('click', () => {
            this.postThread();
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('sidebar-search').addEventListener('input', (e) => {
            this.handleSidebarSearch(e.target.value);
        });

        // Search tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSearchTab(e.target.dataset.tab);
            });
        });

        // Thread actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thread-action')) {
                this.handleThreadAction(e.target.closest('.thread-action'));
            }
        });

        // Follow buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('follow-btn')) {
                this.handleFollow(e.target);
            }
        });

        // User profile clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thread-username') || e.target.closest('.user-profile')) {
                this.showUserProfile(e.target.closest('[data-user]')?.dataset.user || 'current_user');
            }
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Load view-specific content
        switch (viewName) {
            case 'home':
                this.loadHomeView();
                break;
            case 'search':
                this.loadSearchView();
                break;
            case 'activity':
                this.loadActivityView();
                break;
            case 'profile':
                this.loadProfileView();
                break;
        }
    }

    loadHomeView() {
        const feed = document.getElementById('threads-feed');
        feed.innerHTML = '';

        // Sort threads by timestamp (newest first)
        const sortedThreads = [...this.threads].sort((a, b) => b.timestamp - a.timestamp);

        sortedThreads.forEach(thread => {
            const threadElement = this.createThreadElement(thread);
            feed.appendChild(threadElement);
        });
    }

    createThreadElement(thread) {
        const user = getUserById(thread.author);
        const threadDiv = document.createElement('div');
        threadDiv.className = 'thread-item';
        threadDiv.innerHTML = `
            <div class="thread-avatar">
                <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="thread-content">
                <div class="thread-header">
                    <span class="thread-username" data-user="${user.id}">${user.username}</span>
                    <span class="thread-handle">${user.handle}</span>
                    <span class="thread-time">${formatTimeAgo(thread.timestamp)}</span>
                </div>
                <div class="thread-text">${thread.content}</div>
                <div class="thread-actions">
                    <div class="thread-action ${thread.isLiked ? 'liked' : ''}" data-action="like" data-thread="${thread.id}">
                        <i class="fas fa-heart"></i>
                        <span>${thread.likes}</span>
                    </div>
                    <div class="thread-action" data-action="reply" data-thread="${thread.id}">
                        <i class="fas fa-comment"></i>
                        <span>${thread.replies}</span>
                    </div>
                    <div class="thread-action ${thread.isReposted ? 'reposted' : ''}" data-action="repost" data-thread="${thread.id}">
                        <i class="fas fa-retweet"></i>
                        <span>${thread.reposts}</span>
                    </div>
                    <div class="thread-action" data-action="share" data-thread="${thread.id}">
                        <i class="fas fa-share"></i>
                    </div>
                </div>
            </div>
        `;
        return threadDiv;
    }

    postThread() {
        const textarea = document.getElementById('thread-text');
        const content = textarea.value.trim();

        if (!content) return;

        const newThread = {
            id: `thread_${Date.now()}`,
            author: this.currentUser.id,
            content: content,
            timestamp: new Date(),
            likes: 0,
            replies: 0,
            reposts: 0,
            isLiked: false,
            isReposted: false
        };

        this.threads.unshift(newThread);
        textarea.value = '';
        
        // Reload home view to show new thread
        this.loadHomeView();
    }

    handleThreadAction(actionElement) {
        const action = actionElement.dataset.action;
        const threadId = actionElement.dataset.thread;
        const thread = getThreadById(threadId);

        if (!thread) return;

        switch (action) {
            case 'like':
                this.toggleLike(thread, actionElement);
                break;
            case 'repost':
                this.toggleRepost(thread, actionElement);
                break;
            case 'reply':
                this.showReplyModal(thread);
                break;
            case 'share':
                this.shareThread(thread);
                break;
        }
    }

    toggleLike(thread, actionElement) {
        if (thread.isLiked) {
            thread.likes--;
            thread.isLiked = false;
            actionElement.classList.remove('liked');
        } else {
            thread.likes++;
            thread.isLiked = true;
            actionElement.classList.add('liked');
        }
        
        actionElement.querySelector('span').textContent = thread.likes;
    }

    toggleRepost(thread, actionElement) {
        if (thread.isReposted) {
            thread.reposts--;
            thread.isReposted = false;
            actionElement.classList.remove('reposted');
        } else {
            thread.reposts++;
            thread.isReposted = true;
            actionElement.classList.add('reposted');
        }
        
        actionElement.querySelector('span').textContent = thread.reposts;
    }

    showReplyModal(thread) {
        // Simple alert for now - could be expanded to a proper modal
        alert(`Reply to ${thread.author}'s thread: "${thread.content.substring(0, 50)}..."`);
    }

    shareThread(thread) {
        if (navigator.share) {
            navigator.share({
                title: 'Thread',
                text: thread.content,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(thread.content);
            alert('Thread copied to clipboard!');
        }
    }

    loadSearchView() {
        const searchContent = document.getElementById('search-content');
        searchContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Search for people and threads</h3>
                <p>Find your friends and discover new content</p>
            </div>
        `;
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.loadSearchView();
            return;
        }

        const searchContent = document.getElementById('search-content');
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

        let results = [];
        if (activeTab === 'all' || activeTab === 'people') {
            results = searchUsers(query);
        }
        if (activeTab === 'all' || activeTab === 'threads') {
            results = [...results, ...searchThreads(query)];
        }

        this.displaySearchResults(results, activeTab);
    }

    switchSearchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        const query = document.getElementById('search-input').value;
        if (query.trim()) {
            this.handleSearch(query);
        } else {
            this.loadSearchView();
        }
    }

    displaySearchResults(results, tab) {
        const searchContent = document.getElementById('search-content');
        searchContent.innerHTML = '';

        if (results.length === 0) {
            searchContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try searching for something else</p>
                </div>
            `;
            return;
        }

        results.forEach(result => {
            if (result.username) {
                // User result
                const userElement = this.createUserSearchResult(result);
                searchContent.appendChild(userElement);
            } else {
                // Thread result
                const threadElement = this.createThreadSearchResult(result);
                searchContent.appendChild(threadElement);
            }
        });
    }

    createUserSearchResult(user) {
        const userDiv = document.createElement('div');
        userDiv.className = 'search-result-item';
        userDiv.innerHTML = `
            <div class="search-result-avatar">
                <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="search-result-info">
                <h4>${user.username}</h4>
                <p>${user.handle} • ${user.followers} followers</p>
                <p>${user.bio}</p>
            </div>
        `;
        userDiv.addEventListener('click', () => {
            this.showUserProfile(user.id);
        });
        return userDiv;
    }

    createThreadSearchResult(thread) {
        const user = getUserById(thread.author);
        const threadDiv = document.createElement('div');
        threadDiv.className = 'search-result-item';
        threadDiv.innerHTML = `
            <div class="search-result-avatar">
                <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="search-result-info">
                <h4>${user.username} ${user.handle}</h4>
                <p>${thread.content}</p>
                <p>${formatTimeAgo(thread.timestamp)} • ${thread.likes} likes</p>
            </div>
        `;
        return threadDiv;
    }

    handleSidebarSearch(query) {
        // Simple search in sidebar - could be expanded
        console.log('Sidebar search:', query);
    }

    loadActivityView() {
        const activityFeed = document.getElementById('activity-feed');
        activityFeed.innerHTML = '';

        if (this.activities.length === 0) {
            activityFeed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>No activity yet</h3>
                    <p>When people interact with your threads, you'll see it here</p>
                </div>
            `;
            return;
        }

        this.activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            activityFeed.appendChild(activityElement);
        });
    }

    createActivityElement(activity) {
        const user = getUserById(activity.user);
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';

        let activityText = '';
        switch (activity.type) {
            case 'like':
                activityText = `${user.username} liked your thread`;
                break;
            case 'follow':
                activityText = `${user.username} started following you`;
                break;
            case 'repost':
                activityText = `${user.username} reposted your thread`;
                break;
        }

        activityDiv.innerHTML = `
            <div class="activity-avatar">
                <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="activity-content">
                <div class="activity-text">${activityText}</div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
        `;
        return activityDiv;
    }

    loadProfileView() {
        this.showUserProfile(this.currentUser.id);
    }

    showUserProfile(userId) {
        const user = getUserById(userId);
        const profileContent = document.getElementById('profile-content');
        
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${user.avatar}" alt="${user.username}">
                </div>
                <div class="profile-info">
                    <h2>${user.username}</h2>
                    <div class="profile-handle">${user.handle}</div>
                    <p>${user.bio}</p>
                    <div class="profile-stats">
                        <div class="profile-stat">
                            <strong>${user.followers}</strong> followers
                        </div>
                        <div class="profile-stat">
                            <strong>${user.following}</strong> following
                        </div>
                        <div class="profile-stat">
                            <strong>${user.threads}</strong> threads
                        </div>
                    </div>
                </div>
            </div>
            <div class="user-threads">
                <h3>Threads</h3>
                <div class="threads-list" id="user-threads-list">
                    ${this.getUserThreadsHTML(userId)}
                </div>
            </div>
        `;

        // Switch to profile view if not already there
        if (this.currentView !== 'profile') {
            this.switchView('profile');
        }
    }

    getUserThreadsHTML(userId) {
        const userThreads = getThreadsByUser(userId);
        
        if (userThreads.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-comment"></i>
                    <h3>No threads yet</h3>
                    <p>This user hasn't posted any threads</p>
                </div>
            `;
        }

        return userThreads.map(thread => {
            const user = getUserById(thread.author);
            return `
                <div class="thread-item">
                    <div class="thread-avatar">
                        <img src="${user.avatar}" alt="${user.username}">
                    </div>
                    <div class="thread-content">
                        <div class="thread-header">
                            <span class="thread-username">${user.username}</span>
                            <span class="thread-handle">${user.handle}</span>
                            <span class="thread-time">${formatTimeAgo(thread.timestamp)}</span>
                        </div>
                        <div class="thread-text">${thread.content}</div>
                        <div class="thread-actions">
                            <div class="thread-action ${thread.isLiked ? 'liked' : ''}" data-action="like" data-thread="${thread.id}">
                                <i class="fas fa-heart"></i>
                                <span>${thread.likes}</span>
                            </div>
                            <div class="thread-action" data-action="reply" data-thread="${thread.id}">
                                <i class="fas fa-comment"></i>
                                <span>${thread.replies}</span>
                            </div>
                            <div class="thread-action ${thread.isReposted ? 'reposted' : ''}" data-action="repost" data-thread="${thread.id}">
                                <i class="fas fa-retweet"></i>
                                <span>${thread.reposts}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadSuggestedAccounts() {
        const suggestedContainer = document.getElementById('suggested-accounts');
        suggestedContainer.innerHTML = '';

        this.suggestedAccounts.forEach(account => {
            const accountElement = this.createSuggestedAccountElement(account);
            suggestedContainer.appendChild(accountElement);
        });
    }

    createSuggestedAccountElement(account) {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account-item';
        accountDiv.innerHTML = `
            <div class="account-avatar">
                <img src="${account.avatar}" alt="${account.username}">
            </div>
            <div class="account-info">
                <div class="account-name">${account.username}</div>
                <div class="account-handle">${account.handle}</div>
            </div>
            <button class="follow-btn ${account.isFollowing ? 'following' : ''}" data-user="${account.id}">
                ${account.isFollowing ? 'Following' : 'Follow'}
            </button>
        `;
        return accountDiv;
    }

    handleFollow(button) {
        const userId = button.dataset.user;
        const account = this.suggestedAccounts.find(acc => acc.id === userId);
        
        if (account) {
            account.isFollowing = !account.isFollowing;
            button.textContent = account.isFollowing ? 'Following' : 'Follow';
            button.classList.toggle('following', account.isFollowing);
        }
    }

    updateUserProfile() {
        const userProfile = document.querySelector('.user-profile');
        userProfile.innerHTML = `
            <div class="user-avatar">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.username}">
            </div>
            <div class="user-info">
                <span class="username">${this.currentUser.username}</span>
                <span class="user-handle">${this.currentUser.handle}</span>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreadsApp();
});

