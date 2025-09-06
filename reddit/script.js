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

// Current state
let currentTab = 'hot';
let currentPosts = [...postsData];
let searchQuery = '';
let savedPosts = JSON.parse(localStorage.getItem('reddit_saved_posts')) || [];
let userVotes = JSON.parse(localStorage.getItem('reddit_user_votes')) || {};

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
    renderPosts();
    setupEventListeners();
    updateUserStats();
    createNotificationContainer();
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
    if (currentPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="loading">
                No posts found
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = currentPosts.map(post => {
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
                    <button class="post-action" onclick="showComments(${post.id})">
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
            </div>
        </div>
        `;
    }).join('');
}

// Handle search
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    filterPosts();
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
    
    // Update active tab button
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
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
    
    renderPosts();
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

// Data persistence functions
function saveDataToStorage() {
    localStorage.setItem('reddit_posts', JSON.stringify(postsData));
    localStorage.setItem('reddit_user_profile', JSON.stringify(userProfile));
    localStorage.setItem('reddit_saved_posts', JSON.stringify(savedPosts));
    localStorage.setItem('reddit_user_votes', JSON.stringify(userVotes));
}

function loadDataFromStorage() {
    const savedPostsData = localStorage.getItem('reddit_posts');
    const savedUserProfile = localStorage.getItem('reddit_user_profile');
    
    if (savedPostsData) {
        const parsedPosts = JSON.parse(savedPostsData);
        postsData.length = 0;
        postsData.push(...parsedPosts);
        currentPosts = [...postsData];
    }
    
    if (savedUserProfile) {
        Object.assign(userProfile, JSON.parse(savedUserProfile));
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

