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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeVideoPlayers();
    loadUserProfile();
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
    closeSearchModal.addEventListener('click', closeModal);
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeModal();
        }
    });

    // Like buttons
    likeButtons.forEach(btn => {
        btn.addEventListener('click', toggleLike);
    });

    // Tab navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
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
function showModal() {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    searchModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    searchInput.value = '';
}

// Video player functions
function initializeVideoPlayers() {
    videoPlayers.forEach((player, index) => {
        player.addEventListener('loadeddata', () => {
            console.log(`Video ${index + 1} loaded`);
        });

        player.addEventListener('ended', () => {
            playNextVideo(index);
        });
    });
}

function toggleVideoPlay(container) {
    const video = container.querySelector('.video-player');
    if (video.paused) {
        pauseAllVideos();
        video.play();
        isPlaying = true;
    } else {
        video.pause();
        isPlaying = false;
    }
}

function pauseAllVideos() {
    videoPlayers.forEach(player => {
        player.pause();
    });
    isPlaying = false;
}

function resumeVideoPlayback() {
    if (currentPage === 'home' && !isPlaying) {
        const activeVideo = videoContainers[0].querySelector('.video-player');
        activeVideo.play();
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
