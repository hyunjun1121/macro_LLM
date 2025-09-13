// Sample data for posts, users, and interactions
const users = {
    john: {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40'
    },
    sarah: {
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/40'
    },
    mike: {
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/40'
    },
    emma: {
        name: 'Emma Wilson',
        avatar: 'https://via.placeholder.com/40'
    },
    alex: {
        name: 'Alex Rodriguez',
        avatar: 'https://via.placeholder.com/40'
    },
    lisa: {
        name: 'Lisa Park',
        avatar: 'https://via.placeholder.com/40'
    }
};

const samplePosts = [
    {
        id: 1,
        author: 'sarah',
        time: '2 hours ago',
        content: 'Just finished an amazing hiking trip! The views were absolutely breathtaking. Nature never fails to inspire me. 🏔️',
        image: 'https://via.placeholder.com/500x300',
        likes: 24,
        comments: 8,
        shares: 3,
        liked: false
    },
    {
        id: 2,
        author: 'mike',
        time: '4 hours ago',
        content: 'Excited to share that I just got accepted into the computer science graduate program! Hard work pays off. Thank you to everyone who supported me along the way.',
        likes: 67,
        comments: 15,
        shares: 12,
        liked: true
    },
    {
        id: 3,
        author: 'emma',
        time: '6 hours ago',
        content: 'Homemade pizza night with the family! Nothing beats quality time together. 🍕',
        image: 'https://via.placeholder.com/500x400',
        likes: 45,
        comments: 12,
        shares: 7,
        liked: false
    },
    {
        id: 4,
        author: 'alex',
        time: '1 day ago',
        content: 'Beautiful sunset from my balcony tonight. Sometimes the best moments are right at home.',
        image: 'https://via.placeholder.com/500x350',
        likes: 89,
        comments: 23,
        shares: 18,
        liked: true
    },
    {
        id: 5,
        author: 'lisa',
        time: '1 day ago',
        content: 'Starting a new book today: "The Power of Habit" by Charles Duhigg. Anyone else read it? Would love to hear your thoughts!',
        likes: 32,
        comments: 19,
        shares: 5,
        liked: false
    }
];

const searchResults = [
    { type: 'person', name: 'Sarah Johnson', subtitle: 'Friend', avatar: 'https://via.placeholder.com/36' },
    { type: 'person', name: 'Mike Chen', subtitle: 'Friend', avatar: 'https://via.placeholder.com/36' },
    { type: 'person', name: 'Emma Wilson', subtitle: 'Friend', avatar: 'https://via.placeholder.com/36' },
    { type: 'page', name: 'Programming Tips', subtitle: 'Technology', avatar: 'https://via.placeholder.com/36' },
    { type: 'group', name: 'Web Developers', subtitle: '1.2k members', avatar: 'https://via.placeholder.com/36' }
];

const notifications = [
    {
        id: 1,
        user: 'sarah',
        type: 'like',
        content: 'Sarah Johnson liked your post',
        time: '5 minutes ago',
        read: false
    },
    {
        id: 2,
        user: 'mike',
        type: 'comment',
        content: 'Mike Chen commented on your post: "Great job!"',
        time: '1 hour ago',
        read: false
    },
    {
        id: 3,
        user: 'emma',
        type: 'share',
        content: 'Emma Wilson shared your post',
        time: '2 hours ago',
        read: true
    },
    {
        id: 4,
        user: 'alex',
        type: 'tag',
        content: 'Alex Rodriguez tagged you in a post',
        time: '3 hours ago',
        read: true
    },
    {
        id: 5,
        user: 'lisa',
        type: 'friend',
        content: 'Lisa Park sent you a friend request',
        time: '1 day ago',
        read: false
    }
];

const messages = [
    {
        id: 1,
        user: 'sarah',
        content: 'Hey! How are you doing?',
        time: '10 minutes ago',
        read: false
    },
    {
        id: 2,
        user: 'mike',
        content: 'Thanks for the help with the project!',
        time: '1 hour ago',
        read: false
    },
    {
        id: 3,
        user: 'emma',
        content: 'Are we still on for lunch tomorrow?',
        time: '3 hours ago',
        read: true
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Facebook...');
    loadPosts();
    setupEventListeners();
    setupSearch();
    
    // Initialize enhanced features if available
    if (typeof loadEnhancedPosts === 'function') {
        console.log('Enhanced features available');
    }
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-icon[data-page]').forEach(icon => {
        icon.addEventListener('click', () => {
            const page = icon.dataset.page;
            navigateToPage(page);
        });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // Post creation
    document.getElementById('postInput').addEventListener('click', openPostCreator);

    // Notifications
    document.getElementById('notificationsBtn').addEventListener('click', toggleNotifications);

    // Messages
    document.getElementById('messagesBtn').addEventListener('click', toggleMessages);

    // Profile menu
    document.getElementById('profileMenu').addEventListener('click', toggleProfileDropdown);

    // Contact items for chat
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.user;
            openChat(userId);
        });
    });

    // Close panels when clicking outside
    document.addEventListener('click', closeOpenPanels);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length > 0) {
            showSearchResults(query);
        } else {
            hideSearchResults();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            showSearchResults(searchInput.value.toLowerCase().trim());
        }
    });
}

function showSearchResults(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    const filteredResults = searchResults.filter(result => 
        result.name.toLowerCase().includes(query)
    );

    if (filteredResults.length > 0) {
        searchDropdown.innerHTML = filteredResults.map(result => `
            <div class="search-result-item" onclick="selectSearchResult('${result.type}', '${result.name}')">
                <img src="${result.avatar}" alt="${result.name}">
                <div class="search-result-info">
                    <div class="search-result-name">${result.name}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
                <i class="fas fa-${result.type === 'person' ? 'user' : result.type === 'page' ? 'flag' : 'users'}"></i>
            </div>
        `).join('');
        searchDropdown.style.display = 'block';
    } else {
        hideSearchResults();
    }
}

function hideSearchResults() {
    document.getElementById('searchDropdown').style.display = 'none';
}

function selectSearchResult(type, name) {
    console.log(`Selected ${type}: ${name}`);
    hideSearchResults();
    document.getElementById('searchInput').value = '';
    
    // Navigate to the selected result
    if (type === 'person') {
        navigateToPage('profile', name);
    } else if (type === 'page') {
        navigateToPage('page', name);
    } else if (type === 'group') {
        navigateToPage('group', name);
    }
}

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = samplePosts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    const user = users[post.author];
    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="post-author-info">
                    <h4>${user.name}</h4>
                    <div class="post-time">${post.time}</div>
                </div>
                <div class="post-menu">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-media">` : ''}
            </div>
            <div class="post-stats">
                <div class="post-likes">
                    <i class="fas fa-thumbs-up"></i>
                    ${post.likes} people like this
                </div>
                <div class="post-comments-shares">
                    ${post.comments} comments · ${post.shares} shares
                </div>
            </div>
            <div class="post-actions">
                <div class="post-action ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <i class="fas fa-thumbs-up"></i>
                    <span>Like</span>
                </div>
                <div class="post-action" onclick="showComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </div>
                <div class="post-action" onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
    `;
}

function toggleLike(postId) {
    const post = samplePosts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        const likeAction = postElement.querySelector('.post-action');
        const likesCount = postElement.querySelector('.post-likes');
        
        likeAction.classList.toggle('liked', post.liked);
        likesCount.innerHTML = `<i class="fas fa-thumbs-up"></i> ${post.likes} people like this`;
    }
}

function showComments(postId) {
    console.log(`Show comments for post ${postId}`);
    // Implementation for showing comments
}

function sharePost(postId) {
    console.log(`Share post ${postId}`);
    // Implementation for sharing posts
}

function navigateToPage(page, data = null) {
    console.log(`Navigating to ${page}`, data);
    
    // Update active navigation
    document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    const activeIcon = document.querySelector(`[data-page="${page}"]`);
    if (activeIcon) {
        activeIcon.classList.add('active');
    }
    
    // Load page content
    const mainContent = document.getElementById('mainContent');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }
    
    try {
        switch (page) {
            case 'home':
                loadHomePage();
                break;
            case 'watch':
                loadWatchPage();
                break;
            case 'marketplace':
                if (typeof loadMarketplacePage === 'function') {
                    loadMarketplacePage();
                } else {
                    loadMarketplacePageFallback();
                }
                break;
            case 'groups':
                if (typeof loadGroupsPage === 'function') {
                    loadGroupsPage();
                } else {
                    loadGroupsPageFallback();
                }
                break;
            case 'gaming':
                loadGamingPage();
                break;
            case 'profile':
                loadProfilePage(data);
                break;
            case 'friends':
                if (typeof loadFriendsPage === 'function') {
                    loadFriendsPage();
                } else {
                    loadFriendsPageFallback();
                }
                break;
            case 'events':
                if (typeof loadEventsPage === 'function') {
                    loadEventsPage();
                } else {
                    loadEventsPageFallback();
                }
                break;
            case 'memories':
                loadMemoriesPage();
                break;
            case 'saved':
                loadSavedPage();
                break;
            case 'pages':
                loadPagesPage();
                break;
            case 'jobs':
                loadJobsPage();
                break;
            default:
                console.log(`Page ${page} not implemented yet`);
                loadHomePage(); // Default to home
        }
    } catch (error) {
        console.error(`Error loading page ${page}:`, error);
        loadHomePage(); // Fallback to home page
    }
}

function loadHomePage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="stories-section">
            <div class="story create-story">
                <i class="fas fa-plus"></i>
                <span>Create Story</span>
            </div>
            <div class="story">
                <img src="https://via.placeholder.com/120x200" alt="Story">
                <div class="story-author">
                    <img src="https://via.placeholder.com/40" alt="Author">
                    <span>Sarah Johnson</span>
                </div>
            </div>
            <div class="story">
                <img src="https://via.placeholder.com/120x200" alt="Story">
                <div class="story-author">
                    <img src="https://via.placeholder.com/40" alt="Author">
                    <span>Mike Chen</span>
                </div>
            </div>
            <div class="story">
                <img src="https://via.placeholder.com/120x200" alt="Story">
                <div class="story-author">
                    <img src="https://via.placeholder.com/40" alt="Author">
                    <span>Emma Wilson</span>
                </div>
            </div>
        </div>

        <div class="post-creator">
            <div class="post-creator-top">
                <img src="https://via.placeholder.com/40" alt="Profile">
                <input type="text" id="postInput" placeholder="What's on your mind, John?">
            </div>
            <div class="post-creator-options">
                <div class="post-option">
                    <i class="fas fa-video" style="color: #f3425f;"></i>
                    <span>Live Video</span>
                </div>
                <div class="post-option">
                    <i class="fas fa-images" style="color: #45bd62;"></i>
                    <span>Photo/Video</span>
                </div>
                <div class="post-option">
                    <i class="fas fa-smile" style="color: #f7b928;"></i>
                    <span>Feeling/Activity</span>
                </div>
            </div>
        </div>

        <div class="posts-container" id="postsContainer">
            <!-- Posts will be loaded here -->
        </div>
    `;
    
    loadPosts();
    document.getElementById('postInput').addEventListener('click', openPostCreator);
}

function loadWatchPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>Watch</h1>
        </div>
        <div class="watch-content">
            <div class="video-grid">
                <div class="video-item">
                    <img src="https://via.placeholder.com/320x180" alt="Video thumbnail">
                    <div class="video-info">
                        <h3>Amazing Nature Documentary</h3>
                        <p>Discovery Channel • 1.2M views • 2 days ago</p>
                    </div>
                </div>
                <div class="video-item">
                    <img src="https://via.placeholder.com/320x180" alt="Video thumbnail">
                    <div class="video-info">
                        <h3>Cooking Tutorial</h3>
                        <p>Chef's Kitchen • 850K views • 1 week ago</p>
                    </div>
                </div>
                <div class="video-item">
                    <img src="https://via.placeholder.com/320x180" alt="Video thumbnail">
                    <div class="video-info">
                        <h3>Tech Review 2024</h3>
                        <p>TechReview • 2.1M views • 3 days ago</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadMarketplacePage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>Marketplace</h1>
        </div>
        <div class="marketplace-content">
            <div class="marketplace-filters">
                <button class="filter-btn active">All</button>
                <button class="filter-btn">Electronics</button>
                <button class="filter-btn">Clothing</button>
                <button class="filter-btn">Home & Garden</button>
                <button class="filter-btn">Vehicles</button>
            </div>
            <div class="marketplace-grid">
                <div class="marketplace-item">
                    <img src="https://via.placeholder.com/200x150" alt="Product">
                    <div class="item-info">
                        <h3>iPhone 14 Pro</h3>
                        <p class="price">$899</p>
                        <p class="location">New York, NY</p>
                    </div>
                </div>
                <div class="marketplace-item">
                    <img src="https://via.placeholder.com/200x150" alt="Product">
                    <div class="item-info">
                        <h3>MacBook Air M2</h3>
                        <p class="price">$1,199</p>
                        <p class="location">San Francisco, CA</p>
                    </div>
                </div>
                <div class="marketplace-item">
                    <img src="https://via.placeholder.com/200x150" alt="Product">
                    <div class="item-info">
                        <h3>Gaming Chair</h3>
                        <p class="price">$299</p>
                        <p class="location">Los Angeles, CA</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadGroupsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>Groups</h1>
        </div>
        <div class="groups-content">
            <div class="groups-sidebar">
                <h3>Your Groups</h3>
                <div class="group-item">
                    <img src="https://via.placeholder.com/40" alt="Group">
                    <span>Web Developers</span>
                </div>
                <div class="group-item">
                    <img src="https://via.placeholder.com/40" alt="Group">
                    <span>Photography Club</span>
                </div>
                <div class="group-item">
                    <img src="https://via.placeholder.com/40" alt="Group">
                    <span>Book Lovers</span>
                </div>
            </div>
            <div class="groups-feed">
                <div class="group-post">
                    <div class="post-header">
                        <img src="https://via.placeholder.com/40" alt="User">
                        <div class="post-info">
                            <h4>Sarah Johnson</h4>
                            <p>Posted in Web Developers</p>
                        </div>
                    </div>
                    <div class="post-content">
                        <p>Check out this amazing new CSS feature!</p>
                        <img src="https://via.placeholder.com/400x200" alt="Post image">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadGamingPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>Gaming</h1>
        </div>
        <div class="gaming-content">
            <div class="game-categories">
                <div class="game-category">
                    <img src="https://via.placeholder.com/100x100" alt="Game">
                    <h3>Action Games</h3>
                </div>
                <div class="game-category">
                    <img src="https://via.placeholder.com/100x100" alt="Game">
                    <h3>Strategy Games</h3>
                </div>
                <div class="game-category">
                    <img src="https://via.placeholder.com/100x100" alt="Game">
                    <h3>Puzzle Games</h3>
                </div>
            </div>
            <div class="gaming-feed">
                <div class="game-post">
                    <div class="post-header">
                        <img src="https://via.placeholder.com/40" alt="User">
                        <div class="post-info">
                            <h4>Mike Chen</h4>
                            <p>achieved a new high score!</p>
                        </div>
                    </div>
                    <div class="game-achievement">
                        <img src="https://via.placeholder.com/300x150" alt="Game screenshot">
                        <p>Score: 125,400 points in Puzzle Master</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Fallback functions for when additional features aren't loaded
function loadMarketplacePageFallback() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Marketplace</h1>
            <p>Marketplace features are loading...</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>iPhone 14 Pro - Like New</h3>
                    <p style="color: #1877f2; font-weight: bold; font-size: 18px;">$899</p>
                    <p style="color: #65676b;">New York, NY</p>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>MacBook Air M2</h3>
                    <p style="color: #1877f2; font-weight: bold; font-size: 18px;">$1,199</p>
                    <p style="color: #65676b;">San Francisco, CA</p>
                </div>
            </div>
        </div>
    `;
}

function loadGroupsPageFallback() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Groups</h1>
            <p>Groups features are loading...</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>Web Developers</h3>
                    <p style="color: #65676b;">1,247 members • Public group</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Viewing group...', 'info')">View Group</button>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>Photography Enthusiasts</h3>
                    <p style="color: #65676b;">892 members • Public group</p>
                    <button style="background: #42b883; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Joined group!', 'success')">Join Group</button>
                </div>
            </div>
        </div>
    `;
}

function loadFriendsPageFallback() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Friends</h1>
            <p>Friends features are loading...</p>
            <div style="margin-top: 20px;">
                ${Object.entries(users).filter(([id]) => id !== 'john').map(([id, user]) => `
                    <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <img src="${user.avatar}" style="width: 60px; height: 60px; border-radius: 8px;" alt="${user.name}">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0;">${user.name}</h4>
                            <p style="color: #65676b; font-size: 14px; margin: 0;">${user.status === 'online' ? '🟢 Active now' : '⚫ Last seen recently'}</p>
                        </div>
                        <button style="background: #e4e6ea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="openChat('${id}')">Message</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function loadEventsPageFallback() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Events</h1>
            <p>Events features are loading...</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>🎉 Tech Meetup 2024</h3>
                    <p style="color: #65676b; margin: 8px 0;">December 15, 2024 at 6:00 PM</p>
                    <p style="color: #65676b; margin: 8px 0;">📍 Tech Hub, Downtown</p>
                    <div style="margin-top: 12px;">
                        <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px;" onclick="showNotification('RSVP: Going!', 'success')">Going</button>
                        <button style="background: #42b883; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('RSVP: Interested!', 'info')">Interested</button>
                    </div>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>📸 Photography Workshop</h3>
                    <p style="color: #65676b; margin: 8px 0;">December 20, 2024 at 2:00 PM</p>
                    <p style="color: #65676b; margin: 8px 0;">📍 Art Studio, City Center</p>
                    <div style="margin-top: 12px;">
                        <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px;" onclick="showNotification('RSVP: Going!', 'success')">Going</button>
                        <button style="background: #42b883; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('RSVP: Interested!', 'info')">Interested</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadMemoriesPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Memories</h1>
            <p>Look back on this day in previous years</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>📅 On This Day - 2 years ago</h3>
                    <p style="margin: 12px 0;">You shared a photo from your graduation ceremony!</p>
                    <img src="https://via.placeholder.com/400x200/1877f2/ffffff?text=Graduation+Memory" style="width: 100%; border-radius: 8px; margin: 12px 0;">
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Memory shared!', 'success')">Share Memory</button>
                </div>
            </div>
        </div>
    `;
}

function loadSavedPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Saved</h1>
            <p>Items you've saved to view later</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>💾 Programming Tutorial</h3>
                    <p style="color: #65676b;">Saved from Code Academy</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Opening saved item...', 'info')">View</button>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>🎬 Interesting Video</h3>
                    <p style="color: #65676b;">Saved from Watch</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Opening saved item...', 'info')">View</button>
                </div>
            </div>
        </div>
    `;
}

function loadPagesPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Pages</h1>
            <p>Pages you manage and follow</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>📱 Tech Company</h3>
                    <p style="color: #65676b;">1,234 followers • Technology</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Managing page...', 'info')">Manage</button>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>🍕 Local Restaurant</h3>
                    <p style="color: #65676b;">567 followers • Restaurant</p>
                    <button style="background: #42b883; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Following page!', 'success')">Follow</button>
                </div>
            </div>
        </div>
    `;
}

function loadJobsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-loading">
            <h1>Jobs</h1>
            <p>Find your next opportunity</p>
            <div style="margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>💼 Frontend Developer</h3>
                    <p style="color: #65676b;">TechCorp • San Francisco, CA</p>
                    <p style="color: #65676b; font-size: 14px;">$80,000 - $120,000 per year</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Application sent!', 'success')">Apply</button>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <h3>🎨 UI/UX Designer</h3>
                    <p style="color: #65676b;">Design Studio • New York, NY</p>
                    <p style="color: #65676b; font-size: 14px;">$70,000 - $100,000 per year</p>
                    <button style="background: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="showNotification('Application sent!', 'success')">Apply</button>
                </div>
            </div>
        </div>
    `;
}

function loadProfilePage(userName) {
    const mainContent = document.getElementById('mainContent');
    const user = Object.values(users).find(u => u.name === userName) || users.john;
    
    mainContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-cover">
                <img src="https://via.placeholder.com/820x312" alt="Cover photo">
            </div>
            <div class="profile-info">
                <img src="${user.avatar}" alt="Profile picture" class="profile-picture">
                <div class="profile-details">
                    <h1>${user.name}</h1>
                    <p>Software Developer at TechCorp</p>
                    <div class="profile-stats">
                        <span>1,234 friends</span>
                        <span>567 followers</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn-primary">Add Friend</button>
                    <button class="btn-secondary">Message</button>
                </div>
            </div>
        </div>
        <div class="profile-content">
            <div class="profile-posts">
                <h3>Posts</h3>
                <div class="post">
                    <div class="post-header">
                        <img src="${user.avatar}" alt="${user.name}">
                        <div class="post-author-info">
                            <h4>${user.name}</h4>
                            <div class="post-time">2 hours ago</div>
                        </div>
                    </div>
                    <div class="post-content">
                        <div class="post-text">Excited to share my latest project! Been working on this for months.</div>
                        <img src="https://via.placeholder.com/500x300" alt="Post image" class="post-media">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadFriendsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>Friends</h1>
        </div>
        <div class="friends-content">
            <div class="friends-tabs">
                <button class="tab-btn active">All Friends</button>
                <button class="tab-btn">Recently Added</button>
                <button class="tab-btn">Birthdays</button>
                <button class="tab-btn">Custom Lists</button>
            </div>
            <div class="friends-grid">
                ${Object.entries(users).map(([key, user]) => `
                    <div class="friend-card">
                        <img src="${user.avatar}" alt="${user.name}">
                        <h4>${user.name}</h4>
                        <div class="friend-actions">
                            <button class="btn-secondary">Message</button>
                            <button class="btn-secondary">Unfriend</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function openPostCreator() {
    console.log('Opening post creator modal');
    // Implementation for post creation modal
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    const isVisible = panel.style.display === 'block';
    
    closeAllPanels();
    
    if (!isVisible) {
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Notifications</h3>
            </div>
            <div class="panel-content">
                ${notifications.map(notification => `
                    <div class="notification-item ${notification.read ? '' : 'unread'}">
                        <img src="${users[notification.user].avatar}" alt="${users[notification.user].name}">
                        <div class="notification-content">
                            <p>${notification.content}</p>
                        </div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
        panel.style.display = 'block';
    }
}

function toggleMessages() {
    const panel = document.getElementById('messagesPanel');
    const isVisible = panel.style.display === 'block';
    
    closeAllPanels();
    
    if (!isVisible) {
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Messages</h3>
            </div>
            <div class="panel-content">
                ${messages.map(message => `
                    <div class="message-item ${message.read ? '' : 'unread'}" onclick="openChat('${message.user}')">
                        <img src="${users[message.user].avatar}" alt="${users[message.user].name}">
                        <div class="message-content">
                            <h4>${users[message.user].name}</h4>
                            <p>${message.content}</p>
                        </div>
                        <div class="message-time">${message.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
        panel.style.display = 'block';
    }
}

function toggleProfileDropdown() {
    console.log('Toggling profile dropdown');
    
    // Remove existing dropdown
    const existing = document.querySelector('.profile-dropdown');
    if (existing) {
        existing.remove();
        return;
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid #e4e6ea; display: flex; align-items: center; gap: 12px; cursor: pointer;" onclick="navigateToPage('profile'); this.closest('.profile-dropdown').remove();">
            <img src="https://via.placeholder.com/40/1877f2/ffffff?text=JD" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%;">
            <div>
                <h4 style="margin: 0; font-size: 16px;">John Doe</h4>
                <p style="margin: 0; color: #65676b; font-size: 14px;">See your profile</p>
            </div>
        </div>
        <div style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px;" onclick="openEditProfileModal(); this.closest('.profile-dropdown').remove();">
            <i class="fas fa-user-edit" style="width: 20px; color: #65676b;"></i>
            <span>Edit Profile</span>
        </div>
        <div style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px;" onclick="showNotification('Settings opened!', 'info'); this.closest('.profile-dropdown').remove();">
            <i class="fas fa-cog" style="width: 20px; color: #65676b;"></i>
            <span>Settings & Privacy</span>
        </div>
        <div style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px;" onclick="showNotification('Help opened!', 'info'); this.closest('.profile-dropdown').remove();">
            <i class="fas fa-question-circle" style="width: 20px; color: #65676b;"></i>
            <span>Help & Support</span>
        </div>
        <div style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px;" onclick="logoutUser(); this.closest('.profile-dropdown').remove();">
            <i class="fas fa-sign-out-alt" style="width: 20px; color: #65676b;"></i>
            <span>Log Out</span>
        </div>
    `;
    
    // Position and show dropdown
    dropdown.style.cssText = `
        position: absolute;
        top: 60px;
        right: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        padding: 8px 0;
        min-width: 260px;
        z-index: 1001;
        font-size: 15px;
    `;
    
    document.body.appendChild(dropdown);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (dropdown.parentNode) {
            dropdown.remove();
        }
    }, 10000);
}

function openChat(userId) {
    const chatWindows = document.getElementById('chatWindows');
    const existingChat = document.getElementById(`chat-${userId}`);
    
    if (existingChat) {
        existingChat.style.display = 'flex';
        return;
    }
    
    const user = users[userId];
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.id = `chat-${userId}`;
    
    chatWindow.innerHTML = `
        <div class="chat-header">
            <img src="${user.avatar}" alt="${user.name}">
            <span>${user.name}</span>
            <div class="chat-controls">
                <button class="chat-btn" onclick="minimizeChat('${userId}')">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="chat-btn" onclick="closeChat('${userId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="chat-messages" id="messages-${userId}">
            <div class="chat-message received">Hey there! How are you doing?</div>
            <div class="chat-message sent">I'm doing great! How about you?</div>
            <div class="chat-message received">Same here! Just working on some projects.</div>
        </div>
        <div class="chat-input">
            <input type="text" placeholder="Type a message..." onkeypress="handleChatInput(event, '${userId}')">
            <button class="chat-send-btn" onclick="sendMessage('${userId}')">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    chatWindows.appendChild(chatWindow);
    closeAllPanels();
}

function closeChat(userId) {
    const chatWindow = document.getElementById(`chat-${userId}`);
    if (chatWindow) {
        chatWindow.remove();
    }
}

function minimizeChat(userId) {
    const chatWindow = document.getElementById(`chat-${userId}`);
    if (chatWindow) {
        chatWindow.style.display = 'none';
    }
}

function handleChatInput(event, userId) {
    if (event.key === 'Enter') {
        sendMessage(userId);
    }
}

function sendMessage(userId) {
    const input = document.querySelector(`#chat-${userId} .chat-input input`);
    const messagesContainer = document.getElementById(`messages-${userId}`);
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message sent';
        messageDiv.textContent = input.value;
        messagesContainer.appendChild(messageDiv);
        
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Simulate response
        setTimeout(() => {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'chat-message received';
            responseDiv.textContent = 'Thanks for the message!';
            messagesContainer.appendChild(responseDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

function closeAllPanels() {
    document.getElementById('notificationsPanel').style.display = 'none';
    document.getElementById('messagesPanel').style.display = 'none';
    document.getElementById('profileDropdown').style.display = 'none';
    hideSearchResults();
}

function closeOpenPanels(event) {
    if (!event || !event.target) return;
    
    const clickedElement = event.target;
    const isNotificationBtn = clickedElement.closest('#notificationsBtn');
    const isMessageBtn = clickedElement.closest('#messagesBtn');
    const isProfileBtn = clickedElement.closest('#profileMenu');
    const isSearchBar = clickedElement.closest('.search-bar');
    const isPanel = clickedElement.closest('.notifications-panel, .messages-panel, .profile-dropdown, .search-dropdown, .search-results');
    
    if (!isNotificationBtn && !isMessageBtn && !isProfileBtn && !isSearchBar && !isPanel) {
        closeAllPanels();
    }
}

// Add search result styles
const searchStyles = `
    .search-result-item {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .search-result-item:hover {
        background-color: #f0f2f5;
    }
    
    .search-result-item img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 12px;
    }
    
    .search-result-info {
        flex: 1;
    }
    
    .search-result-name {
        font-weight: 600;
        color: #050505;
    }
    
    .search-result-subtitle {
        font-size: 13px;
        color: #65676b;
    }
    
    .search-result-item i {
        color: #65676b;
    }
`;

// Add styles to document
const styleElement = document.createElement('style');
styleElement.textContent = searchStyles;
document.head.appendChild(styleElement);

// Logout functionality
function logoutUser() {
    // Clear user data
    localStorage.removeItem('fbDemoUser');

    // Show logout message
    showNotification('Logged out successfully!', 'success');

    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.fb-notification');
    existingNotifications.forEach(notif => notif.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `fb-notification fb-notification-${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#42b883' : type === 'error' ? '#e74c3c' : '#1877f2'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#fb-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'fb-notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Edit Profile functionality
function openEditProfileModal() {
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('fbDemoUser') || '{}');

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 24px; border-bottom: 1px solid #dadde1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 24px;">Edit Profile</h2>
                    <button onclick="this.closest('.edit-profile-modal').remove()"
                            style="background: #e4e6ea; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 18px;">×</button>
                </div>
            </div>

            <div style="padding: 24px;">
                <form id="editProfileForm">
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px;">Profile Picture</h3>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <img id="profilePicturePreview" src="${userData.avatar || 'https://via.placeholder.com/80/1877f2/ffffff?text=U'}"
                                 alt="Profile" style="width: 80px; height: 80px; border-radius: 50%;">
                            <button type="button" onclick="triggerProfilePictureUpload()"
                                    style="background: #1877f2; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer;">
                                Change Photo
                            </button>
                        </div>
                        <input type="file" id="profilePictureUpload" accept="image/*" style="display: none;" onchange="handleProfilePictureUpload(event)">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Name</label>
                        <input type="text" id="profileName" value="${userData.name || ''}"
                               style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Email</label>
                        <input type="email" id="profileEmail" value="${userData.email || ''}"
                               style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Bio</label>
                        <textarea id="profileBio" placeholder="Tell people a little about yourself..."
                                  style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px; min-height: 80px; resize: vertical;">${userData.bio || ''}</textarea>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Location</label>
                        <input type="text" id="profileLocation" value="${userData.location || ''}" placeholder="City, State"
                               style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Work</label>
                        <input type="text" id="profileWork" value="${userData.work || ''}" placeholder="Company or Organization"
                               style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Education</label>
                        <input type="text" id="profileEducation" value="${userData.education || ''}" placeholder="School or University"
                               style="width: 100%; padding: 12px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px;">
                    </div>
                </form>
            </div>

            <div style="padding: 0 24px 24px 24px; display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="this.closest('.edit-profile-modal').remove()"
                        style="background: #e4e6ea; color: #1c1e21; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-weight: 500;">
                    Cancel
                </button>
                <button onclick="saveProfileChanges()"
                        style="background: #1877f2; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-weight: 500;">
                    Save Changes
                </button>
            </div>
        </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

function triggerProfilePictureUpload() {
    document.getElementById('profilePictureUpload').click();
}

function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profilePicturePreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges() {
    const userData = JSON.parse(localStorage.getItem('fbDemoUser') || '{}');

    // Get form values
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const bio = document.getElementById('profileBio').value.trim();
    const location = document.getElementById('profileLocation').value.trim();
    const work = document.getElementById('profileWork').value.trim();
    const education = document.getElementById('profileEducation').value.trim();
    const avatar = document.getElementById('profilePicturePreview').src;

    if (!name || !email) {
        showNotification('Name and email are required', 'error');
        return;
    }

    // Update user data
    const updatedUserData = {
        ...userData,
        name: name,
        email: email,
        bio: bio,
        location: location,
        work: work,
        education: education,
        avatar: avatar,
        lastUpdated: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('fbDemoUser', JSON.stringify(updatedUserData));

    // Close modal
    document.querySelector('.edit-profile-modal').remove();

    // Show success message
    showNotification('Profile updated successfully!', 'success');

    // Update UI elements that show user info
    updateUserInfoInUI(updatedUserData);
}

function updateUserInfoInUI(userData) {
    // Update profile menu name
    const profileMenus = document.querySelectorAll('#profileMenu span');
    profileMenus.forEach(menu => {
        if (menu.textContent.includes('John Doe')) {
            menu.textContent = userData.name;
        }
    });

    // Update post creator placeholder
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.placeholder = `What's on your mind, ${userData.name.split(' ')[0]}?`;
    }

    // Update any displayed avatars
    const avatars = document.querySelectorAll('img[alt="Profile"]');
    avatars.forEach(avatar => {
        if (avatar.src.includes('placeholder')) {
            avatar.src = userData.avatar;
        }
    });
}

// Make functions globally available
window.logoutUser = logoutUser;
window.showNotification = showNotification;
window.openEditProfileModal = openEditProfileModal;
window.triggerProfilePictureUpload = triggerProfilePictureUpload;
window.handleProfilePictureUpload = handleProfilePictureUpload;
window.saveProfileChanges = saveProfileChanges;