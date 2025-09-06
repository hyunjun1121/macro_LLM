// Profile Page JavaScript

// Profile data
const profileData = {
    username: "jun",
    displayName: "Jun",
    karma: 1234,
    posts: 15,
    comments: 89,
    joinDate: "January 2023",
    avatar: "https://via.placeholder.com/120x120/ff4500/ffffff?text=J",
    bio: "Full-stack developer passionate about web technologies. Love sharing knowledge and learning from the community.",
    location: "Seoul, South Korea",
    website: "https://jun-dev.com",
    socialLinks: {
        github: "https://github.com/jun",
        twitter: "https://twitter.com/jun_dev",
        linkedin: "https://linkedin.com/in/jun"
    }
};

// User's posts data
const userPosts = [
    {
        id: 1,
        title: "Just built my first React app! What do you think?",
        content: "After months of learning JavaScript, I finally built my first React application. It's a simple todo app but I'm really proud of it. The component structure was challenging at first but now I understand the power of React!",
        community: "r/reactjs",
        time: "2 hours ago",
        upvotes: 45,
        downvotes: 2,
        comments: 12,
        userVote: 0
    },
    {
        id: 2,
        title: "JavaScript ES6+ features that changed my coding life",
        content: "Arrow functions, destructuring, async/await, and template literals have completely transformed how I write JavaScript. Here's a breakdown of my favorite features and how they've improved my code quality.",
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
        community: "r/webdev",
        time: "3 days ago",
        upvotes: 56,
        downvotes: 2,
        comments: 31,
        userVote: 1
    }
];

// Comments data
const userComments = [
    {
        id: 1,
        content: "Thanks for the feedback! I'm planning to add more features to the app.",
        community: "r/reactjs",
        postTitle: "Just built my first React app! What do you think?",
        time: "2 hours ago",
        upvotes: 5,
        downvotes: 0
    },
    {
        id: 2,
        content: "I completely agree! Async/await has made my code so much more readable.",
        community: "r/javascript",
        postTitle: "JavaScript ES6+ features that changed my coding life",
        time: "1 day ago",
        upvotes: 12,
        downvotes: 0
    },
    {
        id: 3,
        content: "Great question! I'd recommend focusing on fundamentals first, then exploring frameworks.",
        community: "r/webdev",
        postTitle: "Web development career advice needed",
        time: "2 days ago",
        upvotes: 8,
        downvotes: 1
    }
];

// Current state
let currentTab = 'posts';

// DOM elements
const navTabs = document.querySelectorAll('.nav-tab');
const contentTabs = document.querySelectorAll('.content-tab');
const profilePostsContainer = document.getElementById('profilePostsContainer');

// Initialize the profile page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadPosts();
    updateProfileStats();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab button
    navTabs.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update active content tab
    contentTabs.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tab}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // Load appropriate content
    switch(tab) {
        case 'posts':
            loadPosts();
            break;
        case 'comments':
            loadComments();
            break;
        case 'saved':
            loadSaved();
            break;
        case 'upvoted':
            loadUpvoted();
            break;
    }
}

// Load user posts
function loadPosts() {
    if (!profilePostsContainer) return;
    
    if (userPosts.length === 0) {
        profilePostsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit"></i>
                <h3>No posts yet</h3>
                <p>Posts you create will appear here</p>
            </div>
        `;
        return;
    }
    
    profilePostsContainer.innerHTML = userPosts.map(post => `
        <div class="post" data-post-id="${post.id}">
            <div class="post-voting">
                <button class="vote-btn ${post.userVote === 1 ? 'upvoted' : ''}" onclick="votePost(${post.id}, 1)">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <span class="vote-count">${post.upvotes - post.downvotes}</span>
                <button class="vote-btn ${post.userVote === -1 ? 'downvoted' : ''}" onclick="votePost(${post.id}, -1)">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="post-content">
                <div class="post-header">
                    <a href="#" class="post-community">${post.community}</a>
                    <span>•</span>
                    <span>Posted by</span>
                    <a href="#" class="post-author">u/${profileData.username}</a>
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
                    <button class="post-action">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-bookmark"></i>
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load user comments
function loadComments() {
    const commentsContainer = document.querySelector('#comments-tab .comments-container');
    if (!commentsContainer) return;
    
    if (userComments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment"></i>
                <h3>No comments yet</h3>
                <p>Comments you make will appear here</p>
            </div>
        `;
        return;
    }
    
    commentsContainer.innerHTML = userComments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">u/${profileData.username}</span>
                <span class="comment-time">${comment.time}</span>
                <span class="comment-context">on ${comment.community}</span>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
            <div class="comment-actions">
                <button class="comment-action">
                    <i class="fas fa-arrow-up"></i>
                    ${comment.upvotes}
                </button>
                <button class="comment-action">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="comment-action">
                    <i class="fas fa-reply"></i>
                    Reply
                </button>
            </div>
        </div>
    `).join('');
}

// Load saved posts
function loadSaved() {
    const savedContainer = document.querySelector('#saved-tab .saved-container');
    if (!savedContainer) return;
    
    savedContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-bookmark"></i>
            <h3>No saved posts yet</h3>
            <p>Posts you save will appear here</p>
        </div>
    `;
}

// Load upvoted posts
function loadUpvoted() {
    const upvotedContainer = document.querySelector('#upvoted-tab .upvoted-container');
    if (!upvotedContainer) return;
    
    upvotedContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-arrow-up"></i>
            <h3>No upvoted posts yet</h3>
            <p>Posts you upvote will appear here</p>
        </div>
    `;
}

// Vote on post
function votePost(postId, voteType) {
    const post = userPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Remove previous vote
    if (post.userVote === voteType) {
        if (voteType === 1) {
            post.upvotes--;
        } else {
            post.downvotes--;
        }
        post.userVote = 0;
    } else {
        // Remove opposite vote if exists
        if (post.userVote === 1) {
            post.upvotes--;
        } else if (post.userVote === -1) {
            post.downvotes--;
        }
        
        // Add new vote
        if (voteType === 1) {
            post.upvotes++;
        } else {
            post.downvotes++;
        }
        post.userVote = voteType;
    }
    
    loadPosts();
}

// Show comments (placeholder)
function showComments(postId) {
    alert(`Comments for post ${postId} would be displayed here in a real implementation.`);
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
        loadPosts();
        return;
    }
    
    const filteredPosts = userPosts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.community.toLowerCase().includes(query)
    );
    
    if (filteredPosts.length === 0) {
        profilePostsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
    } else {
        profilePostsContainer.innerHTML = filteredPosts.map(post => `
            <div class="post" data-post-id="${post.id}">
                <div class="post-voting">
                    <button class="vote-btn ${post.userVote === 1 ? 'upvoted' : ''}" onclick="votePost(${post.id}, 1)">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="vote-count">${post.upvotes - post.downvotes}</span>
                    <button class="vote-btn ${post.userVote === -1 ? 'downvoted' : ''}" onclick="votePost(${post.id}, -1)">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                <div class="post-content">
                    <div class="post-header">
                        <a href="#" class="post-community">${post.community}</a>
                        <span>•</span>
                        <span>Posted by</span>
                        <a href="#" class="post-author">u/${profileData.username}</a>
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
                        <button class="post-action">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                        <button class="post-action">
                            <i class="fas fa-bookmark"></i>
                            <span>Save</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Update profile stats
function updateProfileStats() {
    // Update karma, posts, and comments count
    const karmaElement = document.querySelector('.stat:nth-child(1) .stat-number');
    const postsElement = document.querySelector('.stat:nth-child(2) .stat-number');
    const commentsElement = document.querySelector('.stat:nth-child(3) .stat-number');
    
    if (karmaElement) karmaElement.textContent = profileData.karma.toLocaleString();
    if (postsElement) postsElement.textContent = profileData.posts;
    if (commentsElement) commentsElement.textContent = profileData.comments;
}

// Navigation functions
function goToHome() {
    window.location.href = 'index.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
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
});

