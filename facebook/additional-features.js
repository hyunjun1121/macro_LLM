// Additional Facebook features - Friends, Groups, Events, Marketplace, Enhanced Messaging

// Extended data structures
let friendRequests = [
    { id: 1, from: 'alex', message: 'Hi! We met at the conference last week.', time: '2 hours ago', status: 'pending' },
    { id: 2, from: 'lisa', message: 'Found you through Sarah. Hope we can connect!', time: '1 day ago', status: 'pending' }
];

let groups = [
    {
        id: 1,
        name: 'Web Developers',
        description: 'A community for web developers to share knowledge and network',
        members: 1247,
        privacy: 'public',
        avatar: 'https://via.placeholder.com/80/1877f2/ffffff?text=WD',
        joined: true,
        posts: [
            { id: 1, author: 'sarah', content: 'Check out this amazing new CSS feature!', time: '3 hours ago', likes: 15 }
        ]
    },
    {
        id: 2,
        name: 'Photography Enthusiasts',
        description: 'Share your best shots and get feedback from fellow photographers',
        members: 892,
        privacy: 'public',
        avatar: 'https://via.placeholder.com/80/e91e63/ffffff?text=PE',
        joined: false,
        posts: []
    }
];

let events = [
    {
        id: 1,
        name: 'Tech Meetup 2024',
        description: 'Join us for an evening of networking and tech talks',
        date: '2024-12-15',
        time: '18:00',
        location: 'Tech Hub, Downtown',
        attendees: 45,
        interested: 23,
        userStatus: 'going',
        organizer: 'mike',
        cover: 'https://via.placeholder.com/400x200/1877f2/ffffff?text=Tech+Meetup'
    },
    {
        id: 2,
        name: 'Photography Workshop',
        description: 'Learn advanced photography techniques from professionals',
        date: '2024-12-20',
        time: '14:00',
        location: 'Art Studio, City Center',
        attendees: 12,
        interested: 8,
        userStatus: 'interested',
        organizer: 'emma',
        cover: 'https://via.placeholder.com/400x200/e91e63/ffffff?text=Photo+Workshop'
    }
];

let marketplaceItems = [
    {
        id: 1,
        title: 'iPhone 14 Pro - Like New',
        price: 899,
        description: 'Barely used iPhone 14 Pro in excellent condition. Includes original box and charger.',
        images: ['https://via.placeholder.com/300x300/1877f2/ffffff?text=iPhone'],
        location: 'New York, NY',
        seller: 'alex',
        posted: '2 days ago',
        category: 'Electronics',
        condition: 'Like New'
    },
    {
        id: 2,
        title: 'MacBook Air M2',
        price: 1199,
        description: '2023 MacBook Air with M2 chip. Perfect for students and professionals.',
        images: ['https://via.placeholder.com/300x300/42b883/ffffff?text=MacBook'],
        location: 'San Francisco, CA',
        seller: 'sarah',
        posted: '1 week ago',
        category: 'Electronics',
        condition: 'Excellent'
    }
];

let chatMessages = {
    sarah: [
        { id: 1, sender: 'sarah', content: 'Hey! How are you doing?', time: '10:30 AM', type: 'text' },
        { id: 2, sender: 'john', content: 'I\'m doing great! How about you?', time: '10:32 AM', type: 'text' },
        { id: 3, sender: 'sarah', content: 'Same here! Just working on some projects.', time: '10:35 AM', type: 'text' }
    ],
    mike: [
        { id: 1, sender: 'mike', content: 'Thanks for the help with the project!', time: '2:15 PM', type: 'text' },
        { id: 2, sender: 'john', content: 'No problem! Happy to help.', time: '2:17 PM', type: 'text' }
    ],
    jun: [
        { id: 1, sender: 'jun', content: 'Just finished my marathon! 🏃‍♂️', time: '3:45 PM', type: 'text' },
        { id: 2, sender: 'john', content: 'Wow! Congratulations! How was it?', time: '3:46 PM', type: 'text' },
        { id: 3, sender: 'jun', content: 'It was incredible! Tough but so rewarding. Thanks for all your support!', time: '3:48 PM', type: 'text' },
        { id: 4, sender: 'john', content: 'You deserve it! Let\'s celebrate this weekend!', time: '3:50 PM', type: 'text' },
        { id: 5, sender: 'jun', content: 'Sounds great! I know a good Korean BBQ place 😄', time: '3:51 PM', type: 'text' }
    ]
};

// FRIEND REQUEST SYSTEM
function loadFriendsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="friends-page">
            <div class="friends-header">
                <h1>Friends</h1>
                <div class="friends-tabs">
                    <button class="friends-tab active" data-tab="requests">Friend Requests</button>
                    <button class="friends-tab" data-tab="suggestions">Suggestions</button>
                    <button class="friends-tab" data-tab="all">All Friends</button>
                </div>
            </div>
            
            <div class="friends-content">
                <div class="friends-section" id="friendRequests">
                    <h3>Friend Requests</h3>
                    <div class="friend-requests-list">
                        ${friendRequests.map(request => createFriendRequestHTML(request)).join('')}
                    </div>
                </div>
                
                <div class="friends-section hidden" id="friendSuggestions">
                    <h3>People You May Know</h3>
                    <div class="friend-suggestions-list">
                        ${createFriendSuggestionsHTML()}
                    </div>
                </div>
                
                <div class="friends-section hidden" id="allFriends">
                    <h3>All Friends</h3>
                    <div class="all-friends-list">
                        ${Object.entries(users).filter(([id]) => id !== 'john').map(([id, user]) => 
                            createFriendHTML(id, user)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setupFriendsTabHandlers();
}

function createFriendRequestHTML(request) {
    const user = users[request.from];
    return `
        <div class="friend-request-card" data-request-id="${request.id}">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="friend-request-info">
                <h4>${user.name}</h4>
                <p class="request-message">${request.message}</p>
                <p class="request-time">${request.time}</p>
                <div class="friend-request-actions">
                    <button class="btn-primary" onclick="acceptFriendRequest(${request.id})">Accept</button>
                    <button class="btn-secondary" onclick="declineFriendRequest(${request.id})">Decline</button>
                </div>
            </div>
        </div>
    `;
}

function createFriendSuggestionsHTML() {
    const suggestions = [
        { id: 'new1', name: 'David Kim', avatar: 'https://via.placeholder.com/80/3498db/ffffff?text=DK', mutualFriends: 3 },
        { id: 'new2', name: 'Maria Garcia', avatar: 'https://via.placeholder.com/80/9b59b6/ffffff?text=MG', mutualFriends: 5 }
    ];
    
    return suggestions.map(suggestion => `
        <div class="friend-suggestion-card">
            <img src="${suggestion.avatar}" alt="${suggestion.name}">
            <div class="friend-suggestion-info">
                <h4>${suggestion.name}</h4>
                <p>${suggestion.mutualFriends} mutual friends</p>
                <div class="friend-suggestion-actions">
                    <button class="btn-primary" onclick="sendFriendRequest('${suggestion.id}')">Add Friend</button>
                    <button class="btn-secondary" onclick="removeSuggestion('${suggestion.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function createFriendHTML(id, user) {
    return `
        <div class="friend-card">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="friend-info">
                <h4>${user.name}</h4>
                <div class="friend-actions">
                    <button class="btn-secondary" onclick="openChat('${id}')">Message</button>
                    <button class="btn-secondary" onclick="unfriend('${id}')">Unfriend</button>
                </div>
            </div>
        </div>
    `;
}

function setupFriendsTabHandlers() {
    document.querySelectorAll('.friends-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.friends-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.friends-section').forEach(s => s.classList.add('hidden'));
            
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            
            if (tabName === 'requests') {
                document.getElementById('friendRequests').classList.remove('hidden');
            } else if (tabName === 'suggestions') {
                document.getElementById('friendSuggestions').classList.remove('hidden');
            } else if (tabName === 'all') {
                document.getElementById('allFriends').classList.remove('hidden');
            }
        });
    });
}

function acceptFriendRequest(requestId) {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
        friendRequests = friendRequests.filter(r => r.id !== requestId);
        showNotification(`You are now friends with ${users[request.from].name}!`, 'success');
        loadFriendsPage();
    }
}

function declineFriendRequest(requestId) {
    friendRequests = friendRequests.filter(r => r.id !== requestId);
    showNotification('Friend request declined.', 'info');
    loadFriendsPage();
}

function sendFriendRequest(userId) {
    showNotification('Friend request sent!', 'success');
}

// GROUPS FUNCTIONALITY
function loadGroupsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="groups-page">
            <div class="groups-header">
                <h1>Groups</h1>
                <button class="btn-primary" onclick="createGroup()">Create Group</button>
            </div>
            
            <div class="groups-tabs">
                <button class="groups-tab active" data-tab="your">Your Groups</button>
                <button class="groups-tab" data-tab="discover">Discover</button>
            </div>
            
            <div class="groups-content">
                <div class="groups-section" id="yourGroups">
                    <div class="groups-list">
                        ${groups.filter(g => g.joined).map(group => createGroupHTML(group)).join('')}
                    </div>
                </div>
                
                <div class="groups-section hidden" id="discoverGroups">
                    <div class="groups-list">
                        ${groups.filter(g => !g.joined).map(group => createGroupHTML(group)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setupGroupsTabHandlers();
}

function createGroupHTML(group) {
    return `
        <div class="group-card" onclick="openGroup(${group.id})">
            <img src="${group.avatar}" alt="${group.name}">
            <div class="group-info">
                <h3>${group.name}</h3>
                <p class="group-description">${group.description}</p>
                <p class="group-stats">${group.members} members · ${group.privacy}</p>
                <div class="group-actions">
                    ${group.joined 
                        ? `<button class="btn-secondary" onclick="leaveGroup(${group.id}); event.stopPropagation();">Leave Group</button>`
                        : `<button class="btn-primary" onclick="joinGroup(${group.id}); event.stopPropagation();">Join Group</button>`
                    }
                </div>
            </div>
        </div>
    `;
}

function setupGroupsTabHandlers() {
    document.querySelectorAll('.groups-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.groups-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.groups-section').forEach(s => s.classList.add('hidden'));
            
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            
            if (tabName === 'your') {
                document.getElementById('yourGroups').classList.remove('hidden');
            } else if (tabName === 'discover') {
                document.getElementById('discoverGroups').classList.remove('hidden');
            }
        });
    });
}

function joinGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.joined = true;
        group.members++;
        showNotification(`Joined ${group.name}!`, 'success');
        loadGroupsPage();
    }
}

function leaveGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.joined = false;
        group.members--;
        showNotification(`Left ${group.name}.`, 'info');
        loadGroupsPage();
    }
}

// EVENTS FUNCTIONALITY
function loadEventsPage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="events-page">
            <div class="events-header">
                <h1>Events</h1>
                <button class="btn-primary" onclick="createEvent()">Create Event</button>
            </div>
            
            <div class="events-content">
                <div class="events-list">
                    ${events.map(event => createEventHTML(event)).join('')}
                </div>
            </div>
        </div>
    `;
}

function createEventHTML(event) {
    const organizer = users[event.organizer];
    return `
        <div class="event-card" onclick="openEvent(${event.id})">
            <div class="event-cover">
                <img src="${event.cover}" alt="${event.name}">
                <div class="event-date">
                    <span class="month">${new Date(event.date).toLocaleDateString('en-US', {month: 'short'})}</span>
                    <span class="day">${new Date(event.date).getDate()}</span>
                </div>
            </div>
            <div class="event-info">
                <h3>${event.name}</h3>
                <p class="event-time">${event.time} · ${event.location}</p>
                <p class="event-description">${event.description}</p>
                <p class="event-stats">${event.attendees} going · ${event.interested} interested</p>
                <div class="event-actions">
                    <button class="btn-${event.userStatus === 'going' ? 'success' : 'primary'}" 
                            onclick="toggleEventStatus(${event.id}, 'going'); event.stopPropagation();">
                        ${event.userStatus === 'going' ? 'Going' : 'Go'}
                    </button>
                    <button class="btn-${event.userStatus === 'interested' ? 'secondary-active' : 'secondary'}" 
                            onclick="toggleEventStatus(${event.id}, 'interested'); event.stopPropagation();">
                        ${event.userStatus === 'interested' ? 'Interested' : 'Interested'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleEventStatus(eventId, status) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        // Remove from previous status
        if (event.userStatus === 'going') event.attendees--;
        if (event.userStatus === 'interested') event.interested--;
        
        // Add to new status or remove if same
        if (event.userStatus === status) {
            event.userStatus = null;
        } else {
            event.userStatus = status;
            if (status === 'going') event.attendees++;
            if (status === 'interested') event.interested++;
        }
        
        loadEventsPage();
        showNotification(`Event status updated!`, 'success');
    }
}

// MARKETPLACE FUNCTIONALITY
function loadMarketplacePage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="marketplace-page">
            <div class="marketplace-header">
                <h1>Marketplace</h1>
                <button class="btn-primary" onclick="createListing()">Create Listing</button>
            </div>
            
            <div class="marketplace-filters">
                <select class="filter-select" onchange="filterMarketplace(this.value)">
                    <option value="all">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home & Garden</option>
                    <option value="Vehicles">Vehicles</option>
                </select>
                <select class="filter-select" onchange="sortMarketplace(this.value)">
                    <option value="recent">Most Recent</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
            </div>
            
            <div class="marketplace-grid">
                ${marketplaceItems.map(item => createMarketplaceItemHTML(item)).join('')}
            </div>
        </div>
    `;
}

function createMarketplaceItemHTML(item) {
    const seller = users[item.seller];
    return `
        <div class="marketplace-item" onclick="openMarketplaceItem(${item.id})">
            <img src="${item.images[0]}" alt="${item.title}">
            <div class="item-info">
                <h3>${item.title}</h3>
                <p class="item-price">$${item.price}</p>
                <p class="item-location">${item.location}</p>
                <p class="item-seller">Sold by ${seller.name}</p>
                <div class="item-actions">
                    <button class="btn-primary" onclick="messageSellerMarketplace(${item.id}); event.stopPropagation();">Message</button>
                    <button class="btn-secondary" onclick="saveItem(${item.id}); event.stopPropagation();">Save</button>
                </div>
            </div>
        </div>
    `;
}

function createListing() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content marketplace-modal">
            <div class="modal-header">
                <h2>Create Marketplace Listing</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="marketplace-form">
                <input type="text" placeholder="Title" id="listingTitle">
                <textarea placeholder="Description" id="listingDescription"></textarea>
                <input type="number" placeholder="Price ($)" id="listingPrice">
                <select id="listingCategory">
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home & Garden</option>
                    <option value="Vehicles">Vehicles</option>
                </select>
                <select id="listingCondition">
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                </select>
                <input type="text" placeholder="Location" id="listingLocation">
                <button class="btn-primary" onclick="submitListing()">Create Listing</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function submitListing() {
    const title = document.getElementById('listingTitle').value;
    const description = document.getElementById('listingDescription').value;
    const price = document.getElementById('listingPrice').value;
    const category = document.getElementById('listingCategory').value;
    const condition = document.getElementById('listingCondition').value;
    const location = document.getElementById('listingLocation').value;
    
    if (!title || !description || !price) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    const newItem = {
        id: marketplaceItems.length + 1,
        title,
        price: parseFloat(price),
        description,
        images: ['https://via.placeholder.com/300x300/1877f2/ffffff?text=New+Item'],
        location,
        seller: 'john',
        posted: 'Just now',
        category,
        condition
    };
    
    marketplaceItems.unshift(newItem);
    loadMarketplacePage();
    document.querySelector('.modal').remove();
    showNotification('Listing created successfully!', 'success');
}

// ENHANCED MESSAGING SYSTEM
function openEnhancedChat(userId) {
    const chatWindows = document.getElementById('chatWindows');
    const existingChat = document.getElementById(`chat-${userId}`);
    
    if (existingChat) {
        existingChat.style.display = 'flex';
        return;
    }
    
    const user = users[userId];
    const messages = chatMessages[userId] || [];
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window enhanced-chat';
    chatWindow.id = `chat-${userId}`;
    
    chatWindow.innerHTML = `
        <div class="chat-header">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="chat-user-info">
                <span>${user.name}</span>
                <small class="user-status">${user.status === 'online' ? '🟢 Active now' : '⚫ Last seen recently'}</small>
            </div>
            <div class="chat-controls">
                <button class="chat-btn" onclick="startVideoCall('${userId}')" title="Video call">
                    <i class="fas fa-video"></i>
                </button>
                <button class="chat-btn" onclick="startVoiceCall('${userId}')" title="Voice call">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="chat-btn" onclick="minimizeChat('${userId}')">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="chat-btn" onclick="closeChat('${userId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="chat-messages enhanced-messages" id="messages-${userId}">
            ${messages.map(msg => createChatMessageHTML(msg)).join('')}
        </div>
        <div class="chat-input-area">
            <div class="chat-input enhanced-input">
                <button class="emoji-btn" onclick="toggleEmojiPicker('${userId}')">😊</button>
                <input type="text" placeholder="Type a message..." onkeypress="handleEnhancedChatInput(event, '${userId}')">
                <button class="attachment-btn" onclick="sendAttachment('${userId}')">
                    <i class="fas fa-paperclip"></i>
                </button>
                <button class="chat-send-btn" onclick="sendEnhancedMessage('${userId}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="emoji-picker hidden" id="emoji-picker-${userId}">
                <div class="emoji-grid">
                    ${'😀😃😄😁😆😅😂🤣😭😗😙😚😘🥰😍🤩🥳🙂🙃😉😊😇🥺😌😏😪😴'.split('').map(emoji => 
                        `<span class="emoji" onclick="insertEmoji('${userId}', '${emoji}')">${emoji}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    chatWindows.appendChild(chatWindow);
    scrollChatToBottom(userId);
}

function createChatMessageHTML(message) {
    const messageClass = message.sender === 'john' ? 'sent' : 'received';
    return `
        <div class="chat-message ${messageClass}">
            <div class="message-content">${message.content}</div>
            <div class="message-time">${message.time}</div>
        </div>
    `;
}

function handleEnhancedChatInput(event, userId) {
    if (event.key === 'Enter') {
        sendEnhancedMessage(userId);
    }
}

function sendEnhancedMessage(userId) {
    const input = document.querySelector(`#chat-${userId} .chat-input input`);
    const messagesContainer = document.getElementById(`messages-${userId}`);
    
    if (input.value.trim()) {
        const newMessage = {
            id: Date.now(),
            sender: 'john',
            content: input.value,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'text'
        };
        
        if (!chatMessages[userId]) chatMessages[userId] = [];
        chatMessages[userId].push(newMessage);
        
        messagesContainer.appendChild(createMessageElement(newMessage));
        input.value = '';
        scrollChatToBottom(userId);
        
        // Simulate response
        setTimeout(() => {
            const responseMessage = {
                id: Date.now() + 1,
                sender: userId,
                content: getRandomResponse(),
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'text'
            };
            
            chatMessages[userId].push(responseMessage);
            messagesContainer.appendChild(createMessageElement(responseMessage));
            scrollChatToBottom(userId);
        }, 1000 + Math.random() * 2000);
    }
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.sender === 'john' ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${message.time}</div>
    `;
    return messageDiv;
}

function toggleEmojiPicker(userId) {
    const picker = document.getElementById(`emoji-picker-${userId}`);
    picker.classList.toggle('hidden');
}

function insertEmoji(userId, emoji) {
    const input = document.querySelector(`#chat-${userId} .chat-input input`);
    input.value += emoji;
    toggleEmojiPicker(userId);
    input.focus();
}

function scrollChatToBottom(userId) {
    const messagesContainer = document.getElementById(`messages-${userId}`);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getRandomResponse() {
    const responses = [
        "That's interesting!",
        "I see what you mean.",
        "Thanks for sharing!",
        "Absolutely!",
        "I agree with that.",
        "Tell me more about it.",
        "That's a great point!",
        "I hadn't thought about it that way.",
        "Thanks for the update!",
        "Sounds good to me!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced Navigation Updates
const originalNavigateToPage = window.navigateToPage;
window.navigateToPage = function(page, data = null) {
    console.log(`Enhanced navigation to ${page}`);
    
    // Let the original function handle basic navigation first
    if (originalNavigateToPage && typeof originalNavigateToPage === 'function') {
        try {
            originalNavigateToPage(page, data);
        } catch (error) {
            console.warn('Original navigation failed:', error);
        }
    }
    
    // Override with enhanced pages if available
    switch (page) {
        case 'friends':
            if (typeof loadFriendsPage === 'function') {
                loadFriendsPage();
            }
            break;
        case 'groups':
            if (typeof loadGroupsPage === 'function') {
                loadGroupsPage();
            }
            break;
        case 'events':
            if (typeof loadEventsPage === 'function') {
                loadEventsPage();
            }
            break;
        case 'marketplace':
            if (typeof loadMarketplacePage === 'function') {
                loadMarketplacePage();
            }
            break;
    }
};

// Enhanced chat opening
const originalOpenChat = window.openChat;
window.openChat = function(userId) {
    console.log(`Opening chat with ${userId}`);
    if (typeof openEnhancedChat === 'function') {
        openEnhancedChat(userId);
    } else if (originalOpenChat && typeof originalOpenChat === 'function') {
        originalOpenChat(userId);
    }
};

// Export functions for global access
window.loadFriendsPage = loadFriendsPage;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.sendFriendRequest = sendFriendRequest;

window.loadGroupsPage = loadGroupsPage;
window.joinGroup = joinGroup;
window.leaveGroup = leaveGroup;
window.createGroup = function() { showNotification('Group creation opened!', 'info'); };
window.openGroup = function(id) { showNotification(`Opening group ${id}`, 'info'); };

window.loadEventsPage = loadEventsPage;
window.toggleEventStatus = toggleEventStatus;
window.createEvent = function() { showNotification('Event creation opened!', 'info'); };
window.openEvent = function(id) { showNotification(`Opening event ${id}`, 'info'); };

window.loadMarketplacePage = loadMarketplacePage;
window.createListing = createListing;
window.submitListing = submitListing;
window.openMarketplaceItem = function(id) { showNotification(`Opening item ${id}`, 'info'); };
window.messageSellerMarketplace = function(id) { showNotification('Opening chat with seller...', 'info'); };
window.saveItem = function(id) { showNotification('Item saved!', 'success'); };

window.openEnhancedChat = openEnhancedChat;
window.sendEnhancedMessage = sendEnhancedMessage;
window.toggleEmojiPicker = toggleEmojiPicker;
window.insertEmoji = insertEmoji;
window.handleEnhancedChatInput = handleEnhancedChatInput;
window.startVideoCall = function(userId) { showNotification(`Starting video call with ${users[userId].name}...`, 'info'); };
window.startVoiceCall = function(userId) { showNotification(`Starting voice call with ${users[userId].name}...`, 'info'); };
window.sendAttachment = function(userId) { showNotification('File picker opened!', 'info'); };

console.log('Additional Facebook features loaded!');