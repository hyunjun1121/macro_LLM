// Reddit-like Website JavaScript

// Sample data for posts
const postsData = [
    {
        id: 1,
        title: "Just built my first React app! What do you think?",
        content: "After months of learning JavaScript, I finally built my first React application. It's a simple todo app but I'm really proud of it. The component structure was challenging at first but now I understand the power of React!",
        author: "jun",
        community: "r/reactjs",
        time: "2 hours ago",
        upvotes: 45,
        downvotes: 2,
        comments: 12,
        userVote: 0 // 0 = no vote, 1 = upvote, -1 = downvote
    },
    {
        id: 2,
        title: "JavaScript ES6+ features that changed my coding life",
        content: "Arrow functions, destructuring, async/await, and template literals have completely transformed how I write JavaScript. Here's a breakdown of my favorite features and how they've improved my code quality.",
        author: "jun",
        community: "r/javascript",
        time: "5 hours ago",
        upvotes: 78,
        downvotes: 3,
        comments: 23,
        userVote: 1
    },
    {
        id: 3,
        title: "Web development career advice needed",
        content: "I'm a junior developer with 1 year of experience. Should I focus on learning more frameworks or dive deeper into vanilla JavaScript? Also, any tips for building a strong portfolio?",
        author: "jun",
        community: "r/webdev",
        time: "1 day ago",
        upvotes: 34,
        downvotes: 1,
        comments: 18,
        userVote: 0
    },
    {
        id: 4,
        title: "Node.js vs Python for backend development",
        content: "I'm starting a new project and can't decide between Node.js and Python. Both have their strengths, but I'm looking for real-world experiences from developers who've used both.",
        author: "jun",
        community: "r/programming",
        time: "2 days ago",
        upvotes: 92,
        downvotes: 8,
        comments: 45,
        userVote: -1
    },
    {
        id: 5,
        title: "CSS Grid vs Flexbox - When to use which?",
        content: "I understand both CSS Grid and Flexbox, but I'm still confused about when to use each one. Can someone explain the practical differences and use cases?",
        author: "jun",
        community: "r/webdev",
        time: "3 days ago",
        upvotes: 56,
        downvotes: 2,
        comments: 31,
        userVote: 1
    }
];

// User profile data
const userProfile = {
    username: "jun",
    karma: 1234,
    posts: 15,
    comments: 89,
    joinDate: "January 2023",
    avatar: "https://via.placeholder.com/32x32/ff4500/ffffff?text=J"
};

// Communities data
const communities = [
    { name: "programming", members: "2.1m", description: "Computer programming discussion" },
    { name: "webdev", members: "1.8m", description: "Web development community" },
    { name: "javascript", members: "1.5m", description: "JavaScript programming" },
    { name: "reactjs", members: "1.2m", description: "React.js community" },
    { name: "node", members: "800k", description: "Node.js development" }
];

// Comments data
const commentsData = {
    1: [
        {
            id: 101,
            postId: 1,
            content: "Great job on your first React app! The todo app is actually a perfect project to start with.",
            author: "react_dev",
            time: "1 hour ago",
            upvotes: 12,
            downvotes: 0,
            parentId: null,
            replies: [
                {
                    id: 102,
                    postId: 1,
                    content: "I agree! Building a todo app teaches you state management, components, and event handling.",
                    author: "jun",
                    time: "30 minutes ago",
                    upvotes: 5,
                    downvotes: 0,
                    parentId: 101,
                    replies: []
                }
            ]
        },
        {
            id: 103,
            postId: 1,
            content: "Keep up the good work! What's your next project going to be?",
            author: "coder_mike",
            time: "45 minutes ago",
            upvotes: 8,
            downvotes: 0,
            parentId: null,
            replies: []
        }
    ],
    2: [
        {
            id: 201,
            postId: 2,
            content: "Template literals are my favorite ES6 feature. They make string formatting so much cleaner!",
            author: "js_ninja",
            time: "3 hours ago",
            upvotes: 15,
            downvotes: 1,
            parentId: null,
            replies: []
        },
        {
            id: 202,
            postId: 2,
            content: "Don't forget about destructuring! It makes working with objects and arrays so much easier.",
            author: "dev_sarah",
            time: "2 hours ago",
            upvotes: 10,
            downvotes: 0,
            parentId: null,
            replies: [
                {
                    id: 203,
                    postId: 2,
                    content: "Absolutely! Destructuring assignment is a game changer.",
                    author: "jun",
                    time: "1 hour ago",
                    upvotes: 3,
                    downvotes: 0,
                    parentId: 202,
                    replies: []
                }
            ]
        }
    ]
};

// Current state
let currentTab = 'hot';
let currentPosts = [...postsData];
let searchQuery = '';
let savedPosts = JSON.parse(localStorage.getItem('reddit_saved_posts')) || [];
let userVotes = JSON.parse(localStorage.getItem('reddit_user_votes')) || {};
let isDarkMode = JSON.parse(localStorage.getItem('reddit_dark_mode')) || false;

// Infinite scroll state
let displayedPosts = [];
let postsPerPage = 5;
let currentPage = 0;
let isLoading = false;

// DOM elements
const postsContainer = document.getElementById('postsContainer');
const searchInput = document.getElementById('searchInput');
const postModal = document.getElementById('postModal');
const postForm = document.getElementById('postForm');
const closeModal = document.getElementById('closeModal');
const tabButtons = document.querySelectorAll('.tab-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    setupEventListeners();
    updateUserStats();
    createNotificationContainer();
    initializeTheme();
    initInfiniteScroll();
    setupKeyboardNavigation();
    updateTabPanelLabel('hot');
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Modal functionality
    document.querySelector('.create-post-btn').addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    document.querySelector('.cancel-btn').addEventListener('click', closeModalHandler);
    postForm.addEventListener('submit', handlePostSubmit);
    
    // Close modal when clicking outside
    postModal.addEventListener('click', (e) => {
        if (e.target === postModal) {
            closeModalHandler();
        }
    });
    
    // Post option buttons
    document.querySelectorAll('.post-option-btn').forEach(btn => {
        btn.addEventListener('click', openModal);
    });
    
    // Character counters
    const titleInput = document.getElementById('postTitle');
    const contentTextarea = document.getElementById('postContent');
    const titleCounter = document.getElementById('titleCounter');
    const contentCounter = document.getElementById('contentCounter');
    
    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', () => {
            const length = titleInput.value.length;
            titleCounter.textContent = `${length}/300`;
            titleCounter.className = 'char-counter';
            if (length > 250) titleCounter.classList.add('warning');
            if (length > 290) titleCounter.classList.add('error');
        });
    }
    
    if (contentTextarea && contentCounter) {
        contentTextarea.addEventListener('input', () => {
            const length = contentTextarea.value.length;
            contentCounter.textContent = `${length}/40000`;
            contentCounter.className = 'char-counter';
            if (length > 35000) contentCounter.classList.add('warning');
            if (length > 39000) contentCounter.classList.add('error');
        });
    }
}

// Render posts
function renderPosts() {
    const postsToRender = displayedPosts.length > 0 ? displayedPosts : currentPosts.slice(0, postsPerPage);

    if (postsToRender.length === 0) {
        postsContainer.innerHTML = `
            <div class="loading">
                No posts found
            </div>
        `;
        return;
    }

    // Don't replace all content if we're adding new posts (infinite scroll)
    if (displayedPosts.length > 0 && postsContainer.children.length > 0) {
        // Remove existing loading indicator
        hideLoading();

        // Only add new posts
        const existingPostIds = Array.from(postsContainer.querySelectorAll('.post')).map(post =>
            parseInt(post.dataset.postId)
        );
        const newPosts = postsToRender.filter(post => !existingPostIds.includes(post.id));

        newPosts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } else {
        // Render all posts (initial load or filter change)
        postsContainer.innerHTML = postsToRender.map(post => createPostHTML(post)).join('');
    }
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.innerHTML = createPostHTML(post);
    return div.firstElementChild;
}

function createPostHTML(post) {
    const userVote = userVotes[post.id] || 0;
    const isSaved = savedPosts.includes(post.id);

    return `
        <div class="post" data-post-id="${post.id}" id="post-${post.id}">
            <div class="post-voting">
                <button class="vote-btn ${userVote === 1 ? 'upvoted' : ''}" onclick="votePost(${post.id}, 1)">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <span class="vote-count">${post.upvotes - post.downvotes}</span>
                <button class="vote-btn ${userVote === -1 ? 'downvoted' : ''}" onclick="votePost(${post.id}, -1)">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="post-content">
                <div class="post-header">
                    <a href="#" class="post-community">${post.community}</a>
                    <span>•</span>
                    <span>Posted by</span>
                    <a href="#" class="post-author">u/${post.author}</a>
                    <span>•</span>
                    <span class="post-time">${post.time}</span>
                </div>
                <a href="#" class="post-title">${post.title}</a>
                ${post.content ? `<div class="post-text">${post.content}</div>` : ''}
                <div class="post-actions">
                    <button class="post-action" onclick="toggleComments(${post.id})">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments} Comments</span>
                    </button>
                    <button class="post-action" onclick="sharePost(${post.id})">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button class="post-action ${isSaved ? 'saved' : ''}" onclick="toggleSavePost(${post.id})">
                        <i class="fas fa-bookmark"></i>
                        <span>${isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comment-form">
                        <textarea placeholder="What are your thoughts?" id="commentInput-${post.id}" class="comment-input"></textarea>
                        <button class="comment-submit-btn" onclick="addComment(${post.id})">Comment</button>
                    </div>
                    <div class="comments-list" id="commentsList-${post.id}">
                        ${renderComments(post.id)}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Handle search (optimized with debouncing and sanitization)
function handleSearch(e) {
    const sanitizedQuery = sanitizeInput(e.target.value.toLowerCase());
    searchQuery = sanitizedQuery;
    debouncedSearch();
}

// Filter posts based on search query
function filterPosts() {
    if (!searchQuery) {
        currentPosts = [...postsData];
    } else {
        currentPosts = postsData.filter(post => 
            post.title.toLowerCase().includes(searchQuery) ||
            post.content.toLowerCase().includes(searchQuery) ||
            post.community.toLowerCase().includes(searchQuery) ||
            post.author.toLowerCase().includes(searchQuery)
        );
    }
    renderPosts();
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;

    // Update active tab button and ARIA attributes
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            // Update the tabpanel's aria-labelledby
            const postsContainer = document.getElementById('postsContainer');
            if (postsContainer) {
                postsContainer.setAttribute('aria-labelledby', btn.id);
            }
        }
    });

    // Sort posts based on tab
    switch(tab) {
        case 'hot':
            currentPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            break;
        case 'new':
            currentPosts.sort((a, b) => b.id - a.id);
            break;
        case 'top':
            currentPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            break;
        case 'rising':
            currentPosts.sort((a, b) => b.comments - a.comments);
            break;
    }

    // Update tab panel label and announce change
    updateTabPanelLabel(tab);
    announceToScreenReader(`Switched to ${tab} posts`);

    // Reset infinite scroll and reload
    resetInfiniteScroll();
    postsContainer.innerHTML = '';
    initInfiniteScroll();
}

// Vote on post
function votePost(postId, voteType) {
    const post = currentPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Get current vote from storage
    const currentVote = userVotes[postId] || 0;
    
    // Remove previous vote
    if (currentVote === voteType) {
        if (voteType === 1) {
            post.upvotes--;
        } else {
            post.downvotes--;
        }
        userVotes[postId] = 0;
        post.userVote = 0;
    } else {
        // Remove opposite vote if exists
        if (currentVote === 1) {
            post.upvotes--;
        } else if (currentVote === -1) {
            post.downvotes--;
        }
        
        // Add new vote
        if (voteType === 1) {
            post.upvotes++;
        } else {
            post.downvotes++;
        }
        userVotes[postId] = voteType;
        post.userVote = voteType;
    }
    
    // Save to storage
    saveDataToStorage();
    renderPosts();
}

// Show comments (placeholder)
function showComments(postId) {
    alert(`Comments for post ${postId} would be displayed here in a real implementation.`);
}

// Open modal
function openModal() {
    postModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModalHandler() {
    postModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    postForm.reset();
}

// Handle post submission
function handlePostSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const community = document.getElementById('postCommunity').value;
    
    if (!title.trim()) {
        showNotification('Please enter a title for your post.', 'error');
        return;
    }
    
    if (title.length > 300) {
        showNotification('Title must be 300 characters or less.', 'error');
        return;
    }
    
    if (content.length > 40000) {
        showNotification('Content must be 40,000 characters or less.', 'error');
        return;
    }
    
    // Create new post
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        author: userProfile.username,
        community: `r/${community}`,
        time: 'just now',
        upvotes: 1,
        downvotes: 0,
        comments: 0,
        userVote: 1,
        createdAt: new Date().toISOString()
    };
    
    // Add to beginning of posts array
    currentPosts.unshift(newPost);
    postsData.unshift(newPost);
    
    // Save to localStorage
    saveDataToStorage();
    
    // Update user stats
    userProfile.posts++;
    updateUserStats();
    
    // Re-render posts
    renderPosts();
    
    // Close modal
    closeModalHandler();
    
    // Show success message
    showNotification('Post created successfully!', 'success');
}

// Update user stats display
function updateUserStats() {
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = userProfile.karma.toLocaleString();
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = userProfile.posts;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = userProfile.comments;
}

// Community navigation
function navigateToCommunity(communityName) {
    const filteredPosts = postsData.filter(post => 
        post.community.toLowerCase().includes(communityName.toLowerCase())
    );
    currentPosts = filteredPosts;
    renderPosts();
}

// Add community click handlers
document.addEventListener('DOMContentLoaded', function() {
    const communityItems = document.querySelectorAll('.community-item');
    communityItems.forEach(item => {
        item.addEventListener('click', () => {
            const communityName = item.querySelector('.community-name').textContent;
            navigateToCommunity(communityName);
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape' && postModal.classList.contains('show')) {
        closeModalHandler();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Simulate real-time updates
setInterval(() => {
    // Randomly update vote counts to simulate activity
    if (Math.random() < 0.1) { // 10% chance every interval
        const randomPost = currentPosts[Math.floor(Math.random() * currentPosts.length)];
        if (randomPost && Math.random() < 0.7) { // 70% chance of upvote
            randomPost.upvotes++;
        } else if (randomPost) {
            randomPost.downvotes++;
        }
        renderPosts();
    }
}, 30000); // Update every 30 seconds

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for better UX
function showLoading() {
    postsContainer.innerHTML = `
        <div class="loading">
            Loading posts...
        </div>
    `;
}

// Simulate loading delay for realistic experience
function loadPostsWithDelay() {
    showLoading();
    setTimeout(() => {
        renderPosts();
    }, 500);
}

// Navigation functions
function goToHome() {
    window.location.href = 'index.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function goToCommunity(communityName) {
    window.location.href = `community.html?community=${communityName}`;
}

// Add click handlers for navigation
document.addEventListener('DOMContentLoaded', function() {
    // Logo click to go home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', goToHome);
    }
    
    // User info click to go to profile
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', goToProfile);
    }
    
    // Community links
    const communityItems = document.querySelectorAll('.community-item');
    communityItems.forEach(item => {
        item.addEventListener('click', () => {
            const communityName = item.querySelector('.community-name').textContent;
            goToCommunity(communityName);
        });
    });
    
    // Post community links
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('post-community')) {
            e.preventDefault();
            const communityName = e.target.textContent.replace('r/', '');
            goToCommunity(communityName);
        }
    });
    
    loadPostsWithDelay();
});

// Data persistence functions (optimized with error handling)
function saveDataToStorage() {
    safeLocalStorage('set', 'reddit_posts', postsData);
    safeLocalStorage('set', 'reddit_user_profile', userProfile);
    safeLocalStorage('set', 'reddit_saved_posts', savedPosts);
    safeLocalStorage('set', 'reddit_user_votes', userVotes);
    safeLocalStorage('set', 'reddit_dark_mode', isDarkMode);
    safeLocalStorage('set', 'reddit_comments', commentsData);
}

function loadDataFromStorage() {
    const savedPostsData = safeLocalStorage('get', 'reddit_posts');
    const savedUserProfile = safeLocalStorage('get', 'reddit_user_profile');
    const savedSavedPosts = safeLocalStorage('get', 'reddit_saved_posts');
    const savedUserVotes = safeLocalStorage('get', 'reddit_user_votes');
    const savedDarkMode = safeLocalStorage('get', 'reddit_dark_mode');
    const savedComments = safeLocalStorage('get', 'reddit_comments');

    if (savedPostsData && Array.isArray(savedPostsData)) {
        const validPosts = savedPostsData.filter(validatePostData);
        if (validPosts.length > 0) {
            postsData.length = 0;
            postsData.push(...validPosts);
            currentPosts = [...postsData];
        }
    }

    if (savedUserProfile && typeof savedUserProfile === 'object') {
        Object.assign(userProfile, savedUserProfile);
    }

    if (savedSavedPosts && Array.isArray(savedSavedPosts)) {
        savedPosts = savedSavedPosts;
    }

    if (savedUserVotes && typeof savedUserVotes === 'object') {
        userVotes = savedUserVotes;
    }

    if (savedDarkMode !== null) {
        isDarkMode = savedDarkMode;
    }

    if (savedComments && typeof savedComments === 'object') {
        Object.assign(commentsData, savedComments);
    }
}

// Notification system
function createNotificationContainer() {
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    notification.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
        position: relative;
    `;
    
    notification.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            position: absolute;
            top: 5px;
            right: 10px;
            cursor: pointer;
            opacity: 0.7;
        ">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Save/Unsave post functionality
function toggleSavePost(postId) {
    const postIndex = savedPosts.indexOf(postId);
    if (postIndex > -1) {
        savedPosts.splice(postIndex, 1);
        showNotification('Post removed from saved', 'info');
    } else {
        savedPosts.push(postId);
        showNotification('Post saved', 'success');
    }
    saveDataToStorage();
    renderPosts();
}

// Refresh feed functionality
function refreshFeed() {
    showLoading();
    setTimeout(() => {
        renderPosts();
        showNotification('Feed refreshed!', 'success');
    }, 1000);
}

// Show saved posts
function showSavedPosts() {
    if (savedPosts.length === 0) {
        showNotification('No saved posts yet', 'info');
        return;
    }
    
    const savedPostsData = postsData.filter(post => savedPosts.includes(post.id));
    currentPosts = savedPostsData;
    renderPosts();
    showNotification(`Showing ${savedPostsData.length} saved posts`, 'info');
}

// Share functionality
function sharePost(postId) {
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    const shareText = `${post.title} - ${post.community}`;
    
    if (navigator.share) {
        navigator.share({
            title: post.title,
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Unable to copy link', 'error');
        });
    }
}

// Comment system functions
let commentIdCounter = 1000;

function renderComments(postId, parentId = null, depth = 0) {
    const comments = commentsData[postId] || [];
    const filteredComments = comments.filter(comment => comment.parentId === parentId);

    return filteredComments.map(comment => {
        return `
        <div class="comment" data-comment-id="${comment.id}" style="margin-left: ${depth * 20}px;">
            <div class="comment-header">
                <img src="https://via.placeholder.com/24x24/ff4500/ffffff?text=${comment.author.charAt(0).toUpperCase()}"
                     alt="${comment.author}" class="comment-avatar">
                <span class="comment-author">u/${comment.author}</span>
                <span class="comment-time">${comment.time}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <button class="comment-action" onclick="voteComment(${comment.id}, 1)">
                    <i class="fas fa-arrow-up"></i> ${comment.upvotes}
                </button>
                <button class="comment-action" onclick="voteComment(${comment.id}, -1)">
                    <i class="fas fa-arrow-down"></i> ${comment.downvotes}
                </button>
                <button class="comment-action" onclick="showReplyForm(${comment.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                ${comment.author === userProfile.username ?
                    `<button class="comment-action" onclick="editComment(${comment.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="comment-action" onclick="deleteComment(${comment.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''
                }
            </div>
            <div class="reply-form" id="replyForm-${comment.id}" style="display: none;">
                <textarea placeholder="Reply to ${comment.author}" class="reply-input"></textarea>
                <div class="reply-actions">
                    <button onclick="submitReply(${comment.id}, ${postId})">Reply</button>
                    <button onclick="cancelReply(${comment.id})">Cancel</button>
                </div>
            </div>
            ${comment.replies && comment.replies.length > 0 ?
                comment.replies.map(reply => renderComments(postId, reply.parentId, depth + 1)).join('') :
                ''
            }
        </div>
        `;
    }).join('');
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(postId);
    } else {
        commentsSection.style.display = 'none';
    }
}

function loadComments(postId) {
    const commentsList = document.getElementById(`commentsList-${postId}`);
    commentsList.innerHTML = renderComments(postId);
}

function addComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const content = commentInput.value.trim();

    if (!content) {
        showNotification('Please enter a comment', 'warning');
        return;
    }

    const newComment = {
        id: ++commentIdCounter,
        postId: postId,
        content: content,
        author: userProfile.username,
        time: 'now',
        upvotes: 0,
        downvotes: 0,
        parentId: null,
        replies: []
    };

    if (!commentsData[postId]) {
        commentsData[postId] = [];
    }

    commentsData[postId].push(newComment);

    // Update post comment count
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.comments++;
    }

    commentInput.value = '';
    loadComments(postId);
    showNotification('Comment added!', 'success');
    renderPosts();
}

function showReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
}

function cancelReply(commentId) {
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    replyForm.style.display = 'none';
    replyForm.querySelector('.reply-input').value = '';
}

function submitReply(parentCommentId, postId) {
    const replyForm = document.getElementById(`replyForm-${parentCommentId}`);
    const replyInput = replyForm.querySelector('.reply-input');
    const content = replyInput.value.trim();

    if (!content) {
        showNotification('Please enter a reply', 'warning');
        return;
    }

    const newReply = {
        id: ++commentIdCounter,
        postId: postId,
        content: content,
        author: userProfile.username,
        time: 'now',
        upvotes: 0,
        downvotes: 0,
        parentId: parentCommentId,
        replies: []
    };

    // Find parent comment and add reply
    const comments = commentsData[postId] || [];
    const parentComment = findCommentById(comments, parentCommentId);

    if (parentComment) {
        parentComment.replies.push(newReply);

        // Update post comment count
        const post = postsData.find(p => p.id === postId);
        if (post) {
            post.comments++;
        }

        cancelReply(parentCommentId);
        loadComments(postId);
        showNotification('Reply added!', 'success');
        renderPosts();
    }
}

function findCommentById(comments, commentId) {
    for (const comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentById(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}

function voteComment(commentId, voteType) {
    // Find comment in all posts
    for (const postId in commentsData) {
        const comment = findCommentById(commentsData[postId], commentId);
        if (comment) {
            if (voteType === 1) {
                comment.upvotes++;
            } else {
                comment.downvotes++;
            }

            // Reload comments for the post
            loadComments(parseInt(postId));
            showNotification(voteType === 1 ? 'Comment upvoted!' : 'Comment downvoted!', 'success');
            break;
        }
    }
}

function editComment(commentId) {
    // Find comment and replace content with input field
    for (const postId in commentsData) {
        const comment = findCommentById(commentsData[postId], commentId);
        if (comment) {
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"] .comment-content`);
            const originalContent = comment.content;

            commentElement.innerHTML = `
                <textarea class="edit-comment-input" style="width: 100%; min-height: 60px;">${originalContent}</textarea>
                <div class="edit-actions" style="margin-top: 8px;">
                    <button onclick="saveCommentEdit(${commentId}, '${postId}')">Save</button>
                    <button onclick="cancelCommentEdit(${commentId}, '${originalContent}')">Cancel</button>
                </div>
            `;
            break;
        }
    }
}

function saveCommentEdit(commentId, postId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"] .comment-content`);
    const newContent = commentElement.querySelector('.edit-comment-input').value.trim();

    if (!newContent) {
        showNotification('Comment cannot be empty', 'warning');
        return;
    }

    for (const pid in commentsData) {
        const comment = findCommentById(commentsData[pid], commentId);
        if (comment) {
            comment.content = newContent;
            loadComments(parseInt(pid));
            showNotification('Comment updated!', 'success');
            break;
        }
    }
}

function cancelCommentEdit(commentId, originalContent) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"] .comment-content`);
    commentElement.innerHTML = originalContent;
}

function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    for (const postId in commentsData) {
        const comments = commentsData[postId];
        const commentIndex = comments.findIndex(c => c.id === commentId);

        if (commentIndex > -1) {
            comments.splice(commentIndex, 1);

            // Update post comment count
            const post = postsData.find(p => p.id === parseInt(postId));
            if (post && post.comments > 0) {
                post.comments--;
            }

            loadComments(parseInt(postId));
            showNotification('Comment deleted!', 'success');
            renderPosts();
            return;
        }

        // Check in replies
        const parentComment = findParentOfComment(comments, commentId);
        if (parentComment) {
            const replyIndex = parentComment.replies.findIndex(r => r.id === commentId);
            if (replyIndex > -1) {
                parentComment.replies.splice(replyIndex, 1);

                // Update post comment count
                const post = postsData.find(p => p.id === parseInt(postId));
                if (post && post.comments > 0) {
                    post.comments--;
                }

                loadComments(parseInt(postId));
                showNotification('Reply deleted!', 'success');
                renderPosts();
                return;
            }
        }
    }
}

function findParentOfComment(comments, targetCommentId) {
    for (const comment of comments) {
        if (comment.replies && comment.replies.some(reply => reply.id === targetCommentId)) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findParentOfComment(comment.replies, targetCommentId);
            if (found) return found;
        }
    }
    return null;
}

// Dark Mode Functions
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('reddit_dark_mode', JSON.stringify(isDarkMode));
    applyTheme();
    showNotification(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled', 'info');
}

function applyTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    if (isDarkMode) {
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
    }
}

function initializeTheme() {
    applyTheme();
}

// Accessibility and Keyboard Navigation Functions
function setupKeyboardNavigation() {
    // Tab navigation for feed tabs
    const tabButtons = document.querySelectorAll('[role="tab"]');
    tabButtons.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
            let nextIndex;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    nextIndex = index > 0 ? index - 1 : tabButtons.length - 1;
                    tabButtons[nextIndex].focus();
                    switchTab(tabButtons[nextIndex].dataset.tab);
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    nextIndex = index < tabButtons.length - 1 ? index + 1 : 0;
                    tabButtons[nextIndex].focus();
                    switchTab(tabButtons[nextIndex].dataset.tab);
                    break;

                case 'Home':
                    e.preventDefault();
                    tabButtons[0].focus();
                    switchTab(tabButtons[0].dataset.tab);
                    break;

                case 'End':
                    e.preventDefault();
                    tabButtons[tabButtons.length - 1].focus();
                    switchTab(tabButtons[tabButtons.length - 1].dataset.tab);
                    break;
            }
        });
    });

    // Community links keyboard navigation
    const communityLinks = document.querySelectorAll('.community-link');
    communityLinks.forEach(link => {
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });
    });

    // User menu keyboard navigation
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Toggle user menu (implement if needed)
                console.log('User menu toggled');
            }
        });
    }
}

function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function updateTabPanelLabel(activeTab) {
    const postsContainer = document.getElementById('postsContainer');
    if (postsContainer) {
        const labels = {
            hot: 'Hot posts - most popular posts right now',
            new: 'New posts - most recently posted content',
            top: 'Top posts - highest rated posts',
            rising: 'Rising posts - posts gaining popularity'
        };

        postsContainer.setAttribute('aria-label', labels[activeTab] || 'Posts feed');
    }
}

// Performance Optimization Functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized search with debouncing
const debouncedSearch = debounce((searchQuery) => {
    filterPosts();
}, 300);

// Optimized scroll handler with throttling
const throttledScrollHandler = throttle(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        loadNextPage();
    }
}, 250);

// Virtual scrolling for better performance with large lists
function createIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '100px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const post = entry.target;
                const postId = parseInt(post.dataset.postId);

                // Lazy load comments when post comes into view
                const commentsSection = post.querySelector('.comments-section');
                if (commentsSection && !commentsSection.dataset.loaded) {
                    commentsSection.dataset.loaded = 'true';
                    // Comments are already rendered, but we could implement lazy loading here
                }
            }
        });
    }, options);

    return observer;
}

// Memory management - clean up old posts if too many are loaded
function cleanupOldPosts() {
    const posts = document.querySelectorAll('.post');
    const maxPosts = 50; // Keep only 50 posts in DOM

    if (posts.length > maxPosts) {
        const postsToRemove = Array.from(posts).slice(0, posts.length - maxPosts);
        postsToRemove.forEach(post => {
            post.remove();
        });

        // Update displayedPosts array accordingly
        displayedPosts = displayedPosts.slice(-(maxPosts));

        console.log(`Cleaned up ${postsToRemove.length} old posts for better performance`);
    }
}

// Error handling wrapper
function withErrorHandling(fn, context = 'Unknown') {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            showNotification('Something went wrong. Please try again.', 'error');
        }
    };
}

// Validation functions
function validatePostData(post) {
    const required = ['id', 'title', 'author', 'community', 'time', 'upvotes', 'downvotes', 'comments'];
    return required.every(field => post.hasOwnProperty(field) && post[field] !== undefined);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim()
        .substring(0, 1000); // Limit length
}

// Local storage with error handling
function safeLocalStorage(action, key, value = null) {
    try {
        switch(action) {
            case 'get':
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;

            case 'set':
                if (value !== null) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
                break;

            case 'remove':
                localStorage.removeItem(key);
                break;

            case 'clear':
                localStorage.clear();
                break;
        }
    } catch (error) {
        console.warn(`localStorage ${action} failed for key ${key}:`, error);
        return null;
    }
}

// Performance monitoring
function measurePerformance(name, fn) {
    return function(...args) {
        const start = performance.now();
        const result = fn.apply(this, args);
        const end = performance.now();

        if (end - start > 16) { // Log slow operations (> 16ms)
            console.warn(`Slow operation "${name}": ${(end - start).toFixed(2)}ms`);
        }

        return result;
    };
}

// Infinite Scroll Functions
function generateMorePosts(count = 10) {
    const additionalPosts = [];
    const topics = [
        "How to improve your coding skills",
        "Best practices for web development",
        "JavaScript frameworks comparison",
        "Building responsive layouts",
        "Database design principles",
        "API development with REST",
        "Mobile app development tips",
        "DevOps best practices",
        "Code review guidelines",
        "Testing strategies for web apps",
        "CSS animations and transitions",
        "Performance optimization techniques",
        "Security in web development",
        "Git workflow strategies",
        "Open source contribution guide"
    ];

    const communities = ["r/programming", "r/webdev", "r/javascript", "r/reactjs", "r/node", "r/css", "r/python"];
    const authors = ["developer123", "coder_pro", "web_guru", "js_master", "tech_enthusiast", "code_ninja"];

    for (let i = 0; i < count; i++) {
        const id = postsData.length + additionalPosts.length + 1;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const community = communities[Math.floor(Math.random() * communities.length)];
        const author = authors[Math.floor(Math.random() * authors.length)];
        const upvotes = Math.floor(Math.random() * 200) + 5;
        const downvotes = Math.floor(Math.random() * 20);
        const comments = Math.floor(Math.random() * 50) + 1;
        const hoursAgo = Math.floor(Math.random() * 24) + 1;

        additionalPosts.push({
            id: id,
            title: topic,
            content: `This is a detailed discussion about ${topic.toLowerCase()}. Here are some insights and experiences from the community.`,
            author: author,
            community: community,
            time: `${hoursAgo} hours ago`,
            upvotes: upvotes,
            downvotes: downvotes,
            comments: comments,
            userVote: 0
        });
    }

    return additionalPosts;
}

const loadNextPage = withErrorHandling(() => {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    // Simulate network delay
    setTimeout(() => {
        const startIndex = currentPage * postsPerPage;
        const endIndex = startIndex + postsPerPage;

        // If we've shown all existing posts, generate more
        if (startIndex >= currentPosts.length) {
            const newPosts = generateMorePosts(postsPerPage);
            currentPosts.push(...newPosts);
        }

        const newPagePosts = currentPosts.slice(startIndex, endIndex);
        displayedPosts.push(...newPagePosts);

        renderPosts();
        currentPage++;
        isLoading = false;
        hideLoading();

        // Observe new posts for intersection observer
        if (window.observeNewPosts) {
            setTimeout(window.observeNewPosts, 100);
        }

        // Clean up old posts for memory management
        cleanupOldPosts();

        // Check if we need to generate more posts for next time
        if (currentPosts.length < (currentPage + 1) * postsPerPage) {
            const morePosts = generateMorePosts(20);
            currentPosts.push(...morePosts);
        }

        // Save state periodically
        if (currentPage % 5 === 0) {
            saveDataToStorage();
        }
    }, 1000);
}, 'loadNextPage');

function initInfiniteScroll() {
    // Load initial posts
    currentPage = 0;
    displayedPosts = [];
    loadNextPage();

    // Set up optimized scroll event listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    // Set up intersection observer for performance monitoring
    const observer = createIntersectionObserver();

    // Observe posts as they're added
    const observeNewPosts = () => {
        const posts = document.querySelectorAll('.post:not([data-observed])');
        posts.forEach(post => {
            post.setAttribute('data-observed', 'true');
            observer.observe(post);
        });
    };

    // Initial observation
    setTimeout(observeNewPosts, 100);

    // Observe new posts when they're added
    window.observeNewPosts = observeNewPosts;
}

function showLoading() {
    const existingLoader = document.getElementById('infinite-loader');
    if (existingLoader) return;

    const loader = document.createElement('div');
    loader.id = 'infinite-loader';
    loader.className = 'loading';
    loader.innerHTML = 'Loading more posts...';
    postsContainer.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('infinite-loader');
    if (loader) {
        loader.remove();
    }
}

function resetInfiniteScroll() {
    currentPage = 0;
    displayedPosts = [];
    hideLoading();
}

