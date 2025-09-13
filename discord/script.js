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
let messageReactions = {};
let isVoiceConnected = false;
let connectedVoiceChannel = null;
let isMicrophoneMuted = false;
let isDeafened = false;
let userStatus = 'online';
let notifications = [];

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
const fileInput = document.getElementById('file-input');
const fileUploadBtn = document.getElementById('file-upload-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const typingIndicator = document.getElementById('typing-indicator');

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
                if (channel.includes('voice')) {
                    handleVoiceChannelClick(channel);
                } else {
                    switchChannel(channel);
                }
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

    // File upload functionality
    fileUploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            files.forEach(file => {
                sendFileMessage(file);
            });
            e.target.value = '';
        }
    });

    // Add server functionality
    const addServerBtn = document.querySelector('.add-server');
    if (addServerBtn) {
        addServerBtn.addEventListener('click', showCreateServerModal);
    }

    // Server header dropdown functionality
    const serverHeader = document.querySelector('.server-header');
    if (serverHeader) {
        serverHeader.addEventListener('click', showServerMenu);
    }

    // User controls functionality
    const userControls = document.querySelectorAll('.user-controls i');
    userControls.forEach((control, index) => {
        control.addEventListener('click', function() {
            if (index === 0) { // Microphone
                toggleMicrophone();
            } else if (index === 1) { // Headphones
                toggleDeafen();
            } else if (index === 2) { // Settings
                showUserSettings();
            }
        });
    });

    // Mobile menu functionality
    if (mobileMenuToggle && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }

    // Typing indicator simulation
    let typingTimeout;
    messageInput.addEventListener('input', function() {
        if (!typingIndicator) return;

        typingIndicator.classList.add('show');
        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            typingIndicator.classList.remove('show');
        }, 2000);
    });
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
    messageDiv.dataset.messageId = message.id;

    const reactions = messageReactions[message.id] || {};
    const reactionHtml = Object.keys(reactions).map(emoji => {
        const count = reactions[emoji].length;
        const hasReacted = reactions[emoji].includes('jun');
        return `<span class="reaction ${hasReacted ? 'reacted' : ''}" data-emoji="${emoji}">${emoji} ${count}</span>`;
    }).join('');

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
                <span class="message-action" data-emoji="👍">👍</span>
                <span class="message-action" data-emoji="😄">😄</span>
                <span class="message-action" data-emoji="❤️">❤️</span>
                <span class="message-action" data-emoji="😢">😢</span>
                <span class="message-action" data-emoji="😮">😮</span>
                <span class="message-action" data-emoji="😡">😡</span>
                <span class="message-action add-reaction" data-emoji="➕">➕</span>
            </div>
            <div class="message-reactions">${reactionHtml}</div>
        </div>
    `;

    // Add reaction event listeners
    const reactionButtons = messageDiv.querySelectorAll('.message-action');
    reactionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = button.dataset.emoji;
            if (emoji === '➕') {
                showEmojiPicker(message.id);
            } else {
                addReaction(message.id, emoji);
            }
        });
    });

    // Add click events for existing reactions
    const existingReactions = messageDiv.querySelectorAll('.reaction');
    existingReactions.forEach(reaction => {
        reaction.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = reaction.dataset.emoji;
            toggleReaction(message.id, emoji);
        });
    });

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

// Send file message
function sendFileMessage(file) {
    const serverData = mockData.servers[currentServer];
    if (!serverData || !serverData.channels[currentChannel]) {
        return;
    }

    const fileSize = formatFileSize(file.size);
    const fileType = getFileType(file.type);
    const fileUrl = URL.createObjectURL(file);

    let fileContent = '';
    if (fileType === 'image') {
        fileContent = `
            <div class="file-attachment image-attachment">
                <img src="${fileUrl}" alt="${file.name}" class="attachment-image" onclick="openImageModal('${fileUrl}', '${file.name}')">
                <div class="attachment-info">
                    <span class="attachment-name">${file.name}</span>
                    <span class="attachment-size">${fileSize}</span>
                </div>
            </div>
        `;
    } else if (fileType === 'video') {
        fileContent = `
            <div class="file-attachment video-attachment">
                <video controls class="attachment-video">
                    <source src="${fileUrl}" type="${file.type}">
                    Your browser does not support the video tag.
                </video>
                <div class="attachment-info">
                    <span class="attachment-name">${file.name}</span>
                    <span class="attachment-size">${fileSize}</span>
                </div>
            </div>
        `;
    } else if (fileType === 'audio') {
        fileContent = `
            <div class="file-attachment audio-attachment">
                <div class="audio-player">
                    <i class="fas fa-music audio-icon"></i>
                    <div class="audio-info">
                        <div class="audio-name">${file.name}</div>
                        <audio controls class="audio-controls">
                            <source src="${fileUrl}" type="${file.type}">
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                </div>
                <div class="attachment-info">
                    <span class="attachment-size">${fileSize}</span>
                </div>
            </div>
        `;
    } else {
        fileContent = `
            <div class="file-attachment generic-attachment">
                <div class="file-icon">
                    <i class="fas fa-file"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    <button class="download-btn" onclick="downloadFile('${fileUrl}', '${file.name}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }

    const newMessage = {
        id: Date.now(),
        author: 'jun',
        avatar: 'https://via.placeholder.com/40x40/5865f2/ffffff?text=J',
        content: fileContent,
        isFile: true,
        fileName: file.name,
        fileSize: fileSize,
        fileType: fileType,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: 'Today'
    };

    serverData.channels[currentChannel].messages.push(newMessage);
    loadMessages();
    showNotification(`File uploaded: ${file.name}`);
}

// Helper functions for file handling
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
}

function openImageModal(src, name) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-overlay" onclick="this.parentElement.remove()">
            <div class="image-modal-content">
                <img src="${src}" alt="${name}" class="modal-image">
                <div class="image-modal-info">
                    <span class="image-name">${name}</span>
                    <button class="close-image-modal" onclick="this.closest('.image-modal').remove()">&times;</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Voice Channel functionality
function handleVoiceChannelClick(channelId) {
    if (isVoiceConnected && connectedVoiceChannel === channelId) {
        disconnectFromVoiceChannel();
    } else {
        connectToVoiceChannel(channelId);
    }
}

function connectToVoiceChannel(channelId) {
    isVoiceConnected = true;
    connectedVoiceChannel = channelId;

    // Update UI to show connection
    updateVoiceChannelUI();
    updateUserVoiceStatus();

    // Show notification
    showNotification(`Connected to voice channel: ${getChannelDisplayName(channelId)}`);

    // Simulate connection sound
    playConnectionSound();
}

function disconnectFromVoiceChannel() {
    isVoiceConnected = false;
    const previousChannel = connectedVoiceChannel;
    connectedVoiceChannel = null;

    // Reset audio states
    isMicrophoneMuted = false;
    isDeafened = false;

    // Update UI
    updateVoiceChannelUI();
    updateUserVoiceStatus();

    // Show notification
    showNotification(`Disconnected from voice channel: ${getChannelDisplayName(previousChannel)}`);
}

function updateVoiceChannelUI() {
    // Update voice channel visual indicators
    const voiceChannels = document.querySelectorAll('[data-channel*="voice"]');
    voiceChannels.forEach(channel => {
        const isConnected = isVoiceConnected && channel.dataset.channel === connectedVoiceChannel;

        if (isConnected) {
            channel.classList.add('voice-connected');
            // Add user indicator to connected channel
            const userIndicator = channel.querySelector('.voice-user-indicator');
            if (!userIndicator) {
                const indicator = document.createElement('div');
                indicator.className = 'voice-user-indicator';
                indicator.innerHTML = '<span class="voice-user">jun</span>';
                channel.appendChild(indicator);
            }
        } else {
            channel.classList.remove('voice-connected');
            const userIndicator = channel.querySelector('.voice-user-indicator');
            if (userIndicator) {
                userIndicator.remove();
            }
        }
    });
}

function updateUserVoiceStatus() {
    const userControls = document.querySelectorAll('.user-controls i');

    // Update microphone button
    if (userControls[0]) {
        userControls[0].className = isMicrophoneMuted ? 'fas fa-microphone-slash muted' : 'fas fa-microphone';
        userControls[0].style.color = isMicrophoneMuted ? '#f04747' : (isVoiceConnected ? '#43b581' : '#b9bbbe');
    }

    // Update headphones button
    if (userControls[1]) {
        userControls[1].className = isDeafened ? 'fas fa-volume-mute deafened' : 'fas fa-headphones';
        userControls[1].style.color = isDeafened ? '#f04747' : (isVoiceConnected ? '#43b581' : '#b9bbbe');
    }

    // Update settings button
    if (userControls[2]) {
        userControls[2].style.color = isVoiceConnected ? '#43b581' : '#b9bbbe';
    }
}

function getChannelDisplayName(channelId) {
    const channelMap = {
        'general-voice': 'General',
        'gaming-voice': 'Gaming'
    };
    return channelMap[channelId] || channelId;
}

function toggleMicrophone() {
    if (!isVoiceConnected) {
        showNotification('You need to be in a voice channel to use microphone controls');
        return;
    }

    isMicrophoneMuted = !isMicrophoneMuted;
    updateUserVoiceStatus();

    const status = isMicrophoneMuted ? 'Microphone muted' : 'Microphone unmuted';
    showNotification(status);
}

function toggleDeafen() {
    if (!isVoiceConnected) {
        showNotification('You need to be in a voice channel to use audio controls');
        return;
    }

    isDeafened = !isDeafened;
    if (isDeafened) {
        isMicrophoneMuted = true; // Auto-mute when deafened
    }

    updateUserVoiceStatus();

    const status = isDeafened ? 'Audio deafened' : 'Audio undeafened';
    showNotification(status);
}

function showUserSettings() {
    const settingsModal = document.createElement('div');
    settingsModal.className = 'settings-modal-overlay';
    settingsModal.innerHTML = `
        <div class="settings-modal">
            <div class="settings-header">
                <h2>User Settings</h2>
                <button class="close-settings">&times;</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Voice & Video</h3>
                    <div class="setting-item">
                        <label for="input-volume">Input Volume</label>
                        <input type="range" id="input-volume" min="0" max="100" value="80" class="volume-slider">
                        <span class="volume-value">80%</span>
                    </div>
                    <div class="setting-item">
                        <label for="output-volume">Output Volume</label>
                        <input type="range" id="output-volume" min="0" max="100" value="100" class="volume-slider">
                        <span class="volume-value">100%</span>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" checked> Push to Talk
                        </label>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Appearance</h3>
                    <div class="setting-item">
                        <label for="user-status">Status</label>
                        <select id="user-status">
                            <option value="online" ${userStatus === 'online' ? 'selected' : ''}>Online</option>
                            <option value="away" ${userStatus === 'away' ? 'selected' : ''}>Away</option>
                            <option value="busy" ${userStatus === 'busy' ? 'selected' : ''}>Do Not Disturb</option>
                            <option value="invisible" ${userStatus === 'invisible' ? 'selected' : ''}>Invisible</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(settingsModal);

    // Add event listeners
    const closeBtn = settingsModal.querySelector('.close-settings');
    closeBtn.addEventListener('click', () => settingsModal.remove());

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.remove();
    });

    // Status change handler
    const statusSelect = settingsModal.querySelector('#user-status');
    statusSelect.addEventListener('change', (e) => {
        userStatus = e.target.value;
        updateUserStatusDisplay();
        showNotification(`Status changed to ${e.target.value}`);
    });

    // Volume sliders
    const volumeSliders = settingsModal.querySelectorAll('.volume-slider');
    volumeSliders.forEach(slider => {
        const valueSpan = slider.nextElementSibling;
        slider.addEventListener('input', (e) => {
            valueSpan.textContent = e.target.value + '%';
        });
    });
}

function updateUserStatusDisplay() {
    const userStatusElement = document.querySelector('.user-status');
    const statusMap = {
        'online': 'Online',
        'away': 'Away',
        'busy': 'Do Not Disturb',
        'invisible': 'Invisible'
    };
    userStatusElement.textContent = statusMap[userStatus] || 'Online';

    // Update status indicator color
    const userAvatar = document.querySelector('.user-avatar');
    userAvatar.className = `user-avatar ${userStatus}`;
}

function playConnectionSound() {
    // Simulate connection sound with Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Notification System
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${getNotificationIcon(type)}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to notifications container
    let notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }

    notificationsContainer.appendChild(notification);

    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));

    // Auto-remove after duration
    setTimeout(() => {
        removeNotification(notification);
    }, duration);

    // Add click to dismiss
    notification.addEventListener('click', () => removeNotification(notification));

    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

function getNotificationIcon(type) {
    const iconMap = {
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle',
        'voice': 'fas fa-microphone'
    };
    return iconMap[type] || iconMap.info;
}

// Server and Channel Management
function showCreateServerModal() {
    const modal = document.createElement('div');
    modal.className = 'create-server-modal-overlay';
    modal.innerHTML = `
        <div class="create-server-modal">
            <div class="create-server-header">
                <h2>Create a Server</h2>
                <button class="close-create-server">&times;</button>
            </div>
            <div class="create-server-content">
                <div class="server-template">
                    <div class="template-option active" data-template="gaming">
                        <i class="fas fa-gamepad"></i>
                        <span>Gaming</span>
                    </div>
                    <div class="template-option" data-template="study">
                        <i class="fas fa-book"></i>
                        <span>Study Group</span>
                    </div>
                    <div class="template-option" data-template="community">
                        <i class="fas fa-users"></i>
                        <span>Community</span>
                    </div>
                    <div class="template-option" data-template="creative">
                        <i class="fas fa-palette"></i>
                        <span>Creative</span>
                    </div>
                </div>
                <div class="server-details">
                    <label for="server-name">Server Name</label>
                    <input type="text" id="server-name" placeholder="Enter server name" value="jun's server">
                    <label for="server-region">Region</label>
                    <select id="server-region">
                        <option value="us-east">US East</option>
                        <option value="us-west">US West</option>
                        <option value="europe">Europe</option>
                        <option value="asia">Asia Pacific</option>
                    </select>
                </div>
                <div class="create-server-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="create-btn">Create Server</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('.close-create-server');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const createBtn = modal.querySelector('.create-btn');
    const templateOptions = modal.querySelectorAll('.template-option');

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Template selection
    templateOptions.forEach(option => {
        option.addEventListener('click', () => {
            templateOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Create server
    createBtn.addEventListener('click', () => {
        const serverName = modal.querySelector('#server-name').value.trim();
        const selectedTemplate = modal.querySelector('.template-option.active').dataset.template;
        if (serverName) {
            createNewServer(serverName, selectedTemplate);
            modal.remove();
        }
    });
}

function createNewServer(serverName, template) {
    const serverId = `server-${Date.now()}`;
    const serverIcon = getTemplateIcon(template);

    // Add to mock data
    mockData.servers[serverId] = {
        name: serverName,
        channels: {
            general: {
                name: "general",
                type: "text",
                messages: [{
                    id: Date.now(),
                    author: 'jun',
                    avatar: 'https://via.placeholder.com/40x40/5865f2/ffffff?text=J',
                    content: `Welcome to ${serverName}! 🎉`,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    date: 'Today'
                }]
            },
            announcements: {
                name: "announcements",
                type: "text",
                messages: []
            }
        }
    };

    // Add template-specific channels
    if (template === 'gaming') {
        mockData.servers[serverId].channels['gaming-voice'] = {
            name: "Gaming Voice",
            type: "voice",
            messages: []
        };
    }

    // Add server to UI
    const serverList = document.querySelector('.server-list');
    const addServerBtn = document.querySelector('.add-server');

    const newServerDiv = document.createElement('div');
    newServerDiv.className = 'server-item';
    newServerDiv.dataset.server = serverId;
    newServerDiv.innerHTML = `<i class="${serverIcon}"></i>`;

    // Insert before add server button
    serverList.insertBefore(newServerDiv, addServerBtn);

    // Add event listener
    newServerDiv.addEventListener('click', function() {
        switchServer(serverId);
    });

    // Auto-switch to new server
    switchServer(serverId);
    showNotification(`Server "${serverName}" created successfully!`, 'success');
}

function getTemplateIcon(template) {
    const iconMap = {
        'gaming': 'fas fa-gamepad',
        'study': 'fas fa-book',
        'community': 'fas fa-users',
        'creative': 'fas fa-palette'
    };
    return iconMap[template] || 'fas fa-server';
}

function showServerMenu() {
    const existingMenu = document.querySelector('.server-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'server-menu';
    menu.innerHTML = `
        <div class="menu-item" data-action="invite">
            <i class="fas fa-user-plus"></i>
            <span>Invite People</span>
        </div>
        <div class="menu-item" data-action="create-channel">
            <i class="fas fa-plus"></i>
            <span>Create Channel</span>
        </div>
        <div class="menu-item" data-action="create-category">
            <i class="fas fa-folder-plus"></i>
            <span>Create Category</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="server-settings">
            <i class="fas fa-cog"></i>
            <span>Server Settings</span>
        </div>
        <div class="menu-item danger" data-action="leave-server">
            <i class="fas fa-sign-out-alt"></i>
            <span>Leave Server</span>
        </div>
    `;

    const serverHeader = document.querySelector('.server-header');
    serverHeader.appendChild(menu);

    // Position menu
    menu.style.position = 'absolute';
    menu.style.top = '100%';
    menu.style.left = '0';
    menu.style.right = '0';
    menu.style.zIndex = '1000';

    // Add menu item listeners
    const menuItems = menu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            handleServerMenuAction(action);
            menu.remove();
        });
    });

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 10);
}

function handleServerMenuAction(action) {
    switch (action) {
        case 'invite':
            showInviteModal();
            break;
        case 'create-channel':
            showCreateChannelModal();
            break;
        case 'create-category':
            showNotification('Create category feature coming soon!', 'info');
            break;
        case 'server-settings':
            showNotification('Server settings feature coming soon!', 'info');
            break;
        case 'leave-server':
            showNotification('Cannot leave default server', 'warning');
            break;
    }
}

function showInviteModal() {
    const inviteCode = generateInviteCode();
    const modal = document.createElement('div');
    modal.className = 'invite-modal-overlay';
    modal.innerHTML = `
        <div class="invite-modal">
            <div class="invite-header">
                <h2>Invite Friends</h2>
                <button class="close-invite">&times;</button>
            </div>
            <div class="invite-content">
                <p>Share this link with friends to invite them to this server!</p>
                <div class="invite-link-container">
                    <input type="text" class="invite-link" value="https://discord.gg/${inviteCode}" readonly>
                    <button class="copy-link-btn">Copy</button>
                </div>
                <div class="invite-settings">
                    <label>
                        <input type="checkbox" checked> Expire after 7 days
                    </label>
                    <label>
                        <input type="checkbox"> Limit to 1 use
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-invite');
    const copyBtn = modal.querySelector('.copy-link-btn');
    const inviteLink = modal.querySelector('.invite-link');

    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    copyBtn.addEventListener('click', () => {
        inviteLink.select();
        document.execCommand('copy');
        showNotification('Invite link copied to clipboard!', 'success');
    });
}

function showCreateChannelModal() {
    const modal = document.createElement('div');
    modal.className = 'create-channel-modal-overlay';
    modal.innerHTML = `
        <div class="create-channel-modal">
            <div class="create-channel-header">
                <h2>Create Channel</h2>
                <button class="close-create-channel">&times;</button>
            </div>
            <div class="create-channel-content">
                <div class="channel-type">
                    <div class="type-option active" data-type="text">
                        <i class="fas fa-hashtag"></i>
                        <div class="type-info">
                            <span class="type-name">Text Channel</span>
                            <span class="type-description">Send messages, images, GIFs, emoji, opinions, and puns</span>
                        </div>
                    </div>
                    <div class="type-option" data-type="voice">
                        <i class="fas fa-volume-up"></i>
                        <div class="type-info">
                            <span class="type-name">Voice Channel</span>
                            <span class="type-description">Hang out together with voice, video, and screen share</span>
                        </div>
                    </div>
                </div>
                <div class="channel-details">
                    <label for="channel-name">Channel Name</label>
                    <input type="text" id="channel-name" placeholder="new-channel">
                    <div class="channel-preview">
                        <i class="fas fa-hashtag"></i>
                        <span id="channel-preview-name">new-channel</span>
                    </div>
                </div>
                <div class="create-channel-actions">
                    <button class="cancel-channel-btn">Cancel</button>
                    <button class="create-channel-btn">Create Channel</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-create-channel');
    const cancelBtn = modal.querySelector('.cancel-channel-btn');
    const createBtn = modal.querySelector('.create-channel-btn');
    const typeOptions = modal.querySelectorAll('.type-option');
    const channelNameInput = modal.querySelector('#channel-name');
    const previewName = modal.querySelector('#channel-preview-name');
    const previewIcon = modal.querySelector('.channel-preview i');

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Type selection
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            const type = option.dataset.type;
            previewIcon.className = type === 'text' ? 'fas fa-hashtag' : 'fas fa-volume-up';
        });
    });

    // Name preview
    channelNameInput.addEventListener('input', (e) => {
        const name = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        e.target.value = name;
        previewName.textContent = name || 'new-channel';
    });

    // Create channel
    createBtn.addEventListener('click', () => {
        const channelName = channelNameInput.value.trim() || 'new-channel';
        const channelType = modal.querySelector('.type-option.active').dataset.type;
        createNewChannel(channelName, channelType);
        modal.remove();
    });
}

function createNewChannel(channelName, channelType) {
    const serverData = mockData.servers[currentServer];
    if (!serverData) return;

    const channelId = `${channelName}${channelType === 'voice' ? '-voice' : ''}`;

    // Add to server data
    serverData.channels[channelId] = {
        name: channelName,
        type: channelType,
        messages: []
    };

    // Add to UI
    const channelList = document.querySelector('.channel-list');
    const newChannelDiv = document.createElement('div');
    newChannelDiv.className = 'channel-item';
    newChannelDiv.dataset.channel = channelId;
    newChannelDiv.innerHTML = `
        <i class="fas fa-${channelType === 'text' ? 'hashtag' : 'volume-up'}"></i>
        <span>${channelName}</span>
    `;

    channelList.appendChild(newChannelDiv);

    // Add event listener
    newChannelDiv.addEventListener('click', function() {
        const channel = this.dataset.channel;
        if (channel) {
            if (channel.includes('voice')) {
                handleVoiceChannelClick(channel);
            } else {
                switchChannel(channel);
            }
        }
    });

    showNotification(`${channelType} channel "${channelName}" created!`, 'success');
}

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const channelSidebar = document.querySelector('.channel-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (channelSidebar && overlay) {
        const isOpen = channelSidebar.classList.contains('mobile-open');

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
}

function openMobileMenu() {
    const channelSidebar = document.querySelector('.channel-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');

    if (channelSidebar && overlay && toggle) {
        channelSidebar.classList.add('mobile-open');
        overlay.classList.add('show');
        toggle.innerHTML = '<i class="fas fa-times"></i>';

        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const channelSidebar = document.querySelector('.channel-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');

    if (channelSidebar && overlay && toggle) {
        channelSidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';

        // Restore body scrolling
        document.body.style.overflow = '';
    }
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

// Reaction functionality
function addReaction(messageId, emoji) {
    if (!messageReactions[messageId]) {
        messageReactions[messageId] = {};
    }

    if (!messageReactions[messageId][emoji]) {
        messageReactions[messageId][emoji] = [];
    }

    const userIndex = messageReactions[messageId][emoji].indexOf('jun');
    if (userIndex === -1) {
        messageReactions[messageId][emoji].push('jun');
    }

    updateMessageReactions(messageId);
    showNotification(`You reacted with ${emoji}`);
}

function toggleReaction(messageId, emoji) {
    if (!messageReactions[messageId] || !messageReactions[messageId][emoji]) {
        return addReaction(messageId, emoji);
    }

    const userIndex = messageReactions[messageId][emoji].indexOf('jun');
    if (userIndex !== -1) {
        messageReactions[messageId][emoji].splice(userIndex, 1);
        if (messageReactions[messageId][emoji].length === 0) {
            delete messageReactions[messageId][emoji];
        }
        showNotification(`Reaction ${emoji} removed`);
    } else {
        messageReactions[messageId][emoji].push('jun');
        showNotification(`You reacted with ${emoji}`);
    }

    updateMessageReactions(messageId);
}

function updateMessageReactions(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;

    const reactionsContainer = messageElement.querySelector('.message-reactions');
    const reactions = messageReactions[messageId] || {};

    const reactionHtml = Object.keys(reactions).map(emoji => {
        const count = reactions[emoji].length;
        const hasReacted = reactions[emoji].includes('jun');
        return `<span class="reaction ${hasReacted ? 'reacted' : ''}" data-emoji="${emoji}">${emoji} ${count}</span>`;
    }).join('');

    reactionsContainer.innerHTML = reactionHtml;

    // Re-add click events for reactions
    const reactionElements = reactionsContainer.querySelectorAll('.reaction');
    reactionElements.forEach(reaction => {
        reaction.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = reaction.dataset.emoji;
            toggleReaction(messageId, emoji);
        });
    });
}

function showEmojiPicker(messageId) {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'];

    const pickerHtml = `
        <div class="emoji-picker-overlay">
            <div class="emoji-picker">
                <div class="emoji-picker-header">Choose an emoji</div>
                <div class="emoji-grid">
                    ${emojis.map(emoji => `<span class="emoji-option" data-emoji="${emoji}">${emoji}</span>`).join('')}
                </div>
                <button class="close-emoji-picker">&times;</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', pickerHtml);

    const picker = document.querySelector('.emoji-picker-overlay');
    const emojiOptions = picker.querySelectorAll('.emoji-option');
    const closePicker = picker.querySelector('.close-emoji-picker');

    emojiOptions.forEach(option => {
        option.addEventListener('click', () => {
            const emoji = option.dataset.emoji;
            addReaction(messageId, emoji);
            picker.remove();
        });
    });

    closePicker.addEventListener('click', () => picker.remove());
    picker.addEventListener('click', (e) => {
        if (e.target === picker) picker.remove();
    });
}

// Add hover effects for better UX
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('message-action') || e.target.classList.contains('reaction')) {
        e.target.style.transform = 'scale(1.1)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('message-action') || e.target.classList.contains('reaction')) {
        e.target.style.transform = 'scale(1)';
    }
});

// Simulate real-time updates (optional)
setInterval(function() {
    // This could be used to simulate new messages or status updates
    // For now, we'll just keep the interface responsive
}, 1000);
