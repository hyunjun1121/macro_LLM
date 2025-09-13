// Mock data for the application
const mockData = {
    users: {
        jun: {
            id: 'jun',
            username: '@jun',
            displayName: 'Jun',
            bio: 'Content Creator',
            avatar: 'https://via.placeholder.com/120x120/ff0050/ffffff?text=J',
            followers: '15.8M',
            following: '1.2M',
            likes: '2.3B',
            videos: [
                {
                    id: 1,
                    title: 'Amazing dance moves! #dance #viral',
                    thumbnail: 'https://via.placeholder.com/200x300/ff0050/ffffff?text=Video+1',
                    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    likes: '1.2M',
                    comments: '15.3K',
                    shares: '8.9K'
                },
                {
                    id: 2,
                    title: 'Cooking tutorial time! #cooking #food',
                    thumbnail: 'https://via.placeholder.com/200x300/00f2ea/ffffff?text=Video+2',
                    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
                    likes: '856K',
                    comments: '8.9K',
                    shares: '5.2K'
                },
                {
                    id: 3,
                    title: 'New song cover! What do you think? #music #cover',
                    thumbnail: 'https://via.placeholder.com/200x300/ff6b6b/ffffff?text=Video+3',
                    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
                    likes: '2.1M',
                    comments: '32.7K',
                    shares: '12.4K'
                }
            ]
        }
    },
    trendingHashtags: [
        '#dance', '#viral', '#cooking', '#music', '#funny', '#art', '#fashion', '#travel', '#food', '#comedy'
    ],
    searchResults: [
        {
            type: 'user',
            id: 'jun',
            username: '@jun',
            displayName: 'Jun',
            avatar: 'https://via.placeholder.com/48x48/ff0050/ffffff?text=J',
            followers: '15.8M'
        },
        {
            type: 'user',
            id: 'alex_creator',
            username: '@alex_creator',
            displayName: 'Alex Creator',
            avatar: 'https://via.placeholder.com/48x48/00f2ea/ffffff?text=A',
            followers: '2.3M'
        },
        {
            type: 'hashtag',
            id: 'dance',
            name: '#dance',
            posts: '2.3B'
        },
        {
            type: 'hashtag',
            id: 'viral',
            name: '#viral',
            posts: '1.8B'
        }
    ]
};

// Global state
let currentPage = 'home';
let currentVideoIndex = 0;
let isPlaying = false;

// DOM elements
const sidebarItems = document.querySelectorAll('.sidebar-item');
const pages = document.querySelectorAll('.page');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchResults = document.getElementById('searchResults');
const videoContainers = document.querySelectorAll('.video-container');
const videoPlayers = document.querySelectorAll('.video-player');
const likeButtons = document.querySelectorAll('.like-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Modal elements
const modals = {
    comments: document.getElementById('commentsModal'),
    upload: document.getElementById('uploadModal'),
    notifications: document.getElementById('notificationsModal'),
    messages: document.getElementById('messagesModal'),
    share: document.getElementById('shareModal'),
    userSettings: document.getElementById('userSettingsModal')
};

const modalButtons = {
    upload: document.getElementById('uploadBtn'),
    messages: document.getElementById('messagesBtn'),
    notifications: document.getElementById('notificationsBtn'),
    userProfile: document.getElementById('userProfile')
};

const closeButtons = {
    comments: document.getElementById('closeCommentsModal'),
    upload: document.getElementById('closeUploadModal'),
    notifications: document.getElementById('closeNotificationsModal'),
    messages: document.getElementById('closeMessagesModal'),
    share: document.getElementById('closeShareModal'),
    userSettings: document.getElementById('closeUserSettingsModal')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeVideoPlayers();
    loadUserProfile();
    loadFollowingContent();
    initializeSearchSuggestions();
    initializeVideoControls();
    initializeInfiniteScroll();
});

// Event Listeners
function initializeEventListeners() {
    // Sidebar navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Close search modal
    closeSearchModal.addEventListener('click', () => closeModalById('search'));
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeModalById('search');
        }
    });

    // Modal event listeners
    initializeModalListeners();

    // Like buttons
    likeButtons.forEach(btn => {
        btn.addEventListener('click', toggleLike);
    });

    // Comment buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-btn')) {
            openModal('comments');
        }
    });

    // Share buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.share-btn')) {
            openModal('share');
        }
    });

    // Bookmark buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
            toggleBookmark(e.target.closest('.bookmark-btn'));
        }
    });

    // Tab navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Following tab navigation
    const followingTabs = document.querySelectorAll('.following-tab-btn');
    followingTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            switchFollowingTab(btn.dataset.tab);
        });
    });

    // Video interactions
    videoContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            if (!e.target.closest('.video-actions')) {
                toggleVideoPlay(container);
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Initialize upload functionality
    initializeUploadFunctionality();

    // Initialize comment functionality
    initializeCommentFunctionality();

    // Initialize share functionality
    initializeShareFunctionality();

    // Initialize settings functionality
    initializeSettingsFunctionality();
}

// Navigation functions
function navigateToPage(page) {
    // Update sidebar active state
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page visibility
    pages.forEach(p => {
        p.classList.remove('active');
        if (p.id === page + 'Page') {
            p.classList.add('active');
        }
    });

    currentPage = page;

    // Handle page-specific logic
    if (page === 'home') {
        resumeVideoPlayback();
    } else {
        pauseAllVideos();
    }
}

// Search functionality
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Combine different data sources for search
    const allResults = [
        ...mockData.searchResults,
        ...junAccountData.following.map(user => ({ ...user, type: 'user' })),
        ...trendingContent.hashtags.map(hashtag => ({ ...hashtag, type: 'hashtag' }))
    ];

    // Filter search results based on query
    const results = allResults.filter(item => {
        if (item.type === 'user') {
            return item.username.toLowerCase().includes(query.toLowerCase()) ||
                   item.displayName.toLowerCase().includes(query.toLowerCase());
        } else if (item.type === 'hashtag') {
            return item.name.toLowerCase().includes(query.toLowerCase());
        }
        return false;
    });

    displaySearchResults(results);
    showModal();
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No results found</p>';
        return;
    }

    // Remove duplicates based on id/name
    const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => 
            (r.type === 'user' && r.id === result.id) || 
            (r.type === 'hashtag' && r.name === result.name)
        )
    );

    uniqueResults.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        
        if (result.type === 'user') {
            resultElement.innerHTML = `
                <img src="${result.avatar}" alt="${result.displayName}">
                <div class="search-result-info">
                    <h4>${result.displayName}</h4>
                    <p>${result.username} • ${result.followers} followers</p>
                </div>
            `;
            resultElement.addEventListener('click', () => {
                if (result.id === 'jun') {
                    navigateToProfile(result.id);
                } else {
                    // For other users, show a message or navigate to their profile
                    alert(`This would navigate to ${result.displayName}'s profile`);
                }
                closeModal();
            });
        } else if (result.type === 'hashtag') {
            resultElement.innerHTML = `
                <div style="width: 48px; height: 48px; background: linear-gradient(45deg, #ff0050, #00f2ea); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    #
                </div>
                <div class="search-result-info">
                    <h4>${result.name}</h4>
                    <p>${result.posts} posts</p>
                </div>
            `;
            resultElement.addEventListener('click', () => {
                // Filter videos by hashtag
                filterVideosByHashtag(result.name);
                closeModal();
            });
        }

        searchResults.appendChild(resultElement);
    });
}

// Filter videos by hashtag
function filterVideosByHashtag(hashtag) {
    navigateToPage('home');
    
    // Find videos that contain this hashtag
    const matchingVideos = junAccountData.posts.filter(post => 
        post.hashtags.some(tag => tag.toLowerCase() === hashtag.toLowerCase())
    );
    
    if (matchingVideos.length > 0) {
        // Clear current videos and show filtered ones
        const videoFeed = document.querySelector('.video-feed');
        videoFeed.innerHTML = '';
        
        matchingVideos.forEach(post => {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            videoContainer.setAttribute('data-video-id', post.id);
            videoContainer.innerHTML = `
                <video class="video-player" muted loop>
                    <source src="${post.videoUrl}" type="video/mp4">
                </video>
                <div class="video-overlay">
                    <div class="video-info">
                        <div class="user-info">
                            <img src="${junAccountData.profile.avatar}" alt="User" class="user-avatar">
                            <div class="user-details">
                                <h3>${junAccountData.profile.username}</h3>
                                <p>${post.title}</p>
                            </div>
                        </div>
                    </div>
                    <div class="video-actions">
                        <button class="action-btn like-btn" data-liked="false">
                            <i class="fas fa-heart"></i>
                            <span>${post.likes}</span>
                        </button>
                        <button class="action-btn comment-btn">
                            <i class="fas fa-comment"></i>
                            <span>${post.comments}</span>
                        </button>
                        <button class="action-btn share-btn">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                        <button class="action-btn bookmark-btn">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            `;
            
            videoContainer.addEventListener('click', (e) => {
                if (!e.target.closest('.video-actions')) {
                    toggleVideoPlay(videoContainer);
                }
            });
            
            const likeBtn = videoContainer.querySelector('.like-btn');
            likeBtn.addEventListener('click', toggleLike);
            
            videoFeed.appendChild(videoContainer);
        });
        
        // Play the first video
        const firstVideo = videoFeed.querySelector('.video-player');
        if (firstVideo) {
            firstVideo.play();
            isPlaying = true;
        }
    }
}

function navigateToProfile(userId) {
    if (userId === 'jun') {
        navigateToPage('profile');
    }
}

// Modal functions
function initializeModalListeners() {
    // Modal open buttons
    if (modalButtons.upload) {
        modalButtons.upload.addEventListener('click', () => openModal('upload'));
    }
    if (modalButtons.messages) {
        modalButtons.messages.addEventListener('click', () => openModal('messages'));
    }
    if (modalButtons.notifications) {
        modalButtons.notifications.addEventListener('click', () => openModal('notifications'));
    }
    if (modalButtons.userProfile) {
        modalButtons.userProfile.addEventListener('click', () => openModal('userSettings'));
    }

    // Close buttons
    Object.keys(closeButtons).forEach(modalType => {
        if (closeButtons[modalType]) {
            closeButtons[modalType].addEventListener('click', () => closeModal(modalType));
        }
    });

    // Click outside to close
    Object.keys(modals).forEach(modalType => {
        if (modals[modalType]) {
            modals[modalType].addEventListener('click', (e) => {
                if (e.target === modals[modalType]) {
                    closeModal(modalType);
                }
            });
        }
    });
}

function openModal(modalType) {
    if (modals[modalType]) {
        modals[modalType].classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load modal-specific content
        switch(modalType) {
            case 'notifications':
                loadNotifications();
                break;
            case 'messages':
                loadMessages();
                break;
        }
    }
}

function closeModal(modalType) {
    if (modals[modalType]) {
        modals[modalType].classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showModal() {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalById(modalId) {
    if (modalId === 'search') {
        searchModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        searchInput.value = '';
    }
}

// Video player functions
function initializeVideoPlayers() {
    videoPlayers.forEach((player, index) => {
        player.addEventListener('loadeddata', () => {
            console.log(`Video ${index + 1} loaded`);
            updateVideoProgress(player);
        });

        player.addEventListener('ended', () => {
            playNextVideo(index);
        });

        player.addEventListener('timeupdate', () => {
            updateVideoProgress(player);
        });
    });
}

function initializeVideoControls() {
    document.addEventListener('click', (e) => {
        const container = e.target.closest('.video-container');
        if (!container) return;

        const video = container.querySelector('.video-player');
        const controls = container.querySelector('.video-controls');

        // Play/Pause button
        if (e.target.closest('.play-pause-btn')) {
            e.stopPropagation();
            toggleVideoPlayPause(container);
        }
        // Volume button
        else if (e.target.closest('.volume-btn')) {
            e.stopPropagation();
            toggleMute(video);
        }
        // Fullscreen button
        else if (e.target.closest('.fullscreen-btn')) {
            e.stopPropagation();
            toggleFullscreen(container);
        }
        // Volume slider
        else if (e.target.closest('.volume-slider')) {
            e.stopPropagation();
            const slider = e.target;
            video.volume = slider.value;
            video.muted = slider.value === '0';
            updateVolumeIcon(container, video.muted, video.volume);
        }
        // Progress bar click
        else if (e.target.closest('.progress-bar')) {
            e.stopPropagation();
            const progressBar = e.target.closest('.progress-bar');
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            video.currentTime = video.duration * percentage;
        }
        // Show/hide controls on video click
        else if (e.target === video || e.target.closest('.video-overlay')) {
            if (!e.target.closest('.video-actions')) {
                toggleVideoControls(container);
            }
        }
    });

    // Volume slider change
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('volume-slider')) {
            const container = e.target.closest('.video-container');
            const video = container.querySelector('.video-player');
            video.volume = e.target.value;
            video.muted = e.target.value === '0';
            updateVolumeIcon(container, video.muted, video.volume);
        }
    });

    // Double click for fullscreen
    document.addEventListener('dblclick', (e) => {
        const container = e.target.closest('.video-container');
        if (container && e.target.classList.contains('video-player')) {
            toggleFullscreen(container);
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (currentPage !== 'home') return;

        const currentContainer = videoContainers[currentVideoIndex];
        if (!currentContainer) return;

        const video = currentContainer.querySelector('.video-player');

        switch(e.key) {
            case 'k':
            case 'K':
            case ' ':
                e.preventDefault();
                toggleVideoPlayPause(currentContainer);
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute(video);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen(currentContainer);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                updateVolumeSlider(currentContainer, video.volume);
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                updateVolumeSlider(currentContainer, video.volume);
                break;
        }
    });
}

function toggleVideoPlayPause(container) {
    const video = container.querySelector('.video-player');
    const playPauseBtn = container.querySelector('.play-pause-btn i');

    if (video.paused) {
        pauseAllVideos();
        video.play();
        playPauseBtn.className = 'fas fa-pause';
        isPlaying = true;
    } else {
        video.pause();
        playPauseBtn.className = 'fas fa-play';
        isPlaying = false;
    }
}

function toggleMute(video) {
    const container = video.closest('.video-container');
    video.muted = !video.muted;

    if (video.muted) {
        video.volume = 0;
    } else {
        video.volume = 0.5;
    }

    updateVolumeIcon(container, video.muted, video.volume);
    updateVolumeSlider(container, video.volume);
}

function toggleFullscreen(container) {
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function toggleVideoControls(container) {
    const controls = container.querySelector('.video-controls');
    const overlay = container.querySelector('.video-overlay');

    if (controls.style.opacity === '0' || !controls.style.opacity) {
        controls.style.opacity = '1';
        overlay.style.opacity = '1';

        // Hide after 3 seconds
        setTimeout(() => {
            if (controls.style.opacity === '1') {
                controls.style.opacity = '0';
                overlay.style.opacity = '0';
            }
        }, 3000);
    } else {
        controls.style.opacity = '0';
        overlay.style.opacity = '0';
    }
}

function updateVideoProgress(video) {
    const container = video.closest('.video-container');
    const progressFill = container.querySelector('.progress-fill');

    if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

function updateVolumeIcon(container, muted, volume) {
    const volumeBtn = container.querySelector('.volume-btn i');

    if (muted || volume === 0) {
        volumeBtn.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeBtn.className = 'fas fa-volume-down';
    } else {
        volumeBtn.className = 'fas fa-volume-up';
    }
}

function updateVolumeSlider(container, volume) {
    const volumeSlider = container.querySelector('.volume-slider');
    volumeSlider.value = volume;
}

function toggleVideoPlay(container) {
    const video = container.querySelector('.video-player');
    const playPauseBtn = container.querySelector('.play-pause-btn i');

    if (video.paused) {
        pauseAllVideos();
        video.play();
        if (playPauseBtn) playPauseBtn.className = 'fas fa-pause';
        isPlaying = true;
    } else {
        video.pause();
        if (playPauseBtn) playPauseBtn.className = 'fas fa-play';
        isPlaying = false;
    }
}

function pauseAllVideos() {
    videoPlayers.forEach(player => {
        player.pause();
        const container = player.closest('.video-container');
        const playPauseBtn = container?.querySelector('.play-pause-btn i');
        if (playPauseBtn) playPauseBtn.className = 'fas fa-play';
    });

    // Also pause any dynamically added videos
    document.querySelectorAll('.video-player').forEach(player => {
        player.pause();
        const container = player.closest('.video-container');
        const playPauseBtn = container?.querySelector('.play-pause-btn i');
        if (playPauseBtn) playPauseBtn.className = 'fas fa-play';
    });

    isPlaying = false;
}

function resumeVideoPlayback() {
    if (currentPage === 'home' && !isPlaying) {
        const activeContainer = videoContainers[currentVideoIndex] || videoContainers[0];
        const activeVideo = activeContainer.querySelector('.video-player');
        const playPauseBtn = activeContainer.querySelector('.play-pause-btn i');

        activeVideo.play();
        if (playPauseBtn) playPauseBtn.className = 'fas fa-pause';
        isPlaying = true;
    }
}

function playNextVideo(currentIndex) {
    const nextIndex = (currentIndex + 1) % videoContainers.length;
    const currentVideo = videoPlayers[currentIndex];
    const nextVideo = videoPlayers[nextIndex];
    
    currentVideo.pause();
    nextVideo.play();
    
    // Scroll to next video
    videoContainers[nextIndex].scrollIntoView({ behavior: 'smooth' });
}

// Like functionality
function toggleLike(e) {
    e.stopPropagation();
    const button = e.currentTarget;
    const isLiked = button.dataset.liked === 'true';
    
    if (isLiked) {
        button.classList.remove('liked');
        button.dataset.liked = 'false';
        // Decrease like count
        const countSpan = button.querySelector('span');
        const currentCount = parseInt(countSpan.textContent.replace(/[^\d]/g, ''));
        countSpan.textContent = formatCount(currentCount - 1);
    } else {
        button.classList.add('liked');
        button.dataset.liked = 'true';
        // Increase like count
        const countSpan = button.querySelector('span');
        const currentCount = parseInt(countSpan.textContent.replace(/[^\d]/g, ''));
        countSpan.textContent = formatCount(currentCount + 1);
    }
}

function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Tab functionality
function switchTab(tab) {
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tab + 'Tab') {
            content.classList.add('active');
        }
    });
}

// Profile loading
function loadUserProfile() {
    const junUser = junAccountData.profile;
    
    // Update profile information
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-details h2');
    const profileBio = document.querySelector('.profile-details p');
    
    if (profileAvatar) profileAvatar.src = junUser.avatar;
    if (profileName) profileName.textContent = junUser.username;
    if (profileBio) profileBio.textContent = junUser.bio;
    
    // Update stats
    const stats = document.querySelectorAll('.stat strong');
    if (stats[0]) stats[0].textContent = junUser.following;
    if (stats[1]) stats[1].textContent = junUser.followers;
    if (stats[2]) stats[2].textContent = junUser.likes;
    
    // Load jun's videos
    loadJunVideos();
}

// Load jun's videos in profile
function loadJunVideos() {
    const videosGrid = document.getElementById('junVideosGrid');
    if (!videosGrid) return;
    
    videosGrid.innerHTML = '';
    
    junAccountData.posts.forEach(post => {
        const videoThumbnail = document.createElement('div');
        videoThumbnail.className = 'video-thumbnail';
        videoThumbnail.innerHTML = `
            <img src="${post.thumbnail}" alt="${post.title}">
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-info-overlay">
                <div class="video-stats">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                </div>
            </div>
        `;
        
        videoThumbnail.addEventListener('click', () => {
            playVideoInFeed(post);
        });
        
        videosGrid.appendChild(videoThumbnail);
    });
}

// Play video in main feed
function playVideoInFeed(post) {
    navigateToPage('home');
    
    // Create new video container for the selected post
    const videoFeed = document.querySelector('.video-feed');
    const newVideoContainer = document.createElement('div');
    newVideoContainer.className = 'video-container';
    newVideoContainer.setAttribute('data-video-id', post.id);
    newVideoContainer.innerHTML = `
        <video class="video-player" autoplay muted loop>
            <source src="${post.videoUrl}" type="video/mp4">
        </video>
        <div class="video-overlay">
            <div class="video-info">
                <div class="user-info">
                    <img src="${junAccountData.profile.avatar}" alt="User" class="user-avatar">
                    <div class="user-details">
                        <h3>${junAccountData.profile.username}</h3>
                        <p>${post.title}</p>
                    </div>
                </div>
            </div>
            <div class="video-actions">
                <button class="action-btn like-btn" data-liked="false">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="action-btn comment-btn">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments}</span>
                </button>
                <button class="action-btn share-btn">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
                <button class="action-btn bookmark-btn">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    
    // Insert at the beginning of the feed
    videoFeed.insertBefore(newVideoContainer, videoFeed.firstChild);
    
    // Scroll to the new video
    newVideoContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Add event listeners to new video
    const newVideo = newVideoContainer.querySelector('.video-player');
    const newLikeBtn = newVideoContainer.querySelector('.like-btn');
    
    newVideoContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.video-actions')) {
            toggleVideoPlay(newVideoContainer);
        }
    });
    
    newLikeBtn.addEventListener('click', toggleLike);
    
    // Pause other videos and play this one
    pauseAllVideos();
    newVideo.play();
    isPlaying = true;
}

// Keyboard navigation
function handleKeyboardNavigation(e) {
    if (currentPage !== 'home') return;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            navigateToPreviousVideo();
            break;
        case 'ArrowDown':
            e.preventDefault();
            navigateToNextVideo();
            break;
        case ' ':
            e.preventDefault();
            toggleCurrentVideo();
            break;
    }
}

function navigateToPreviousVideo() {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        scrollToVideo(currentVideoIndex);
    }
}

function navigateToNextVideo() {
    if (currentVideoIndex < videoContainers.length - 1) {
        currentVideoIndex++;
        scrollToVideo(currentVideoIndex);
    }
}

function scrollToVideo(index) {
    videoContainers[index].scrollIntoView({ behavior: 'smooth' });
    pauseAllVideos();
    setTimeout(() => {
        const video = videoContainers[index].querySelector('.video-player');
        video.play();
        isPlaying = true;
    }, 300);
}

function toggleCurrentVideo() {
    const currentVideo = videoContainers[currentVideoIndex].querySelector('.video-player');
    toggleVideoPlay(videoContainers[currentVideoIndex]);
}

// Intersection Observer for video autoplay
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentPage === 'home') {
            const video = entry.target.querySelector('.video-player');
            if (video) {
                pauseAllVideos();
                video.play();
                isPlaying = true;
                currentVideoIndex = Array.from(videoContainers).indexOf(entry.target);
            }
        }
    });
}, observerOptions);

// Observe all video containers
videoContainers.forEach(container => {
    videoObserver.observe(container);
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to video thumbnails
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.transform = 'scale(1.05)';
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.transform = 'scale(1)';
        });
    });

    // Add click handlers for hashtags
    const hashtags = document.querySelectorAll('.hashtag');
    hashtags.forEach(hashtag => {
        hashtag.addEventListener('click', () => {
            searchInput.value = hashtag.textContent;
            performSearch();
        });
    });
});

// Following page functionality
function switchFollowingTab(tab) {
    const followingTabs = document.querySelectorAll('.following-tab-btn');
    const followingTabContents = document.querySelectorAll('.following-tab-content');

    followingTabs.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    followingTabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `following${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`) {
            content.classList.add('active');
        }
    });
}

function loadFollowingContent() {
    const followingVideosTab = document.getElementById('followingVideosTab');
    if (followingVideosTab) {
        const followingVideos = followingVideosTab.querySelector('.following-videos');
        if (followingVideos) {
            // Load videos from followed users
            const followedUsersVideos = junAccountData.following.slice(0, 3).map((user, index) => {
                return `
                    <div class="following-video-item">
                        <div class="following-video-thumbnail">
                            <img src="https://via.placeholder.com/120x160/${getRandomColor()}/ffffff?text=Video" alt="Video">
                            <div class="play-overlay"><i class="fas fa-play"></i></div>
                        </div>
                        <div class="following-video-info">
                            <div class="following-video-user">
                                <img src="${user.avatar}" alt="${user.displayName}" class="following-video-avatar">
                                <span>${user.username}</span>
                            </div>
                            <p class="following-video-title">Latest video from ${user.displayName}</p>
                            <div class="following-video-stats">
                                <span><i class="fas fa-heart"></i> ${Math.floor(Math.random() * 500)}K</span>
                                <span><i class="fas fa-comment"></i> ${Math.floor(Math.random() * 50)}K</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            followingVideos.innerHTML = followedUsersVideos || '<p>Videos from people you follow will appear here.</p>';
        }
    }

    // Add follow/unfollow functionality
    const followButtons = document.querySelectorAll('.following-user-btn');
    followButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFollowUser(btn);
        });
    });
}

function toggleFollowUser(button) {
    const isFollowing = button.classList.contains('following');

    if (isFollowing) {
        button.classList.remove('following');
        button.textContent = 'Follow';
        button.style.backgroundColor = '#ff0050';
    } else {
        button.classList.add('following');
        button.textContent = 'Following';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    }
}

function getRandomColor() {
    const colors = ['ff0050', '00f2ea', 'ff6b6b', '4ecdc4', '45b7d1', 'f9ca24'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Upload functionality
function initializeUploadFunctionality() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.getElementById('uploadBtn');
    const videoFileInput = document.getElementById('videoFileInput');
    const uploadForm = document.getElementById('uploadForm');
    const cancelUpload = document.getElementById('cancelUpload');
    const publishVideo = document.getElementById('publishVideo');

    if (uploadBtn && videoFileInput) {
        uploadBtn.addEventListener('click', () => {
            videoFileInput.click();
        });

        videoFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.type.startsWith('video/')) {
                    uploadArea.style.display = 'none';
                    uploadForm.style.display = 'block';
                } else {
                    alert('Please select a video file');
                }
            }
        });
    }

    if (cancelUpload) {
        cancelUpload.addEventListener('click', () => {
            uploadArea.style.display = 'block';
            uploadForm.style.display = 'none';
            if (videoFileInput) videoFileInput.value = '';
        });
    }

    if (publishVideo) {
        publishVideo.addEventListener('click', () => {
            const caption = document.getElementById('videoCaption').value;
            const hashtags = document.getElementById('videoHashtags').value;
            const privacy = document.getElementById('videoPrivacy').value;

            // Simulate upload
            alert(`Video uploaded successfully!\nCaption: ${caption}\nHashtags: ${hashtags}\nPrivacy: ${privacy}`);
            closeModal('upload');

            // Reset form
            document.getElementById('videoCaption').value = '';
            document.getElementById('videoHashtags').value = '';
            document.getElementById('videoPrivacy').value = 'public';
            uploadArea.style.display = 'block';
            uploadForm.style.display = 'none';
            if (videoFileInput) videoFileInput.value = '';
        });
    }

    // Drag and drop functionality
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(255, 0, 80, 0.1)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';

            const files = e.dataTransfer.files;
            if (files && files[0] && files[0].type.startsWith('video/')) {
                uploadArea.style.display = 'none';
                uploadForm.style.display = 'block';
            } else {
                alert('Please drop a video file');
            }
        });
    }
}

// Comment functionality
function initializeCommentFunctionality() {
    const commentSendBtn = document.getElementById('commentSendBtn');
    const commentInput = document.getElementById('commentInput');
    const commentsList = document.getElementById('commentsList');

    if (commentSendBtn && commentInput) {
        commentSendBtn.addEventListener('click', () => {
            addComment(commentInput.value);
        });

        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addComment(commentInput.value);
            }
        });
    }

    // Add like functionality to existing comments
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-like-btn')) {
            const btn = e.target.closest('.comment-like-btn');
            const icon = btn.querySelector('i');
            const count = btn.querySelector('span');

            if (icon.classList.contains('fas')) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.style.color = 'rgba(255, 255, 255, 0.6)';
                const currentCount = parseInt(count.textContent.replace(/[^\d]/g, ''));
                count.textContent = formatCount(currentCount - 1);
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.color = '#ff0050';
                const currentCount = parseInt(count.textContent.replace(/[^\d]/g, ''));
                count.textContent = formatCount(currentCount + 1);
            }
        }
    });
}

function addComment(text) {
    if (!text.trim()) return;

    const commentsList = document.getElementById('commentsList');
    const commentInput = document.getElementById('commentInput');

    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
        <img src="https://via.placeholder.com/32x32/ff0050/ffffff?text=U" alt="User" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-username">@you</span>
                <span class="comment-time">now</span>
            </div>
            <p class="comment-text">${text}</p>
            <div class="comment-actions">
                <button class="comment-like-btn">
                    <i class="far fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="comment-reply-btn">Reply</button>
            </div>
        </div>
    `;

    commentsList.insertBefore(newComment, commentsList.firstChild);
    commentInput.value = '';
}

// Share functionality
function initializeShareFunctionality() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.share-option')) {
            const option = e.target.closest('.share-option');
            const platform = option.querySelector('span').textContent;

            if (platform === 'Copy Link') {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copied to clipboard!');
                    closeModal('share');
                }).catch(() => {
                    alert('Unable to copy link');
                });
            } else {
                alert(`Sharing to ${platform}...`);
                closeModal('share');
            }
        }
    });
}

// Settings functionality
function initializeSettingsFunctionality() {
    const darkModeToggle = document.querySelector('.toggle-switch input[type="checkbox"]');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.style.backgroundColor = '#000';
                alert('Dark mode enabled');
            } else {
                document.body.style.backgroundColor = '#111';
                alert('Light mode enabled');
            }
        });
    }

    // Settings menu items
    document.addEventListener('click', (e) => {
        if (e.target.closest('.setting-item')) {
            const settingItem = e.target.closest('.setting-item');
            const settingText = settingItem.querySelector('span').textContent;

            if (settingText !== 'Dark Mode' && settingText !== 'Language') {
                alert(`${settingText} feature will be available soon!`);
            }
        }
    });
}

// Load notifications
function loadNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        // Add some dynamic notifications
        const dynamicNotifications = [
            {
                avatar: 'https://via.placeholder.com/40x40/4ecdc4/ffffff?text=D',
                text: '<strong>@dance_queen</strong> liked your video',
                time: '1 minute ago',
                hasVideo: true
            },
            {
                avatar: 'https://via.placeholder.com/40x40/f9ca24/ffffff?text=C',
                text: '<strong>@chef_master</strong> started following you',
                time: '30 minutes ago',
                hasVideo: false
            }
        ];

        const newNotifications = dynamicNotifications.map(notif => `
            <div class="notification">
                <img src="${notif.avatar}" alt="User" class="notification-avatar">
                <div class="notification-content">
                    <p>${notif.text}</p>
                    <span class="notification-time">${notif.time}</span>
                </div>
                ${notif.hasVideo ? '<img src="https://via.placeholder.com/60x60/ff0050/ffffff?text=V" alt="Video" class="notification-video">' : ''}
            </div>
        `).join('');

        notificationsList.innerHTML = newNotifications + notificationsList.innerHTML;
    }
}

// Load messages
function loadMessages() {
    const messagesList = document.querySelector('.messages-list');
    if (messagesList) {
        // Add a new message
        const newMessage = document.createElement('div');
        newMessage.className = 'message-item';
        newMessage.innerHTML = `
            <img src="https://via.placeholder.com/48x48/4ecdc4/ffffff?text=N" alt="User" class="message-avatar">
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">@new_follower</span>
                    <span class="message-time">now</span>
                </div>
                <p class="message-preview">Hi! Love your content! 😊</p>
            </div>
            <div class="message-status">
                <i class="fas fa-circle"></i>
            </div>
        `;

        messagesList.insertBefore(newMessage, messagesList.firstChild);
    }
}

// Search suggestions
function initializeSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => hideSearchSuggestions(), 150);
        });
    }
}

function showSearchSuggestions(query) {
    const suggestions = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query)
    ).slice(0, 5);

    let suggestionsList = document.getElementById('searchSuggestions');

    if (!suggestionsList) {
        suggestionsList = document.createElement('div');
        suggestionsList.id = 'searchSuggestions';
        suggestionsList.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestionsList);
    }

    suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="search-suggestion-item" onclick="selectSearchSuggestion('${suggestion}')">
            ${suggestion.startsWith('@') ? '<i class="fas fa-user"></i>' : '<i class="fas fa-hashtag"></i>'}
            <span>${suggestion}</span>
        </div>
    `).join('');

    suggestionsList.style.display = suggestions.length > 0 ? 'block' : 'none';
}

function hideSearchSuggestions() {
    const suggestionsList = document.getElementById('searchSuggestions');
    if (suggestionsList) {
        suggestionsList.style.display = 'none';
    }
}

function selectSearchSuggestion(suggestion) {
    searchInput.value = suggestion;
    hideSearchSuggestions();
    performSearch();
}

// Infinite scroll functionality
let isLoadingMore = false;
let videoPage = 1;
const videosPerPage = 3;

function initializeInfiniteScroll() {
    const videoFeed = document.querySelector('.video-feed');
    if (!videoFeed) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.classList.contains('load-more-trigger')) {
                loadMoreVideos();
            }
        });
    }, {
        threshold: 0.1
    });

    // Create load more trigger
    const loadMoreTrigger = document.createElement('div');
    loadMoreTrigger.className = 'load-more-trigger';
    loadMoreTrigger.style.height = '20px';
    videoFeed.appendChild(loadMoreTrigger);
    observer.observe(loadMoreTrigger);
}

function loadMoreVideos() {
    if (isLoadingMore || currentPage !== 'home') return;

    isLoadingMore = true;
    videoPage++;

    const videoFeed = document.querySelector('.video-feed');
    const loadMoreTrigger = document.querySelector('.load-more-trigger');

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading more videos...</p>
    `;
    videoFeed.insertBefore(loadingIndicator, loadMoreTrigger);

    // Simulate loading delay
    setTimeout(() => {
        const newVideos = generateMoreVideos(videosPerPage);
        newVideos.forEach(videoHTML => {
            const videoContainer = document.createElement('div');
            videoContainer.innerHTML = videoHTML;
            const videoElement = videoContainer.firstElementChild;

            videoFeed.insertBefore(videoElement, loadingIndicator);

            // Initialize controls for new video
            const video = videoElement.querySelector('.video-player');
            video.addEventListener('timeupdate', () => {
                updateVideoProgress(video);
            });

            // Add to intersection observer
            videoObserver.observe(videoElement);
        });

        // Remove loading indicator
        loadingIndicator.remove();
        isLoadingMore = false;

        // Update videoContainers NodeList
        updateVideoContainersList();

    }, 1500);
}

function generateMoreVideos(count) {
    const videoTemplates = [
        {
            id: `video_${Date.now()}_1`,
            user: { name: '@fitness_guru', avatar: 'https://via.placeholder.com/48x48/4CAF50/ffffff?text=F' },
            title: 'Morning workout routine #fitness #healthy',
            likes: Math.floor(Math.random() * 1000) + 100 + 'K',
            comments: Math.floor(Math.random() * 100) + 10 + 'K',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
            id: `video_${Date.now()}_2`,
            user: { name: '@art_creator', avatar: 'https://via.placeholder.com/48x48/9C27B0/ffffff?text=A' },
            title: 'Amazing digital art process #art #creative',
            likes: Math.floor(Math.random() * 2000) + 500 + 'K',
            comments: Math.floor(Math.random() * 200) + 50 + 'K',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        },
        {
            id: `video_${Date.now()}_3`,
            user: { name: '@food_lover', avatar: 'https://via.placeholder.com/48x48/FF9800/ffffff?text=F' },
            title: 'Quick pasta recipe #food #cooking',
            likes: Math.floor(Math.random() * 800) + 200 + 'K',
            comments: Math.floor(Math.random() * 80) + 20 + 'K',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        }
    ];

    const videos = [];
    for (let i = 0; i < count; i++) {
        const template = videoTemplates[i % videoTemplates.length];
        const uniqueId = `${template.id}_${i}`;

        videos.push(`
            <div class="video-container" data-video-id="${uniqueId}">
                <video class="video-player" muted loop>
                    <source src="${template.videoUrl}" type="video/mp4">
                </video>
                <div class="video-controls">
                    <div class="video-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                    <div class="control-buttons">
                        <button class="control-btn play-pause-btn">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="control-btn volume-btn">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="0">
                        <button class="control-btn fullscreen-btn">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="video-overlay">
                    <div class="video-info">
                        <div class="user-info">
                            <img src="${template.user.avatar}" alt="User" class="user-avatar">
                            <div class="user-details">
                                <h3>${template.user.name}</h3>
                                <p>${template.title}</p>
                            </div>
                        </div>
                    </div>
                    <div class="video-actions">
                        <button class="action-btn like-btn" data-liked="false">
                            <i class="fas fa-heart"></i>
                            <span>${template.likes}</span>
                        </button>
                        <button class="action-btn comment-btn">
                            <i class="fas fa-comment"></i>
                            <span>${template.comments}</span>
                        </button>
                        <button class="action-btn share-btn">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                        <button class="action-btn bookmark-btn">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
    }

    return videos;
}

function updateVideoContainersList() {
    // Update the global videoContainers reference
    window.videoContainers = document.querySelectorAll('.video-container');
}

// Bookmark functionality
let bookmarkedVideos = JSON.parse(localStorage.getItem('bookmarkedVideos') || '[]');

function toggleBookmark(button) {
    const videoContainer = button.closest('.video-container');
    const videoId = videoContainer.dataset.videoId;
    const icon = button.querySelector('i');

    const isBookmarked = bookmarkedVideos.includes(videoId);

    if (isBookmarked) {
        // Remove bookmark
        bookmarkedVideos = bookmarkedVideos.filter(id => id !== videoId);
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.style.color = 'rgba(255, 255, 255, 0.8)';
        showToast('Removed from bookmarks');
    } else {
        // Add bookmark
        bookmarkedVideos.push(videoId);
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.style.color = '#ff0050';
        showToast('Added to bookmarks');
    }

    localStorage.setItem('bookmarkedVideos', JSON.stringify(bookmarkedVideos));
}

// Initialize bookmarks on load
function initializeBookmarks() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        const videoContainer = btn.closest('.video-container');
        const videoId = videoContainer.dataset.videoId;
        const icon = btn.querySelector('i');

        if (bookmarkedVideos.includes(videoId)) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.color = '#ff0050';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    });
}

// Toast notification system
function showToast(message, duration = 3000) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Double-tap to like functionality
let lastTapTime = 0;
let tapCount = 0;

document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 500 && tapLength > 0) {
        tapCount++;
        if (tapCount === 2) {
            // Double tap detected
            const videoContainer = e.target.closest('.video-container');
            if (videoContainer) {
                const likeBtn = videoContainer.querySelector('.like-btn');
                if (likeBtn && likeBtn.dataset.liked === 'false') {
                    toggleLike({ currentTarget: likeBtn, stopPropagation: () => {} });
                    showHeartAnimation(e.touches ? e.touches[0] : e);
                }
            }
            tapCount = 0;
        }
    } else {
        tapCount = 1;
    }
    lastTapTime = currentTime;
});

function showHeartAnimation(event) {
    const heart = document.createElement('div');
    heart.className = 'heart-animation';
    heart.innerHTML = '<i class="fas fa-heart"></i>';

    heart.style.left = (event.clientX || event.pageX) + 'px';
    heart.style.top = (event.clientY || event.pageY) + 'px';

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 1000);
}

// Enhanced keyboard shortcuts
function initializeEnhancedKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only if no input is focused
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        const currentContainer = videoContainers[currentVideoIndex];
        if (!currentContainer) return;

        const video = currentContainer.querySelector('.video-player');
        const likeBtn = currentContainer.querySelector('.like-btn');
        const bookmarkBtn = currentContainer.querySelector('.bookmark-btn');

        switch(e.key.toLowerCase()) {
            case 'l':
                e.preventDefault();
                if (likeBtn) toggleLike({ currentTarget: likeBtn, stopPropagation: () => {} });
                break;
            case 'b':
                e.preventDefault();
                if (bookmarkBtn) toggleBookmark(bookmarkBtn);
                break;
            case 'c':
                e.preventDefault();
                openModal('comments');
                break;
            case 's':
                e.preventDefault();
                openModal('share');
                break;
            case '?':
                e.preventDefault();
                showKeyboardShortcuts();
                break;
        }
    });
}

function showKeyboardShortcuts() {
    const shortcuts = [
        'Space/K - Play/Pause',
        'M - Mute/Unmute',
        'F - Fullscreen',
        'L - Like video',
        'B - Bookmark video',
        'C - Open comments',
        'S - Share video',
        '↑/↓ - Volume up/down',
        '←/→ - Seek backward/forward',
        '? - Show shortcuts'
    ];

    const shortcutsText = shortcuts.join('\n');
    alert('Keyboard Shortcuts:\n\n' + shortcutsText);
}

// Performance optimizations
function optimizePerformance() {
    // Lazy loading for videos
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('.video-player');
            if (entry.isIntersecting) {
                if (video.dataset.src) {
                    video.src = video.dataset.src;
                    video.removeAttribute('data-src');
                }
            }
        });
    }, { threshold: 0.1 });

    // Optimize video quality based on network
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            document.querySelectorAll('.video-player').forEach(video => {
                video.preload = 'none';
            });
        }
    }

    // Memory cleanup
    setInterval(() => {
        const videos = document.querySelectorAll('.video-player');
        videos.forEach((video, index) => {
            if (Math.abs(index - currentVideoIndex) > 2) {
                // Pause and clear videos that are far from current
                video.pause();
                video.currentTime = 0;
            }
        });
    }, 30000);
}

// Analytics tracking (mock)
function trackEvent(eventName, properties = {}) {
    console.log('Analytics Event:', eventName, properties);
    // In a real app, this would send data to analytics service
}

// Update initialization to include new features
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeVideoPlayers();
    loadUserProfile();
    loadFollowingContent();
    initializeSearchSuggestions();
    initializeVideoControls();
    initializeInfiniteScroll();
    initializeBookmarks();
    initializeEnhancedKeyboardShortcuts();
    optimizePerformance();

    // Track page load
    trackEvent('page_loaded', { page: 'home' });
});

// Simulate real-time updates
setInterval(() => {
    // Randomly update like counts for demonstration
    if (Math.random() < 0.1) { // 10% chance every interval
        const likeButtons = document.querySelectorAll('.like-btn:not(.liked)');
        if (likeButtons.length > 0) {
            const randomButton = likeButtons[Math.floor(Math.random() * likeButtons.length)];
            const countSpan = randomButton.querySelector('span');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent.replace(/[^\d]/g, ''));
                countSpan.textContent = formatCount(currentCount + Math.floor(Math.random() * 10));
            }
        }
    }
}, 5000); // Update every 5 seconds
