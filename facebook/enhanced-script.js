// Enhanced Facebook functionality with full interactivity

// Extended sample data
const users = {
    john: {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40/1877f2/ffffff?text=JD',
        status: 'online'
    },
    sarah: {
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/40/e91e63/ffffff?text=SJ',
        status: 'online'
    },
    mike: {
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/40/42b883/ffffff?text=MC',
        status: 'online'
    },
    emma: {
        name: 'Emma Wilson',
        avatar: 'https://via.placeholder.com/40/f39c12/ffffff?text=EW',
        status: 'offline'
    },
    alex: {
        name: 'Alex Rodriguez',
        avatar: 'https://via.placeholder.com/40/9b59b6/ffffff?text=AR',
        status: 'online'
    },
    lisa: {
        name: 'Lisa Park',
        avatar: 'https://via.placeholder.com/40/e74c3c/ffffff?text=LP',
        status: 'offline'
    },
    jun: {
        name: 'Jun Kim',
        avatar: 'https://via.placeholder.com/40/2c3e50/ffffff?text=JK',
        status: 'online'
    }
};

let posts = [
    {
        id: 1,
        author: 'jun',
        time: '30 minutes ago',
        content: 'Today I completed my first marathon! 🏃‍♂️ It took me 4 hours and 23 minutes, but I finally did it. Thank you to everyone who cheered me on along the way. The support meant everything! Next goal: sub-4 hours! 💪',
        image: 'https://via.placeholder.com/500x300/2c3e50/ffffff?text=Marathon+Finish',
        likes: 48,
        comments: [
            { id: 1, author: 'john', content: 'Incredible achievement! So proud of you!', time: '25 minutes ago', likes: 4 },
            { id: 2, author: 'sarah', content: 'Amazing! You\'re an inspiration! 🔥', time: '20 minutes ago', likes: 3 },
            { id: 3, author: 'mike', content: 'Sub-4 next time for sure! Great job!', time: '15 minutes ago', likes: 2 }
        ],
        shares: 8,
        reactions: { like: 32, love: 14, care: 2 },
        userReaction: null
    },
    {
        id: 2,
        author: 'sarah',
        time: '2 hours ago',
        content: 'Just finished an amazing hiking trip! The views were absolutely breathtaking. Nature never fails to inspire me. 🏔️',
        image: 'https://via.placeholder.com/500x300/42b883/ffffff?text=Hiking+Trip',
        likes: 24,
        comments: [
            { id: 1, author: 'mike', content: 'Looks amazing! Where is this?', time: '1 hour ago', likes: 3 },
            { id: 2, author: 'emma', content: 'Beautiful shot! 😍', time: '45 minutes ago', likes: 1 }
        ],
        shares: 3,
        reactions: { like: 15, love: 8, wow: 1 },
        userReaction: null
    },
    {
        id: 3,
        author: 'mike',
        time: '4 hours ago',
        content: 'Excited to share that I just got accepted into the computer science graduate program! Hard work pays off. Thank you to everyone who supported me along the way. 🎓',
        likes: 67,
        comments: [
            { id: 1, author: 'sarah', content: 'Congratulations! Well deserved!', time: '3 hours ago', likes: 5 },
            { id: 2, author: 'alex', content: 'So proud of you man! 🎉', time: '2 hours ago', likes: 2 },
            { id: 3, author: 'lisa', content: 'Amazing news! Celebrate tonight!', time: '1 hour ago', likes: 1 },
            { id: 4, author: 'jun', content: 'Congrats bro! Let\'s celebrate this weekend!', time: '30 minutes ago', likes: 4 }
        ],
        shares: 12,
        reactions: { like: 45, love: 20, care: 2 },
        userReaction: 'love'
    },
    {
        id: 4,
        author: 'emma',
        time: '6 hours ago',
        content: 'Homemade pizza night with the family! Nothing beats quality time together. 🍕',
        image: 'https://via.placeholder.com/500x400/f39c12/ffffff?text=Pizza+Night',
        likes: 45,
        comments: [
            { id: 1, author: 'john', content: 'That looks delicious!', time: '5 hours ago', likes: 2 }
        ],
        shares: 7,
        reactions: { like: 35, love: 8, haha: 2 },
        userReaction: null
    },
    {
        id: 5,
        author: 'jun',
        time: '1 day ago',
        content: 'Started learning Korean traditional cooking from my grandmother today! 👵🏻 Made kimchi jjigae (김치찌개) for the first time and it turned out pretty good! Family recipes are the best. Can\'t wait to master more dishes. 🥢',
        image: 'https://via.placeholder.com/500x400/2c3e50/ffffff?text=Korean+Cooking',
        likes: 38,
        comments: [
            { id: 1, author: 'lisa', content: 'That looks so authentic! Recipe please?', time: '23 hours ago', likes: 5 },
            { id: 2, author: 'alex', content: 'Your grandma is the best teacher! 😊', time: '20 hours ago', likes: 3 },
            { id: 3, author: 'emma', content: 'I love Korean food! Teach me sometime!', time: '18 hours ago', likes: 2 }
        ],
        shares: 4,
        reactions: { like: 28, love: 9, haha: 1 },
        userReaction: null
    }
];

let stories = [
    { id: 1, author: 'jun', image: 'https://via.placeholder.com/120x200/2c3e50/ffffff?text=Jun', viewed: false },
    { id: 2, author: 'sarah', image: 'https://via.placeholder.com/120x200/42b883/ffffff?text=Sarah', viewed: false },
    { id: 3, author: 'mike', image: 'https://via.placeholder.com/120x200/e91e63/ffffff?text=Mike', viewed: true },
    { id: 4, author: 'emma', image: 'https://via.placeholder.com/120x200/f39c12/ffffff?text=Emma', viewed: false }
];

let currentPostId = null;
let currentStoryFile = null;
let uploadedMedia = [];

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced script loading...');
    
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        try {
            loadEnhancedPosts();
            setupEnhancedEventListeners();
            setupEnhancedSearch();
            loadStories();
            console.log('Enhanced Facebook features loaded successfully!');
        } catch (error) {
            console.error('Error loading enhanced features:', error);
        }
    }, 100);
});

function setupEnhancedEventListeners() {
    // Enhanced post creation
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.addEventListener('click', openPostModal);
    }
    
    // Story creation
    const createStory = document.querySelector('.create-story');
    if (createStory) {
        createStory.addEventListener('click', openStoryModal);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Enhanced search with filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleEnhancedSearch);
        searchInput.addEventListener('focus', showSearchFilters);
    }
    
    // Navigation event listeners
    setupNavigationListeners();
}

function setupNavigationListeners() {
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

    // Notifications
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', toggleNotifications);
    }

    // Messages
    const messagesBtn = document.getElementById('messagesBtn');
    if (messagesBtn) {
        messagesBtn.addEventListener('click', toggleMessages);
    }

    // Profile menu
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.addEventListener('click', toggleProfileDropdown);
    }

    // Contact items for chat
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.user;
            if (userId) {
                openEnhancedChat(userId);
            }
        });
    });

    // Close panels when clicking outside
    document.addEventListener('click', closeOpenPanels);
}

// POST CREATION FUNCTIONALITY
function openPostModal() {
    document.getElementById('postModal').style.display = 'block';
    document.getElementById('postText').focus();
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('postText').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    uploadedMedia = [];
    updatePostButton();
}

function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

function triggerVideoUpload() {
    document.getElementById('videoUpload').click();
}

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedMedia.push({
                    type: 'image',
                    src: e.target.result,
                    file: file
                });
                updateMediaPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedMedia.push({
                type: 'video',
                src: e.target.result,
                file: file
            });
            updateMediaPreview();
        };
        reader.readAsDataURL(file);
    }
}

function updateMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = uploadedMedia.map((media, index) => `
        <div class="media-item">
            ${media.type === 'image' 
                ? `<img src="${media.src}" alt="Upload preview">` 
                : `<video src="${media.src}" controls></video>`}
            <button class="media-remove" onclick="removeMedia(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    updatePostButton();
}

function removeMedia(index) {
    uploadedMedia.splice(index, 1);
    updateMediaPreview();
}

function updatePostButton() {
    const postText = document.getElementById('postText');
    const submitBtn = document.getElementById('postSubmitBtn');
    
    if (!postText || !submitBtn) return;
    
    const hasContent = postText.value.trim().length > 0 || uploadedMedia.length > 0;
    
    submitBtn.disabled = !hasContent;
    submitBtn.style.background = hasContent ? '#1877f2' : '#e4e6ea';
}

function submitPost() {
    const postText = document.getElementById('postText').value.trim();
    const privacy = document.getElementById('postPrivacy').value;
    
    if (postText.length === 0 && uploadedMedia.length === 0) return;
    
    const newPost = {
        id: posts.length + 1,
        author: 'john',
        time: 'Just now',
        content: postText,
        image: uploadedMedia.length > 0 ? uploadedMedia[0].src : null,
        likes: 0,
        comments: [],
        shares: 0,
        reactions: {},
        userReaction: null,
        privacy: privacy
    };
    
    posts.unshift(newPost);
    loadEnhancedPosts();
    closePostModal();

    // Save data immediately
    saveDataToStorage();

    // Show success message
    showNotification('Post created successfully!', 'success');
}

// STORY FUNCTIONALITY
function openStoryModal() {
    document.getElementById('storyModal').style.display = 'block';
}

function closeStoryModal() {
    document.getElementById('storyModal').style.display = 'none';
    document.getElementById('storyPreview').innerHTML = '';
    document.getElementById('storySubmitBtn').disabled = true;
    currentStoryFile = null;
}

function triggerStoryUpload() {
    document.getElementById('storyUpload').click();
}

function handleStoryUpload(event) {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        currentStoryFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('storyPreview');
            preview.innerHTML = file.type.startsWith('image/') 
                ? `<img src="${e.target.result}" alt="Story preview">`
                : `<video src="${e.target.result}" controls></video>`;
            document.getElementById('storySubmitBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

function submitStory() {
    if (!currentStoryFile) return;
    
    const newStory = {
        id: stories.length + 1,
        author: 'john',
        image: 'https://via.placeholder.com/120x200/1877f2/ffffff?text=Your+Story',
        viewed: false
    };
    
    stories.unshift(newStory);
    loadStories();
    closeStoryModal();

    // Save data immediately
    saveDataToStorage();

    showNotification('Story shared successfully!', 'success');
}

// ENHANCED POST DISPLAY
function loadEnhancedPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = posts.map(post => createEnhancedPostHTML(post)).join('');
}

function createEnhancedPostHTML(post) {
    const user = users[post.author];
    const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);
    const commentsCount = post.comments ? post.comments.length : 0;
    
    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="post-author-info">
                    <h4>${user.name}</h4>
                    <div class="post-time">${post.time} · ${getPrivacyIcon(post.privacy)}</div>
                </div>
                <div class="post-menu" onclick="showPostMenu(${post.id})">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-media" onclick="openImageModal('${post.image}')">` : ''}
            </div>
            <div class="post-stats">
                <div class="post-likes" onclick="showReactionsList(${post.id})">
                    ${getReactionIcons(post.reactions)}
                    ${totalReactions > 0 ? `${totalReactions}` : ''}
                </div>
                <div class="post-comments-shares" onclick="openComments(${post.id})">
                    ${commentsCount > 0 ? `${commentsCount} comments` : ''} ${post.shares > 0 ? `· ${post.shares} shares` : ''}
                </div>
            </div>
            <div class="post-actions">
                <div class="post-action ${post.userReaction ? 'reacted ' + post.userReaction : ''}" 
                     onmouseenter="showReactionsPicker(event, ${post.id})" 
                     onmouseleave="hideReactionsPicker()"
                     onclick="toggleReaction(${post.id}, 'like')">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${post.userReaction ? capitalizeFirst(post.userReaction) : 'Like'}</span>
                </div>
                <div class="post-action" onclick="openComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </div>
                <div class="post-action" onclick="openShareModal(${post.id})">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
    `;
}

function getPrivacyIcon(privacy) {
    const icons = {
        public: '🌍 Public',
        friends: '👥 Friends',
        private: '🔒 Only me'
    };
    return icons[privacy] || '👥 Friends';
}

function getReactionIcons(reactions) {
    if (!reactions || Object.keys(reactions).length === 0) return '';
    
    const reactionIcons = {
        like: '👍',
        love: '❤️',
        care: '🤗',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
    };
    
    return Object.keys(reactions)
        .filter(reaction => reactions[reaction] > 0)
        .slice(0, 3)
        .map(reaction => reactionIcons[reaction])
        .join('');
}

// REACTIONS SYSTEM
let reactionTimer;

function showReactionsPicker(event, postId) {
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => {
        const picker = document.getElementById('reactionsPicker');
        const rect = event.currentTarget.getBoundingClientRect();
        
        picker.style.left = rect.left + 'px';
        picker.style.top = rect.top - 60 + 'px';
        picker.style.display = 'flex';
        picker.dataset.postId = postId;
    }, 500);
}

function hideReactionsPicker() {
    clearTimeout(reactionTimer);
    setTimeout(() => {
        document.getElementById('reactionsPicker').style.display = 'none';
    }, 100);
}

function selectReaction(reaction) {
    const picker = document.getElementById('reactionsPicker');
    const postId = parseInt(picker.dataset.postId);
    toggleReaction(postId, reaction);
    hideReactionsPicker();
}

function toggleReaction(postId, reaction) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Remove previous reaction
    if (post.userReaction) {
        post.reactions[post.userReaction] = Math.max(0, (post.reactions[post.userReaction] || 0) - 1);
    }
    
    // Add new reaction or remove if same
    if (post.userReaction === reaction) {
        post.userReaction = null;
    } else {
        post.userReaction = reaction;
        post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
    }

    // Save data immediately
    saveDataToStorage();

    loadEnhancedPosts();
}

// COMMENTS SYSTEM
function openComments(postId) {
    currentPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const modal = document.getElementById('commentsModal');
    const container = document.getElementById('commentsContainer');
    
    container.innerHTML = post.comments.map(comment => createCommentHTML(comment)).join('');
    modal.style.display = 'block';
}

function closeCommentsModal() {
    document.getElementById('commentsModal').style.display = 'none';
    currentPostId = null;
}

function createCommentHTML(comment) {
    const user = users[comment.author];
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="comment-content">
                <div class="comment-bubble">
                    <div class="comment-author">${user.name}</div>
                    <div class="comment-text">${comment.content}</div>
                </div>
                <div class="comment-actions">
                    <span class="comment-action" onclick="likeComment(${comment.id})">
                        Like ${comment.likes > 0 ? `(${comment.likes})` : ''}
                    </span>
                    <span class="comment-action" onclick="replyToComment(${comment.id})">Reply</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
            </div>
        </div>
    `;
}

function handleCommentKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitComment();
    }
}

function submitComment() {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (!content || !currentPostId) return;
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    const newComment = {
        id: (post.comments.length + 1),
        author: 'john',
        content: content,
        time: 'Just now',
        likes: 0
    };
    
    post.comments.push(newComment);
    input.value = '';
    
    // Refresh comments display
    const container = document.getElementById('commentsContainer');
    container.innerHTML = post.comments.map(comment => createCommentHTML(comment)).join('');
    container.scrollTop = container.scrollHeight;

    // Save data immediately
    saveDataToStorage();

    // Update post display
    loadEnhancedPosts();
}

function likeComment(commentId) {
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    const comment = post.comments.find(c => c.id === commentId);
    if (comment) {
        comment.likes = (comment.likes || 0) + 1;
        openComments(currentPostId); // Refresh
    }
}

// SHARING FUNCTIONALITY
function openShareModal(postId) {
    const modal = document.getElementById('shareModal');
    modal.dataset.postId = postId;
    modal.style.display = 'block';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function shareToTimeline() {
    const modal = document.getElementById('shareModal');
    const postId = parseInt(modal.dataset.postId);
    const originalPost = posts.find(p => p.id === postId);
    
    if (originalPost) {
        const sharedPost = {
            id: posts.length + 1,
            author: 'john',
            time: 'Just now',
            content: 'Shared a post',
            sharedPost: originalPost,
            likes: 0,
            comments: [],
            shares: 0,
            reactions: {},
            userReaction: null
        };
        
        posts.unshift(sharedPost);
        originalPost.shares++;
        loadEnhancedPosts();
        closeShareModal();
        showNotification('Post shared to your timeline!', 'success');
    }
}

function shareToStory() {
    closeShareModal();
    showNotification('Post shared to your story!', 'success');
}

function sendInMessage() {
    closeShareModal();
    showNotification('Post sent in message!', 'success');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href + '#post-' + document.getElementById('shareModal').dataset.postId);
    closeShareModal();
    showNotification('Link copied to clipboard!', 'success');
}

// ENHANCED SEARCH FUNCTIONALITY
function setupEnhancedSearch() {
    const searchInput = document.getElementById('searchInput');
    
    // Create search filters container
    const filtersHTML = `
        <div class="search-filters" id="searchFilters">
            <div class="search-filter-section">
                <h4>Filter by type</h4>
                <div class="search-filter-options">
                    <button class="search-filter-option active" data-filter="all">All</button>
                    <button class="search-filter-option" data-filter="people">People</button>
                    <button class="search-filter-option" data-filter="posts">Posts</button>
                    <button class="search-filter-option" data-filter="pages">Pages</button>
                    <button class="search-filter-option" data-filter="groups">Groups</button>
                </div>
            </div>
            <div class="search-filter-section">
                <h4>Posted by</h4>
                <div class="search-filter-options">
                    <button class="search-filter-option active" data-filter="anyone">Anyone</button>
                    <button class="search-filter-option" data-filter="friends">Friends</button>
                    <button class="search-filter-option" data-filter="me">You</button>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.search-bar').insertAdjacentHTML('afterend', filtersHTML);
    
    // Setup filter event listeners
    document.querySelectorAll('.search-filter-option').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const section = e.target.closest('.search-filter-section');
            section.querySelectorAll('.search-filter-option').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            handleEnhancedSearch();
        });
    });
}

function showSearchFilters() {
    const filters = document.getElementById('searchFilters');
    if (filters) {
        filters.style.display = 'block';
    }
}

function handleEnhancedSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    
    if (query.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    const typeFilter = document.querySelector('.search-filter-option.active[data-filter]')?.dataset.filter || 'all';
    const authorFilter = document.querySelectorAll('.search-filter-option.active')[1]?.dataset.filter || 'anyone';
    
    const results = performAdvancedSearch(query, typeFilter, authorFilter);
    displaySearchResults(results, query);
    searchResults.style.display = 'block';
}

function performAdvancedSearch(query, typeFilter, authorFilter) {
    let results = [];
    
    // Search people
    if (typeFilter === 'all' || typeFilter === 'people') {
        Object.entries(users).forEach(([id, user]) => {
            if (user.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'person',
                    id: id,
                    name: user.name,
                    subtitle: 'Friend',
                    avatar: user.avatar,
                    relevance: user.name.toLowerCase().indexOf(query)
                });
            }
        });
    }
    
    // Search posts
    if (typeFilter === 'all' || typeFilter === 'posts') {
        posts.forEach(post => {
            if (post.content.toLowerCase().includes(query)) {
                const author = users[post.author];
                if (authorFilter === 'anyone' || 
                    (authorFilter === 'friends' && post.author !== 'john') ||
                    (authorFilter === 'me' && post.author === 'john')) {
                    results.push({
                        type: 'post',
                        id: post.id,
                        name: `Post by ${author.name}`,
                        subtitle: post.content.substring(0, 50) + '...',
                        avatar: author.avatar,
                        relevance: post.content.toLowerCase().indexOf(query)
                    });
                }
            }
        });
    }
    
    // Sort by relevance
    return results.sort((a, b) => a.relevance - b.relevance);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="advanced-search-results">
                <p style="padding: 16px; text-align: center; color: #65676b;">No results found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    const groupedResults = results.reduce((groups, result) => {
        if (!groups[result.type]) groups[result.type] = [];
        groups[result.type].push(result);
        return groups;
    }, {});
    
    searchResults.innerHTML = `
        <div class="advanced-search-results">
            ${Object.entries(groupedResults).map(([type, items]) => `
                <div class="search-result-section">
                    <h3>${capitalizeFirst(type)}${type === 'person' ? 's' : type === 'post' ? 's' : ''}</h3>
                    ${items.map(item => `
                        <div class="search-result-item" onclick="selectSearchResult('${item.type}', '${item.id}', '${item.name}')">
                            <img src="${item.avatar}" alt="${item.name}">
                            <div class="search-result-info">
                                <div class="search-result-name">${highlightQuery(item.name, query)}</div>
                                <div class="search-result-subtitle">${highlightQuery(item.subtitle, query)}</div>
                            </div>
                            <i class="fas fa-${item.type === 'person' ? 'user' : item.type === 'post' ? 'file-alt' : 'flag'}"></i>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

function highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function selectSearchResult(type, id, name) {
    console.log(`Selected ${type}: ${id} - ${name}`);
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
    
    if (type === 'post') {
        // Scroll to post
        const postElement = document.querySelector(`[data-post-id="${id}"]`);
        if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postElement.style.outline = '2px solid #1877f2';
            setTimeout(() => {
                postElement.style.outline = '';
            }, 2000);
        }
    } else if (type === 'person') {
        navigateToPage('profile', name);
    }
}

// UTILITY FUNCTIONS
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#42b883' : type === 'error' ? '#e74c3c' : '#1877f2'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function closeAllModals() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('storyModal').style.display = 'none';
    document.getElementById('commentsModal').style.display = 'none';
    document.getElementById('shareModal').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
}

function loadStories() {
    const storiesSection = document.querySelector('.stories-section');
    const storyElements = stories.map(story => {
        const user = users[story.author];
        return `
            <div class="story ${story.viewed ? 'viewed' : ''}" onclick="viewStory(${story.id})">
                <img src="${story.image}" alt="Story">
                <div class="story-author">
                    <img src="${user.avatar}" alt="${user.name}">
                    <span>${user.name}</span>
                </div>
            </div>
        `;
    }).join('');
    
    storiesSection.innerHTML = `
        <div class="story create-story" onclick="openStoryModal()">
            <i class="fas fa-plus"></i>
            <span>Create Story</span>
        </div>
        ${storyElements}
    `;
}

function viewStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (story) {
        story.viewed = true;
        loadStories();
        showNotification('Viewing story...', 'info');
    }
}

// Auto-update post text button state
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'postText') {
        updatePostButton();
    }
});

// Handle post text changes
function setupPostTextListener() {
    const postText = document.getElementById('postText');
    if (postText) {
        postText.addEventListener('input', updatePostButton);
        postText.addEventListener('keyup', updatePostButton);
    }
}

// Data persistence functions
function saveDataToStorage() {
    try {
        localStorage.setItem('fbPosts', JSON.stringify(posts));
        localStorage.setItem('fbStories', JSON.stringify(stories));
        localStorage.setItem('fbLastSaved', new Date().toISOString());
    } catch (error) {
        console.warn('Failed to save data to localStorage:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedPosts = localStorage.getItem('fbPosts');
        const savedStories = localStorage.getItem('fbStories');

        if (savedPosts) {
            posts = JSON.parse(savedPosts);
        }

        if (savedStories) {
            stories = JSON.parse(savedStories);
        }

        console.log('Data loaded from localStorage');
    } catch (error) {
        console.warn('Failed to load data from localStorage:', error);
    }
}

// Auto-save data every 30 seconds
setInterval(saveDataToStorage, 30000);

// Save data before page unload
window.addEventListener('beforeunload', saveDataToStorage);

// Update user interface with current user data
function updateUIWithUserData() {
    const userData = JSON.parse(localStorage.getItem('fbDemoUser') || '{}');

    if (userData.name) {
        // Update navigation
        const navUserName = document.getElementById('navUserName');
        if (navUserName) navUserName.textContent = userData.name;

        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName) sidebarUserName.textContent = userData.name;

        // Update post input placeholder
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.placeholder = `What's on your mind, ${userData.name.split(' ')[0]}?`;
        }
    }

    if (userData.avatar) {
        // Update profile pictures
        const navProfilePic = document.getElementById('navProfilePic');
        if (navProfilePic) navProfilePic.src = userData.avatar;

        const sidebarProfilePic = document.getElementById('sidebarProfilePic');
        if (sidebarProfilePic) sidebarProfilePic.src = userData.avatar;
    }
}

// Initialize everything when page loads
window.addEventListener('load', function() {
    console.log('Enhanced Facebook functionality loaded!');

    // Load saved data first
    loadDataFromStorage();

    // Update UI with user data
    updateUIWithUserData();

    // Setup additional listeners that might need DOM to be fully loaded
    setTimeout(() => {
        setupPostTextListener();
    }, 200);
});

// Export functions for global access
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.submitPost = submitPost;
window.triggerImageUpload = triggerImageUpload;
window.triggerVideoUpload = triggerVideoUpload;
window.handleImageUpload = handleImageUpload;
window.handleVideoUpload = handleVideoUpload;
window.removeMedia = removeMedia;
window.addFeeling = function() { showNotification('Feeling selector opened!', 'info'); };
window.addLocation = function() { showNotification('Location selector opened!', 'info'); };
window.tagFriends = function() { showNotification('Friend tagger opened!', 'info'); };

window.openStoryModal = openStoryModal;
window.closeStoryModal = closeStoryModal;
window.triggerStoryUpload = triggerStoryUpload;
window.handleStoryUpload = handleStoryUpload;
window.submitStory = submitStory;

window.openComments = openComments;
window.closeCommentsModal = closeCommentsModal;
window.handleCommentKeyPress = handleCommentKeyPress;
window.submitComment = submitComment;

window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.shareToTimeline = shareToTimeline;
window.shareToStory = shareToStory;
window.sendInMessage = sendInMessage;
window.copyLink = copyLink;

window.showReactionsPicker = showReactionsPicker;
window.hideReactionsPicker = hideReactionsPicker;
window.selectReaction = selectReaction;
window.toggleReaction = toggleReaction;

// Missing functions implementation
function closeCommentsModal() {
    document.getElementById('commentsModal').style.display = 'none';
    currentPostId = null;
}

function handleCommentKeyPress(event) {
    if (event.key === 'Enter') {
        submitComment();
    }
}

function createCommentHTML(comment) {
    const user = users[comment.author];
    return `
        <div class="comment">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="comment-content">
                <div class="comment-header">
                    <h4>${user.name}</h4>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <p>${comment.content}</p>
                <div class="comment-actions">
                    <button onclick="likeComment(${comment.id})">
                        <i class="fas fa-thumbs-up"></i> ${comment.likes || 0}
                    </button>
                    <button onclick="replyToComment(${comment.id})">
                        Reply
                    </button>
                </div>
            </div>
        </div>
    `;
}

function replyToComment(commentId) {
    showNotification('Reply feature coming soon!', 'info');
}

function addFeeling() {
    const feelings = ['😊 Happy', '😢 Sad', '😍 Loved', '😄 Excited', '😤 Angry', '🤔 Thoughtful'];
    const selectedFeeling = feelings[Math.floor(Math.random() * feelings.length)];
    const postText = document.getElementById('postText');
    if (postText) {
        postText.value += ` — feeling ${selectedFeeling}`;
        updatePostButton();
    }
    showNotification('Feeling added!', 'success');
}

function addLocation() {
    const locations = ['📍 New York, NY', '📍 San Francisco, CA', '📍 Los Angeles, CA', '📍 Chicago, IL'];
    const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
    const postText = document.getElementById('postText');
    if (postText) {
        postText.value += ` — at ${selectedLocation}`;
        updatePostButton();
    }
    showNotification('Location added!', 'success');
}

function tagFriends() {
    const userNames = Object.values(users).map(u => u.name).filter(name => name !== 'John Doe');
    const randomFriend = userNames[Math.floor(Math.random() * userNames.length)];
    const postText = document.getElementById('postText');
    if (postText) {
        postText.value += ` — with ${randomFriend}`;
        updatePostButton();
    }
    showNotification('Friend tagged!', 'success');
}

// Additional function exports for compatibility
window.openPostCreator = openPostModal;
window.showComments = openComments;
window.sharePost = openShareModal;
window.closeCommentsModal = closeCommentsModal;
window.handleCommentKeyPress = handleCommentKeyPress;
window.replyToComment = replyToComment;
window.addFeeling = addFeeling;
window.addLocation = addLocation;
window.tagFriends = tagFriends;