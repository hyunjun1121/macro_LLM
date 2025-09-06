// Playlist Creation and Management System

class PlaylistManager {
    constructor() {
        this.init();
        this.setupPlaylists();
    }

    init() {
        // Initialize playlist data structure in mockData
        if (!mockData.playlists) {
            mockData.playlists = {};
        }
        if (!mockData.user.playlists) {
            mockData.user.playlists = [];
        }
    }

    setupPlaylists() {
        // Create default playlists
        this.createDefaultPlaylists();
    }

    createDefaultPlaylists() {
        const defaultPlaylists = [
            {
                id: 'liked_videos',
                name: 'Liked videos',
                description: 'Videos you have liked',
                privacy: 'private',
                videos: mockData.user.likedVideos || [],
                thumbnail: null,
                created: '2024-01-01',
                isDefault: true
            },
            {
                id: 'watch_later',
                name: 'Watch later',
                description: 'Videos to watch later',
                privacy: 'private', 
                videos: mockData.user.watchLater || [],
                thumbnail: null,
                created: '2024-01-01',
                isDefault: true
            }
        ];

        defaultPlaylists.forEach(playlist => {
            mockData.playlists[playlist.id] = playlist;
            if (!mockData.user.playlists.includes(playlist.id)) {
                mockData.user.playlists.push(playlist.id);
            }
        });
    }

    showCreatePlaylistModal() {
        const modal = document.createElement('div');
        modal.className = 'playlist-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Create new playlist</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-section">
                            <label for="playlist-name">Name</label>
                            <input type="text" id="playlist-name" placeholder="Enter playlist name" maxlength="150">
                            <div class="char-count">0/150</div>
                        </div>
                        
                        <div class="form-section">
                            <label for="playlist-description">Description</label>
                            <textarea id="playlist-description" placeholder="Add a description" rows="4"></textarea>
                        </div>
                        
                        <div class="form-section">
                            <label>Privacy</label>
                            <div class="privacy-options">
                                <div class="privacy-option">
                                    <input type="radio" id="privacy-public" name="privacy" value="public">
                                    <label for="privacy-public">
                                        <i class="fas fa-globe"></i>
                                        <div>
                                            <strong>Public</strong>
                                            <p>Anyone can search for and view</p>
                                        </div>
                                    </label>
                                </div>
                                <div class="privacy-option">
                                    <input type="radio" id="privacy-unlisted" name="privacy" value="unlisted">
                                    <label for="privacy-unlisted">
                                        <i class="fas fa-link"></i>
                                        <div>
                                            <strong>Unlisted</strong>
                                            <p>Anyone with the link can view</p>
                                        </div>
                                    </label>
                                </div>
                                <div class="privacy-option">
                                    <input type="radio" id="privacy-private" name="privacy" value="private" checked>
                                    <label for="privacy-private">
                                        <i class="fas fa-lock"></i>
                                        <div>
                                            <strong>Private</strong>
                                            <p>Only you can view</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="playlistManager.closeCreateModal()">Cancel</button>
                        <button class="btn-primary" onclick="playlistManager.createPlaylist()">Create</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Character counter
        modal.querySelector('#playlist-name').addEventListener('input', (e) => {
            const count = e.target.value.length;
            e.target.nextElementSibling.textContent = `${count}/150`;
        });
        
        // Close handlers
        modal.querySelector('.modal-close').onclick = () => this.closeCreateModal();
        modal.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target === e.currentTarget) this.closeCreateModal();
        };
        
        modal.querySelector('#playlist-name').focus();
    }

    closeCreateModal() {
        const modal = document.querySelector('.playlist-modal');
        if (modal) modal.remove();
    }

    createPlaylist() {
        const name = document.getElementById('playlist-name').value.trim();
        const description = document.getElementById('playlist-description').value.trim();
        const privacy = document.querySelector('input[name="privacy"]:checked').value;
        
        if (!name) {
            alert('Please enter a playlist name.');
            return;
        }
        
        const playlistId = 'playlist_' + Date.now();
        const playlist = {
            id: playlistId,
            name: name,
            description: description || '',
            privacy: privacy,
            videos: [],
            thumbnail: null,
            created: new Date().toISOString().split('T')[0],
            isDefault: false,
            createdBy: mockData.user.id
        };
        
        mockData.playlists[playlistId] = playlist;
        mockData.user.playlists.push(playlistId);
        
        this.closeCreateModal();
        alert(`Playlist "${name}" created successfully!`);
        
        // Refresh library page if currently viewing
        if (router.currentRoute === 'library') {
            router.handleRoute('library', false);
        }
    }

    showSaveToPlaylistModal(videoId) {
        const video = mockData.videos[videoId];
        if (!video) return;
        
        const userPlaylists = mockData.user.playlists.map(id => mockData.playlists[id]);
        
        const modal = document.createElement('div');
        modal.className = 'save-playlist-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Save to playlist</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="playlist-list">
                            ${userPlaylists.map(playlist => `
                                <div class="playlist-item">
                                    <label class="playlist-checkbox">
                                        <input type="checkbox" value="${playlist.id}" 
                                            ${playlist.videos.includes(videoId) ? 'checked' : ''}>
                                        <span class="checkmark"></span>
                                        <div class="playlist-info">
                                            <span class="playlist-name">${playlist.name}</span>
                                            <span class="playlist-privacy">
                                                <i class="fas fa-${this.getPrivacyIcon(playlist.privacy)}"></i>
                                                ${playlist.privacy}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        <div class="create-new-playlist">
                            <button class="btn-secondary" onclick="playlistManager.showCreatePlaylistModal()">
                                <i class="fas fa-plus"></i>
                                Create new playlist
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="playlistManager.closeSaveModal()">Cancel</button>
                        <button class="btn-primary" onclick="playlistManager.saveToPlaylists('${videoId}')">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.modal-close').onclick = () => this.closeSaveModal();
        modal.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target === e.currentTarget) this.closeSaveModal();
        };
    }

    closeSaveModal() {
        const modal = document.querySelector('.save-playlist-modal');
        if (modal) modal.remove();
    }

    saveToPlaylists(videoId) {
        const checkboxes = document.querySelectorAll('.playlist-checkbox input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            const playlistId = checkbox.value;
            const playlist = mockData.playlists[playlistId];
            const isChecked = checkbox.checked;
            const hasVideo = playlist.videos.includes(videoId);
            
            if (isChecked && !hasVideo) {
                // Add video to playlist
                playlist.videos.push(videoId);
            } else if (!isChecked && hasVideo) {
                // Remove video from playlist
                playlist.videos = playlist.videos.filter(id => id !== videoId);
            }
        });
        
        this.closeSaveModal();
        alert('Changes saved to playlists!');
    }

    getPrivacyIcon(privacy) {
        switch (privacy) {
            case 'public': return 'globe';
            case 'unlisted': return 'link';
            case 'private': return 'lock';
            default: return 'lock';
        }
    }

    showPlaylistPage(playlistId) {
        const playlist = mockData.playlists[playlistId];
        if (!playlist) {
            router.handleRoute('404');
            return;
        }
        
        const videos = playlist.videos.map(videoId => mockData.videos[videoId]).filter(v => v);
        const isOwner = playlist.createdBy === mockData.user.id;
        
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="playlist-header">
                <div class="playlist-thumbnail">
                    ${playlist.thumbnail ? 
                        `<img src="${playlist.thumbnail}" alt="${playlist.name}">` :
                        `<div class="default-playlist-thumbnail">
                            <i class="fas fa-list"></i>
                        </div>`
                    }
                </div>
                <div class="playlist-info">
                    <h1 class="playlist-title">${playlist.name}</h1>
                    <div class="playlist-meta">
                        <span class="playlist-creator">${mockData.user.name}</span>
                        <span class="playlist-stats">${videos.length} video${videos.length !== 1 ? 's' : ''}</span>
                        <span class="playlist-privacy">
                            <i class="fas fa-${this.getPrivacyIcon(playlist.privacy)}"></i>
                            ${playlist.privacy}
                        </span>
                    </div>
                    ${playlist.description ? `<p class="playlist-description">${playlist.description}</p>` : ''}
                    <div class="playlist-actions">
                        <button class="btn-primary" onclick="playlistManager.playAll('${playlistId}')">
                            <i class="fas fa-play"></i>
                            Play all
                        </button>
                        <button class="btn-secondary" onclick="playlistManager.shufflePlay('${playlistId}')">
                            <i class="fas fa-random"></i>
                            Shuffle
                        </button>
                        ${isOwner ? `
                            <button class="btn-secondary" onclick="playlistManager.editPlaylist('${playlistId}')">
                                <i class="fas fa-edit"></i>
                                Edit
                            </button>
                            <button class="btn-secondary" onclick="playlistManager.deletePlaylist('${playlistId}')">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        ` : ''}
                        <button class="btn-secondary" onclick="playlistManager.sharePlaylist('${playlistId}')">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="playlist-videos">
                <div class="playlist-controls">
                    <div class="sort-options">
                        <select onchange="playlistManager.sortPlaylist('${playlistId}', this.value)">
                            <option value="manual">Manual order</option>
                            <option value="date_added">Date added (newest)</option>
                            <option value="date_added_old">Date added (oldest)</option>
                            <option value="popularity">Most popular</option>
                            <option value="date_published">Date published (newest)</option>
                        </select>
                    </div>
                </div>
                
                <div class="video-list-detailed">
                    ${videos.length > 0 ? 
                        videos.map((video, index) => this.renderPlaylistVideo(video, index, playlistId, isOwner)).join('') :
                        '<div class="empty-playlist"><p>This playlist is empty. Add some videos!</p></div>'
                    }
                </div>
            </div>
        `;
    }

    renderPlaylistVideo(video, index, playlistId, isOwner) {
        return `
            <div class="playlist-video-item" data-video-id="${video.id}">
                <div class="video-index">${index + 1}</div>
                <div class="video-thumbnail" onclick="router.navigate('watch', {id: '${video.id}'})">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-details" onclick="router.navigate('watch', {id: '${video.id}'})">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-channel">${video.channelName}</p>
                    <p class="video-stats">${video.views} views</p>
                </div>
                <div class="video-duration">${video.duration}</div>
                ${isOwner ? `
                    <div class="video-actions">
                        <button class="action-btn" onclick="playlistManager.removeFromPlaylist('${playlistId}', '${video.id}')" title="Remove from playlist">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="action-btn drag-handle" title="Drag to reorder">
                            <i class="fas fa-grip-vertical"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    playAll(playlistId) {
        const playlist = mockData.playlists[playlistId];
        if (playlist.videos.length > 0) {
            router.navigate('watch', { id: playlist.videos[0] });
        }
    }

    shufflePlay(playlistId) {
        const playlist = mockData.playlists[playlistId];
        if (playlist.videos.length > 0) {
            const randomIndex = Math.floor(Math.random() * playlist.videos.length);
            router.navigate('watch', { id: playlist.videos[randomIndex] });
        }
    }

    editPlaylist(playlistId) {
        const playlist = mockData.playlists[playlistId];
        const modal = document.createElement('div');
        modal.className = 'playlist-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit playlist details</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-section">
                            <label for="edit-playlist-name">Name</label>
                            <input type="text" id="edit-playlist-name" value="${playlist.name}" maxlength="150">
                            <div class="char-count">${playlist.name.length}/150</div>
                        </div>
                        
                        <div class="form-section">
                            <label for="edit-playlist-description">Description</label>
                            <textarea id="edit-playlist-description" rows="4">${playlist.description}</textarea>
                        </div>
                        
                        <div class="form-section">
                            <label>Privacy</label>
                            <div class="privacy-options">
                                <div class="privacy-option">
                                    <input type="radio" id="edit-privacy-public" name="edit-privacy" value="public" ${playlist.privacy === 'public' ? 'checked' : ''}>
                                    <label for="edit-privacy-public">
                                        <i class="fas fa-globe"></i>
                                        <div>
                                            <strong>Public</strong>
                                            <p>Anyone can search for and view</p>
                                        </div>
                                    </label>
                                </div>
                                <div class="privacy-option">
                                    <input type="radio" id="edit-privacy-unlisted" name="edit-privacy" value="unlisted" ${playlist.privacy === 'unlisted' ? 'checked' : ''}>
                                    <label for="edit-privacy-unlisted">
                                        <i class="fas fa-link"></i>
                                        <div>
                                            <strong>Unlisted</strong>
                                            <p>Anyone with the link can view</p>
                                        </div>
                                    </label>
                                </div>
                                <div class="privacy-option">
                                    <input type="radio" id="edit-privacy-private" name="edit-privacy" value="private" ${playlist.privacy === 'private' ? 'checked' : ''}>
                                    <label for="edit-privacy-private">
                                        <i class="fas fa-lock"></i>
                                        <div>
                                            <strong>Private</strong>
                                            <p>Only you can view</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="playlistManager.closeEditModal()">Cancel</button>
                        <button class="btn-primary" onclick="playlistManager.savePlaylistEdits('${playlistId}')">Save changes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Character counter
        modal.querySelector('#edit-playlist-name').addEventListener('input', (e) => {
            const count = e.target.value.length;
            e.target.nextElementSibling.textContent = `${count}/150`;
        });
        
        // Close handlers
        modal.querySelector('.modal-close').onclick = () => this.closeEditModal();
        modal.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target === e.currentTarget) this.closeEditModal();
        };
    }

    closeEditModal() {
        const modal = document.querySelector('.playlist-modal');
        if (modal) modal.remove();
    }

    savePlaylistEdits(playlistId) {
        const playlist = mockData.playlists[playlistId];
        const name = document.getElementById('edit-playlist-name').value.trim();
        const description = document.getElementById('edit-playlist-description').value.trim();
        const privacy = document.querySelector('input[name="edit-privacy"]:checked').value;
        
        if (!name) {
            alert('Please enter a playlist name.');
            return;
        }
        
        playlist.name = name;
        playlist.description = description;
        playlist.privacy = privacy;
        
        this.closeEditModal();
        alert('Playlist updated successfully!');
        
        // Refresh page
        this.showPlaylistPage(playlistId);
    }

    deletePlaylist(playlistId) {
        const playlist = mockData.playlists[playlistId];
        if (playlist.isDefault) {
            alert('Cannot delete default playlists.');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`)) {
            return;
        }
        
        delete mockData.playlists[playlistId];
        mockData.user.playlists = mockData.user.playlists.filter(id => id !== playlistId);
        
        alert('Playlist deleted successfully.');
        router.navigate('library');
    }

    removeFromPlaylist(playlistId, videoId) {
        const playlist = mockData.playlists[playlistId];
        playlist.videos = playlist.videos.filter(id => id !== videoId);
        
        // Refresh page
        this.showPlaylistPage(playlistId);
    }

    sortPlaylist(playlistId, sortBy) {
        const playlist = mockData.playlists[playlistId];
        const videos = playlist.videos.map(id => ({ id, data: mockData.videos[id] })).filter(v => v.data);
        
        switch (sortBy) {
            case 'date_added':
                // Newest first (reverse current order)
                playlist.videos = videos.reverse().map(v => v.id);
                break;
            case 'popularity':
                videos.sort((a, b) => {
                    const viewsA = parseInt(a.data.views.replace(/[^\d]/g, ''));
                    const viewsB = parseInt(b.data.views.replace(/[^\d]/g, ''));
                    return viewsB - viewsA;
                });
                playlist.videos = videos.map(v => v.id);
                break;
            case 'date_published':
                videos.sort((a, b) => new Date(b.data.uploadDate) - new Date(a.data.uploadDate));
                playlist.videos = videos.map(v => v.id);
                break;
            // 'manual' and 'date_added_old' keep current order
        }
        
        this.showPlaylistPage(playlistId);
    }

    sharePlaylist(playlistId) {
        const playlist = mockData.playlists[playlistId];
        if (playlist.privacy === 'private') {
            alert('Private playlists cannot be shared. Change privacy settings to share.');
            return;
        }
        
        const url = `${window.location.origin}${window.location.pathname}#playlist/${playlistId}`;
        
        if (navigator.share) {
            navigator.share({
                title: playlist.name,
                text: `Check out this playlist: ${playlist.name}`,
                url: url
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(url).then(() => {
                alert('Playlist link copied to clipboard!');
            }).catch(() => {
                prompt('Copy this link to share the playlist:', url);
            });
        }
    }
}

// Make PlaylistManager globally available
window.PlaylistManager = PlaylistManager;

// Initialize playlist manager will be done in script.js