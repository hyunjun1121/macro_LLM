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
        this.loadTrendingTopics();
        this.updateUserProfile();
        this.updateCharacterCount();
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

        // Modal event listeners
        this.setupModalListeners();

        // Character count for thread text
        document.getElementById('thread-text').addEventListener('input', () => {
            this.updateCharacterCount();
        });

        // Image upload handlers
        this.setupImageHandlers();

        // Emoji handlers
        this.setupEmojiHandlers();

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Bookmark functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thread-action[data-action="bookmark"]')) {
                this.handleBookmark(e.target.closest('.thread-action'));
            }
        });

        // Thread detail view
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thread-text') || e.target.closest('.thread-header')) {
                const threadId = e.target.closest('.thread-item')?.querySelector('[data-thread]')?.dataset.thread;
                if (threadId) {
                    this.showThreadDetail(threadId);
                }
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
            case 'bookmarks':
                this.loadBookmarksView();
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
        const isBookmarked = isBookmarked(thread.id);
        const formattedContent = formatTextWithLinks(thread.content);

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
                <div class="thread-text">${formattedContent}</div>
                ${thread.image ? `<div class="thread-image"><img src="${thread.image}" alt="Thread image" onclick="showImageViewer('${thread.image}')"></div>` : ''}
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
                    <div class="thread-action ${isBookmarked ? 'bookmarked' : ''}" data-action="bookmark" data-thread="${thread.id}">
                        <i class="fas fa-bookmark"></i>
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
        const imagePreview = document.getElementById('image-preview');
        const previewImage = document.getElementById('preview-image');

        if (!content && !previewImage.src) {
            this.showToast('Please write something or add an image', 'error');
            return;
        }

        if (content.length > 500) {
            this.showToast('Thread is too long. Maximum 500 characters allowed.', 'error');
            return;
        }

        const newThread = {
            id: `thread_${Date.now()}`,
            author: this.currentUser.id,
            content: content,
            image: previewImage.src || null,
            timestamp: new Date(),
            likes: 0,
            replies: 0,
            reposts: 0,
            isLiked: false,
            isReposted: false
        };

        this.threads.unshift(newThread);
        textarea.value = '';
        this.clearImagePreview();
        this.updateCharacterCount();

        this.loadHomeView();
        this.showToast('Thread posted successfully!', 'success');
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
        if (query.trim()) {\n            document.getElementById('search-input').value = query;\n            this.switchView('search');\n            this.handleSearch(query);\n        }
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

    // Modal System
    setupModalListeners() {
        // Generic modal close handlers
        document.querySelectorAll('.close-btn, .back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click outside to close modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Settings modal tabs
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSettingsTab(e.target.dataset.tab);
            });
        });

        // Activity tabs
        document.querySelectorAll('.activity-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchActivityTab(e.target.dataset.tab);
            });
        });

        // Save settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Cancel settings
        document.getElementById('cancel-settings').addEventListener('click', () => {
            this.closeModal('settings-modal');
        });

        // Reply modal handlers
        document.getElementById('post-reply').addEventListener('click', () => {
            this.postReply();
        });

        document.getElementById('reply-text').addEventListener('input', () => {
            this.updateReplyCharacterCount();
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showReplyModal(thread) {
        const user = getUserById(thread.author);
        const previewDiv = document.getElementById('reply-thread-preview');
        const formattedContent = formatTextWithLinks(thread.content);

        previewDiv.innerHTML = `
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
                    <div class="thread-text">${formattedContent}</div>
                </div>
            </div>
        `;

        // Store thread ID for reply
        document.getElementById('reply-modal').dataset.threadId = thread.id;
        document.getElementById('reply-text').value = '';
        this.updateReplyCharacterCount();
        this.showModal('reply-modal');
    }

    postReply() {
        const textarea = document.getElementById('reply-text');
        const content = textarea.value.trim();
        const threadId = document.getElementById('reply-modal').dataset.threadId;

        if (!content) {
            this.showToast('Please write something', 'error');
            return;
        }

        if (content.length > 500) {
            this.showToast('Reply is too long. Maximum 500 characters allowed.', 'error');
            return;
        }

        const newReply = {
            id: `reply_${Date.now()}`,
            threadId: threadId,
            author: this.currentUser.id,
            content: content,
            timestamp: new Date(),
            likes: 0,
            isLiked: false
        };

        // Add to replies data
        mockData.replies.push(newReply);

        // Update thread reply count
        const thread = getThreadById(threadId);
        if (thread) {
            thread.replies++;
        }

        // Close modal and refresh view
        this.closeModal('reply-modal');
        this.loadHomeView();
        this.showToast('Reply posted successfully!', 'success');
    }

    showThreadDetail(threadId) {
        const thread = getThreadById(threadId);
        const user = getUserById(thread.author);
        const replies = getRepliesByThreadId(threadId);
        const content = document.getElementById('thread-detail-content');
        const formattedContent = formatTextWithLinks(thread.content);

        let repliesHtml = '';
        if (replies.length > 0) {
            repliesHtml = `
                <div class="replies-section">
                    <h4>Replies</h4>
                    ${replies.map(reply => {
                        const replyUser = getUserById(reply.author);
                        const replyContent = formatTextWithLinks(reply.content);
                        return `
                            <div class="reply-item">
                                <div class="reply-avatar">
                                    <img src="${replyUser.avatar}" alt="${replyUser.username}">
                                </div>
                                <div class="reply-content">
                                    <div class="reply-header">
                                        <span class="reply-username">${replyUser.username}</span>
                                        <span class="reply-handle">${replyUser.handle}</span>
                                        <span class="reply-time">${formatTimeAgo(reply.timestamp)}</span>
                                    </div>
                                    <div class="reply-text">${replyContent}</div>
                                    <div class="reply-actions">
                                        <div class="reply-action ${reply.isLiked ? 'liked' : ''}" onclick="app.toggleReplyLike('${reply.id}')">
                                            <i class="fas fa-heart"></i>
                                            <span>${reply.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        content.innerHTML = `
            <div class="thread-detail">
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
                        <div class="thread-text">${formattedContent}</div>
                        ${thread.image ? `<div class="thread-image"><img src="${thread.image}" alt="Thread image"></div>` : ''}
                        <div class="thread-actions">
                            <div class="thread-action ${thread.isLiked ? 'liked' : ''}" onclick="app.toggleLike(getThreadById('${thread.id}'), this)">
                                <i class="fas fa-heart"></i>
                                <span>${thread.likes}</span>
                            </div>
                            <div class="thread-action" onclick="app.showReplyModal(getThreadById('${thread.id}'))">
                                <i class="fas fa-comment"></i>
                                <span>${thread.replies}</span>
                            </div>
                            <div class="thread-action ${thread.isReposted ? 'reposted' : ''}" onclick="app.toggleRepost(getThreadById('${thread.id}'), this)">
                                <i class="fas fa-retweet"></i>
                                <span>${thread.reposts}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${repliesHtml}
        `;

        this.showModal('thread-modal');
    }

    showSettingsModal() {
        this.loadSettingsData();
        this.showModal('settings-modal');
    }

    switchSettingsTab(tabName) {
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.settings-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${tabName}-settings`).style.display = 'block';
    }

    switchActivityTab(tabName) {
        document.querySelectorAll('.activity-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        this.loadActivityView(tabName);
    }

    loadSettingsData() {
        document.getElementById('settings-username').value = this.currentUser.username;
        document.getElementById('settings-display-name').value = this.currentUser.username;
        document.getElementById('settings-bio').value = this.currentUser.bio || '';
    }

    saveSettings() {
        const username = document.getElementById('settings-username').value;
        const displayName = document.getElementById('settings-display-name').value;
        const bio = document.getElementById('settings-bio').value;
        const location = document.getElementById('settings-location').value;
        const website = document.getElementById('settings-website').value;
        const theme = document.getElementById('theme-select').value;
        const fontSize = document.getElementById('font-size-select').value;

        // Update current user data
        this.currentUser.username = username;
        this.currentUser.bio = bio;
        this.currentUser.location = location;
        this.currentUser.website = website;

        // Apply theme settings
        this.applyTheme(theme);
        this.applyFontSize(fontSize);

        this.updateUserProfile();
        this.closeModal('settings-modal');
        this.showToast('Settings saved successfully!', 'success');
    }

    applyTheme(theme) {
        document.body.className = theme === 'light' ? 'light-theme' : '';
    }

    applyFontSize(size) {
        document.body.className += ` font-${size}`;
    }

    // Character count functionality
    updateCharacterCount() {
        const textarea = document.getElementById('thread-text');
        const charCount = document.getElementById('char-count');
        const length = textarea.value.length;

        charCount.textContent = `${length}/500`;
        charCount.className = 'char-count';

        if (length > 450) {
            charCount.classList.add('warning');
        }
        if (length > 500) {
            charCount.classList.add('error');
        }

        // Disable post button if over limit
        const postBtn = document.getElementById('post-thread');
        postBtn.disabled = length > 500;
    }

    updateReplyCharacterCount() {
        const textarea = document.getElementById('reply-text');
        const charCount = document.getElementById('reply-char-count');
        const length = textarea.value.length;

        charCount.textContent = `${length}/500`;
        charCount.className = 'char-count';

        if (length > 450) {
            charCount.classList.add('warning');
        }
        if (length > 500) {
            charCount.classList.add('error');
        }

        const postBtn = document.getElementById('post-reply');
        postBtn.disabled = length > 500;
    }

    // Image handling
    setupImageHandlers() {
        const imageInput = document.getElementById('image-input');
        const addImageBtn = document.getElementById('add-image');
        const removeImageBtn = document.getElementById('remove-image');

        addImageBtn.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        removeImageBtn.addEventListener('click', () => {
            this.clearImagePreview();
        });

        // Reply image handlers
        const replyImageInput = document.getElementById('reply-image-input');
        const addReplyImageBtn = document.getElementById('add-reply-image');
        const removeReplyImageBtn = document.getElementById('remove-reply-image');

        addReplyImageBtn.addEventListener('click', () => {
            replyImageInput.click();
        });

        replyImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleReplyImageUpload(file);
            }
        });

        removeReplyImageBtn.addEventListener('click', () => {
            this.clearReplyImagePreview();
        });
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showToast('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewDiv = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-image');

            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    handleReplyImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showToast('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewDiv = document.getElementById('reply-image-preview');
            const previewImg = document.getElementById('reply-preview-image');

            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    clearImagePreview() {
        const previewDiv = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-image');
        const imageInput = document.getElementById('image-input');

        previewDiv.style.display = 'none';
        previewImg.src = '';
        imageInput.value = '';
    }

    clearReplyImagePreview() {
        const previewDiv = document.getElementById('reply-image-preview');
        const previewImg = document.getElementById('reply-preview-image');
        const imageInput = document.getElementById('reply-image-input');

        previewDiv.style.display = 'none';
        previewImg.src = '';
        imageInput.value = '';
    }

    // Emoji functionality
    setupEmojiHandlers() {
        document.getElementById('add-emoji').addEventListener('click', () => {
            this.showEmojiPicker();
        });

        document.getElementById('add-reply-emoji').addEventListener('click', () => {
            this.showEmojiPicker(true);
        });

        document.getElementById('close-emoji-picker').addEventListener('click', () => {
            this.closeModal('emoji-picker-modal');
        });
    }

    showEmojiPicker(isReply = false) {
        const emojiGrid = document.getElementById('emoji-grid');
        const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

        emojiGrid.innerHTML = emojis.map(emoji =>
            `<span class="emoji-item" onclick="app.insertEmoji('${emoji}', ${isReply})">${emoji}</span>`
        ).join('');

        this.showModal('emoji-picker-modal');
    }

    insertEmoji(emoji, isReply = false) {
        const textarea = isReply ? document.getElementById('reply-text') : document.getElementById('thread-text');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        textarea.value = text.substring(0, start) + emoji + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);

        if (isReply) {
            this.updateReplyCharacterCount();
        } else {
            this.updateCharacterCount();
        }

        this.closeModal('emoji-picker-modal');
    }

    // Bookmark functionality
    handleBookmark(actionElement) {
        const threadId = actionElement.dataset.thread;
        const isBookmarked = toggleBookmark(threadId);

        actionElement.classList.toggle('bookmarked', isBookmarked);

        const message = isBookmarked ? 'Thread bookmarked!' : 'Bookmark removed!';
        this.showToast(message, 'success');
    }

    // Load bookmarks view
    loadBookmarksView() {
        const bookmarksFeed = document.getElementById('bookmarks-feed');
        const bookmarkedThreads = this.threads.filter(thread => isBookmarked(thread.id));

        if (bookmarkedThreads.length === 0) {
            bookmarksFeed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>No bookmarks yet</h3>
                    <p>Save threads you want to read later</p>
                </div>
            `;
            return;
        }

        bookmarksFeed.innerHTML = '';
        bookmarkedThreads.forEach(thread => {
            const threadElement = this.createThreadElement(thread);
            bookmarksFeed.appendChild(threadElement);
        });
    }

    // Trending topics
    loadTrendingTopics() {
        const trendingContainer = document.getElementById('trending-topics');
        const topics = getTrendingTopics();

        trendingContainer.innerHTML = topics.map(topic => `
            <div class="trending-item" onclick="app.searchTopic('${topic.tag}')">
                <div class="trending-info">
                    <span class="trending-tag">${topic.tag}</span>
                    <span class="trending-count">${topic.count} threads</span>
                </div>
            </div>
        `).join('');
    }

    searchTopic(tag) {
        document.getElementById('search-input').value = tag;
        this.switchView('search');
        this.handleSearch(tag);
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Loading state
    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    toggleReplyLike(replyId) {
        const reply = mockData.replies.find(r => r.id === replyId);
        if (reply) {
            reply.isLiked = !reply.isLiked;
            reply.likes += reply.isLiked ? 1 : -1;
            // Refresh the current view to update the UI
            this.showThreadDetail(reply.threadId);
        }
    }
}

// Global app instance
let app;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new ThreadsApp();
});

// Global helper functions for inline event handlers
function showImageViewer(imageSrc) {
    const modal = document.getElementById('image-viewer-modal');
    const image = document.getElementById('viewer-image');
    image.src = imageSrc;
    app.showModal('image-viewer-modal');
}

