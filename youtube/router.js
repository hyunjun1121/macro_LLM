// Simple client-side router for YouTube clone
class YouTubeRouter {
    constructor() {
        this.routes = {};
        this.currentRoute = 'home';
        this.init();
    }

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute(e.state?.route || 'home', false);
        });

        // Initial route
        const initialRoute = this.getRouteFromURL();
        this.handleRoute(initialRoute, false);
    }

    getRouteFromURL() {
        const hash = window.location.hash.slice(1);
        if (!hash) return 'home';
        
        const parts = hash.split('/');
        return parts[0] || 'home';
    }

    getRouteParams() {
        const hash = window.location.hash.slice(1);
        const parts = hash.split('/');
        const params = {};
        
        if (parts[1]) {
            params.id = parts[1];
        }
        if (parts[2]) {
            params.query = decodeURIComponent(parts[2]);
        }
        
        return params;
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(route, params = {}, pushState = true) {
        let url = '#' + route;
        if (params.id) {
            url += '/' + params.id;
        }
        if (params.query) {
            url += '/' + encodeURIComponent(params.query);
        }

        if (pushState) {
            history.pushState({ route, params }, '', url);
        }
        
        this.handleRoute(route, false, params);
    }

    handleRoute(route, pushState = true, params = {}) {
        if (pushState) {
            this.navigate(route, params, true);
            return;
        }

        this.currentRoute = route;
        
        // Update active navigation item
        this.updateActiveNavigation(route);
        
        // Handle route
        if (this.routes[route]) {
            this.routes[route](params || this.getRouteParams());
        } else {
            this.routes['404'] && this.routes['404']();
        }
    }

    updateActiveNavigation(route) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current route
        const activeNavItem = document.querySelector(`[data-page="${route}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }
}

// Page renderer class
class PageRenderer {
    constructor() {
        this.mainContent = document.querySelector('.main-content');
    }

    renderHome() {
        this.mainContent.innerHTML = `
            <div class="filter-tags">
                <button class="tag active">All</button>
                <button class="tag">Music</button>
                <button class="tag">Gaming</button>
                <button class="tag">News</button>
                <button class="tag">Sports</button>
                <button class="tag">Movies</button>
                <button class="tag">Cooking</button>
                <button class="tag">Education</button>
                <button class="tag">Technology</button>
                <button class="tag">Travel</button>
            </div>
            <div class="video-grid" id="video-grid">
                ${this.renderVideoGrid(mockData.categories.all)}
            </div>
        `;
        
        this.attachFilterTagListeners();
        this.attachVideoClickListeners();
    }

    renderTrending() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>Trending</h1>
                <p>See what's trending on YouTube right now</p>
            </div>
            <div class="video-grid">
                ${this.renderVideoGrid(mockData.trending)}
            </div>
        `;
        
        this.attachVideoClickListeners();
    }

    renderSubscriptions() {
        const subscribedVideos = Object.values(mockData.videos)
            .filter(video => mockData.user.subscribedChannels.includes(video.channelId));
        
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>Subscriptions</h1>
                <p>Latest videos from your subscribed channels</p>
            </div>
            <div class="video-grid">
                ${subscribedVideos.length > 0 ? this.renderVideoGrid(subscribedVideos.map(v => v.id)) : '<p class="no-content">No videos from subscribed channels yet.</p>'}
            </div>
        `;
        
        this.attachVideoClickListeners();
    }

    renderLibrary() {
        const userPlaylists = mockData.user.playlists.map(id => mockData.playlists[id]).filter(p => p);
        
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>Library</h1>
                <p>Your saved videos and playlists</p>
            </div>
            
            <div class="library-sections">
                <div class="library-section">
                    <div class="section-header">
                        <h3>Recently created</h3>
                        <button class="btn-primary" onclick="window.playlistManager && window.playlistManager.showCreatePlaylistModal()">
                            <i class="fas fa-plus"></i> New playlist
                        </button>
                    </div>
                    <div class="playlist-grid">
                        ${userPlaylists.slice(0, 6).map(playlist => `
                            <div class="playlist-card" onclick="window.router.navigate('playlist', {id: '${playlist.id}'})">
                                <div class="playlist-thumbnail">
                                    ${playlist.thumbnail ? 
                                        `<img src="${playlist.thumbnail}" alt="${playlist.name}">` :
                                        `<div class="default-playlist-thumbnail">
                                            <i class="fas fa-list"></i>
                                            <span>${playlist.videos.length}</span>
                                        </div>`
                                    }
                                </div>
                                <div class="playlist-info">
                                    <h4>${playlist.name}</h4>
                                    <p>${playlist.videos.length} video${playlist.videos.length !== 1 ? 's' : ''}</p>
                                    <span class="playlist-privacy">
                                        <i class="fas fa-${this.getPrivacyIcon(playlist.privacy)}"></i>
                                        ${playlist.privacy}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="library-section">
                    <h3>Watch later</h3>
                    <div class="video-list">
                        ${mockData.user.watchLater.length > 0 ? 
                            mockData.user.watchLater.slice(0, 4).map(videoId => this.renderVideoItem(videoId)).join('') :
                            '<p class="no-content">No videos saved for later</p>'
                        }
                    </div>
                    ${mockData.user.watchLater.length > 4 ? 
                        `<button class="show-more" onclick="window.router.navigate('playlist', {id: 'watch_later'})">Show all</button>` : 
                        ''
                    }
                </div>
                
                <div class="library-section">
                    <h3>Liked videos</h3>
                    <div class="video-list">
                        ${mockData.user.likedVideos.length > 0 ? 
                            mockData.user.likedVideos.slice(0, 4).map(videoId => this.renderVideoItem(videoId)).join('') :
                            '<p class="no-content">No liked videos yet</p>'
                        }
                    </div>
                    ${mockData.user.likedVideos.length > 4 ? 
                        `<button class="show-more" onclick="window.router.navigate('playlist', {id: 'liked_videos'})">Show all</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        this.attachVideoClickListeners();
    }

    renderHistory() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>History</h1>
                <p>Videos you've watched</p>
            </div>
            <div class="video-list">
                ${mockData.user.watchHistory.length > 0 ? 
                    mockData.user.watchHistory.map(videoId => this.renderVideoItem(videoId)).join('') :
                    '<p class="no-content">No watch history yet</p>'
                }
            </div>
        `;
        
        this.attachVideoClickListeners();
    }

    renderSearchResults(params) {
        const query = params.query || '';
        const results = generateSearchResults(query);
        
        this.mainContent.innerHTML = `
            <div class="search-header">
                <h2>Search results for "${query}"</h2>
                <p>${results.length} results</p>
            </div>
            <div class="search-results">
                ${results.length > 0 ? 
                    results.map(video => this.renderSearchResultItem(video)).join('') :
                    '<p class="no-results">No results found for your search.</p>'
                }
            </div>
        `;
        
        this.attachVideoClickListeners();
    }

    renderVideoPlayer(params) {
        const videoId = params.id;
        const video = mockData.videos[videoId];

        if (!video) {
            this.render404('Video not found', 'The video you\'re looking for doesn\'t exist or has been removed.');
            return;
        }

        const channel = mockData.channels[video.channelId];
        const comments = mockData.comments[videoId] || [];

        this.mainContent.innerHTML = `
            <div class="video-player-container">
                <div class="video-player">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Video Player - ${video.title}</p>
                        <small>Duration: ${video.duration}</small>
                    </div>
                </div>
                
                <div class="video-info">
                    <h1 class="video-title">${video.title}</h1>
                    <div class="video-meta">
                        <span class="video-stats">${video.views} views • ${video.uploadDate}</span>
                        <div class="video-actions">
                            <button class="action-btn like-btn ${mockData.user.likedVideos.includes(videoId) ? 'active' : ''}">
                                <i class="fas fa-thumbs-up"></i>
                                <span>${this.formatNumber(video.likes)}</span>
                            </button>
                            <button class="action-btn dislike-btn">
                                <i class="fas fa-thumbs-down"></i>
                                <span>${this.formatNumber(video.dislikes)}</span>
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-share"></i>
                                Share
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-plus"></i>
                                Save
                            </button>
                        </div>
                    </div>
                    
                    <div class="channel-info">
                        <div class="channel-details">
                            <img src="${channel?.avatar}" alt="${video.channelName}" class="channel-avatar">
                            <div class="channel-text">
                                <h3 class="channel-name">${video.channelName} ${channel?.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}</h3>
                                <p class="subscriber-count">${channel?.subscribers} subscribers</p>
                            </div>
                        </div>
                        <button class="subscribe-btn ${mockData.user.subscribedChannels.includes(video.channelId) ? 'subscribed' : ''}">
                            ${mockData.user.subscribedChannels.includes(video.channelId) ? 'Subscribed' : 'Subscribe'}
                        </button>
                    </div>
                    
                    <div class="video-description">
                        <p>${video.description}</p>
                    </div>
                </div>
                
                <div class="comments-section">
                    <div class="comments-header">
                        <h3>${comments.length} Comments</h3>
                        <div class="comment-sort">
                            <button class="sort-btn active">Top comments</button>
                            <button class="sort-btn">Newest first</button>
                        </div>
                    </div>
                    
                    <div class="add-comment">
                        <img src="${mockData.user.avatar}" alt="Your avatar" class="user-avatar">
                        <input type="text" placeholder="Add a comment..." class="comment-input">
                    </div>
                    
                    <div class="comments-list">
                        ${comments.map(comment => this.renderComment(comment)).join('')}
                    </div>
                </div>
            </div>
            
            <div class="suggested-videos">
                <h3>Up next</h3>
                <div class="suggested-list">
                    ${this.renderSuggestedVideos(videoId)}
                </div>
            </div>
        `;

        // Add video to watch history
        if (!mockData.user.watchHistory.includes(videoId)) {
            mockData.user.watchHistory.unshift(videoId);
        }

        this.attachVideoPlayerListeners(videoId);
        this.attachVideoClickListeners();
    }

    renderVideoGrid(videoIds) {
        return videoIds.map(videoId => this.renderVideoItem(videoId)).join('');
    }

    renderVideoItem(videoId) {
        const video = mockData.videos[videoId];
        if (!video) return '';

        const channel = mockData.channels[video.channelId];
        
        return `
            <div class="video-item" data-video-id="${videoId}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="video-info">
                    <div class="channel-avatar">
                        <img src="${channel?.avatar || 'https://via.placeholder.com/36x36?text=CH'}" alt="${video.channelName}">
                    </div>
                    <div class="video-details">
                        <h3 class="video-title">${video.title}</h3>
                        <p class="channel-name">${video.channelName}</p>
                        <p class="video-stats">${video.views} views • ${video.uploadDate}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderSearchResultItem(video) {
        const channel = mockData.channels[video.channelId];
        
        return `
            <div class="search-result-item" data-video-id="${video.id}">
                <div class="result-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="result-info">
                    <h3 class="result-title">${video.title}</h3>
                    <p class="result-stats">${video.views} views • ${video.uploadDate}</p>
                    <div class="result-channel">
                        <img src="${channel?.avatar || 'https://via.placeholder.com/24x24?text=CH'}" alt="${video.channelName}">
                        <span class="channel-name">${video.channelName}</span>
                    </div>
                    <p class="result-description">${video.description}</p>
                </div>
            </div>
        `;
    }

    renderComment(comment) {
        return `
            <div class="comment">
                <img src="${comment.avatar}" alt="${comment.username}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.username}</span>
                        <span class="comment-time">${comment.timestamp}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-actions">
                        <button class="comment-action">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${comment.likes}</span>
                        </button>
                        <button class="comment-action">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                        <button class="comment-action">Reply</button>
                    </div>
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.replies.map(reply => this.renderReply(reply)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderReply(reply) {
        return `
            <div class="comment-reply">
                <img src="${reply.avatar}" alt="${reply.username}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${reply.username}</span>
                        <span class="comment-time">${reply.timestamp}</span>
                    </div>
                    <p class="comment-text">${reply.text}</p>
                    <div class="comment-actions">
                        <button class="comment-action">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${reply.likes}</span>
                        </button>
                        <button class="comment-action">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSuggestedVideos(currentVideoId) {
        const suggestions = Object.keys(mockData.videos)
            .filter(id => id !== currentVideoId)
            .slice(0, 10);
            
        return suggestions.map(videoId => {
            const video = mockData.videos[videoId];
            const channel = mockData.channels[video.channelId];
            
            return `
                <div class="suggested-video" data-video-id="${videoId}">
                    <div class="suggested-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}">
                        <span class="video-duration">${video.duration}</span>
                    </div>
                    <div class="suggested-info">
                        <h4 class="suggested-title">${video.title}</h4>
                        <p class="suggested-channel">${video.channelName}</p>
                        <p class="suggested-stats">${video.views} views</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    render404(title = '404 - Page Not Found', message = 'The page you\'re looking for doesn\'t exist.') {
        this.mainContent.innerHTML = `
            <div class="error-page">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1>${title}</h1>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="window.router.navigate('home')" class="btn-primary">
                        <i class="fas fa-home"></i>
                        Go Home
                    </button>
                    <button onclick="history.back()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Go Back
                    </button>
                </div>
                <div class="error-suggestions">
                    <h3>You might be interested in:</h3>
                    <div class="suggested-videos-grid">
                        ${this.renderRandomVideos(4)}
                    </div>
                </div>
            </div>
        `;

        this.attachVideoClickListeners();
    }

    renderRandomVideos(count = 4) {
        const allVideos = Object.keys(mockData.videos);
        const randomVideos = [];

        while (randomVideos.length < count && randomVideos.length < allVideos.length) {
            const randomIndex = Math.floor(Math.random() * allVideos.length);
            const videoId = allVideos[randomIndex];
            if (!randomVideos.includes(videoId)) {
                randomVideos.push(videoId);
            }
        }

        return randomVideos.map(videoId => this.renderVideoItem(videoId)).join('');
    }
    
    renderSettings() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>Settings</h1>
                <p>Manage your YouTube settings</p>
            </div>
            
            <div class="settings-sections">
                <div class="settings-section">
                    <h3>Account</h3>
                    <div class="setting-item">
                        <label>Channel name</label>
                        <input type="text" value="${mockData.user.name}" onchange="mockData.user.name = this.value">
                    </div>
                    <div class="setting-item">
                        <label>Email</label>
                        <input type="email" value="${mockData.user.email}" onchange="mockData.user.email = this.value">
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Privacy</h3>
                    <div class="setting-item checkbox">
                        <input type="checkbox" id="private-subscriptions" checked>
                        <label for="private-subscriptions">Keep all my subscriptions private</label>
                    </div>
                    <div class="setting-item checkbox">
                        <input type="checkbox" id="private-playlists">
                        <label for="private-playlists">Keep all my saved playlists private</label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Notifications</h3>
                    <div class="setting-item checkbox">
                        <input type="checkbox" id="email-notifications" checked>
                        <label for="email-notifications">Send me email notifications</label>
                    </div>
                    <div class="setting-item checkbox">
                        <input type="checkbox" id="push-notifications" checked>
                        <label for="push-notifications">Send me push notifications</label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Playback and performance</h3>
                    <div class="setting-item">
                        <label>Default video quality</label>
                        <select>
                            <option value="auto" selected>Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                        </select>
                    </div>
                    <div class="setting-item checkbox">
                        <input type="checkbox" id="autoplay" checked>
                        <label for="autoplay">Autoplay next video</label>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderStudio() {
        const userVideos = Object.values(mockData.videos)
            .filter(video => video.channelId === mockData.user.id)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>YouTube Studio</h1>
                <p>Manage your content and channel</p>
            </div>
            
            <div class="studio-dashboard">
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h3>Views</h3>
                        <p class="stat-number">${this.formatNumber(userVideos.reduce((sum, video) => sum + parseInt(video.views.replace(/[^\d]/g, '')), 0))}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Subscribers</h3>
                        <p class="stat-number">1.2K</p>
                    </div>
                    <div class="stat-card">
                        <h3>Videos</h3>
                        <p class="stat-number">${userVideos.length}</p>
                    </div>
                </div>
                
                <div class="studio-actions">
                    <button class="btn-primary" onclick="contentManager.showUploadModal()">
                        <i class="fas fa-upload"></i> Upload video
                    </button>
                    <button class="btn-secondary">
                        <i class="fas fa-broadcast-tower"></i> Go live
                    </button>
                    <button class="btn-secondary">
                        <i class="fas fa-edit"></i> Create post
                    </button>
                </div>
                
                <div class="recent-videos">
                    <h3>Recent uploads</h3>
                    <div class="video-management-list">
                        ${userVideos.length > 0 ? 
                            userVideos.slice(0, 10).map(video => `
                                <div class="video-management-item">
                                    <div class="video-thumbnail">
                                        <img src="${video.thumbnail}" alt="${video.title}">
                                    </div>
                                    <div class="video-details">
                                        <h4>${video.title}</h4>
                                        <p>${video.views} views • ${video.uploadDate}</p>
                                        <p class="video-description-preview">${video.description.substring(0, 100)}...</p>
                                    </div>
                                    <div class="video-actions">
                                        <button class="btn-secondary" onclick="alert('Edit functionality not implemented in demo')">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn-secondary">
                                            <i class="fas fa-chart-line"></i> Analytics
                                        </button>
                                    </div>
                                </div>
                            `).join('') :
                            '<div class="no-content">No videos uploaded yet. <button class="btn-primary" onclick="contentManager.showUploadModal()">Upload your first video</button></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderHelp() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>Help & Support</h1>
                <p>Get help using YouTube and learn about our features</p>
            </div>

            <div class="help-sections">
                <div class="help-section">
                    <h3>Getting Started</h3>
                    <div class="help-items">
                        <div class="help-item">
                            <h4>How to search for videos</h4>
                            <p>Use the search bar at the top or press <kbd>/</kbd> to focus it. You can also use voice search by clicking the microphone icon.</p>
                        </div>
                        <div class="help-item">
                            <h4>Navigating with keyboard shortcuts</h4>
                            <p>Press <kbd>?</kbd> to see all available keyboard shortcuts. Use <kbd>H</kbd>, <kbd>T</kbd>, <kbd>S</kbd>, <kbd>L</kbd> to navigate between sections.</p>
                        </div>
                        <div class="help-item">
                            <h4>Managing playlists</h4>
                            <p>Create custom playlists to organize your favorite videos. Click the "Save" button on any video to add it to a playlist.</p>
                        </div>
                    </div>
                </div>

                <div class="help-section">
                    <h3>Video Management</h3>
                    <div class="help-items">
                        <div class="help-item">
                            <h4>Uploading videos</h4>
                            <p>Click the "+" button in the top right or press <kbd>U</kbd> to upload a new video. You can drag and drop files directly.</p>
                        </div>
                        <div class="help-item">
                            <h4>Video privacy settings</h4>
                            <p>Choose between Public, Unlisted, or Private when uploading. You can change these settings later in YouTube Studio.</p>
                        </div>
                        <div class="help-item">
                            <h4>Managing your content</h4>
                            <p>Visit YouTube Studio to edit video details, view analytics, and manage your channel.</p>
                        </div>
                    </div>
                </div>

                <div class="help-section">
                    <h3>Community Features</h3>
                    <div class="help-items">
                        <div class="help-item">
                            <h4>Comments and interactions</h4>
                            <p>Like, reply to, and report comments. Use formatting like *bold* and _italic_ in your comments.</p>
                        </div>
                        <div class="help-item">
                            <h4>Subscriptions</h4>
                            <p>Subscribe to channels you enjoy. View all content from subscribed channels in the Subscriptions section.</p>
                        </div>
                        <div class="help-item">
                            <h4>Notifications</h4>
                            <p>Get notified when channels you subscribe to upload new content or go live.</p>
                        </div>
                    </div>
                </div>

                <div class="help-section">
                    <h3>Troubleshooting</h3>
                    <div class="help-items">
                        <div class="help-item">
                            <h4>Video won't play</h4>
                            <p>This is a demo site with placeholder videos. In a real implementation, check your internet connection and browser compatibility.</p>
                        </div>
                        <div class="help-item">
                            <h4>Voice search not working</h4>
                            <p>Voice search requires microphone permissions and works best in Chrome or Edge browsers.</p>
                        </div>
                        <div class="help-item">
                            <h4>Upload failing</h4>
                            <p>Check file format, size limits, and ensure you have a stable internet connection.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="help-footer">
                <h3>Still need help?</h3>
                <p>This is a demo version of YouTube with simulated functionality. In a real implementation, you would find additional support resources here.</p>
            </div>
        `;
    }

    attachFilterTagListeners() {
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.textContent.toLowerCase();
                const videoIds = mockData.categories[category] || mockData.categories.all;
                
                document.getElementById('video-grid').innerHTML = this.renderVideoGrid(videoIds);
                this.attachVideoClickListeners();
            });
        });
    }

    attachVideoClickListeners() {
        document.querySelectorAll('.video-item, .search-result-item, .suggested-video').forEach(item => {
            item.addEventListener('click', (e) => {
                const videoId = item.dataset.videoId;
                if (videoId) {
                    window.router.navigate('watch', { id: videoId });
                }
            });
        });
    }

    attachVideoPlayerListeners(videoId) {
        // Like button
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                const video = mockData.videos[videoId];
                if (mockData.user.likedVideos.includes(videoId)) {
                    // Unlike
                    mockData.user.likedVideos = mockData.user.likedVideos.filter(id => id !== videoId);
                    video.likes--;
                    likeBtn.classList.remove('active');
                } else {
                    // Like
                    mockData.user.likedVideos.push(videoId);
                    video.likes++;
                    likeBtn.classList.add('active');
                }
                likeBtn.querySelector('span').textContent = this.formatNumber(video.likes);
            });
        }

        // Subscribe button
        const subscribeBtn = document.querySelector('.subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                const video = mockData.videos[videoId];
                if (mockData.user.subscribedChannels.includes(video.channelId)) {
                    // Unsubscribe
                    mockData.user.subscribedChannels = mockData.user.subscribedChannels.filter(id => id !== video.channelId);
                    subscribeBtn.textContent = 'Subscribe';
                    subscribeBtn.classList.remove('subscribed');
                } else {
                    // Subscribe
                    mockData.user.subscribedChannels.push(video.channelId);
                    subscribeBtn.textContent = 'Subscribed';
                    subscribeBtn.classList.add('subscribed');
                }
            });
        }
        
        // Save button (add to playlist)
        const saveBtn = document.querySelector('.action-btn[onclick*="Save"]');
        if (saveBtn) {
            saveBtn.onclick = () => {
                if (window.playlistManager) {
                    window.playlistManager.showSaveToPlaylistModal(videoId);
                }
            };
        }
        
        // Share button
        const shareBtn = document.querySelector('.action-btn[onclick*="Share"]');
        if (shareBtn) {
            shareBtn.onclick = () => this.shareVideo(videoId);
        }
        
        // Download button
        const downloadBtn = document.querySelector('.action-btn[onclick*="Download"]');
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadVideo(videoId);
        }
        
        // Initialize comment system
        if (window.commentSystem) {
            window.commentSystem.init(videoId);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }
    
    shareVideo(videoId) {
        const video = mockData.videos[videoId];
        const url = `${window.location.origin}${window.location.pathname}#watch/${videoId}`;
        
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url: url
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                alert('Video link copied to clipboard!');
            }).catch(() => {
                prompt('Copy this link to share the video:', url);
            });
        }
    }
    
    downloadVideo(videoId) {
        const video = mockData.videos[videoId];
        // Simulate download
        alert(`Downloading "${video.title}"...\n\nIn a real implementation, this would start the video download.`);
    }
}

// Initialize router and renderer
window.router = new YouTubeRouter();
window.renderer = new PageRenderer();

// Define routes
window.router.addRoute('home', () => window.renderer.renderHome());
window.router.addRoute('trending', () => window.renderer.renderTrending());
window.router.addRoute('subscriptions', () => window.renderer.renderSubscriptions());
window.router.addRoute('library', () => window.renderer.renderLibrary());
window.router.addRoute('history', () => window.renderer.renderHistory());
window.router.addRoute('search', (params) => window.renderer.renderSearchResults(params));
window.router.addRoute('watch', (params) => window.renderer.renderVideoPlayer(params));
window.router.addRoute('playlist', (params) => window.playlistManager && window.playlistManager.showPlaylistPage(params.id));
window.router.addRoute('settings', () => window.renderer.renderSettings());
window.router.addRoute('studio', () => window.renderer.renderStudio());
window.router.addRoute('help', () => window.renderer.renderHelp());
window.router.addRoute('404', () => window.renderer.render404());