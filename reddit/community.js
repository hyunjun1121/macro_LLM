// Community Page JavaScript

// Community data
const communityData = {
    name: "programming",
    displayName: "r/programming",
    description: "Computer programming discussion",
    members: "2.1m",
    online: "12.5k",
    created: "Jan 2008",
    icon: "💻",
    rules: [
        "Be respectful",
        "No spam",
        "Use proper tags",
        "Follow reddiquette",
        "No self-promotion"
    ],
    moderators: [
        { name: "programming_mod", avatar: "https://via.placeholder.com/24x24/ff4500/ffffff?text=M" },
        { name: "admin_user", avatar: "https://via.placeholder.com/24x24/ff4500/ffffff?text=A" }
    ],
    related: [
        { name: "webdev", icon: "🌐" },
        { name: "javascript", icon: "⚡" },
        { name: "python", icon: "🐍" }
    ]
};

// Community posts data
const communityPosts = [
    {
        id: 1,
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
        id: 2,
        title: "The future of web development: What to expect in 2024",
        content: "As we move into 2024, web development continues to evolve rapidly. Here are the key trends and technologies that will shape the industry this year.",
        author: "webdev_expert",
        community: "r/programming",
        time: "3 days ago",
        upvotes: 156,
        downvotes: 12,
        comments: 78,
        userVote: 0
    },
    {
        id: 3,
        title: "Building scalable microservices with Docker and Kubernetes",
        content: "A comprehensive guide to building and deploying microservices using Docker containers and Kubernetes orchestration.",
        author: "devops_guru",
        community: "r/programming",
        time: "4 days ago",
        upvotes: 203,
        downvotes: 15,
        comments: 92,
        userVote: 1
    },
    {
        id: 4,
        title: "Functional programming principles every developer should know",
        content: "Understanding functional programming concepts like immutability, pure functions, and higher-order functions can make you a better programmer regardless of your language choice.",
        author: "fp_enthusiast",
        community: "r/programming",
        time: "5 days ago",
        upvotes: 178,
        downvotes: 9,
        comments: 67,
        userVote: 0
    },
    {
        id: 5,
        title: "Code review best practices: How to give and receive feedback",
        content: "Effective code reviews are crucial for maintaining code quality and team collaboration. Here are some best practices for both reviewers and authors.",
        author: "senior_dev",
        community: "r/programming",
        time: "1 week ago",
        upvotes: 134,
        downvotes: 6,
        comments: 54,
        userVote: 1
    }
];

// Current state
let currentTab = 'hot';
let isJoined = false;

// DOM elements
const navTabs = document.querySelectorAll('.nav-tab');
const contentTabs = document.querySelectorAll('.content-tab');
const communityPostsContainer = document.getElementById('communityPostsContainer');
const joinBtn = document.querySelector('.join-btn');

// Initialize the community page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadPosts();
    updateCommunityInfo();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Join/Leave community
    if (joinBtn) {
        joinBtn.addEventListener('click', toggleJoin);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Related communities
    const relatedItems = document.querySelectorAll('.related-item');
    relatedItems.forEach(item => {
        item.addEventListener('click', () => {
            const communityName = item.querySelector('.related-name').textContent;
            navigateToCommunity(communityName);
        });
    });
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
        case 'hot':
            loadPosts();
            break;
        case 'new':
            loadNewPosts();
            break;
        case 'top':
            loadTopPosts();
            break;
        case 'rising':
            loadRisingPosts();
            break;
    }
}

// Load community posts
function loadPosts() {
    if (!communityPostsContainer) return;
    
    if (communityPosts.length === 0) {
        communityPostsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit"></i>
                <h3>No posts yet</h3>
                <p>Be the first to post in this community</p>
            </div>
        `;
        return;
    }
    
    communityPostsContainer.innerHTML = communityPosts.map(post => `
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

// Load new posts
function loadNewPosts() {
    const newTab = document.getElementById('new-tab');
    if (!newTab) return;
    
    newTab.innerHTML = `
        <div class="posts-container">
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <h3>No new posts</h3>
                <p>New posts will appear here</p>
            </div>
        </div>
    `;
}

// Load top posts
function loadTopPosts() {
    const topTab = document.getElementById('top-tab');
    if (!topTab) return;
    
    topTab.innerHTML = `
        <div class="posts-container">
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No top posts</h3>
                <p>Top posts will appear here</p>
            </div>
        </div>
    `;
}

// Load rising posts
function loadRisingPosts() {
    const risingTab = document.getElementById('rising-tab');
    if (!risingTab) return;
    
    risingTab.innerHTML = `
        <div class="posts-container">
            <div class="empty-state">
                <i class="fas fa-arrow-up"></i>
                <h3>No rising posts</h3>
                <p>Rising posts will appear here</p>
            </div>
        </div>
    `;
}

// Vote on post
function votePost(postId, voteType) {
    const post = communityPosts.find(p => p.id === postId);
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

// Toggle join/leave community
function toggleJoin() {
    isJoined = !isJoined;
    
    if (isJoined) {
        joinBtn.innerHTML = '<i class="fas fa-check"></i> Joined';
        joinBtn.classList.add('joined');
    } else {
        joinBtn.innerHTML = '<i class="fas fa-plus"></i> Join';
        joinBtn.classList.remove('joined');
    }
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
        loadPosts();
        return;
    }
    
    const filteredPosts = communityPosts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    );
    
    if (filteredPosts.length === 0) {
        communityPostsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
    } else {
        communityPostsContainer.innerHTML = filteredPosts.map(post => `
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

// Navigate to community
function navigateToCommunity(communityName) {
    alert(`Navigating to r/${communityName} would be implemented here.`);
}

// Update community info
function updateCommunityInfo() {
    // Update community stats
    const membersElement = document.querySelector('.stat:nth-child(1) .stat-number');
    const onlineElement = document.querySelector('.stat:nth-child(2) .stat-number');
    const createdElement = document.querySelector('.stat:nth-child(3) .stat-number');
    
    if (membersElement) membersElement.textContent = communityData.members;
    if (onlineElement) onlineElement.textContent = communityData.online;
    if (createdElement) createdElement.textContent = communityData.created;
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

// Simulate real-time updates
setInterval(() => {
    // Randomly update online count
    if (Math.random() < 0.3) { // 30% chance every interval
        const onlineElement = document.querySelector('.stat:nth-child(2) .stat-number');
        if (onlineElement) {
            const currentOnline = parseInt(onlineElement.textContent.replace('k', '')) * 1000;
            const newOnline = currentOnline + Math.floor(Math.random() * 100) - 50;
            onlineElement.textContent = (newOnline / 1000).toFixed(1) + 'k';
        }
    }
}, 30000); // Update every 30 seconds

