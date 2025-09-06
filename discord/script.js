// Mock data for Discord-like interface
const mockData = {
    servers: {
        home: {
            name: "Discord",
            channels: {
                general: {
                    name: "general",
                    type: "text",
                    messages: [
                        {
                            id: 1,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Hey everyone! Welcome to our Discord server!",
                            timestamp: "12:34 PM",
                            date: "Today"
                        },
                        {
                            id: 2,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "I've been working on some cool projects lately. Anyone interested in web development?",
                            timestamp: "12:35 PM",
                            date: "Today"
                        },
                        {
                            id: 3,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Just finished building a Discord clone! It's pretty awesome how much you can do with HTML, CSS, and JavaScript.",
                            timestamp: "12:36 PM",
                            date: "Today"
                        },
                        {
                            id: 4,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Feel free to share your own projects here. I'd love to see what everyone is working on!",
                            timestamp: "12:37 PM",
                            date: "Today"
                        },
                        {
                            id: 5,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Also, if you have any questions about coding or need help with something, just ask! I'm always happy to help.",
                            timestamp: "12:38 PM",
                            date: "Today"
                        }
                    ]
                },
                random: {
                    name: "random",
                    type: "text",
                    messages: [
                        {
                            id: 6,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Random thought: What's your favorite programming language?",
                            timestamp: "11:20 AM",
                            date: "Today"
                        },
                        {
                            id: 7,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "I'm really enjoying JavaScript lately. The ecosystem is just incredible!",
                            timestamp: "11:21 AM",
                            date: "Today"
                        }
                    ]
                },
                announcements: {
                    name: "announcements",
                    type: "text",
                    messages: [
                        {
                            id: 8,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "🎉 Welcome to our Discord server! This is where we'll share important updates and announcements.",
                            timestamp: "10:00 AM",
                            date: "Today"
                        },
                        {
                            id: 9,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "📢 Server rules: Be respectful, stay on topic, and have fun!",
                            timestamp: "10:01 AM",
                            date: "Today"
                        }
                    ]
                }
            }
        },
        gaming: {
            name: "Gaming Hub",
            channels: {
                general: {
                    name: "general",
                    type: "text",
                    messages: [
                        {
                            id: 10,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Anyone up for some gaming tonight?",
                            timestamp: "8:30 PM",
                            date: "Yesterday"
                        }
                    ]
                }
            }
        },
        study: {
            name: "Study Group",
            channels: {
                general: {
                    name: "general",
                    type: "text",
                    messages: [
                        {
                            id: 11,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "Study session tomorrow at 2 PM. Who's joining?",
                            timestamp: "6:00 PM",
                            date: "Yesterday"
                        }
                    ]
                }
            }
        },
        music: {
            name: "Music Lovers",
            channels: {
                general: {
                    name: "general",
                    type: "text",
                    messages: [
                        {
                            id: 12,
                            author: "jun",
                            avatar: "https://via.placeholder.com/40x40/5865f2/ffffff?text=J",
                            content: "What's everyone listening to today?",
                            timestamp: "4:15 PM",
                            date: "Yesterday"
                        }
                    ]
                }
            }
        }
    }
};

// Global state
let currentServer = 'home';
let currentChannel = 'general';
let searchResults = [];

// DOM elements
const serverItems = document.querySelectorAll('.server-item');
const channelItems = document.querySelectorAll('.channel-item');
const messagesList = document.getElementById('messages-list');
const currentChannelSpan = document.getElementById('current-channel');
const serverNameSpan = document.getElementById('server-name');
const messageInput = document.getElementById('message-input');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results');
const closeSearchBtn = document.querySelector('.close-search');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Server navigation
    serverItems.forEach(item => {
        item.addEventListener('click', function() {
            const server = this.dataset.server;
            if (server) {
                switchServer(server);
            }
        });
    });

    // Channel navigation
    channelItems.forEach(item => {
        item.addEventListener('click', function() {
            const channel = this.dataset.channel;
            if (channel) {
                switchChannel(channel);
            }
        });
    });

    // Message input
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            sendMessage(this.value.trim());
            this.value = '';
        }
    });

    // Search functionality
    document.querySelector('.fa-search').addEventListener('click', openSearch);
    closeSearchBtn.addEventListener('click', closeSearch);
    searchInput.addEventListener('input', performSearch);
    
    // Close search on overlay click
    document.querySelector('.search-overlay').addEventListener('click', closeSearch);
}

// Switch server
function switchServer(serverId) {
    currentServer = serverId;
    currentChannel = 'general'; // Reset to general channel
    
    // Update active server
    serverItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.server === serverId) {
            item.classList.add('active');
        }
    });

    // Update server name
    const serverData = mockData.servers[serverId];
    if (serverData) {
        serverNameSpan.textContent = serverData.name;
    }

    // Update active channel
    channelItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.channel === 'general') {
            item.classList.add('active');
        }
    });

    // Update current channel display
    currentChannelSpan.textContent = 'general';
    messageInput.placeholder = 'Message #general';

    // Load messages for the new server/channel
    loadMessages();
}

// Switch channel
function switchChannel(channelId) {
    currentChannel = channelId;
    
    // Update active channel
    channelItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.channel === channelId) {
            item.classList.add('active');
        }
    });

    // Update current channel display
    currentChannelSpan.textContent = channelId;
    messageInput.placeholder = `Message #${channelId}`;

    // Load messages for the new channel
    loadMessages();
}

// Load messages for current server and channel
function loadMessages() {
    const serverData = mockData.servers[currentServer];
    if (!serverData || !serverData.channels[currentChannel]) {
        messagesList.innerHTML = '<div class="no-messages">No messages in this channel yet.</div>';
        return;
    }

    const messages = serverData.channels[currentChannel].messages;
    messagesList.innerHTML = '';

    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${message.avatar}" alt="${message.author}">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${message.author}</span>
                <span class="message-timestamp">${message.date} at ${message.timestamp}</span>
            </div>
            <div class="message-text">${message.content}</div>
            <div class="message-actions">
                <span class="message-action">👍</span>
                <span class="message-action">😄</span>
                <span class="message-action">❤️</span>
                <span class="message-action">😢</span>
                <span class="message-action">😮</span>
                <span class="message-action">😡</span>
            </div>
        </div>
    `;
    return messageDiv;
}

// Send message
function sendMessage(content) {
    const serverData = mockData.servers[currentServer];
    if (!serverData || !serverData.channels[currentChannel]) {
        return;
    }

    const newMessage = {
        id: Date.now(),
        author: 'jun',
        avatar: 'https://via.placeholder.com/40x40/5865f2/ffffff?text=J',
        content: content,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: 'Today'
    };

    serverData.channels[currentChannel].messages.push(newMessage);
    loadMessages();
}

// Open search modal
function openSearch() {
    searchModal.style.display = 'block';
    searchInput.focus();
    performSearch(); // Show all messages initially
}

// Close search modal
function closeSearch() {
    searchModal.style.display = 'none';
    searchInput.value = '';
    searchResultsContainer.innerHTML = '';
}

// Perform search
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    searchResults = [];

    if (!query) {
        // Show all messages if no query
        Object.keys(mockData.servers).forEach(serverId => {
            const server = mockData.servers[serverId];
            Object.keys(server.channels).forEach(channelId => {
                const channel = server.channels[channelId];
                channel.messages.forEach(message => {
                    searchResults.push({
                        ...message,
                        serverName: server.name,
                        channelName: channel.name
                    });
                });
            });
        });
    } else {
        // Search through all messages
        Object.keys(mockData.servers).forEach(serverId => {
            const server = mockData.servers[serverId];
            Object.keys(server.channels).forEach(channelId => {
                const channel = server.channels[channelId];
                channel.messages.forEach(message => {
                    if (message.content.toLowerCase().includes(query) || 
                        message.author.toLowerCase().includes(query)) {
                        searchResults.push({
                            ...message,
                            serverName: server.name,
                            channelName: channel.name
                        });
                    }
                });
            });
        });
    }

    displaySearchResults();
}

// Display search results
function displaySearchResults() {
    searchResultsContainer.innerHTML = '';

    if (searchResults.length === 0) {
        searchResultsContainer.innerHTML = '<div style="padding: 16px; color: #72767d; text-align: center;">No results found.</div>';
        return;
    }

    searchResults.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-channel">#${result.channelName} in ${result.serverName}</span>
            </div>
            <div class="search-result-author">${result.author}</div>
            <div class="search-result-text">${result.content}</div>
        `;
        
        resultElement.addEventListener('click', function() {
            // Switch to the server and channel of this message
            const serverId = Object.keys(mockData.servers).find(id => 
                mockData.servers[id].name === result.serverName
            );
            if (serverId) {
                switchServer(serverId);
                switchChannel(result.channelName);
                closeSearch();
            }
        });

        searchResultsContainer.appendChild(resultElement);
    });
}

// Add some interactive features
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    
    // Escape to close search
    if (e.key === 'Escape') {
        closeSearch();
    }
});

// Add hover effects for better UX
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('message-action')) {
        e.target.style.transform = 'scale(1.1)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('message-action')) {
        e.target.style.transform = 'scale(1)';
    }
});

// Simulate real-time updates (optional)
setInterval(function() {
    // This could be used to simulate new messages or status updates
    // For now, we'll just keep the interface responsive
}, 1000);
