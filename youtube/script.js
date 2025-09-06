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
                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    if (searchInput) searchInput.value = transcript;
                    performSearch();
                };
                
                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                    alert('Voice recognition failed.');
                };
                
                recognition.start();
                alert('Voice search started. Please speak now.');
            } else {
                alert('This browser does not support voice search.');
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

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // '/' key focuses search input
        if (e.key === '/' && searchInput && !searchInput.matches(':focus')) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // ESC key closes sidebar on mobile
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
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