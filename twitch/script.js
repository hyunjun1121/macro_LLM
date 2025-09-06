// Mock data for Twitch-like interface
const mockData = {
    streams: [
        {
            id: 1,
            channel: "jun",
            title: "Building a Twitch Clone - Live Coding Session",
            game: "Just Chatting",
            viewers: 1247,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=jun+Live+Coding",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Join me as I build a Twitch clone using HTML, CSS, and JavaScript. We'll cover responsive design, interactive features, and modern web development techniques."
        },
        {
            id: 2,
            channel: "jun",
            title: "Web Development Tips & Tricks - Q&A Session",
            game: "Just Chatting",
            viewers: 892,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/ff6b6b/ffffff?text=Web+Dev+Tips",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Answering your web development questions and sharing some cool tips I've learned over the years."
        },
        {
            id: 3,
            channel: "jun",
            title: "React vs Vue vs Angular - Framework Comparison",
            game: "Just Chatting",
            viewers: 1563,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/4ecdc4/ffffff?text=Framework+Comparison",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Let's compare the three most popular JavaScript frameworks and discuss their pros and cons."
        },
        {
            id: 4,
            channel: "alice_gaming",
            title: "Ranked Grind to Diamond - League of Legends",
            game: "League of Legends",
            viewers: 856,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/ff6b6b/ffffff?text=LoL+Ranked",
            avatar: "https://via.placeholder.com/40x40/ff6b6b/ffffff?text=A",
            isLive: true,
            description: "Trying to climb to Diamond rank this season. Let's see how far we can get!"
        },
        {
            id: 5,
            channel: "bob_streams",
            title: "Building Epic Minecraft Castle - Part 3",
            game: "Minecraft",
            viewers: 2103,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/4ecdc4/ffffff?text=Minecraft+Castle",
            avatar: "https://via.placeholder.com/40x40/4ecdc4/ffffff?text=B",
            isLive: true,
            description: "Continuing our massive castle build. Today we're working on the main tower and throne room."
        },
        {
            id: 6,
            channel: "jun",
            title: "CSS Grid vs Flexbox - When to Use What?",
            game: "Just Chatting",
            viewers: 743,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=CSS+Grid+vs+Flexbox",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Deep dive into CSS layout methods. When should you use Grid vs Flexbox? Let's find out together."
        },
        {
            id: 7,
            channel: "jun",
            title: "JavaScript ES6+ Features You Should Know",
            game: "Just Chatting",
            viewers: 1124,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=ES6+Features",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Exploring modern JavaScript features that every developer should be familiar with."
        },
        {
            id: 8,
            channel: "jun",
            title: "Building a Full-Stack App - Backend Setup",
            game: "Just Chatting",
            viewers: 987,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=Full+Stack+Backend",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Setting up the backend for our full-stack application. We'll cover Node.js, Express, and database setup."
        }
    ],
    categories: [
        {
            id: 1,
            name: "Just Chatting",
            viewers: 245000,
            thumbnail: "https://via.placeholder.com/60x80/9146ff/ffffff?text=JC"
        },
        {
            id: 2,
            name: "League of Legends",
            viewers: 89000,
            thumbnail: "https://via.placeholder.com/60x80/ff6b6b/ffffff?text=LOL"
        },
        {
            id: 3,
            name: "Minecraft",
            viewers: 67000,
            thumbnail: "https://via.placeholder.com/60x80/4ecdc4/ffffff?text=MC"
        },
        {
            id: 4,
            name: "Fortnite",
            viewers: 45000,
            thumbnail: "https://via.placeholder.com/60x80/ffa500/ffffff?text=FN"
        },
        {
            id: 5,
            name: "Valorant",
            viewers: 32000,
            thumbnail: "https://via.placeholder.com/60x80/ff4757/ffffff?text=VAL"
        }
    ],
    channels: [
        {
            id: 1,
            name: "jun",
            displayName: "jun",
            followers: 15420,
            avatar: "https://via.placeholder.com/60x60/9146ff/ffffff?text=J",
            isLive: true,
            currentGame: "Just Chatting",
            viewers: 1247
        },
        {
            id: 2,
            name: "alice_gaming",
            displayName: "alice_gaming",
            followers: 8930,
            avatar: "https://via.placeholder.com/60x60/ff6b6b/ffffff?text=A",
            isLive: true,
            currentGame: "League of Legends",
            viewers: 856
        },
        {
            id: 3,
            name: "bob_streams",
            displayName: "bob_streams",
            followers: 12300,
            avatar: "https://via.placeholder.com/60x60/4ecdc4/ffffff?text=B",
            isLive: true,
            currentGame: "Minecraft",
            viewers: 2103
        }
    ]
};

// Global state
let currentTab = 'recommended';
let currentSearchType = 'channels';
let searchResults = [];

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const streamGrid = document.getElementById('stream-grid');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results');
const closeSearchBtn = document.querySelector('.close-search');
const searchTabs = document.querySelectorAll('.search-tab');
const loadMoreBtn = document.querySelector('.load-more-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadStreams();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page);
        });
    });

    // Tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', performSearch);
    document.querySelector('.search-btn').addEventListener('click', openSearch);
    closeSearchBtn.addEventListener('click', closeSearch);
    
    // Search tabs
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.dataset.type;
            switchSearchType(type);
        });
    });
    
    // Close search on overlay click
    document.querySelector('.search-overlay').addEventListener('click', closeSearch);
    
    // Load more button
    loadMoreBtn.addEventListener('click', loadMoreStreams);
    
    // Channel items in sidebar
    document.querySelectorAll('.channel-item').forEach(item => {
        item.addEventListener('click', function() {
            const channelName = this.querySelector('.channel-name').textContent;
            searchForChannel(channelName);
        });
    });
    
    // Category items in sidebar
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            const categoryName = this.querySelector('.category-name').textContent;
            searchForCategory(categoryName);
        });
    });
}

// Switch page
function switchPage(page) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Update content based on page
    switch(page) {
        case 'browse':
            switchTab('browse');
            break;
        case 'following':
            switchTab('following');
            break;
        case 'esports':
            loadEsportsContent();
            break;
        case 'music':
            loadMusicContent();
            break;
    }
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;
    
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    loadStreams();
}

// Load streams based on current tab
function loadStreams() {
    let streamsToShow = [];
    
    switch(currentTab) {
        case 'recommended':
            streamsToShow = mockData.streams;
            break;
        case 'following':
            // Show only jun's streams for following tab
            streamsToShow = mockData.streams.filter(stream => stream.channel === 'jun');
            break;
        case 'browse':
            // Show all streams
            streamsToShow = mockData.streams;
            break;
    }
    
    displayStreams(streamsToShow);
}

// Display streams in grid
function displayStreams(streams) {
    streamGrid.innerHTML = '';
    
    streams.forEach(stream => {
        const streamCard = createStreamCard(stream);
        streamGrid.appendChild(streamCard);
    });
}

// Create stream card element
function createStreamCard(stream) {
    const card = document.createElement('div');
    card.className = 'stream-card';
    card.innerHTML = `
        <div class="stream-preview">
            <img src="${stream.thumbnail}" alt="${stream.title}">
            ${stream.isLive ? '<div class="live-indicator">LIVE</div>' : ''}
        </div>
        <div class="stream-details">
            <div class="stream-meta">
                <div class="stream-avatar">
                    <img src="${stream.avatar}" alt="${stream.channel}">
                </div>
                <div class="stream-info">
                    <div class="stream-title">${stream.title}</div>
                    <div class="stream-channel">${stream.channel}</div>
                    <div class="stream-game">${stream.game}</div>
                </div>
            </div>
            <div class="stream-stats">
                <span class="viewer-count">${formatViewerCount(stream.viewers)} viewers</span>
                <span class="language-tag">${stream.language}</span>
            </div>
        </div>
    `;
    
    // Add click event to stream card
    card.addEventListener('click', function() {
        openStream(stream);
    });
    
    return card;
}

// Format viewer count
function formatViewerCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Open stream (simulate)
function openStream(stream) {
    alert(`Opening stream: ${stream.title}\nChannel: ${stream.channel}\nViewers: ${formatViewerCount(stream.viewers)}`);
}

// Load more streams
function loadMoreStreams() {
    // Simulate loading more streams
    const additionalStreams = [
        {
            id: 9,
            channel: "jun",
            title: "Advanced CSS Techniques - Animations & Transitions",
            game: "Just Chatting",
            viewers: 654,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=CSS+Animations",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Exploring advanced CSS techniques for creating smooth animations and transitions."
        },
        {
            id: 10,
            channel: "jun",
            title: "API Design Best Practices - REST vs GraphQL",
            game: "Just Chatting",
            viewers: 432,
            language: "EN",
            thumbnail: "https://via.placeholder.com/300x180/9146ff/ffffff?text=API+Design",
            avatar: "https://via.placeholder.com/40x40/9146ff/ffffff?text=J",
            isLive: true,
            description: "Discussing API design patterns and when to use REST vs GraphQL."
        }
    ];
    
    additionalStreams.forEach(stream => {
        const streamCard = createStreamCard(stream);
        streamGrid.appendChild(streamCard);
    });
    
    // Hide load more button after loading
    loadMoreBtn.style.display = 'none';
}

// Open search modal
function openSearch() {
    searchModal.style.display = 'block';
    searchInput.focus();
    performSearch(); // Show all results initially
}

// Close search modal
function closeSearch() {
    searchModal.style.display = 'none';
    searchInput.value = '';
    searchResultsContainer.innerHTML = '';
}

// Switch search type
function switchSearchType(type) {
    currentSearchType = type;
    
    searchTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.type === type) {
            tab.classList.add('active');
        }
    });
    
    performSearch();
}

// Perform search
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    searchResults = [];
    
    if (!query) {
        // Show all results if no query
        switch(currentSearchType) {
            case 'channels':
                searchResults = mockData.channels;
                break;
            case 'categories':
                searchResults = mockData.categories;
                break;
            case 'videos':
                searchResults = mockData.streams;
                break;
        }
    } else {
        // Search based on type
        switch(currentSearchType) {
            case 'channels':
                searchResults = mockData.channels.filter(channel => 
                    channel.name.toLowerCase().includes(query) ||
                    channel.displayName.toLowerCase().includes(query)
                );
                break;
            case 'categories':
                searchResults = mockData.categories.filter(category => 
                    category.name.toLowerCase().includes(query)
                );
                break;
            case 'videos':
                searchResults = mockData.streams.filter(stream => 
                    stream.title.toLowerCase().includes(query) ||
                    stream.channel.toLowerCase().includes(query) ||
                    stream.game.toLowerCase().includes(query)
                );
                break;
        }
    }
    
    displaySearchResults();
}

// Display search results
function displaySearchResults() {
    searchResultsContainer.innerHTML = '';
    
    if (searchResults.length === 0) {
        searchResultsContainer.innerHTML = '<div style="padding: 16px; color: #adadb8; text-align: center;">No results found.</div>';
        return;
    }
    
    searchResults.forEach(result => {
        const resultElement = createSearchResultElement(result);
        searchResultsContainer.appendChild(resultElement);
    });
}

// Create search result element
function createSearchResultElement(result) {
    const element = document.createElement('div');
    element.className = 'search-result';
    
    switch(currentSearchType) {
        case 'channels':
            element.innerHTML = `
                <div class="search-result-avatar">
                    <img src="${result.avatar}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${result.displayName}</div>
                    <div class="search-result-details">
                        ${result.followers.toLocaleString()} followers
                        ${result.isLive ? `• Live: ${result.currentGame} (${formatViewerCount(result.viewers)} viewers)` : '• Offline'}
                    </div>
                </div>
            `;
            break;
        case 'categories':
            element.innerHTML = `
                <div class="search-result-avatar">
                    <img src="${result.thumbnail}" alt="${result.name}">
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${result.name}</div>
                    <div class="search-result-details">
                        ${formatViewerCount(result.viewers)} viewers
                    </div>
                </div>
            `;
            break;
        case 'videos':
            element.innerHTML = `
                <div class="search-result-avatar">
                    <img src="${result.avatar}" alt="${result.channel}">
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${result.title}</div>
                    <div class="search-result-details">
                        ${result.channel} • ${result.game} • ${formatViewerCount(result.viewers)} viewers
                    </div>
                </div>
            `;
            break;
    }
    
    element.addEventListener('click', function() {
        if (currentSearchType === 'channels') {
            searchForChannel(result.name);
        } else if (currentSearchType === 'categories') {
            searchForCategory(result.name);
        } else if (currentSearchType === 'videos') {
            openStream(result);
        }
        closeSearch();
    });
    
    return element;
}

// Search for specific channel
function searchForChannel(channelName) {
    const channelStreams = mockData.streams.filter(stream => 
        stream.channel.toLowerCase() === channelName.toLowerCase()
    );
    displayStreams(channelStreams);
}

// Search for specific category
function searchForCategory(categoryName) {
    const categoryStreams = mockData.streams.filter(stream => 
        stream.game.toLowerCase() === categoryName.toLowerCase()
    );
    displayStreams(categoryStreams);
}

// Load esports content
function loadEsportsContent() {
    const esportsStreams = mockData.streams.filter(stream => 
        stream.game === 'League of Legends' || stream.game === 'Valorant'
    );
    displayStreams(esportsStreams);
}

// Load music content
function loadMusicContent() {
    const musicStreams = mockData.streams.filter(stream => 
        stream.game === 'Just Chatting' && stream.title.toLowerCase().includes('music')
    );
    displayStreams(musicStreams);
}

// Keyboard shortcuts
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
    if (e.target.classList.contains('stream-card')) {
        e.target.style.transform = 'translateY(-4px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('stream-card')) {
        e.target.style.transform = 'translateY(0)';
    }
});

// Simulate real-time updates
setInterval(function() {
    // This could be used to simulate live viewer count updates
    // For now, we'll just keep the interface responsive
}, 5000);

