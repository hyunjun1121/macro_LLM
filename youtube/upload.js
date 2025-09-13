// Video Upload and Content Creation System

class ContentManager {
    constructor() {
        this.uploadModal = null;
        this.notificationPanel = null;
        this.init();
    }

    init() {
        this.createUploadModal();
        this.createNotificationPanel();
        this.attachEventListeners();
    }

    createUploadModal() {
        this.uploadModal = document.createElement('div');
        this.uploadModal.className = 'upload-modal';
        this.uploadModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Upload Video</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-tabs">
                            <button class="upload-tab active" data-tab="upload">Upload Video</button>
                            <button class="upload-tab" data-tab="live">Go Live</button>
                            <button class="upload-tab" data-tab="post">Create Post</button>
                        </div>
                        
                        <div class="upload-content" id="upload-tab">
                            <div class="upload-area" id="upload-area">
                                <div class="upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <h3>Drag and drop video files to upload</h3>
                                <p>Your videos will be private until you publish them.</p>
                                <input type="file" id="video-file" accept="video/*" multiple style="display: none;">
                                <button class="btn-primary" onclick="document.getElementById('video-file').click()">
                                    SELECT FILES
                                </button>
                            </div>
                            
                            <div class="upload-form" id="upload-form" style="display: none;">
                                <div class="form-section">
                                    <label for="video-title">Title (required)</label>
                                    <input type="text" id="video-title" placeholder="Add a title that describes your video" maxlength="100">
                                    <div class="char-count">0/100</div>
                                </div>
                                
                                <div class="form-section">
                                    <label for="video-description">Description</label>
                                    <textarea id="video-description" placeholder="Tell viewers about your video" rows="8"></textarea>
                                </div>
                                
                                <div class="form-section">
                                    <label for="video-thumbnail">Thumbnail</label>
                                    <div class="thumbnail-options">
                                        <div class="thumbnail-option auto active">
                                            <img src="https://via.placeholder.com/160x90?text=Auto" alt="Auto thumbnail">
                                            <span>Auto-generated</span>
                                        </div>
                                        <div class="thumbnail-option custom">
                                            <div class="custom-thumbnail">
                                                <i class="fas fa-plus"></i>
                                                <span>Custom</span>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" id="thumbnail-file" accept="image/*" style="display: none;">
                                </div>
                                
                                <div class="form-section">
                                    <label for="video-visibility">Visibility</label>
                                    <select id="video-visibility">
                                        <option value="private">Private</option>
                                        <option value="unlisted">Unlisted</option>
                                        <option value="public">Public</option>
                                    </select>
                                </div>
                                
                                <div class="form-section">
                                    <label for="video-category">Category</label>
                                    <select id="video-category">
                                        <option value="entertainment">Entertainment</option>
                                        <option value="education">Education</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="music">Music</option>
                                        <option value="news">News & Politics</option>
                                        <option value="sports">Sports</option>
                                        <option value="technology">Science & Technology</option>
                                        <option value="travel">Travel & Events</option>
                                    </select>
                                </div>
                                
                                <div class="form-actions">
                                    <button class="btn-secondary" onclick="contentManager.closeUploadModal()">Cancel</button>
                                    <button class="btn-primary" onclick="contentManager.publishVideo()">Publish</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="upload-content" id="live-tab" style="display: none;">
                            <div class="live-setup">
                                <div class="live-preview">
                                    <div class="camera-preview">
                                        <i class="fas fa-video"></i>
                                        <p>Camera preview will appear here</p>
                                    </div>
                                </div>
                                <div class="live-form">
                                    <div class="form-section">
                                        <label for="live-title">Stream title</label>
                                        <input type="text" id="live-title" placeholder="Describe your live stream">
                                    </div>
                                    <div class="form-section">
                                        <label for="live-description">Description</label>
                                        <textarea id="live-description" placeholder="Tell viewers about your stream" rows="4"></textarea>
                                    </div>
                                    <div class="form-section">
                                        <label for="live-visibility">Visibility</label>
                                        <select id="live-visibility">
                                            <option value="public">Public</option>
                                            <option value="unlisted">Unlisted</option>
                                        </select>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn-secondary">Save for later</button>
                                        <button class="btn-primary live-btn">Go Live</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="upload-content" id="post-tab" style="display: none;">
                            <div class="post-creator">
                                <div class="form-section">
                                    <label for="post-content">Create a post</label>
                                    <textarea id="post-content" placeholder="Share something with your community..." rows="6"></textarea>
                                </div>
                                <div class="post-options">
                                    <button class="post-option">
                                        <i class="fas fa-image"></i>
                                        Add photo
                                    </button>
                                    <button class="post-option">
                                        <i class="fas fa-video"></i>
                                        Add video
                                    </button>
                                    <button class="post-option">
                                        <i class="fas fa-poll"></i>
                                        Create poll
                                    </button>
                                </div>
                                <div class="form-actions">
                                    <button class="btn-secondary">Save draft</button>
                                    <button class="btn-primary">Post</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.uploadModal);
    }

    createNotificationPanel() {
        this.notificationPanel = document.createElement('div');
        this.notificationPanel.className = 'notification-panel';
        this.notificationPanel.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read">Mark all as read</button>
            </div>
            <div class="notification-list">
                <div class="notification-item unread">
                    <img src="https://via.placeholder.com/32x32?text=CH" alt="Channel" class="notification-avatar">
                    <div class="notification-content">
                        <p><strong>Gaming Central</strong> uploaded a new video: "Epic Gaming Moments - Part 2"</p>
                        <span class="notification-time">2 hours ago</span>
                    </div>
                </div>
                <div class="notification-item unread">
                    <img src="https://via.placeholder.com/32x32?text=ST" alt="Channel" class="notification-avatar">
                    <div class="notification-content">
                        <p><strong>Science Today</strong> is live now: "Breaking: New Scientific Discovery"</p>
                        <span class="notification-time">3 hours ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <img src="https://via.placeholder.com/32x32?text=CA" alt="Channel" class="notification-avatar">
                    <div class="notification-content">
                        <p><strong>Code Academy</strong> uploaded: "Advanced JavaScript Concepts"</p>
                        <span class="notification-time">1 day ago</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.notificationPanel);
    }

    attachEventListeners() {
        // Create button
        document.querySelector('.create-btn').addEventListener('click', () => {
            this.showUploadModal();
        });

        // Notification button
        document.querySelector('.notification-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationPanel();
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (this.notificationPanel.style.display === 'block' && 
                !this.notificationPanel.contains(e.target) && 
                !e.target.closest('.notification-btn')) {
                this.hideNotificationPanel();
            }
        });

        // Modal close button
        this.uploadModal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeUploadModal();
        });

        // Modal overlay click
        this.uploadModal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeUploadModal();
            }
        });

        // Upload tabs
        this.uploadModal.querySelectorAll('.upload-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchUploadTab(tab.dataset.tab);
            });
        });

        // File upload handling
        document.getElementById('video-file').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Title character count
        document.getElementById('video-title').addEventListener('input', (e) => {
            const charCount = e.target.value.length;
            e.target.nextElementSibling.textContent = `${charCount}/100`;
        });

        // Custom thumbnail
        document.querySelector('.custom-thumbnail').addEventListener('click', () => {
            document.getElementById('thumbnail-file').click();
        });

        document.getElementById('thumbnail-file').addEventListener('change', (e) => {
            this.handleThumbnailUpload(e.target.files[0]);
        });

        // Mark notifications as read
        this.notificationPanel.querySelector('.mark-all-read').addEventListener('click', () => {
            this.markAllNotificationsRead();
        });
    }

    showUploadModal() {
        this.uploadModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeUploadModal() {
        this.uploadModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetUploadForm();
    }

    toggleNotificationPanel() {
        const isVisible = this.notificationPanel.style.display === 'block';
        this.notificationPanel.style.display = isVisible ? 'none' : 'block';
    }

    hideNotificationPanel() {
        this.notificationPanel.style.display = 'none';
    }

    switchUploadTab(tabName) {
        // Update tab buttons
        this.uploadModal.querySelectorAll('.upload-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.uploadModal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        this.uploadModal.querySelectorAll('.upload-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
    }

    handleFileUpload(files) {
        if (files.length > 0) {
            const file = files[0];
            console.log('File selected:', file.name);
            
            // Show upload form
            document.getElementById('upload-area').style.display = 'none';
            document.getElementById('upload-form').style.display = 'block';
            
            // Pre-fill title with filename
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('video-title').value = fileName;
            document.querySelector('.char-count').textContent = `${fileName.length}/100`;
            
            // Simulate upload progress
            this.simulateUploadProgress();
        }
    }

    handleThumbnailUpload(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const customOption = document.querySelector('.thumbnail-option.custom');
                customOption.innerHTML = `
                    <img src="${e.target.result}" alt="Custom thumbnail" style="width: 160px; height: 90px; object-fit: cover;">
                    <span>Custom</span>
                `;
                customOption.classList.add('active');
                document.querySelector('.thumbnail-option.auto').classList.remove('active');
            };
            reader.readAsDataURL(file);
        }
    }

    simulateUploadProgress() {
        // Create progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.className = 'upload-progress';
        progressDiv.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <span class="progress-text">Uploading... 0%</span>
        `;
        document.getElementById('upload-form').prepend(progressDiv);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressDiv.querySelector('.progress-fill').style.width = progress + '%';
            progressDiv.querySelector('.progress-text').textContent = 
                progress < 100 ? `Uploading... ${Math.round(progress)}%` : 'Processing video...';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.remove();
                    this.showUploadSuccess();
                }, 2000);
            }
        }, 200);
    }

    showUploadSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'upload-success';
        successDiv.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Upload successful!</h3>
            <p>Your video is ready to publish.</p>
        `;
        document.getElementById('upload-form').prepend(successDiv);
        
        setTimeout(() => successDiv.remove(), 3000);
    }

    publishVideo() {
        const title = document.getElementById('video-title').value.trim();
        const description = document.getElementById('video-description').value.trim();
        const visibility = document.getElementById('video-visibility').value;
        const category = document.getElementById('video-category').value;

        if (!title) {
            alert('Please add a title for your video.');
            return;
        }

        // Create new video object
        const videoId = 'video_' + Date.now();
        const newVideo = {
            id: videoId,
            title: title,
            description: description || 'No description provided.',
            channelId: 'user123',
            channelName: mockData.user.name,
            views: '0',
            uploadDate: 'Just now',
            duration: Math.floor(Math.random() * 10 + 5) + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            thumbnail: 'https://via.placeholder.com/320x180?text=' + encodeURIComponent(title),
            likes: 0,
            dislikes: 0,
            comments: [],
            category: category,
            visibility: visibility,
            tags: []
        };

        // Add to mock data
        mockData.videos[videoId] = newVideo;
        
        // Add to appropriate categories
        mockData.categories.all.unshift(videoId);
        if (mockData.categories[category]) {
            mockData.categories[category].unshift(videoId);
        }

        // Show success notification and close modal
        const statusMessage = visibility === 'public' ? 'published successfully!' : `saved as ${visibility}!`;
        if (typeof showNotification === 'function') {
            showNotification(`Video "${title}" has been ${statusMessage}`, 'success', 5000);
        } else {
            alert(`Video "${title}" has been ${statusMessage}`);
        }
        this.closeUploadModal();

        // Refresh current page if on home
        if (router.currentRoute === 'home') {
            router.handleRoute('home', false);
        }
    }

    markAllNotificationsRead() {
        this.notificationPanel.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        
        // Update badge
        const badge = document.querySelector('.notification-badge');
        badge.textContent = '0';
        badge.style.display = 'none';
    }

    resetUploadForm() {
        document.getElementById('upload-area').style.display = 'block';
        document.getElementById('upload-form').style.display = 'none';
        document.getElementById('video-title').value = '';
        document.getElementById('video-description').value = '';
        document.querySelector('.char-count').textContent = '0/100';
        
        // Reset thumbnail options
        document.querySelector('.thumbnail-option.custom').classList.remove('active');
        document.querySelector('.thumbnail-option.auto').classList.add('active');
        
        // Remove any progress or success indicators
        const existingProgress = document.querySelector('.upload-progress');
        const existingSuccess = document.querySelector('.upload-success');
        if (existingProgress) existingProgress.remove();
        if (existingSuccess) existingSuccess.remove();
    }
}

// Make ContentManager globally available
window.ContentManager = ContentManager;

// Initialize content manager will be done in script.js