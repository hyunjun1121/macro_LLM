document.addEventListener('DOMContentLoaded', function() {
    // Wait for all scripts to load
    setTimeout(() => {
        initializeApp();
    }, 100);
});

function initializeApp() {
    console.log('Initializing YouTube Clone...');
    
    // Initialize systems
    if (typeof ContentManager !== 'undefined') {
        window.contentManager = new ContentManager();
        console.log('Content manager initialized');
    }
    
    if (typeof CommentSystem !== 'undefined') {
        window.commentSystem = new CommentSystem();
        console.log('Comment system initialized');
    }
    
    if (typeof PlaylistManager !== 'undefined') {
        window.playlistManager = new PlaylistManager();
        console.log('Playlist manager initialized');
    }
    
    // Initialize UI components
    initializeUI();
    
    console.log('YouTube Clone initialized successfully!');
}

function initializeUI() {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !menuBtn.contains(e.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const query = searchInput?.value?.trim();
        if (query && typeof router !== 'undefined') {
            router.navigate('search', { query: query });
            if (searchInput) searchInput.value = '';
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Voice search
    const voiceSearchBtn = document.querySelector('.voice-search-btn');
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', function() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();

                recognition.lang = 'en-US';
                recognition.continuous = false;
                recognition.interimResults = false;

                // Visual feedback
                voiceSearchBtn.classList.add('listening');
                voiceSearchBtn.innerHTML = '<i class="fas fa-stop"></i>';

                recognition.onstart = function() {
                    console.log('Voice recognition started');
                };

                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    if (searchInput) {
                        searchInput.value = transcript;
                        performSearch();
                    }
                    resetVoiceButton();
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                    let errorMessage = 'Voice recognition failed. ';
                    switch(event.error) {
                        case 'network':
                            errorMessage += 'Please check your internet connection.';
                            break;
                        case 'not-allowed':
                            errorMessage += 'Please allow microphone access.';
                            break;
                        case 'no-speech':
                            errorMessage += 'No speech detected. Please try again.';
                            break;
                        default:
                            errorMessage += 'Please try again.';
                    }
                    showNotification(errorMessage, 'error');
                    resetVoiceButton();
                };

                recognition.onend = function() {
                    resetVoiceButton();
                };

                function resetVoiceButton() {
                    voiceSearchBtn.classList.remove('listening');
                    voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                }

                try {
                    recognition.start();
                    showNotification('Listening... Speak now!', 'info');
                } catch (error) {
                    showNotification('Failed to start voice recognition.', 'error');
                    resetVoiceButton();
                }
            } else {
                showNotification('This browser does not support voice search. Please try Chrome or Edge.', 'warning');
            }
        });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            if (page && typeof router !== 'undefined') {
                router.navigate(page);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('active');
                }
            }
        });
    });

    // User avatar click
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            showUserMenu();
        });
    }

    // Responsive sidebar behavior
    function handleResize() {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
        }
    }

    window.addEventListener('resize', handleResize);

    // Smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';

    // Infinite scroll simulation
    let isLoading = false;
    
    function loadMoreVideos() {
        if (isLoading || (typeof router !== 'undefined' && router.currentRoute !== 'home')) return;
        
        isLoading = true;
        console.log('Loading more videos...');
        
        setTimeout(() => {
            const videoGrid = document.querySelector('#video-grid');
            if (!videoGrid || typeof generateMoreVideos === 'undefined') {
                isLoading = false;
                return;
            }
            
            const newVideos = generateMoreVideos(4);
            newVideos.forEach(video => {
                const videoElement = document.createElement('div');
                videoElement.className = 'video-item';
                videoElement.dataset.videoId = video.id;
                videoElement.innerHTML = `
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}">
                        <span class="video-duration">${video.duration}</span>
                    </div>
                    <div class="video-info">
                        <div class="channel-avatar">
                            <img src="https://via.placeholder.com/36x36?text=CH" alt="${video.channelName}">
                        </div>
                        <div class="video-details">
                            <h3 class="video-title">${video.title}</h3>
                            <p class="channel-name">${video.channelName}</p>
                            <p class="video-stats">${video.views} views • ${video.uploadDate}</p>
                        </div>
                    </div>
                `;
                
                videoElement.addEventListener('click', function() {
                    if (typeof router !== 'undefined') {
                        router.navigate('watch', { id: video.id });
                    }
                });
                
                videoGrid.appendChild(videoElement);
            });
            
            isLoading = false;
            console.log('New videos loaded successfully.');
        }, 1000);
    }

    // Infinite scroll
    window.addEventListener('scroll', function() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadMoreVideos();
        }
    });

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Skip if typing in input/textarea
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );

        if (!isTyping) {
            // '/' key focuses search input
            if (e.key === '/' && searchInput) {
                e.preventDefault();
                searchInput.focus();
                return;
            }

            // 'h' key goes to home
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                router.navigate('home');
                return;
            }

            // 't' key goes to trending
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                router.navigate('trending');
                return;
            }

            // 's' key goes to subscriptions
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                router.navigate('subscriptions');
                return;
            }

            // 'l' key goes to library
            if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                router.navigate('library');
                return;
            }

            // 'u' key opens upload modal
            if (e.key === 'u' || e.key === 'U') {
                e.preventDefault();
                if (window.contentManager) {
                    window.contentManager.showUploadModal();
                }
                return;
            }

            // '?' key shows shortcuts help
            if (e.key === '?') {
                e.preventDefault();
                showKeyboardShortcutsHelp();
                return;
            }
        }

        // ESC key - works everywhere
        if (e.key === 'Escape') {
            // Close sidebar on mobile
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                return;
            }

            // Close any open modals
            const modals = document.querySelectorAll('.upload-modal, .playlist-modal, .save-playlist-modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

            // Close notifications
            const notification = document.querySelector('.notification-toast');
            if (notification) {
                notification.remove();
            }

            // Clear search focus
            if (searchInput && searchInput.matches(':focus')) {
                searchInput.blur();
            }
        }
    });
}

// Keyboard shortcuts help
function showKeyboardShortcutsHelp() {
    const existingHelp = document.querySelector('.shortcuts-help');
    if (existingHelp) {
        existingHelp.remove();
        return;
    }

    const helpModal = document.createElement('div');
    helpModal.className = 'shortcuts-help';
    helpModal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content shortcuts-content">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-section">
                            <h3>Navigation</h3>
                            <div class="shortcut-item">
                                <kbd>/</kbd>
                                <span>Focus search</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>H</kbd>
                                <span>Go to Home</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>T</kbd>
                                <span>Go to Trending</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>S</kbd>
                                <span>Go to Subscriptions</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>L</kbd>
                                <span>Go to Library</span>
                            </div>
                        </div>
                        <div class="shortcut-section">
                            <h3>Actions</h3>
                            <div class="shortcut-item">
                                <kbd>U</kbd>
                                <span>Upload video</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Close modal/menu</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>?</kbd>
                                <span>Show this help</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(helpModal);

    // Close on overlay click
    helpModal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            helpModal.remove();
        }
    });
}

// Global notification system
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;

    const icon = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle'
    }[type] || 'fa-info-circle';

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="close-notification" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

function showUserMenu() {
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-menu-header">
            <img src="${mockData?.user?.avatar || 'https://via.placeholder.com/40x40?text=JD'}" alt="User avatar">
            <div>
                <div class="user-name">${mockData?.user?.name || 'John Doe'}</div>
                <div class="user-email">${mockData?.user?.email || 'john.doe@example.com'}</div>
            </div>
        </div>
        <hr>
        <a href="#" onclick="router.navigate('studio'); this.parentElement.remove();">Your channel</a>
        <a href="#" onclick="router.navigate('studio'); this.parentElement.remove();">YouTube Studio</a>
        <a href="#" onclick="router.navigate('settings'); this.parentElement.remove();">Settings</a>
        <hr>
        <a href="#" onclick="alert('Sign out functionality would be implemented here'); this.parentElement.remove();">Sign out</a>
    `;
    
    document.body.appendChild(userMenu);
    
    // Position menu
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        const rect = userAvatar.getBoundingClientRect();
        userMenu.style.position = 'fixed';
        userMenu.style.top = (rect.bottom + 8) + 'px';
        userMenu.style.right = '16px';
        userMenu.style.zIndex = '10001';
    }
    
    // Close when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeUserMenu(e) {
            if (!userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
                userMenu.remove();
                document.removeEventListener('click', closeUserMenu);
            }
        });
    }, 10);
}