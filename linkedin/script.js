// LinkedIn Clone JavaScript with Full Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

let currentActiveSection = 'home';
let currentConversation = null;

function initializeApp() {
    setupNavigation();
    setupSearch();
    setupPostComposer();
    setupPostActions();
    setupProfileDropdown();
    setupMessaging();
    setupNotifications();
    setupNetworking();
    setupJobs();
    
    // Show home section by default
    showSection('home');
}

// Navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const logo = document.querySelector('.logo');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
            updateActiveNavItem(this);
        });
    });
    
    logo.addEventListener('click', function() {
        showSection('home');
        updateActiveNavItem(document.querySelector('[data-section="home"]'));
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentActiveSection = sectionName;
    }
}

function updateActiveNavItem(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchContainer = document.querySelector('.search-container');
    let searchResults = null;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 1) {
            showSearchResults(query);
        } else {
            hideSearchResults();
        }
    });
    
    searchInput.addEventListener('focus', function() {
        this.style.backgroundColor = '#ffffff';
        if (this.value.trim().length > 1) {
            showSearchResults(this.value.trim());
        }
    });
    
    searchInput.addEventListener('blur', function() {
        setTimeout(() => {
            hideSearchResults();
            if (!this.value) {
                this.style.backgroundColor = '#edf3f8';
            }
        }, 200);
    });
    
    function showSearchResults(query) {
        hideSearchResults();
        
        const results = performSearch(query);
        if (results.people.length === 0 && results.companies.length === 0 && results.posts.length === 0) {
            return;
        }
        
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        
        // People results
        if (results.people.length > 0) {
            const peopleSection = createSearchSection('People', results.people, 'person');
            searchResults.appendChild(peopleSection);
        }
        
        // Company results
        if (results.companies.length > 0) {
            const companiesSection = createSearchSection('Companies', results.companies, 'company');
            searchResults.appendChild(companiesSection);
        }
        
        // Post results
        if (results.posts.length > 0) {
            const postsSection = createSearchSection('Posts', results.posts, 'post');
            searchResults.appendChild(postsSection);
        }
        
        searchContainer.appendChild(searchResults);
    }
    
    function hideSearchResults() {
        if (searchResults) {
            searchResults.remove();
            searchResults = null;
        }
    }
    
    function createSearchSection(title, items, type) {
        const section = document.createElement('div');
        section.className = 'search-category';
        
        const header = document.createElement('h4');
        header.textContent = title;
        section.appendChild(header);
        
        items.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.addEventListener('click', () => handleSearchClick(item, type));
            
            if (type === 'person') {
                resultItem.innerHTML = `
                    <img src="${item.avatar}" alt="${item.name}" class="search-result-avatar">
                    <div class="search-result-info">
                        <h5>${item.name}</h5>
                        <p>${item.title}</p>
                    </div>
                `;
            } else if (type === 'company') {
                resultItem.innerHTML = `
                    <img src="${item.logo}" alt="${item.name}" class="search-result-avatar">
                    <div class="search-result-info">
                        <h5>${item.name}</h5>
                        <p>${item.industry} • ${item.followers} followers</p>
                    </div>
                `;
            } else if (type === 'post') {
                resultItem.innerHTML = `
                    <div class="search-result-info">
                        <h5>Post by ${item.author}</h5>
                        <p>${item.content.substring(0, 60)}...</p>
                    </div>
                `;
            }
            
            section.appendChild(resultItem);
        });
        
        return section;
    }
    
    function performSearch(query) {
        const lowerQuery = query.toLowerCase();
        
        return {
            people: mockData.searchResults.people.filter(person =>
                person.name.toLowerCase().includes(lowerQuery) ||
                person.title.toLowerCase().includes(lowerQuery)
            ),
            companies: mockData.searchResults.companies.filter(company =>
                company.name.toLowerCase().includes(lowerQuery) ||
                company.industry.toLowerCase().includes(lowerQuery)
            ),
            posts: mockData.searchResults.posts.filter(post =>
                post.author.toLowerCase().includes(lowerQuery) ||
                post.content.toLowerCase().includes(lowerQuery)
            )
        };
    }
    
    function handleSearchClick(item, type) {
        console.log('Search result clicked:', item, type);
        // In a real app, this would navigate to the item's profile/page
        hideSearchResults();
        searchInput.value = '';
        searchInput.blur();
    }
}

// Post composer functionality
function setupPostComposer() {
    const composerInput = document.querySelector('.composer-input');
    
    composerInput.addEventListener('click', function() {
        showPostModal();
    });
}

function showPostModal() {
    const modal = document.createElement('div');
    modal.className = 'post-modal-overlay';
    modal.innerHTML = `
        <div class="post-modal">
            <div class="modal-header">
                <h3>Create a post</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-content">
                <div class="composer-profile">
                    <img src="${mockData.currentUser.avatar}" alt="Profile" class="modal-avatar">
                    <span>${mockData.currentUser.name}</span>
                </div>
                <textarea placeholder="What do you want to talk about?" class="modal-textarea"></textarea>
                <div class="modal-actions">
                    <button class="modal-action-btn">
                        <i class="fas fa-image"></i> Photo
                    </button>
                    <button class="modal-action-btn">
                        <i class="fas fa-video"></i> Video
                    </button>
                    <button class="modal-action-btn">
                        <i class="fas fa-calendar"></i> Event
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="post-btn" disabled>Post</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = modal.querySelector('.close-modal');
    const textarea = modal.querySelector('.modal-textarea');
    const postBtn = modal.querySelector('.post-btn');
    
    closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    textarea.addEventListener('input', () => {
        postBtn.disabled = !textarea.value.trim();
    });
    
    postBtn.addEventListener('click', () => {
        if (textarea.value.trim()) {
            createNewPost(textarea.value.trim());
            document.body.removeChild(modal);
        }
    });
    
    textarea.focus();
}

function createNewPost(content) {
    const feed = document.querySelector('.feed');
    const newPostData = {
        id: Date.now(),
        author: {
            name: mockData.currentUser.name,
            title: mockData.currentUser.title,
            avatar: mockData.currentUser.avatar
        },
        content: content,
        likes: 0,
        comments: 0,
        reposts: 0,
        time: "now",
        liked: false
    };
    
    const newPost = createPostElement(newPostData);
    feed.insertBefore(newPost, feed.children[1]);
    
    // Add to mock data
    mockData.posts.unshift(newPostData);
}

function createPostElement(postData) {
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
        <div class="post-header">
            <img src="${postData.author.avatar}" alt="Author" class="post-avatar">
            <div class="post-info">
                <h4>${postData.author.name}</h4>
                <p>${postData.author.title}</p>
                <span class="post-time">${postData.time}</span>
            </div>
            <button class="more-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        <div class="post-content">
            <p>${postData.content}</p>
            ${postData.image ? `<img src="${postData.image}" alt="Post image" class="post-image">` : ''}
            ${postData.poll ? createPollHTML(postData.poll) : ''}
        </div>
        <div class="post-stats">
            <span>👍 ${postData.likes > 0 ? `and ${postData.likes} others` : '0'}</span>
            <span>${postData.comments} comments • ${postData.reposts} reposts</span>
        </div>
        <div class="post-actions">
            <button class="action-btn ${postData.liked ? 'liked' : ''}">
                <i class="${postData.liked ? 'fas' : 'far'} fa-thumbs-up"></i>
                Like
            </button>
            <button class="action-btn">
                <i class="far fa-comment"></i>
                Comment
            </button>
            <button class="action-btn">
                <i class="far fa-share"></i>
                Repost
            </button>
            <button class="action-btn">
                <i class="far fa-paper-plane"></i>
                Send
            </button>
        </div>
    `;
    
    setupPostElementActions(post, postData);
    return post;
}

function createPollHTML(poll) {
    return `
        <div class="post-poll">
            <h5>${poll.question}</h5>
            ${poll.options.map(option => `
                <div class="poll-option">
                    <span>${option.text}</span>
                    <div class="poll-bar" style="width: ${option.percentage}%"></div>
                    <span>${option.percentage}%</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Post actions functionality
function setupPostActions() {
    document.querySelectorAll('.post').forEach(post => {
        const postData = mockData.posts.find(p => p.author.name === post.querySelector('.post-info h4').textContent);
        if (postData) {
            setupPostElementActions(post, postData);
        }
    });
}

function setupPostElementActions(post, postData) {
    const actionBtns = post.querySelectorAll('.post-actions .action-btn');
    const moreBtn = post.querySelector('.more-btn');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handlePostAction(action, this, postData);
        });
    });
    
    moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showPostOptions(this);
    });
}

function handlePostAction(action, button, postData) {
    const post = button.closest('.post');
    
    switch(action) {
        case 'Like':
            toggleLike(button, postData, post);
            break;
        case 'Comment':
            showCommentSection(post);
            break;
        case 'Repost':
            sharePost(postData);
            break;
        case 'Send':
            sendPost(postData);
            break;
    }
}

function toggleLike(button, postData, post) {
    const icon = button.querySelector('i');
    const statsElement = post.querySelector('.post-stats span');
    
    if (postData.liked) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.classList.remove('liked');
        postData.likes--;
        postData.liked = false;
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.classList.add('liked');
        postData.likes++;
        postData.liked = true;
    }
    
    // Update stats display
    const likesText = postData.likes > 0 ? `👍 and ${postData.likes} others` : '👍 0';
    statsElement.textContent = likesText;
}

function showCommentSection(post) {
    let commentSection = post.querySelector('.comment-section');
    
    if (commentSection) {
        commentSection.remove();
        return;
    }
    
    commentSection = document.createElement('div');
    commentSection.className = 'comment-section';
    commentSection.innerHTML = `
        <div class="comment-input-container">
            <img src="${mockData.currentUser.avatar}" alt="Profile" class="comment-avatar">
            <input type="text" placeholder="Add a comment..." class="comment-input">
        </div>
        <div class="comments-list">
            <div class="comment">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" alt="Commenter" class="comment-avatar">
                <div class="comment-content">
                    <span class="comment-author">Sarah Wilson</span>
                    <p>Great insights! Thank you for sharing.</p>
                </div>
            </div>
        </div>
    `;
    
    post.appendChild(commentSection);
    
    const commentInput = commentSection.querySelector('.comment-input');
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && commentInput.value.trim()) {
            addComment(commentSection, commentInput.value.trim());
            commentInput.value = '';
        }
    });
}

function addComment(commentSection, text) {
    const commentsList = commentSection.querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
        <img src="${mockData.currentUser.avatar}" alt="Commenter" class="comment-avatar">
        <div class="comment-content">
            <span class="comment-author">${mockData.currentUser.name}</span>
            <p>${text}</p>
        </div>
    `;
    
    commentsList.appendChild(newComment);
}

function sharePost(postData) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal-overlay';
    shareModal.innerHTML = `
        <div class="share-modal">
            <h3>Share post</h3>
            <div class="share-options">
                <button class="share-option">
                    <i class="fab fa-linkedin"></i>
                    Share on LinkedIn
                </button>
                <button class="share-option">
                    <i class="fas fa-link"></i>
                    Copy link
                </button>
                <button class="share-option">
                    <i class="fas fa-envelope"></i>
                    Send via email
                </button>
            </div>
            <button class="close-share">Close</button>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    shareModal.querySelector('.close-share').addEventListener('click', () => {
        document.body.removeChild(shareModal);
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            document.body.removeChild(shareModal);
        }
    });
}

function sendPost(postData) {
    alert('Messaging feature - would open message composer');
}

function showPostOptions(button) {
    const existingOptions = document.querySelector('.post-options');
    if (existingOptions) {
        existingOptions.remove();
        return;
    }
    
    const options = document.createElement('div');
    options.className = 'post-options';
    options.innerHTML = `
        <div class="option-item">Save post</div>
        <div class="option-item">Copy link</div>
        <div class="option-item">Report post</div>
        <div class="option-item">Unfollow</div>
    `;
    
    button.appendChild(options);
    
    setTimeout(() => {
        document.addEventListener('click', function removeOptions() {
            if (options.parentNode) {
                options.remove();
            }
            document.removeEventListener('click', removeOptions);
        });
    }, 100);
}

// Profile dropdown functionality
function setupProfileDropdown() {
    const profileMenu = document.querySelector('.profile-menu');
    let dropdownOpen = false;

    profileMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleProfileDropdown();
    });

    document.addEventListener('click', function() {
        if (dropdownOpen) {
            closeProfileDropdown();
        }
    });
    
    function toggleProfileDropdown() {
        let dropdown = document.querySelector('.profile-dropdown');
        
        if (dropdown) {
            closeProfileDropdown();
            return;
        }
        
        dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-user-info">
                <img src="${mockData.currentUser.avatar}" alt="Profile">
                <h4>${mockData.currentUser.name}</h4>
                <p>${mockData.currentUser.title}</p>
            </div>
            <div class="dropdown-item">
                <i class="fas fa-user"></i>
                <span>View Profile</span>
            </div>
            <div class="dropdown-item">
                <i class="fas fa-cog"></i>
                <span>Settings & Privacy</span>
            </div>
            <div class="dropdown-item">
                <i class="fas fa-question-circle"></i>
                <span>Help</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sign out</span>
            </div>
        `;
        
        profileMenu.appendChild(dropdown);
        dropdownOpen = true;
    }
    
    function closeProfileDropdown() {
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown) {
            dropdown.remove();
            dropdownOpen = false;
        }
    }
}

// Messaging functionality
function setupMessaging() {
    setupConversationList();
    setupMessageInput();
    
    // Load first conversation by default
    if (mockData.conversations.length > 0) {
        loadConversation(mockData.conversations[0]);
    }
}

function setupConversationList() {
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.conversation-item').forEach(conv => {
                conv.classList.remove('active');
            });
            this.classList.add('active');
            
            const conversation = mockData.conversations[index];
            loadConversation(conversation);
        });
    });
}

function loadConversation(conversation) {
    currentConversation = conversation;
    
    // Update chat header
    const chatHeader = document.querySelector('.chat-header');
    chatHeader.querySelector('.chat-avatar').src = conversation.contact.avatar;
    chatHeader.querySelector('.chat-contact-info h4').textContent = conversation.contact.name;
    chatHeader.querySelector('.chat-contact-info span').textContent = conversation.contact.title;
    
    // Update messages
    const messagesContainer = document.querySelector('.messages-container');
    messagesContainer.innerHTML = '';
    
    conversation.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        
        if (message.sender === 'contact') {
            messageElement.innerHTML = `
                <img src="${conversation.contact.avatar}" alt="Contact" class="message-avatar">
                <div class="message-content">
                    <p>${message.content}</p>
                    <span class="message-timestamp">${message.timestamp}</span>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${message.content}</p>
                    <span class="message-timestamp">${message.timestamp}</span>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setupMessageInput() {
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.btn-send');
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentConversation) return;
        
        // Add message to current conversation
        const newMessage = {
            id: Date.now(),
            content: text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        currentConversation.messages.push(newMessage);
        currentConversation.lastMessage = text;
        currentConversation.time = 'now';
        
        // Update UI
        loadConversation(currentConversation);
        messageInput.value = '';
        
        // Simulate response after a delay
        setTimeout(() => {
            const responses = [
                "Thanks for your message!",
                "That sounds great!",
                "I'll get back to you on that.",
                "Interesting point!",
                "Let me think about it."
            ];
            
            const response = {
                id: Date.now() + 1,
                content: responses[Math.floor(Math.random() * responses.length)],
                sender: 'contact',
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            currentConversation.messages.push(response);
            currentConversation.lastMessage = response.content;
            loadConversation(currentConversation);
        }, 1000 + Math.random() * 2000);
    }
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
}

// Notifications functionality
function setupNotifications() {
    const markAllReadBtn = document.querySelector('.btn-mark-read');
    const notificationItems = document.querySelectorAll('.notification-item');
    
    markAllReadBtn.addEventListener('click', function() {
        notificationItems.forEach(item => {
            item.classList.remove('unread');
        });
        
        // Update notification badges
        document.querySelectorAll('.notification-badge').forEach(badge => {
            if (badge.textContent !== '3' && badge.textContent !== '12') { // Keep messaging and network badges
                badge.style.display = 'none';
            }
        });
    });
    
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            // In a real app, this would navigate to the relevant content
        });
    });
}

// Networking functionality
function setupNetworking() {
    setupConnectionRequests();
    setupPeopleSuggestions();
}

function setupConnectionRequests() {
    const invitationItems = document.querySelectorAll('.invitation-item');
    
    invitationItems.forEach(item => {
        const ignoreBtn = item.querySelector('.btn-ignore');
        const acceptBtn = item.querySelector('.btn-accept');
        
        ignoreBtn.addEventListener('click', function() {
            item.style.opacity = '0.5';
            item.style.pointerEvents = 'none';
            setTimeout(() => {
                item.remove();
                updateInvitationCount(-1);
            }, 300);
        });
        
        acceptBtn.addEventListener('click', function() {
            this.textContent = 'Accepted';
            this.style.backgroundColor = '#10b981';
            ignoreBtn.style.display = 'none';
            setTimeout(() => {
                item.remove();
                updateInvitationCount(-1);
            }, 1000);
        });
    });
}

function setupPeopleSuggestions() {
    const connectBtns = document.querySelectorAll('.btn-connect');
    
    connectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = 'Pending';
            this.style.backgroundColor = '#666';
            this.disabled = true;
        });
    });
}

function updateInvitationCount(change) {
    const invitationHeader = document.querySelector('.network-invitations h3');
    const currentText = invitationHeader.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)[0]);
    const newCount = currentCount + change;
    invitationHeader.textContent = `Invitations (${newCount})`;
    
    // Update nav badge
    const networkBadge = document.querySelector('[data-section="network"] .notification-badge');
    if (networkBadge) {
        networkBadge.textContent = newCount.toString();
    }
}

// Jobs functionality
function setupJobs() {
    setupJobSearch();
    setupJobFilters();
    setupJobCards();
}

function setupJobSearch() {
    const searchBtn = document.querySelector('.btn-search');
    const jobSearchInput = document.querySelector('.job-search-input');
    const locationInput = document.querySelector('.job-location-input');
    
    function performJobSearch() {
        const searchTerm = jobSearchInput.value.toLowerCase();
        const location = locationInput.value.toLowerCase();
        
        let filteredJobs = mockData.jobs;
        
        if (searchTerm) {
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (location) {
            filteredJobs = filteredJobs.filter(job =>
                job.location.toLowerCase().includes(location)
            );
        }
        
        displayJobs(filteredJobs);
    }
    
    searchBtn.addEventListener('click', performJobSearch);
    
    jobSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performJobSearch();
        }
    });
    
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performJobSearch();
        }
    });
}

function setupJobFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.textContent.toLowerCase();
            filterJobs(filter);
        });
    });
}

function filterJobs(filter) {
    let filteredJobs = mockData.jobs;
    
    if (filter !== 'all') {
        if (filter === 'remote') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('Remote'));
        } else {
            // For other filters, you could add more job properties
            filteredJobs = mockData.jobs; // Show all for now
        }
    }
    
    displayJobs(filteredJobs);
}

function displayJobs(jobs) {
    const jobsList = document.querySelector('.jobs-list');
    jobsList.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
        <div class="job-header">
            <img src="${job.logo}" alt="Company" class="company-logo">
            <div class="job-info">
                <h3>${job.title}</h3>
                <p>${job.company}</p>
                <span class="job-location">${job.location}</span>
                <span class="job-posted">${job.posted}</span>
            </div>
            <button class="btn-save">${job.saved ? 'Saved' : 'Save'}</button>
        </div>
        <div class="job-details">
            <p>${job.description}</p>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    const saveBtn = card.querySelector('.btn-save');
    saveBtn.addEventListener('click', function() {
        job.saved = !job.saved;
        this.textContent = job.saved ? 'Saved' : 'Save';
        this.style.backgroundColor = job.saved ? '#10b981' : '';
        this.style.color = job.saved ? 'white' : '';
    });
    
    return card;
}

// Add CSS for modals and additional functionality
const additionalStyles = `
    .post-modal-overlay, .share-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    .post-modal, .share-modal {
        background-color: white;
        border-radius: 8px;
        width: 500px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
    }

    .modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e6e6e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: #000000e6;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
    }

    .close-modal:hover {
        background-color: #f3f2ef;
    }

    .modal-content {
        padding: 20px;
    }

    .composer-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .modal-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
    }

    .modal-textarea {
        width: 100%;
        min-height: 200px;
        border: none;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
        font-family: inherit;
    }

    .modal-textarea:focus {
        outline: none;
    }

    .modal-actions {
        display: flex;
        gap: 16px;
        margin-top: 16px;
    }

    .modal-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: none;
        background: none;
        color: #666;
        font-size: 14px;
        cursor: pointer;
        border-radius: 4px;
    }

    .modal-action-btn:hover {
        background-color: #f3f2ef;
    }

    .modal-footer {
        padding: 16px 20px;
        border-top: 1px solid #e6e6e6;
        text-align: right;
    }

    .post-btn {
        background-color: #0a66c2;
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .post-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .post-btn:not(:disabled):hover {
        background-color: #004182;
    }

    .comment-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e6e6e6;
    }

    .comment-input-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .comment-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .comment-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e6e6e6;
        border-radius: 20px;
        font-size: 14px;
    }

    .comment-input:focus {
        outline: none;
        border-color: #0a66c2;
    }

    .comment {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }

    .comment-content {
        flex: 1;
    }

    .comment-author {
        font-weight: 600;
        font-size: 14px;
        color: #000000e6;
        display: block;
        margin-bottom: 4px;
    }

    .comment-content p {
        font-size: 14px;
        color: #000000e6;
        margin: 0;
    }

    .share-options {
        padding: 20px;
    }

    .share-option {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        text-align: left;
        font-size: 14px;
        color: #000000e6;
        cursor: pointer;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .share-option:hover {
        background-color: #f3f2ef;
    }

    .close-share {
        width: 100%;
        padding: 12px;
        border: none;
        background-color: #f3f2ef;
        color: #000000e6;
        cursor: pointer;
        font-size: 14px;
    }

    .post-options {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 150px;
        z-index: 1000;
        margin-top: 4px;
    }

    .option-item {
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #000000e6;
    }

    .option-item:hover {
        background-color: #f3f2ef;
    }
`;

// Add the additional styles to the page
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);