// Pinterest Clone JavaScript

// Sample data including jun account and posts
const sampleData = {
    users: {
        jun: {
            id: 'jun',
            username: 'jun',
            displayName: 'Jun',
            profileImg: 'https://via.placeholder.com/40x40/BD081C/FFFFFF?text=J',
            followers: '1.2K',
            following: '456',
            bio: 'Creative designer and photographer'
        }
    },
    pins: [
        {
            id: 1,
            image: 'https://picsum.photos/300/400?random=1',
            title: 'Beautiful sunset landscape',
            description: 'Amazing sunset view from the mountains. Perfect for a peaceful evening.',
            author: 'jun',
            likes: 234,
            saves: 89,
            category: 'travel'
        },
        {
            id: 2,
            image: 'https://picsum.photos/300/500?random=2',
            title: 'Modern kitchen design',
            description: 'Clean and minimalist kitchen design with white cabinets and wooden accents.',
            author: 'jun',
            likes: 567,
            saves: 123,
            category: 'home'
        },
        {
            id: 3,
            image: 'https://picsum.photos/300/450?random=3',
            title: 'Delicious pasta recipe',
            description: 'Homemade pasta with fresh ingredients and herbs. Perfect for dinner!',
            author: 'jun',
            likes: 445,
            saves: 156,
            category: 'food'
        },
        {
            id: 4,
            image: 'https://picsum.photos/300/350?random=4',
            title: 'Street fashion inspiration',
            description: 'Casual street style with denim jacket and sneakers.',
            author: 'jun',
            likes: 789,
            saves: 234,
            category: 'fashion'
        },
        {
            id: 5,
            image: 'https://picsum.photos/300/600?random=5',
            title: 'Abstract art painting',
            description: 'Colorful abstract painting with bold brushstrokes and vibrant colors.',
            author: 'jun',
            likes: 123,
            saves: 45,
            category: 'art'
        },
        {
            id: 6,
            image: 'https://picsum.photos/300/400?random=6',
            title: 'Tech workspace setup',
            description: 'Minimalist workspace with MacBook, monitor, and plants.',
            author: 'jun',
            likes: 678,
            saves: 189,
            category: 'tech'
        },
        {
            id: 7,
            image: 'https://picsum.photos/300/500?random=7',
            title: 'Cozy bedroom design',
            description: 'Warm and inviting bedroom with soft lighting and comfortable furniture.',
            author: 'jun',
            likes: 345,
            saves: 98,
            category: 'home'
        },
        {
            id: 8,
            image: 'https://picsum.photos/300/450?random=8',
            title: 'Healthy breakfast bowl',
            description: 'Nutritious breakfast with fruits, granola, and yogurt.',
            author: 'jun',
            likes: 456,
            saves: 167,
            category: 'food'
        },
        {
            id: 9,
            image: 'https://picsum.photos/300/350?random=9',
            title: 'Vintage camera collection',
            description: 'Beautiful collection of vintage film cameras from different eras.',
            author: 'jun',
            likes: 234,
            saves: 78,
            category: 'art'
        },
        {
            id: 10,
            image: 'https://picsum.photos/300/600?random=10',
            title: 'Mountain hiking trail',
            description: 'Scenic hiking trail through the mountains with breathtaking views.',
            author: 'jun',
            likes: 567,
            saves: 145,
            category: 'travel'
        },
        {
            id: 11,
            image: 'https://picsum.photos/300/400?random=11',
            title: 'Elegant evening dress',
            description: 'Beautiful black evening dress perfect for special occasions.',
            author: 'jun',
            likes: 789,
            saves: 234,
            category: 'fashion'
        },
        {
            id: 12,
            image: 'https://picsum.photos/300/500?random=12',
            title: 'Smart home gadgets',
            description: 'Latest smart home devices for modern living.',
            author: 'jun',
            likes: 345,
            saves: 123,
            category: 'tech'
        }
    ]
};

// Global variables
let currentSection = 'home';
let currentUser = 'jun';
let filteredPins = [...sampleData.pins];

// DOM elements
const searchInput = document.getElementById('searchInput');
const navTabs = document.querySelectorAll('.nav-tab');
const contentSections = document.querySelectorAll('.content-section');
const pinsGrid = document.getElementById('pinsGrid');
const followingGrid = document.getElementById('followingGrid');
const exploreGrid = document.getElementById('exploreGrid');
const shoppingGrid = document.getElementById('shoppingGrid');
const pinModal = document.getElementById('pinModal');
const createModal = document.getElementById('createModal');
const createBtn = document.getElementById('createBtn');
const createPinForm = document.getElementById('createPinForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadPins('home');
});

function initializeApp() {
    // Set current user profile
    const profileImg = document.querySelector('.profile-img');
    profileImg.src = sampleData.users[currentUser].profileImg;
    profileImg.alt = sampleData.users[currentUser].displayName;
}

function setupEventListeners() {
    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            switchSection(section);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', handleSearch);

    // Header buttons
    document.getElementById('homeBtn').addEventListener('click', () => switchSection('home'));
    createBtn.addEventListener('click', () => openCreateModal());
    document.getElementById('messagesBtn').addEventListener('click', () => alert('Messages feature coming soon!'));
    document.getElementById('notificationsBtn').addEventListener('click', () => alert('Notifications feature coming soon!'));

    // Profile dropdown
    document.getElementById('profileLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Profile page coming soon!');
    });
    document.getElementById('boardsLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Boards page coming soon!');
    });
    document.getElementById('settingsLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Settings page coming soon!');
    });
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Logout functionality coming soon!');
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === pinModal) {
            closeModals();
        }
        if (e.target === createModal) {
            closeModals();
        }
    });

    // Create pin form
    createPinForm.addEventListener('submit', handleCreatePin);

    // Category items
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            filterByCategory(category);
        });
    });
}

function switchSection(section) {
    // Update active tab
    navTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === section) {
            tab.classList.add('active');
        }
    });

    // Update active section
    contentSections.forEach(contentSection => {
        contentSection.classList.remove('active');
        if (contentSection.id === section) {
            contentSection.classList.add('active');
        }
    });

    currentSection = section;
    loadPins(section);
}

function loadPins(section) {
    let targetGrid;
    let pinsToShow = [];

    switch (section) {
        case 'home':
            targetGrid = pinsGrid;
            pinsToShow = filteredPins;
            break;
        case 'following':
            targetGrid = followingGrid;
            pinsToShow = filteredPins.filter(pin => pin.author !== currentUser);
            break;
        case 'explore':
            targetGrid = exploreGrid;
            pinsToShow = filteredPins;
            break;
        case 'shopping':
            targetGrid = shoppingGrid;
            pinsToShow = filteredPins.filter(pin => 
                pin.category === 'fashion' || pin.category === 'home' || pin.category === 'tech'
            );
            break;
    }

    renderPins(targetGrid, pinsToShow);
}

function renderPins(container, pins) {
    container.innerHTML = '';
    
    pins.forEach(pin => {
        const pinElement = createPinElement(pin);
        container.appendChild(pinElement);
    });
}

function createPinElement(pin) {
    const pinDiv = document.createElement('div');
    pinDiv.className = 'pin';
    pinDiv.dataset.pinId = pin.id;

    const user = sampleData.users[pin.author];
    
    pinDiv.innerHTML = `
        <div class="pin-image-container">
            <img src="${pin.image}" alt="${pin.title}" class="pin-image">
            <div class="pin-overlay">
                <div class="pin-actions">
                    <button class="pin-action-btn save-action" title="Save">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <button class="pin-action-btn share-action" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="pin-action-btn like-action" title="Like">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="pin-info">
            <div class="pin-title">${pin.title}</div>
            <div class="pin-author">
                <img src="${user.profileImg}" alt="${user.displayName}">
                <span>${user.displayName}</span>
            </div>
        </div>
    `;

    // Add click event to open modal
    pinDiv.addEventListener('click', (e) => {
        if (!e.target.closest('.pin-action-btn')) {
            openPinModal(pin);
        }
    });

    // Add action button events
    const saveBtn = pinDiv.querySelector('.save-action');
    const shareBtn = pinDiv.querySelector('.share-action');
    const likeBtn = pinDiv.querySelector('.like-action');

    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSavePin(pin);
    });

    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSharePin(pin);
    });

    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLikePin(pin, likeBtn);
    });

    return pinDiv;
}

function openPinModal(pin) {
    const user = sampleData.users[pin.author];
    
    document.getElementById('modalImage').src = pin.image;
    document.getElementById('modalImage').alt = pin.title;
    document.getElementById('modalProfileImg').src = user.profileImg;
    document.getElementById('modalProfileImg').alt = user.displayName;
    document.getElementById('modalUsername').textContent = user.displayName;
    document.getElementById('modalFollowers').textContent = `${user.followers} followers`;
    document.getElementById('modalDescription').textContent = pin.description;
    document.getElementById('modalLikes').textContent = pin.likes;

    // Update follow button
    const followBtn = document.getElementById('modalFollowBtn');
    if (pin.author === currentUser) {
        followBtn.style.display = 'none';
    } else {
        followBtn.style.display = 'block';
        followBtn.textContent = 'Follow';
    }

    pinModal.style.display = 'block';
}

function closeModals() {
    pinModal.style.display = 'none';
    createModal.style.display = 'none';
}

function openCreateModal() {
    createModal.style.display = 'block';
}

function handleCreatePin(e) {
    e.preventDefault();
    
    const imageUrl = document.getElementById('pinImage').value;
    const title = document.getElementById('pinTitle').value;
    const description = document.getElementById('pinDescription').value;
    const board = document.getElementById('pinBoard').value;

    const newPin = {
        id: Date.now(),
        image: imageUrl,
        title: title,
        description: description,
        author: currentUser,
        likes: 0,
        saves: 0,
        category: 'general'
    };

    sampleData.pins.unshift(newPin);
    filteredPins = [...sampleData.pins];
    
    loadPins(currentSection);
    closeModals();
    
    // Reset form
    createPinForm.reset();
    
    alert('Pin created successfully!');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query === '') {
        filteredPins = [...sampleData.pins];
    } else {
        filteredPins = sampleData.pins.filter(pin => 
            pin.title.toLowerCase().includes(query) ||
            pin.description.toLowerCase().includes(query) ||
            pin.category.toLowerCase().includes(query)
        );
    }
    
    loadPins(currentSection);
}

function filterByCategory(category) {
    filteredPins = sampleData.pins.filter(pin => pin.category === category);
    switchSection('explore');
}

function handleSavePin(pin) {
    pin.saves++;
    alert(`Pin saved! Total saves: ${pin.saves}`);
}

function handleSharePin(pin) {
    if (navigator.share) {
        navigator.share({
            title: pin.title,
            text: pin.description,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `${window.location.origin}${window.location.pathname}?pin=${pin.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

function handleLikePin(pin, likeBtn) {
    const icon = likeBtn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        pin.likes++;
        likeBtn.style.color = '#BD081C';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        pin.likes--;
        likeBtn.style.color = '';
    }
}

// Add some additional functionality
function addInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            // Load more pins when user scrolls near bottom
            loadMorePins();
        }
    });
}

function loadMorePins() {
    // Simulate loading more pins
    const morePins = [
        {
            id: Date.now() + Math.random(),
            image: `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`,
            title: 'More amazing content',
            description: 'Additional pins loaded dynamically',
            author: 'jun',
            likes: Math.floor(Math.random() * 500),
            saves: Math.floor(Math.random() * 100),
            category: 'general'
        }
    ];
    
    sampleData.pins.push(...morePins);
    filteredPins = [...sampleData.pins];
    loadPins(currentSection);
}

// Initialize infinite scroll
addInfiniteScroll();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModals();
    }
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Add some animations
function addPinAnimation() {
    const pins = document.querySelectorAll('.pin');
    pins.forEach((pin, index) => {
        pin.style.animationDelay = `${index * 0.1}s`;
        pin.classList.add('fade-in');
    });
}

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Call animation function after pins are loaded
setTimeout(addPinAnimation, 100);

