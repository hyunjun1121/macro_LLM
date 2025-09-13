// Error Handler Class
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    logError(type, error) {
        const errorInfo = {
            type,
            message: error?.message || error,
            stack: error?.stack,
            timestamp: new Date().toISOString()
        };

        this.errors.push(errorInfo);
        console.error(`${type}:`, errorInfo);

        if (this.errors.length > 50) {
            this.errors = this.errors.slice(-25);
        }
    }

    handleApiError(operation, error) {
        const message = `Failed to ${operation}. Please try again.`;
        this.showErrorMessage(message);
        this.logError(`API Error - ${operation}`, error);
    }

    showErrorMessage(message) {
        const existingError = document.querySelector('.error-toast');
        if (existingError) {
            existingError.remove();
        }

        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${this.escapeHtml(message)}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="error-close">&times;</button>
            </div>
        `;

        document.body.appendChild(errorToast);

        setTimeout(() => {
            if (document.body.contains(errorToast)) {
                errorToast.remove();
            }
        }, 5000);
    }

    showSuccessMessage(message) {
        const successToast = document.createElement('div');
        successToast.className = 'success-toast';
        successToast.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>${this.escapeHtml(message)}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="success-close">&times;</button>
            </div>
        `;

        document.body.appendChild(successToast);

        setTimeout(() => {
            if (document.body.contains(successToast)) {
                successToast.remove();
            }
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
}

// Input Validator Class
class InputValidator {
    constructor() {
        this.patterns = {
            username: /^[a-zA-Z0-9._]{1,30}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            hashtag: /^#[a-zA-Z0-9_]+$/
        };
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { isValid: false, message: 'Username is required' };
        }

        if (username.length < 1 || username.length > 30) {
            return { isValid: false, message: 'Username must be 1-30 characters long' };
        }

        if (!this.patterns.username.test(username)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, periods, and underscores' };
        }

        return { isValid: true };
    }

    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, message: 'Email is required' };
        }

        if (!this.patterns.email.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        return { isValid: true };
    }

    validatePostCaption(caption) {
        if (!caption || typeof caption !== 'string') {
            return { isValid: true }; // Caption is optional
        }

        if (caption.length > 2200) {
            return { isValid: false, message: 'Caption is too long (max 2200 characters)' };
        }

        return { isValid: true };
    }

    validateMessage(message) {
        if (!message || typeof message !== 'string') {
            return { isValid: false, message: 'Message cannot be empty' };
        }

        if (message.trim().length === 0) {
            return { isValid: false, message: 'Message cannot be empty' };
        }

        if (message.length > 1000) {
            return { isValid: false, message: 'Message is too long (max 1000 characters)' };
        }

        return { isValid: true };
    }

    validateFileUpload(file) {
        if (!file) {
            return { isValid: false, message: 'Please select a file' };
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, message: 'File type not supported. Please upload an image or video.' };
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return { isValid: false, message: 'File is too large. Maximum size is 50MB.' };
        }

        return { isValid: true };
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .trim();
    }
}

// Complete Instagram Clone - Full Functionality
class InstagramApp {
    constructor() {
        this.storageKeys = {
            USER_DATA: 'ig_user_data',
            POSTS: 'ig_posts',
            CONVERSATIONS: 'ig_conversations',
            SEARCH_HISTORY: 'ig_search_history',
            NOTIFICATIONS: 'ig_notifications',
            SETTINGS: 'ig_settings'
        };

        this.errorHandler = new ErrorHandler();
        this.inputValidator = new InputValidator();

        this.currentUser = this.loadUserData() || {
            username: 'my_username',
            fullName: 'My Full Name',
            avatar: 'https://via.placeholder.com/150',
            posts: 42,
            followers: 1234,
            following: 567,
            bio: 'This is my bio description.',
            website: 'www.mywebsite.com',
            isPrivate: false,
            notifications: true
        };

        this.currentPostId = null;
        this.currentChatUser = null;
        
        this.mockData = {
            users: [
                { username: 'jun', fullName: 'Jun Kim', avatar: 'https://via.placeholder.com/44', isFollowing: true },
                { username: 'emma_davis', fullName: 'Emma Davis', avatar: 'https://via.placeholder.com/44', isFollowing: false },
                { username: 'john_doe', fullName: 'John Doe', avatar: 'https://via.placeholder.com/44', isFollowing: true },
                { username: 'sarah_wilson', fullName: 'Sarah Wilson', avatar: 'https://via.placeholder.com/44', isFollowing: false },
                { username: 'mike_jones', fullName: 'Mike Jones', avatar: 'https://via.placeholder.com/44', isFollowing: true },
                { username: 'alex_smith', fullName: 'Alex Smith', avatar: 'https://via.placeholder.com/44', isFollowing: false },
                { username: 'lisa_brown', fullName: 'Lisa Brown', avatar: 'https://via.placeholder.com/44', isFollowing: true },
                { username: 'david_wilson', fullName: 'David Wilson', avatar: 'https://via.placeholder.com/44', isFollowing: false },
                { username: 'anna_garcia', fullName: 'Anna Garcia', avatar: 'https://via.placeholder.com/44', isFollowing: true }
            ],
            posts: [
                {
                    id: 1,
                    username: 'jun',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x600',
                    likes: 487,
                    caption: 'Working on some new code today 💻 #coding #developer #tech #javascript #webdevelopment',
                    comments: [
                        { username: 'emma_davis', text: 'Looking good! What are you building?', time: '1h', likes: 8 },
                        { username: 'john_doe', text: 'Clean setup! 🔥', time: '45m', likes: 12 },
                        { username: 'alex_smith', text: 'Which IDE is that?', time: '30m', likes: 3 },
                        { username: 'mike_jones', text: 'Love the minimalist workspace', time: '15m', likes: 5 }
                    ],
                    timeAgo: '1 HOUR AGO',
                    liked: false,
                    bookmarked: false
                },
                {
                    id: 2,
                    username: 'jun',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x400',
                    likes: 623,
                    caption: 'Just finished my morning workout! 💪 Starting the day right. #fitness #morning #motivation #health #workout',
                    comments: [
                        { username: 'sarah_wilson', text: 'Inspiring! Keep it up 💪', time: '3h', likes: 15 },
                        { username: 'lisa_brown', text: 'What\'s your routine?', time: '2h', likes: 7 },
                        { username: 'david_wilson', text: 'Great dedication!', time: '1h', likes: 4 }
                    ],
                    timeAgo: '3 HOURS AGO',
                    liked: false,
                    bookmarked: false
                },
                {
                    id: 3,
                    username: 'emma_davis',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x600',
                    likes: 234,
                    caption: 'Beautiful sunset today! #nature #sunset #photography',
                    comments: [
                        { username: 'john_doe', text: 'Amazing shot! 📸', time: '2h', likes: 5 },
                        { username: 'sarah_wilson', text: 'So beautiful! Where is this?', time: '1h', likes: 2 },
                        { username: 'mike_jones', text: 'Perfect timing 🌅', time: '30m', likes: 3 }
                    ],
                    timeAgo: '2 HOURS AGO',
                    liked: false,
                    bookmarked: false
                },
                {
                    id: 4,
                    username: 'jun',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x500',
                    likes: 291,
                    caption: 'Late night coding session 🌙 Building something amazing! #coding #nightowl #javascript #webdev #programming',
                    comments: [
                        { username: 'anna_garcia', text: 'Dedication! 👨‍💻', time: '5h', likes: 9 },
                        { username: 'john_doe', text: 'What are you working on?', time: '4h', likes: 6 },
                        { username: 'emma_davis', text: 'Get some sleep too! 😄', time: '3h', likes: 11 }
                    ],
                    timeAgo: '5 HOURS AGO',
                    liked: false,
                    bookmarked: false
                },
                {
                    id: 5,
                    username: 'john_doe',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x400',
                    likes: 156,
                    caption: 'Great workout session! 💪 #fitness #gym #motivation #health',
                    comments: [
                        { username: 'emma_davis', text: 'Keep it up! 💪', time: '3h', likes: 8 },
                        { username: 'alex_smith', text: 'Inspiring! What routine are you following?', time: '2h', likes: 1 }
                    ],
                    timeAgo: '4 HOURS AGO',
                    liked: false,
                    bookmarked: false
                },
                {
                    id: 6,
                    username: 'sarah_wilson',
                    avatar: 'https://via.placeholder.com/32',
                    image: 'https://via.placeholder.com/600x500',
                    likes: 89,
                    caption: 'Delicious coffee ☕ Perfect start to the day! #coffee #morning #cafe #lifestyle',
                    comments: [
                        { username: 'lisa_brown', text: 'That looks delicious!', time: '1h', likes: 4 }
                    ],
                    timeAgo: '6 HOURS AGO',
                    liked: false,
                    bookmarked: false
                }
            ],
            notifications: [
                {
                    type: 'comment',
                    user: 'jun',
                    avatar: 'https://via.placeholder.com/44',
                    post: 'https://via.placeholder.com/44',
                    time: '30m',
                    text: 'commented: "Great work! 🔥"'
                },
                {
                    type: 'like',
                    user: 'jun',
                    avatar: 'https://via.placeholder.com/44',
                    post: 'https://via.placeholder.com/44',
                    time: '1h',
                    text: 'liked your photo.'
                },
                {
                    type: 'like',
                    user: 'sarah_wilson',
                    avatar: 'https://via.placeholder.com/44',
                    post: 'https://via.placeholder.com/44',
                    time: '2h',
                    text: 'liked your photo.'
                },
                {
                    type: 'follow',
                    user: 'mike_jones',
                    avatar: 'https://via.placeholder.com/44',
                    time: '5h',
                    text: 'started following you.'
                },
                {
                    type: 'comment',
                    user: 'emma_davis',
                    avatar: 'https://via.placeholder.com/44',
                    post: 'https://via.placeholder.com/44',
                    time: '1d',
                    text: 'commented: "Amazing shot! 📸"'
                }
            ],
            conversations: {
                'jun': {
                    avatar: 'https://via.placeholder.com/56',
                    messages: [
                        { text: 'Hey! Saw your latest coding post 🔥', time: '30m', own: false },
                        { text: 'Thanks! Been working on a new project', time: '25m', own: true },
                        { text: 'What kind of project? Looks interesting!', time: '20m', own: false },
                        { text: 'It\'s an Instagram clone actually 😄', time: '15m', own: true },
                        { text: 'No way! That\'s so cool! Can I see it when it\'s done?', time: '10m', own: false },
                        { text: 'Absolutely! I\'ll share the link soon', time: '5m', own: true }
                    ]
                },
                'emma_davis': {
                    avatar: 'https://via.placeholder.com/56',
                    messages: [
                        { text: 'Hey! How are you?', time: '2h', own: false },
                        { text: 'I\'m good! Just posted a new photo', time: '2h', own: true },
                        { text: 'Saw it! Amazing sunset 🌅', time: '1h', own: false },
                        { text: 'Thanks! The lighting was perfect', time: '1h', own: true }
                    ]
                },
                'alex_smith': {
                    avatar: 'https://via.placeholder.com/56',
                    messages: [
                        { text: 'Thanks for the follow!', time: '1d', own: false },
                        { text: 'No problem! Love your content', time: '1d', own: true },
                        { text: 'Appreciate it! 🙏', time: '1d', own: false }
                    ]
                }
            },
            exploreItems: [
                { image: 'https://via.placeholder.com/300x200', likes: 156, comments: 12, username: 'explore_user1' },
                { image: 'https://via.placeholder.com/300x400', likes: 89, comments: 5, username: 'explore_user2' },
                { image: 'https://via.placeholder.com/300x300', likes: 234, comments: 18, username: 'explore_user3' },
                { image: 'https://via.placeholder.com/300x350', likes: 67, comments: 3, username: 'explore_user4' },
                { image: 'https://via.placeholder.com/300x250', likes: 123, comments: 9, username: 'explore_user5' },
                { image: 'https://via.placeholder.com/300x320', likes: 45, comments: 2, username: 'explore_user6' }
            ],
            highlights: [
                { id: 1, title: 'Travel', cover: 'https://via.placeholder.com/77', stories: ['story1', 'story2', 'story3'] },
                { id: 2, title: 'Food', cover: 'https://via.placeholder.com/77', stories: ['story4', 'story5'] },
                { id: 3, title: 'Work', cover: 'https://via.placeholder.com/77', stories: ['story6', 'story7', 'story8'] }
            ],
            savedPosts: [],
            archivedPosts: [],
            closeFriends: ['jun', 'emma_davis', 'john_doe'],
            hashtags: ['#coding', '#developer', '#tech', '#javascript', '#webdevelopment', '#programming', '#nightowl', '#webdev', '#nature', '#sunset', '#photography', '#fitness', '#gym', '#motivation', '#health', '#coffee', '#morning', '#cafe', '#lifestyle']
        };
        
        this.searchHistory = this.loadSearchHistory() || ['jun', 'john_doe', 'emma_davis', '#coding', '#javascript', '#nature', '#coffee'];
        this.loadStoredData();
        this.init();
    }

    // Data Persistence Methods
    saveUserData() {
        try {
            localStorage.setItem(this.storageKeys.USER_DATA, JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    loadUserData() {
        try {
            const data = localStorage.getItem(this.storageKeys.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return null;
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem(this.storageKeys.SEARCH_HISTORY, JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    loadSearchHistory() {
        try {
            const data = localStorage.getItem(this.storageKeys.SEARCH_HISTORY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load search history:', error);
            return null;
        }
    }

    saveConversations() {
        try {
            localStorage.setItem(this.storageKeys.CONVERSATIONS, JSON.stringify(this.mockData.conversations));
        } catch (error) {
            console.error('Failed to save conversations:', error);
        }
    }

    loadConversations() {
        try {
            const data = localStorage.getItem(this.storageKeys.CONVERSATIONS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load conversations:', error);
            return null;
        }
    }

    savePosts() {
        try {
            localStorage.setItem(this.storageKeys.POSTS, JSON.stringify(this.mockData.posts));
        } catch (error) {
            console.error('Failed to save posts:', error);
        }
    }

    loadPosts() {
        try {
            const data = localStorage.getItem(this.storageKeys.POSTS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load posts:', error);
            return null;
        }
    }

    loadStoredData() {
        const storedConversations = this.loadConversations();
        if (storedConversations) {
            this.mockData.conversations = storedConversations;
        }

        const storedPosts = this.loadPosts();
        if (storedPosts) {
            this.mockData.posts = storedPosts;
        }
    }

    init() {
        this.setupEventListeners();
        this.loadMorePosts();
        this.setupInfiniteScroll();
        this.setupKeyboardShortcuts();
        this.setupImageLazyLoading();
        this.setupPerformanceOptimizations();
        console.log('Instagram clone fully initialized!');
    }

    setupEventListeners() {
        this.setupNavigation();
        this.setupSearch();
        this.setupPostInteractions();
        this.setupModals();
        this.setupStoryInteractions();
        this.setupSidebarInteractions();
        this.setupCommentSystem();
        this.setupChatSystem();
        this.setupStoryCreation();
        this.setupSettingsModal();
        this.setupProfileEditButtons();
    }

    setupNavigation() {
        // Home button
        document.querySelector('.home-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveNavItem(e.currentTarget);
            this.showHomeFeed();
        });

        // Messages button
        document.querySelector('.messages-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveNavItem(e.currentTarget);
            this.showModal('messagesModal');
            this.loadMessages();
        });

        // Create button
        document.querySelector('.create-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('createPostModal');
        });

        // Explore button
        document.querySelector('.explore-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveNavItem(e.currentTarget);
            this.showModal('exploreModal');
            this.loadExploreContent();
        });

        // Notifications button
        document.querySelector('.notifications-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('notificationsModal');
            this.loadNotifications();
        });

        // Profile button
        document.querySelector('.profile-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveNavItem(e.currentTarget);
            this.showModal('profileModal');
            this.loadProfile();
        });
    }

    setActiveNavItem(clickedItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        clickedItem.classList.add('active');
    }

    setupSearch() {
        const mainSearchInput = document.getElementById('mainSearchInput');
        const searchInput = document.getElementById('searchInput');

        mainSearchInput.addEventListener('click', () => {
            this.showModal('searchModal');
            setTimeout(() => {
                searchInput.focus();
                this.showRecentSearches();
            }, 100);
        });

        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addToSearchHistory(e.target.value.trim());
            }
        });

        document.querySelector('#searchModal .close-modal').addEventListener('click', () => {
            this.hideModal('searchModal');
        });
    }

    performSearch(query) {
        const resultsContainer = document.querySelector('.search-results');
        
        if (!query.trim()) {
            this.showRecentSearches();
            return;
        }

        // Search users and hashtags
        const filteredUsers = this.mockData.users.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.fullName.toLowerCase().includes(query.toLowerCase())
        );

        const filteredHashtags = this.mockData.hashtags.filter(tag =>
            tag.toLowerCase().includes(query.toLowerCase())
        );

        let resultsHTML = '';
        
        if (filteredUsers.length > 0) {
            resultsHTML += '<div class="search-suggestions"><h3>Users</h3>';
            filteredUsers.forEach(user => {
                resultsHTML += `
                    <div class="search-item" onclick="instagramApp.viewProfile('${user.username}')">
                        <img src="${user.avatar}" alt="Profile">
                        <div class="search-item-info">
                            <span class="username">${user.username}</span>
                            <span class="fullname">${user.fullName}</span>
                        </div>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }

        if (filteredHashtags.length > 0) {
            resultsHTML += '<div class="search-suggestions"><h3>Hashtags</h3>';
            filteredHashtags.forEach(tag => {
                resultsHTML += `
                    <div class="search-item" onclick="instagramApp.searchHashtag('${tag}')">
                        <div style="width: 44px; height: 44px; background: #f1f1f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <i class="fas fa-hashtag" style="color: #262626;"></i>
                        </div>
                        <div class="search-item-info">
                            <span class="username">${tag}</span>
                            <span class="fullname">Hashtag</span>
                        </div>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }
        
        if (filteredUsers.length === 0 && filteredHashtags.length === 0) {
            resultsHTML = '<p style="padding: 20px; color: #8e8e8e; text-align: center;">No results found</p>';
        }
        
        resultsContainer.innerHTML = resultsHTML;
    }

    showRecentSearches() {
        const resultsContainer = document.querySelector('.search-results');
        let html = '<div class="recent-searches"><h3>Recent</h3>';
        
        this.searchHistory.forEach(term => {
            const isHashtag = term.startsWith('#');
            html += `
                <div class="search-item" onclick="instagramApp.searchFromHistory('${term}')">
                    ${isHashtag ? 
                        '<div style="width: 44px; height: 44px; background: #f1f1f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;"><i class="fas fa-hashtag" style="color: #262626;"></i></div>' :
                        '<img src="https://via.placeholder.com/44" alt="Profile">'
                    }
                    <div class="search-item-info">
                        <span class="username">${term}</span>
                        <span class="fullname">Recent search</span>
                    </div>
                    <button class="remove-search" onclick="instagramApp.removeFromHistory('${term}', event)">&times;</button>
                </div>
            `;
        });
        
        html += '</div>';
        resultsContainer.innerHTML = html;
    }

    searchFromHistory(term) {
        document.getElementById('searchInput').value = term;
        this.performSearch(term);
    }

    addToSearchHistory(term) {
        if (!this.searchHistory.includes(term)) {
            this.searchHistory.unshift(term);
            if (this.searchHistory.length > 10) {
                this.searchHistory = this.searchHistory.slice(0, 10);
            }
            this.saveSearchHistory();
        }
    }

    removeFromHistory(term, event) {
        event.stopPropagation();
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        this.saveSearchHistory();
        this.showRecentSearches();
    }

    searchHashtag(hashtag) {
        this.hideModal('searchModal');
        this.addToSearchHistory(hashtag);
        alert(`Searching posts with ${hashtag} 🔍`);
    }

    setupPostInteractions() {
        document.addEventListener('click', (e) => {
            // Like button
            if (e.target.closest('.like-btn')) {
                this.toggleLike(e.target.closest('.like-btn'));
            }
            
            // Bookmark button
            if (e.target.closest('.bookmark-btn')) {
                this.toggleBookmark(e.target.closest('.bookmark-btn'));
            }
            
            // Post options
            if (e.target.closest('.post-options')) {
                this.showPostOptions(e.target.closest('.post-options'));
            }
            
            // View comments
            if (e.target.closest('.view-comments')) {
                this.showComments(e.target.closest('.post'));
            }

            // Comment button
            if (e.target.closest('.action-btn') && e.target.closest('.action-btn').querySelector('.fa-comment')) {
                this.showComments(e.target.closest('.post'));
            }

            // Share button
            if (e.target.closest('.action-btn') && e.target.closest('.action-btn').querySelector('.fa-paper-plane')) {
                this.sharePost(e.target.closest('.post'));
            }
        });

        // Double tap to like
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.post-image img')) {
                const post = e.target.closest('.post');
                const likeBtn = post.querySelector('.like-btn');
                this.toggleLike(likeBtn, true);
                this.showHeartAnimation(e.target);
            }
        });
    }

    toggleLike(likeBtn, forceAdd = false) {
        const heartIcon = likeBtn.querySelector('i');
        const post = likeBtn.closest('.post');
        const likesElement = post.querySelector('.post-likes');
        const currentLikes = parseInt(likesElement.textContent.match(/\d+/)[0]);

        if (heartIcon.classList.contains('far') || forceAdd) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            likeBtn.classList.add('liked');
            likesElement.textContent = `${(currentLikes + 1).toLocaleString()} likes`;
            
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 150);
        } else if (!forceAdd) {
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            likeBtn.classList.remove('liked');
            likesElement.textContent = `${(currentLikes - 1).toLocaleString()} likes`;
        }
    }

    toggleBookmark(bookmarkBtn) {
        const bookmarkIcon = bookmarkBtn.querySelector('i');
        
        if (bookmarkIcon.classList.contains('far')) {
            bookmarkIcon.classList.remove('far');
            bookmarkIcon.classList.add('fas');
            bookmarkBtn.classList.add('bookmarked');
        } else {
            bookmarkIcon.classList.remove('fas');
            bookmarkIcon.classList.add('far');
            bookmarkBtn.classList.remove('bookmarked');
        }
        
        bookmarkBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            bookmarkBtn.style.transform = 'scale(1)';
        }, 150);
    }

    showPostOptions(optionsBtn) {
        const post = optionsBtn.closest('.post');
        const postId = this.getPostId(post);
        
        const options = [
            { text: 'Report', action: () => alert('Post reported') },
            { text: 'Unfollow', action: () => alert('Unfollowed user') },
            { text: 'Copy Link', action: () => { navigator.clipboard.writeText(`https://instagram.com/p/${postId}`); alert('Link copied!'); }},
            { text: 'Cancel', action: () => {} }
        ];

        this.showActionSheet(options);
    }

    sharePost(post) {
        const postId = this.getPostId(post);
        const username = post.querySelector('.post-username').textContent;
        
        if (navigator.share) {
            navigator.share({
                title: `${username}'s post`,
                text: 'Check out this post on Instagram',
                url: `https://instagram.com/p/${postId}`
            });
        } else {
            navigator.clipboard.writeText(`https://instagram.com/p/${postId}`);
            alert('Link copied to clipboard!');
        }
    }

    showActionSheet(options) {
        const overlay = document.createElement('div');
        overlay.className = 'action-sheet-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 3000;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        `;

        const actionSheet = document.createElement('div');
        actionSheet.className = 'action-sheet';
        actionSheet.style.cssText = `
            background: white;
            border-radius: 12px 12px 0 0;
            width: 100%;
            max-width: 500px;
            margin: 20px;
            animation: slideUp 0.3s ease;
        `;

        let optionsHTML = '';
        options.forEach((option, index) => {
            optionsHTML += `
                <div class="action-sheet-option" data-index="${index}" style="padding: 16px; text-align: center; border-bottom: 1px solid #f1f1f1; cursor: pointer; font-size: 16px;">
                    ${option.text}
                </div>
            `;
        });

        actionSheet.innerHTML = optionsHTML;

        actionSheet.addEventListener('click', (e) => {
            const option = e.target.closest('.action-sheet-option');
            if (option) {
                const index = parseInt(option.dataset.index);
                options[index].action();
                overlay.remove();
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        overlay.appendChild(actionSheet);
        document.body.appendChild(overlay);
    }

    getPostId(post) {
        const username = post.querySelector('.post-username').textContent;
        const timestamp = Date.now();
        return `${username}_${timestamp}`;
    }

    showHeartAnimation(element) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: absolute;
            font-size: 60px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: none;
            z-index: 1000;
            animation: heartPop 0.8s ease-out;
        `;
        
        const container = element.parentElement;
        container.style.position = 'relative';
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 800);
    }

    setupCommentSystem() {
        // Use setTimeout to ensure modals are in DOM
        setTimeout(() => {
            const commentInput = document.getElementById('commentInput');
            const postBtn = document.getElementById('postCommentBtn');

            if (commentInput && postBtn) {
                // Initially disable post button
                postBtn.disabled = true;
                
                commentInput.addEventListener('input', () => {
                    postBtn.disabled = !commentInput.value.trim();
                });

                commentInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && commentInput.value.trim()) {
                        this.addComment();
                    }
                });
            }
        }, 100);
    }

    showComments(post) {
        const postId = this.getPostDataFromElement(post);
        this.currentPostId = postId.id;
        
        // Set post preview info
        document.getElementById('commentPostImage').src = postId.image;
        document.getElementById('commentPostAvatar').src = postId.avatar;
        document.getElementById('commentPostUsername').textContent = postId.username;
        document.getElementById('commentPostCaption').textContent = postId.caption;
        
        this.loadComments(postId.id);
        this.showModal('commentsModal');
    }

    getPostDataFromElement(postElement) {
        return {
            id: parseInt(postElement.dataset.postId || Date.now()),
            username: postElement.querySelector('.post-username').textContent,
            avatar: postElement.querySelector('.post-profile-img').src,
            image: postElement.querySelector('.post-image img').src,
            caption: postElement.querySelector('.caption-text').textContent
        };
    }

    loadComments(postId) {
        const post = this.mockData.posts.find(p => p.id === postId) || this.mockData.posts[0];
        const commentsList = document.getElementById('commentsList');
        
        let html = '';
        post.comments.forEach(comment => {
            html += `
                <div class="comment-item">
                    <img src="https://via.placeholder.com/32" alt="Profile" class="comment-avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-username">${comment.username}</span>
                            <span class="comment-time">${comment.time}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-actions">
                            <span class="comment-action" onclick="instagramApp.likeComment(this)">Like</span>
                            <span class="comment-action" onclick="instagramApp.replyToComment('${comment.username}')">Reply</span>
                            <span class="comment-likes">${comment.likes} likes</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        commentsList.innerHTML = html;
    }

    addComment() {
        const commentInput = document.getElementById('commentInput');
        const commentText = commentInput.value.trim();

        const validation = this.inputValidator.validateMessage(commentText);
        if (!validation.isValid) {
            this.errorHandler.showErrorMessage(validation.message);
            return;
        }

        const sanitizedComment = this.inputValidator.sanitizeInput(commentText);
        
        const commentsList = document.getElementById('commentsList');
        const newComment = document.createElement('div');
        newComment.className = 'comment-item';
        newComment.innerHTML = `
            <img src="${this.currentUser.avatar}" alt="Profile" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${this.currentUser.username}</span>
                    <span class="comment-time">now</span>
                </div>
                <div class="comment-text">${sanitizedComment}</div>
                <div class="comment-actions">
                    <span class="comment-action" onclick="instagramApp.likeComment(this)">Like</span>
                    <span class="comment-action" onclick="instagramApp.replyToComment('${this.currentUser.username}')">Reply</span>
                    <span class="comment-likes">0 likes</span>
                </div>
            </div>
        `;
        
        commentsList.appendChild(newComment);
        commentInput.value = '';
        const postBtn = document.getElementById('postCommentBtn');
        if (postBtn) {
            postBtn.disabled = true;
        }
        
        // Scroll to new comment
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    likeComment(likeBtn) {
        const likesSpan = likeBtn.parentElement.querySelector('.comment-likes');
        const currentLikes = parseInt(likesSpan.textContent.match(/\d+/)[0]);
        
        if (likeBtn.textContent === 'Like') {
            likeBtn.textContent = 'Unlike';
            likeBtn.style.color = '#ed4956';
            likesSpan.textContent = `${currentLikes + 1} likes`;
        } else {
            likeBtn.textContent = 'Like';
            likeBtn.style.color = '#8e8e8e';
            likesSpan.textContent = `${currentLikes - 1} likes`;
        }
    }

    replyToComment(username) {
        const commentInput = document.getElementById('commentInput');
        commentInput.value = `@${username} `;
        commentInput.focus();
    }

    setupChatSystem() {
        // Use setTimeout to ensure modals are in DOM
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendMessageBtn');

            if (chatInput && sendBtn) {
                // Initially disable send button
                sendBtn.disabled = true;
                
                chatInput.addEventListener('input', () => {
                    sendBtn.disabled = !chatInput.value.trim();
                });

                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && chatInput.value.trim()) {
                        this.sendMessage();
                    }
                });
            }
        }, 100);
    }

    openChat(username) {
        this.currentChatUser = username;
        this.hideModal('messagesModal');
        this.showModal('chatModal');
        
        const user = this.mockData.users.find(u => u.username === username);
        const conversation = this.mockData.conversations[username] || { avatar: user?.avatar, messages: [] };
        
        document.getElementById('chatUserAvatar').src = conversation.avatar;
        document.getElementById('chatUsername').textContent = username;
        
        this.loadChatMessages(username);
    }

    loadChatMessages(username) {
        const messagesContainer = document.getElementById('chatMessages');
        const conversation = this.mockData.conversations[username] || { messages: [] };
        
        let html = '';
        conversation.messages.forEach(message => {
            html += `
                <div class="message-bubble ${message.own ? 'own' : ''}">
                    <div class="message-content">${message.text}</div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const messageText = chatInput.value.trim();

        if (!this.currentChatUser) return;

        const validation = this.inputValidator.validateMessage(messageText);
        if (!validation.isValid) {
            this.errorHandler.showErrorMessage(validation.message);
            return;
        }

        const sanitizedMessage = this.inputValidator.sanitizeInput(messageText);
        
        if (!this.mockData.conversations[this.currentChatUser]) {
            this.mockData.conversations[this.currentChatUser] = { 
                avatar: 'https://via.placeholder.com/56',
                messages: [] 
            };
        }
        
        this.mockData.conversations[this.currentChatUser].messages.push({
            text: sanitizedMessage,
            time: 'now',
            own: true
        });

        this.saveConversations();
        
        const messagesContainer = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.className = 'message-bubble own';
        newMessage.innerHTML = `<div class="message-content">${sanitizedMessage}</div>`;
        
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        chatInput.value = '';
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
        }
        
        // Simulate response after 2 seconds
        setTimeout(() => {
            this.simulateMessageResponse();
        }, 2000);
    }

    simulateMessageResponse() {
        if (!this.currentChatUser) return;
        
        const responses = [
            'Thanks for the message!',
            'How are you doing?',
            'Great to hear from you!',
            'I\'ll get back to you soon',
            'Sounds good!'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        this.mockData.conversations[this.currentChatUser].messages.push({
            text: randomResponse,
            time: 'now',
            own: false
        });

        this.saveConversations();
        
        const messagesContainer = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.className = 'message-bubble';
        newMessage.innerHTML = `<div class="message-content">${randomResponse}</div>`;
        
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    backToMessages() {
        this.hideModal('chatModal');
        this.showModal('messagesModal');
        this.loadMessages();
    }

    setupStoryCreation() {
        // Use setTimeout to ensure modals are in DOM
        setTimeout(() => {
            const selectStoryBtn = document.querySelector('.select-story-btn');
            const storyFileInput = document.getElementById('storyFileInput');
            
            if (selectStoryBtn && storyFileInput) {
                selectStoryBtn.addEventListener('click', () => {
                    storyFileInput.click();
                });
                
                storyFileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        this.handleStoryUpload(e.target.files[0]);
                    }
                });
            }
        }, 100);
    }

    createStory() {
        this.showModal('createStoryModal');
    }

    handleStoryUpload(file) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                alert('Story created successfully! 📸');
                this.hideModal('createStoryModal');
            };
            reader.readAsDataURL(file);
        }
    }

    setupSettingsModal() {
        // Use setTimeout to ensure modals are in DOM
        setTimeout(() => {
            const profileModal = document.getElementById('profileModal');
            if (profileModal) {
                const settingsBtn = profileModal.querySelector('.settings-btn');
                
                if (settingsBtn) {
                    settingsBtn.addEventListener('click', () => {
                        this.hideModal('profileModal');
                        this.showModal('settingsModal');
                    });
                }
            }
        }, 100);
    }

    editProfile() {
        alert('Edit Profile functionality - would open profile editing form');
    }

    changePassword() {
        alert('Change Password functionality - would open password change form');
    }

    togglePrivateAccount() {
        this.currentUser.isPrivate = !this.currentUser.isPrivate;
        document.getElementById('privateAccountToggle').checked = this.currentUser.isPrivate;
        alert(`Account is now ${this.currentUser.isPrivate ? 'private' : 'public'}`);
    }

    toggleNotifications() {
        this.currentUser.notifications = !this.currentUser.notifications;
        document.getElementById('notificationsToggle').checked = this.currentUser.notifications;
        alert(`Notifications are now ${this.currentUser.notifications ? 'enabled' : 'disabled'}`);
    }

    setupProfileEditButtons() {
        // Make stats clickable to show followers/following lists
        document.addEventListener('click', (e) => {
            if (e.target.closest('.stats span')) {
                const statText = e.target.textContent;
                if (statText.includes('followers')) {
                    this.showUserList('Followers', this.generateFollowersList());
                } else if (statText.includes('following')) {
                    this.showUserList('Following', this.generateFollowingList());
                }
            }
        });
    }

    showUserList(title, users) {
        document.getElementById('userListTitle').textContent = title;
        const container = document.getElementById('userListContent');
        
        let html = '';
        users.forEach(user => {
            html += `
                <div class="user-list-item" onclick="instagramApp.viewProfile('${user.username}')">
                    <img src="${user.avatar}" alt="Profile">
                    <div class="user-list-info">
                        <span class="username">${user.username}</span>
                        <span class="fullname">${user.fullName}</span>
                    </div>
                    <button class="user-list-action" onclick="instagramApp.toggleFollowInList(this, '${user.username}', event)">
                        ${user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
        this.showModal('userListModal');
    }

    generateFollowersList() {
        return this.mockData.users.slice(0, 6).map(user => ({
            ...user,
            isFollowing: Math.random() > 0.5
        }));
    }

    generateFollowingList() {
        return this.mockData.users.filter(user => user.isFollowing);
    }

    toggleFollowInList(btn, username, event) {
        event.stopPropagation();
        
        if (btn.textContent === 'Follow') {
            btn.textContent = 'Following';
            btn.style.backgroundColor = '#8e8e8e';
        } else {
            btn.textContent = 'Follow';
            btn.style.backgroundColor = '#0095f6';
        }
        
        // Update user data
        const user = this.mockData.users.find(u => u.username === username);
        if (user) {
            user.isFollowing = !user.isFollowing;
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                this.hideAllModals();
                return;
            }

            // Ctrl/Cmd + / for search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                document.getElementById('mainSearchInput').focus();
                return;
            }

            // Tab navigation management
            if (e.key === 'Tab') {
                this.manageFocusTrap(e);
            }

            // Arrow key navigation for posts
            if (!e.target.matches('input, textarea')) {
                this.handleArrowKeyNavigation(e);
            }

            // Enter/Space key for buttons
            if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('button, [role="button"]')) {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    manageFocusTrap(e) {
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            const focusableElements = openModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    handleArrowKeyNavigation(e) {
        const currentElement = document.activeElement;

        // Navigate through stories with left/right arrows
        if (currentElement.matches('.story')) {
            const stories = Array.from(document.querySelectorAll('.story'));
            const currentIndex = stories.indexOf(currentElement);

            if (e.key === 'ArrowRight' && currentIndex < stories.length - 1) {
                stories[currentIndex + 1].focus();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                stories[currentIndex - 1].focus();
                e.preventDefault();
            }
        }

        // Navigate through posts with up/down arrows
        if (currentElement.matches('.post, .post *')) {
            const posts = Array.from(document.querySelectorAll('.post'));
            const currentPost = currentElement.closest('.post');
            const currentIndex = posts.indexOf(currentPost);

            if (e.key === 'ArrowDown' && currentIndex < posts.length - 1) {
                posts[currentIndex + 1].focus();
                e.preventDefault();
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                posts[currentIndex - 1].focus();
                e.preventDefault();
            }
        }
    }

    setupModals() {
        // Use setTimeout to ensure all modals are in DOM
        setTimeout(() => {
            // Close modal buttons
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.hideAllModals();
                });
            });

            // Close modal on background click
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal.id);
                    }
                });
            });

            // Setup specific modal buttons
            this.setupModalSpecificButtons();
        }, 100);

        // Create post functionality
        this.setupCreatePost();
    }

    setupModalSpecificButtons() {
        // Back buttons in modals
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Handle back button logic based on current modal
                if (document.getElementById('chatModal').style.display === 'block') {
                    this.backToMessages();
                } else {
                    this.hideAllModals();
                }
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            const modal = btn.closest('.modal');
            if (modal && modal.id === 'createPostModal') {
                btn.addEventListener('click', () => {
                    this.publishPost();
                });
            } else if (modal && modal.id === 'createStoryModal') {
                btn.addEventListener('click', () => {
                    alert('Story shared successfully! 📸');
                    this.hideModal('createStoryModal');
                });
            }
        });
    }

    setupCreatePost() {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const selectBtn = document.querySelector('.select-computer-btn');
            const fileInput = document.getElementById('fileInput');
            
            if (selectBtn) {
                selectBtn.addEventListener('click', () => {
                    if (fileInput) {
                        fileInput.click();
                    }
                });
            }
            
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0]);
                    }
                });
            }
        }, 100);
    }

    handleFileUpload(file) {
        const validation = this.inputValidator.validateFileUpload(file);
        if (!validation.isValid) {
            this.errorHandler.showErrorMessage(validation.message);
            return;
        }

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const createPostContent = document.querySelector('.create-post-content');
                createPostContent.innerHTML = `
                    <div class="uploaded-image-preview" style="flex: 1; display: flex; align-items: center; justify-content: center;">
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 400px; object-fit: contain;">
                    </div>
                    <div class="post-caption-area" style="padding: 20px; border-left: 1px solid #dbdbdb; width: 300px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <img src="${this.currentUser.avatar}" alt="Profile" style="width: 28px; height: 28px; border-radius: 50%;">
                            <span style="font-weight: 600;">${this.currentUser.username}</span>
                        </div>
                        <textarea placeholder="Write a caption..." id="postCaption" style="width: 100%; height: 120px; border: none; outline: none; resize: vertical; font-family: inherit; font-size: 14px;"></textarea>
                        <div style="border-top: 1px solid #dbdbdb; padding-top: 16px; margin-top: 16px;">
                            <input type="text" placeholder="Add location" style="width: 100%; border: none; outline: none; padding: 8px 0; font-size: 14px;">
                        </div>
                        <button onclick="instagramApp.publishPost()" style="background: #0095f6; color: white; border: none; padding: 8px 24px; border-radius: 4px; margin-top: 16px; cursor: pointer; width: 100%; font-weight: 600;">Share</button>
                    </div>
                `;
                
                // Update modal layout
                createPostContent.style.display = 'flex';
                createPostContent.style.height = '100%';
            };
            reader.readAsDataURL(file);
        }
    }

    publishPost() {
        const caption = document.getElementById('postCaption')?.value || '';

        const validation = this.inputValidator.validatePostCaption(caption);
        if (!validation.isValid) {
            this.errorHandler.showErrorMessage(validation.message);
            return;
        }

        const sanitizedCaption = this.inputValidator.sanitizeInput(caption);

        this.errorHandler.showSuccessMessage('Post shared successfully! 📸');
        this.hideModal('createPostModal');
        
        // Add new post to feed
        const newPost = {
            id: Date.now(),
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            image: 'https://via.placeholder.com/600x600',
            likes: 0,
            caption: sanitizedCaption || 'New post!',
            comments: [],
            timeAgo: 'now',
            liked: false,
            bookmarked: false
        };
        
        this.mockData.posts.unshift(newPost);
        this.savePosts();
        this.refreshFeed();
        
        // Reset create post modal
        setTimeout(() => {
            const createPostContent = document.querySelector('.create-post-content');
            if (createPostContent) {
                createPostContent.innerHTML = `
                    <div class="image-upload-area">
                        <i class="fas fa-image"></i>
                        <p>Drag photos and videos here</p>
                        <button class="select-computer-btn">Select from computer</button>
                        <input type="file" id="fileInput" accept="image/*,video/*" style="display: none;">
                    </div>
                `;
                createPostContent.style.display = 'flex';
                createPostContent.style.flexDirection = 'column';
                createPostContent.style.alignItems = 'center';
                createPostContent.style.justifyContent = 'center';
                
                // Re-setup event listeners for new elements
                this.setupCreatePost();
            }
        }, 500);
    }

    refreshFeed() {
        const postsContainer = document.querySelector('.posts');
        postsContainer.innerHTML = '';
        
        this.mockData.posts.forEach(postData => {
            const postElement = this.createPostElement(postData);
            postsContainer.appendChild(postElement);
        });
    }

    setupStoryInteractions() {
        document.querySelectorAll('.story:not(.add-story)').forEach(story => {
            story.addEventListener('click', () => {
                const username = story.querySelector('.story-username').textContent;
                this.viewStory(username);
            });
        });
    }

    viewStory(username) {
        // Create story viewer overlay
        const storyViewer = document.createElement('div');
        storyViewer.className = 'story-viewer';
        storyViewer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        `;
        
        storyViewer.innerHTML = `
            <div class="story-content" style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
                    <img src="https://via.placeholder.com/40" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff;">
                    <span style="font-weight: 600;">${username}</span>
                    <span style="color: #ccc; font-size: 12px;">2h</span>
                </div>
                <div style="width: 300px; height: 500px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 20px auto; position: relative;">
                    <p style="font-size: 20px;">📸 Story Content</p>
                    <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; height: 2px; background: rgba(255,255,255,0.5); border-radius: 1px;">
                        <div style="height: 100%; background: white; border-radius: 1px; animation: storyProgress 5s linear;"></div>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.5); padding: 8px 16px; border-radius: 4px; margin-top: 20px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(storyViewer);
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(storyViewer)) {
                storyViewer.remove();
            }
        }, 5000);
    }

    setupSidebarInteractions() {
        // Follow buttons
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleFollow(btn);
            });
        });

        // Switch account
        const switchBtn = document.querySelector('.switch-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                alert('Account switching feature! 🔄');
            });
        }
    }

    toggleFollow(followBtn) {
        if (followBtn.textContent.trim() === 'Follow') {
            followBtn.textContent = 'Following';
            followBtn.style.backgroundColor = '#8e8e8e';
        } else {
            followBtn.textContent = 'Follow';
            followBtn.style.backgroundColor = '#0095f6';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    loadNotifications() {
        const container = document.querySelector('.notifications-content');
        let html = '';
        
        this.mockData.notifications.forEach(notification => {
            html += `
                <div class="notification-item">
                    <img src="${notification.avatar}" alt="Profile">
                    <div class="notification-info">
                        <span><strong>${notification.user}</strong> ${notification.text}</span>
                        <span class="notification-time">${notification.time}</span>
                    </div>
                    ${notification.post ? `<img src="${notification.post}" alt="Post" class="notification-post">` : ''}
                    ${notification.type === 'follow' ? '<button class="follow-back-btn" onclick="instagramApp.followBack(this)">Follow</button>' : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    followBack(btn) {
        btn.textContent = 'Following';
        btn.style.backgroundColor = '#8e8e8e';
    }

    loadMessages() {
        const container = document.querySelector('.messages-content');
        let html = '';
        
        Object.entries(this.mockData.conversations).forEach(([username, conversation]) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            html += `
                <div class="message-thread" onclick="instagramApp.openChat('${username}')">
                    <img src="${conversation.avatar}" alt="Profile">
                    <div class="message-info">
                        <span class="message-username">${username}</span>
                        <span class="last-message">${lastMessage ? lastMessage.text : 'Start a conversation'}</span>
                    </div>
                    <span class="message-time">${lastMessage ? lastMessage.time : ''}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    loadProfile() {
        // Profile is already loaded in HTML, just make it interactive
        document.querySelectorAll('.post-thumbnail').forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                alert(`Opening post ${index + 1} 📸`);
            });
        });
    }

    loadExploreContent() {
        const container = document.querySelector('.explore-grid');
        let html = '';
        
        this.mockData.exploreItems.forEach((item, index) => {
            html += `
                <div class="explore-item" onclick="instagramApp.openExplorePost(${index})">
                    <img src="${item.image}" alt="Explore">
                    <div class="explore-overlay">
                        <span><i class="fas fa-heart"></i> ${item.likes}</span>
                        <span><i class="fas fa-comment"></i> ${item.comments}</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    openExplorePost(index) {
        const item = this.mockData.exploreItems[index];
        alert(`Opening explore post by ${item.username} 🔍`);
    }

    // Archive functionality
    archivePost(postId) {
        const postIndex = this.mockData.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const post = this.mockData.posts[postIndex];
            this.mockData.archivedPosts.push({
                ...post,
                archivedAt: new Date().toISOString()
            });
            this.mockData.posts.splice(postIndex, 1);
            this.savePosts();
            this.refreshFeed();
            this.errorHandler.showSuccessMessage('Post archived successfully');
        }
    }

    unarchivePost(postId) {
        const archivedIndex = this.mockData.archivedPosts.findIndex(p => p.id === postId);
        if (archivedIndex !== -1) {
            const post = this.mockData.archivedPosts[archivedIndex];
            delete post.archivedAt;
            this.mockData.posts.unshift(post);
            this.mockData.archivedPosts.splice(archivedIndex, 1);
            this.savePosts();
            this.refreshFeed();
            this.errorHandler.showSuccessMessage('Post restored successfully');
        }
    }

    viewArchive() {
        this.showArchiveModal();
    }

    showArchiveModal() {
        const existingModal = document.getElementById('archiveModal');
        if (existingModal) {
            existingModal.remove();
        }

        const archiveModal = document.createElement('div');
        archiveModal.id = 'archiveModal';
        archiveModal.className = 'modal';
        archiveModal.style.display = 'block';
        archiveModal.innerHTML = `
            <div class="modal-content archive-modal">
                <div class="archive-header">
                    <h2>Archive</h2>
                    <button class="close-modal" onclick="instagramApp.hideModal('archiveModal')">&times;</button>
                </div>
                <div class="archive-content">
                    ${this.generateArchiveContent()}
                </div>
            </div>
        `;

        document.body.appendChild(archiveModal);
        document.body.style.overflow = 'hidden';
    }

    generateArchiveContent() {
        if (this.mockData.archivedPosts.length === 0) {
            return '<p style="text-align: center; padding: 40px; color: #8e8e8e;">No archived posts</p>';
        }

        let html = '<div class="archive-grid">';
        this.mockData.archivedPosts.forEach(post => {
            html += `
                <div class="archive-item" onclick="instagramApp.unarchivePost(${post.id})">
                    <img src="${post.image}" alt="Archived post">
                    <div class="archive-overlay">
                        <span>Tap to restore</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // Save post functionality
    savePost(postId) {
        if (!this.mockData.savedPosts.includes(postId)) {
            this.mockData.savedPosts.push(postId);
            this.errorHandler.showSuccessMessage('Post saved');
        }
    }

    unsavePost(postId) {
        const index = this.mockData.savedPosts.indexOf(postId);
        if (index !== -1) {
            this.mockData.savedPosts.splice(index, 1);
            this.errorHandler.showSuccessMessage('Post removed from saved');
        }
    }

    viewSavedPosts() {
        this.showSavedPostsModal();
    }

    showSavedPostsModal() {
        const existingModal = document.getElementById('savedPostsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const savedModal = document.createElement('div');
        savedModal.id = 'savedPostsModal';
        savedModal.className = 'modal';
        savedModal.style.display = 'block';
        savedModal.innerHTML = `
            <div class="modal-content saved-posts-modal">
                <div class="saved-posts-header">
                    <h2>Saved Posts</h2>
                    <button class="close-modal" onclick="instagramApp.hideModal('savedPostsModal')">&times;</button>
                </div>
                <div class="saved-posts-content">
                    ${this.generateSavedPostsContent()}
                </div>
            </div>
        `;

        document.body.appendChild(savedModal);
        document.body.style.overflow = 'hidden';
    }

    generateSavedPostsContent() {
        if (this.mockData.savedPosts.length === 0) {
            return '<p style="text-align: center; padding: 40px; color: #8e8e8e;">No saved posts</p>';
        }

        let html = '<div class="saved-posts-grid">';
        this.mockData.savedPosts.forEach(postId => {
            const post = this.mockData.posts.find(p => p.id === postId);
            if (post) {
                html += `
                    <div class="saved-post-item" onclick="instagramApp.showComments(document.querySelector('[data-post-id=\\"${post.id}\\"]'))">
                        <img src="${post.image}" alt="Saved post">
                        <div class="saved-post-overlay">
                            <span><i class="fas fa-heart"></i> ${post.likes}</span>
                            <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
        return html;
    }

    // Close Friends functionality
    addToCloseFriends(username) {
        if (!this.mockData.closeFriends.includes(username)) {
            this.mockData.closeFriends.push(username);
            this.errorHandler.showSuccessMessage(`Added ${username} to close friends`);
        }
    }

    removeFromCloseFriends(username) {
        const index = this.mockData.closeFriends.indexOf(username);
        if (index !== -1) {
            this.mockData.closeFriends.splice(index, 1);
            this.errorHandler.showSuccessMessage(`Removed ${username} from close friends`);
        }
    }

    viewProfile(username) {
        this.hideModal('searchModal');
        this.addToSearchHistory(username);
        alert(`Opening ${username}'s profile 👤`);
    }

    showHomeFeed() {
        this.hideAllModals();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadMorePosts() {
        const postsContainer = document.querySelector('.posts');
        
        this.mockData.posts.forEach(postData => {
            const postElement = this.createPostElement(postData);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(postData) {
        const article = document.createElement('article');
        article.className = 'post';
        article.dataset.postId = postData.id;
        article.innerHTML = `
            <header class="post-header">
                <div class="post-user-info">
                    <img src="${postData.avatar}" alt="Profile" class="post-profile-img">
                    <span class="post-username">${postData.username}</span>
                </div>
                <button class="post-options">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </header>
            <div class="post-image">
                <img src="${postData.image}" alt="Post">
            </div>
            <div class="post-actions">
                <div class="post-actions-left">
                    <button class="action-btn like-btn">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-paper-plane"></i>
                    </button>
                </div>
                <button class="action-btn bookmark-btn">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
            <div class="post-info">
                <div class="post-likes">${postData.likes.toLocaleString()} likes</div>
                <div class="post-caption">
                    <span class="post-username">${postData.username}</span>
                    <span class="caption-text">${postData.caption}</span>
                </div>
                <div class="post-comments">
                    <span class="view-comments">View all ${postData.comments.length} comments</span>
                </div>
                <div class="post-time">${postData.timeAgo}</div>
            </div>
        `;
        
        return article;
    }

    setupInfiniteScroll() {
        let isLoading = false;
        
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && !isLoading) {
                this.loadMorePostsInfinite();
            }
        });
    }

    loadMorePostsInfinite() {
        console.log('Loading more posts...');
        
        setTimeout(() => {
            const newPosts = [
                {
                    id: Date.now(),
                    username: 'random_user_' + Math.floor(Math.random() * 100),
                    avatar: 'https://via.placeholder.com/32',
                    image: `https://via.placeholder.com/600x${Math.floor(Math.random() * 200) + 400}`,
                    likes: Math.floor(Math.random() * 500) + 50,
                    caption: 'Another amazing post! #instagram #life #photography',
                    comments: [
                        { username: 'user1', text: 'Great post!', time: '1h', likes: 2 }
                    ],
                    timeAgo: Math.floor(Math.random() * 12) + 1 + ' HOURS AGO',
                    liked: false,
                    bookmarked: false
                }
            ];
            
            const postsContainer = document.querySelector('.posts');
            newPosts.forEach(postData => {
                const postElement = this.createPostElement(postData);
                postsContainer.appendChild(postElement);
            });
            
            console.log('New posts loaded!');
        }, 1000);
    }

    // Performance Optimization Methods
    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        }
    }

    setupPerformanceOptimizations() {
        // Debounce scroll events
        let scrollTimeout;
        const originalScrollHandler = window.addEventListener;

        // Throttle resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Memory cleanup
        this.setupMemoryCleanup();
    }

    handleResize() {
        // Handle responsive layout changes
        const screenWidth = window.innerWidth;

        if (screenWidth <= 768) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    setupMemoryCleanup() {
        // Clean up event listeners and observers when page unloads
        window.addEventListener('beforeunload', () => {
            if (this.imageObserver) {
                this.imageObserver.disconnect();
            }
            this.cleanup();
        });

        // Periodic cleanup
        setInterval(() => {
            this.performCleanup();
        }, 300000); // Every 5 minutes
    }

    performCleanup() {
        // Remove old error messages
        const oldErrors = document.querySelectorAll('.error-toast, .success-toast');
        oldErrors.forEach(toast => {
            if (Date.now() - parseInt(toast.dataset.timestamp || '0') > 30000) {
                toast.remove();
            }
        });

        // Limit stored errors
        if (this.errorHandler.errors.length > 25) {
            this.errorHandler.errors = this.errorHandler.errors.slice(-10);
        }
    }

    cleanup() {
        // Remove all event listeners and observers
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
    }

    // Optimized post creation with virtual scrolling concept
    createPostElementOptimized(postData) {
        const article = document.createElement('article');
        article.className = 'post';
        article.dataset.postId = postData.id;

        // Use template literals for better performance
        const postHTML = this.generatePostHTML(postData);
        article.innerHTML = postHTML;

        // Add lazy loading to images
        const img = article.querySelector('.post-image img');
        if (img && this.imageObserver) {
            img.dataset.src = img.src;
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=';
            img.classList.add('lazy-image');
            this.imageObserver.observe(img);
        }

        return article;
    }

    generatePostHTML(postData) {
        return `
            <header class="post-header">
                <div class="post-user-info">
                    <img src="${postData.avatar}" alt="Profile" class="post-profile-img">
                    <span class="post-username">${postData.username}</span>
                </div>
                <button class="post-options">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </header>
            <div class="post-image">
                <img src="${postData.image}" alt="Post">
            </div>
            <div class="post-actions">
                <div class="post-actions-left">
                    <button class="action-btn like-btn">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-paper-plane"></i>
                    </button>
                </div>
                <button class="action-btn bookmark-btn">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
            <div class="post-info">
                <div class="post-likes">${postData.likes.toLocaleString()} likes</div>
                <div class="post-caption">
                    <span class="post-username">${postData.username}</span>
                    <span class="caption-text">${postData.caption}</span>
                </div>
                <div class="post-comments">
                    <span class="view-comments">View all ${postData.comments.length} comments</span>
                </div>
                <div class="post-time">${postData.timeAgo}</div>
            </div>
        `;
    }
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        try {
            window.instagramApp = new InstagramApp();
            console.log('✅ Instagram App initialized successfully!');
            
            // Add visual feedback that app is ready
            document.body.classList.add('app-ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Instagram App:', error);
        }
    }, 100);
    
    // Add CSS animations and additional styles
    const style = document.createElement('style');
    style.textContent = `
        /* Additional Animation Styles */
        @keyframes heartPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        
        @keyframes storyProgress {
            from { width: 0%; }
            to { width: 100%; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        /* App Ready State */
        body:not(.app-ready) {
            cursor: wait;
        }
        
        body.app-ready {
            cursor: default;
        }
        
        /* Post Image Container */
        .post-image {
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        
        /* Button States */
        .liked i {
            color: #ed4956 !important;
            animation: pulse 0.3s ease;
        }
        
        .bookmarked i {
            color: #262626 !important;
            animation: pulse 0.3s ease;
        }
        
        .nav-item.active i {
            color: #262626 !important;
        }
        
        /* Story Viewer */
        .story-viewer {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Action Sheet */
        .action-sheet-overlay {
            animation: fadeIn 0.2s ease;
        }
        
        .action-sheet-option:hover {
            background-color: #f5f5f5;
        }
        
        .action-sheet-option:active {
            background-color: #e5e5e5;
        }
        
        /* Loading Indicators */
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #0095f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Enhanced Interactions */
        .clickable {
            cursor: pointer;
            transition: opacity 0.2s ease;
        }
        
        .clickable:hover {
            opacity: 0.8;
        }
        
        .clickable:active {
            transform: scale(0.98);
        }
        
        /* Smooth Scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Text Selection */
        .no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Focus Visible */
        .focus-visible:focus {
            outline: 2px solid #0095f6;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });
});