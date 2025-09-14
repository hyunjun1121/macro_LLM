// Enhanced Facebook functionality with full interactivity

// Extended sample data with comprehensive personal information
const users = {
    john: {
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://via.placeholder.com/40/1877f2/ffffff?text=JD',
        status: 'online',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        birthday: '1990-05-15',
        age: 33,
        location: {
            current: 'New York, NY, USA',
            hometown: 'Boston, MA, USA',
            coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        work: {
            company: 'TechCorp Inc.',
            position: 'Senior Software Engineer',
            startDate: '2018-03-01',
            location: 'New York, NY',
            description: 'Full-stack development with focus on React and Node.js'
        },
        education: [
            {
                school: 'Massachusetts Institute of Technology',
                degree: 'Master of Science',
                field: 'Computer Science',
                startYear: 2014,
                endYear: 2016
            },
            {
                school: 'Boston University',
                degree: 'Bachelor of Science',
                field: 'Computer Engineering',
                startYear: 2010,
                endYear: 2014
            }
        ],
        relationship: {
            status: 'Single',
            interestedIn: ['Women'],
            lookingFor: ['Friendship', 'Dating']
        },
        languages: ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
        interests: ['Technology', 'Gaming', 'Photography', 'Travel', 'Cooking'],
        bio: 'Software engineer passionate about creating innovative solutions. Love to travel and try new cuisines!',
        website: 'https://johndoe.dev',
        socialMedia: {
            instagram: '@johndoe_dev',
            twitter: '@john_codes',
            linkedin: 'linkedin.com/in/johndoedev'
        },
        privacy: {
            profileVisibility: 'friends',
            contactInfo: 'friends',
            posts: 'public',
            friendsList: 'friends'
        },
        joined: '2018-01-15T10:30:00Z',
        lastActive: '2024-02-15T14:22:00Z'
    },
    sarah: {
        name: 'Sarah Johnson',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://via.placeholder.com/40/e91e63/ffffff?text=SJ',
        status: 'online',
        email: 'sarah.johnson@gmail.com',
        phone: '+1 (555) 234-5678',
        birthday: '1992-08-22',
        age: 31,
        location: {
            current: 'San Francisco, CA, USA',
            hometown: 'Portland, OR, USA',
            coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        work: {
            company: 'Design Studios LLC',
            position: 'Creative Director',
            startDate: '2020-06-01',
            location: 'San Francisco, CA',
            description: 'Leading creative campaigns for Fortune 500 companies'
        },
        education: [
            {
                school: 'Art Institute of California',
                degree: 'Master of Fine Arts',
                field: 'Graphic Design',
                startYear: 2014,
                endYear: 2016
            }
        ],
        relationship: {
            status: 'In a relationship',
            partner: 'Mike Chen',
            since: '2023-01-01',
            interestedIn: ['Men'],
            lookingFor: ['Friendship']
        },
        languages: ['English (Native)', 'Korean (Fluent)'],
        interests: ['Art', 'Photography', 'Hiking', 'Yoga', 'Sustainable Living'],
        bio: 'Creative director with a passion for sustainable design. Always looking for new adventures!',
        website: 'https://sarahjohnsondesign.com',
        socialMedia: {
            instagram: '@sarahj_designs',
            behance: 'sarahjohnson'
        },
        privacy: {
            profileVisibility: 'public',
            contactInfo: 'friends',
            posts: 'public',
            friendsList: 'friends'
        },
        joined: '2019-03-20T16:45:00Z',
        lastActive: '2024-02-15T15:10:00Z'
    },
    mike: {
        name: 'Mike Chen',
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://via.placeholder.com/40/42b883/ffffff?text=MC',
        status: 'online',
        email: 'mike.chen@techmail.com',
        phone: '+1 (555) 345-6789',
        birthday: '1988-12-03',
        age: 35,
        location: {
            current: 'Austin, TX, USA',
            hometown: 'Houston, TX, USA',
            coordinates: { lat: 30.2672, lng: -97.7431 }
        },
        work: {
            company: 'Startup Innovations',
            position: 'Co-Founder & CTO',
            startDate: '2021-01-01',
            location: 'Austin, TX',
            description: 'Building next-generation fintech solutions'
        },
        education: [
            {
                school: 'University of Texas at Austin',
                degree: 'Doctor of Philosophy',
                field: 'Computer Science',
                startYear: 2012,
                endYear: 2017
            }
        ],
        relationship: {
            status: 'In a relationship',
            partner: 'Sarah Johnson',
            since: '2023-01-01',
            interestedIn: ['Women'],
            lookingFor: ['Friendship']
        },
        languages: ['English (Native)', 'Mandarin (Native)', 'Japanese (Intermediate)'],
        interests: ['Entrepreneurship', 'AI/ML', 'Rock Climbing', 'Chess', 'Craft Beer'],
        bio: 'Tech entrepreneur focused on fintech innovation. Rock climbing enthusiast and chess player.',
        website: 'https://mikechen.tech',
        socialMedia: {
            twitter: '@mike_codes',
            linkedin: 'linkedin.com/in/mikechen-tech'
        },
        privacy: {
            profileVisibility: 'friends',
            contactInfo: 'friends',
            posts: 'friends',
            friendsList: 'me'
        },
        joined: '2019-06-10T12:20:00Z',
        lastActive: '2024-02-15T13:55:00Z'
    },
    emma: {
        name: 'Emma Wilson',
        firstName: 'Emma',
        lastName: 'Wilson',
        avatar: 'https://via.placeholder.com/40/f39c12/ffffff?text=EW',
        status: 'offline',
        email: 'emma.wilson@university.edu',
        phone: '+1 (555) 456-7890',
        birthday: '1995-03-10',
        age: 28,
        location: {
            current: 'Chicago, IL, USA',
            hometown: 'Milwaukee, WI, USA',
            coordinates: { lat: 41.8781, lng: -87.6298 }
        },
        work: {
            company: 'Northwestern University',
            position: 'Research Associate',
            startDate: '2022-09-01',
            location: 'Chicago, IL',
            description: 'Conducting research in environmental sustainability'
        },
        education: [
            {
                school: 'Northwestern University',
                degree: 'Master of Science',
                field: 'Environmental Engineering',
                startYear: 2020,
                endYear: 2022
            }
        ],
        relationship: {
            status: 'Single',
            interestedIn: ['Men', 'Women'],
            lookingFor: ['Friendship', 'Dating']
        },
        languages: ['English (Native)', 'German (Intermediate)'],
        interests: ['Environmental Science', 'Running', 'Reading', 'Volunteer Work', 'Gardening'],
        bio: 'Environmental researcher working to make the world more sustainable. Marathon runner and book lover.',
        privacy: {
            profileVisibility: 'friends',
            contactInfo: 'me',
            posts: 'friends',
            friendsList: 'friends'
        },
        joined: '2020-11-05T09:15:00Z',
        lastActive: '2024-02-14T22:30:00Z'
    },
    alex: {
        name: 'Alex Rodriguez',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        avatar: 'https://via.placeholder.com/40/9b59b6/ffffff?text=AR',
        status: 'online',
        email: 'alex.rodriguez@media.com',
        phone: '+1 (555) 567-8901',
        birthday: '1991-07-18',
        age: 32,
        location: {
            current: 'Los Angeles, CA, USA',
            hometown: 'Phoenix, AZ, USA',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        work: {
            company: 'Media Productions Inc.',
            position: 'Video Producer',
            startDate: '2019-04-15',
            location: 'Los Angeles, CA',
            description: 'Producing content for digital media platforms'
        },
        education: [
            {
                school: 'UCLA',
                degree: 'Bachelor of Arts',
                field: 'Film and Television',
                startYear: 2009,
                endYear: 2013
            }
        ],
        relationship: {
            status: 'Married',
            partner: 'Maria Rodriguez',
            since: '2020-06-20',
            interestedIn: ['Women'],
            lookingFor: ['Friendship']
        },
        languages: ['English (Native)', 'Spanish (Native)'],
        interests: ['Filmmaking', 'Music Production', 'Soccer', 'Travel', 'Food'],
        bio: 'Video producer passionate about storytelling. Love exploring new cultures and cuisines.',
        website: 'https://alexrodriguezproductions.com',
        socialMedia: {
            instagram: '@alex_produces',
            youtube: 'AlexRodriguezFilms'
        },
        privacy: {
            profileVisibility: 'public',
            contactInfo: 'friends',
            posts: 'public',
            friendsList: 'friends'
        },
        joined: '2018-05-22T14:00:00Z',
        lastActive: '2024-02-15T16:40:00Z'
    },
    lisa: {
        name: 'Lisa Park',
        firstName: 'Lisa',
        lastName: 'Park',
        avatar: 'https://via.placeholder.com/40/e74c3c/ffffff?text=LP',
        status: 'offline',
        email: 'lisa.park@healthsystem.org',
        phone: '+1 (555) 678-9012',
        birthday: '1987-11-25',
        age: 36,
        location: {
            current: 'Seattle, WA, USA',
            hometown: 'Vancouver, BC, Canada',
            coordinates: { lat: 47.6062, lng: -122.3321 }
        },
        work: {
            company: 'Seattle Medical Center',
            position: 'Pediatric Nurse',
            startDate: '2015-08-01',
            location: 'Seattle, WA',
            description: 'Providing compassionate care to children and families'
        },
        education: [
            {
                school: 'University of Washington',
                degree: 'Bachelor of Science',
                field: 'Nursing',
                startYear: 2009,
                endYear: 2013
            }
        ],
        relationship: {
            status: 'Divorced',
            interestedIn: ['Men'],
            lookingFor: ['Friendship', 'Dating']
        },
        languages: ['English (Native)', 'Korean (Fluent)', 'French (Basic)'],
        interests: ['Healthcare', 'Children', 'Hiking', 'Knitting', 'Cooking'],
        bio: 'Pediatric nurse dedicated to caring for children. Love spending time in nature and crafting.',
        privacy: {
            profileVisibility: 'friends',
            contactInfo: 'friends',
            posts: 'friends',
            friendsList: 'me'
        },
        joined: '2017-09-30T11:25:00Z',
        lastActive: '2024-02-14T20:15:00Z'
    },
    jun: {
        name: 'Jun Kim',
        firstName: 'Jun',
        lastName: 'Kim',
        avatar: 'https://via.placeholder.com/40/2c3e50/ffffff?text=JK',
        status: 'online',
        email: 'jun.kim@fitness.com',
        phone: '+1 (555) 789-0123',
        birthday: '1993-09-08',
        age: 30,
        location: {
            current: 'Miami, FL, USA',
            hometown: 'Seoul, South Korea',
            coordinates: { lat: 25.7617, lng: -80.1918 }
        },
        work: {
            company: 'Elite Fitness Centers',
            position: 'Personal Trainer & Nutritionist',
            startDate: '2020-01-15',
            location: 'Miami, FL',
            description: 'Helping clients achieve their fitness and wellness goals'
        },
        education: [
            {
                school: 'University of Miami',
                degree: 'Bachelor of Science',
                field: 'Exercise Science',
                startYear: 2012,
                endYear: 2016
            }
        ],
        relationship: {
            status: 'Single',
            interestedIn: ['Women'],
            lookingFor: ['Dating', 'Friendship']
        },
        languages: ['Korean (Native)', 'English (Fluent)', 'Spanish (Intermediate)'],
        interests: ['Fitness', 'Nutrition', 'Marathon Running', 'Martial Arts', 'Beach Volleyball'],
        bio: 'Personal trainer and marathon runner. Passionate about helping people live healthier lives!',
        website: 'https://junkimfitness.com',
        socialMedia: {
            instagram: '@jun_fitness',
            youtube: 'JunKimFitness'
        },
        privacy: {
            profileVisibility: 'public',
            contactInfo: 'friends',
            posts: 'public',
            friendsList: 'public'
        },
        joined: '2020-02-14T13:45:00Z',
        lastActive: '2024-02-15T17:20:00Z'
    }
};

let posts = [
    {
        id: 1,
        author: 'jun',
        time: '30 minutes ago',
        content: 'Today I completed my first marathon! 🏃‍♂️ It took me 4 hours and 23 minutes, but I finally did it. Thank you to everyone who cheered me on along the way. The support meant everything! Next goal: sub-4 hours! 💪',
        image: 'https://via.placeholder.com/500x300/2c3e50/ffffff?text=Marathon+Finish',
        likes: 48,
        comments: [
            { id: 1, author: 'john', content: 'Incredible achievement! So proud of you!', time: '25 minutes ago', likes: 4 },
            { id: 2, author: 'sarah', content: 'Amazing! You\'re an inspiration! 🔥', time: '20 minutes ago', likes: 3 },
            { id: 3, author: 'mike', content: 'Sub-4 next time for sure! Great job!', time: '15 minutes ago', likes: 2 }
        ],
        shares: 8,
        reactions: { like: 32, love: 14, care: 2 },
        userReaction: null
    },
    {
        id: 2,
        author: 'sarah',
        time: '2 hours ago',
        content: 'Just finished an amazing hiking trip! The views were absolutely breathtaking. Nature never fails to inspire me. 🏔️',
        image: 'https://via.placeholder.com/500x300/42b883/ffffff?text=Hiking+Trip',
        likes: 24,
        comments: [
            { id: 1, author: 'mike', content: 'Looks amazing! Where is this?', time: '1 hour ago', likes: 3 },
            { id: 2, author: 'emma', content: 'Beautiful shot! 😍', time: '45 minutes ago', likes: 1 }
        ],
        shares: 3,
        reactions: { like: 15, love: 8, wow: 1 },
        userReaction: null
    },
    {
        id: 3,
        author: 'mike',
        time: '4 hours ago',
        content: 'Excited to share that I just got accepted into the computer science graduate program! Hard work pays off. Thank you to everyone who supported me along the way. 🎓',
        likes: 67,
        comments: [
            { id: 1, author: 'sarah', content: 'Congratulations! Well deserved!', time: '3 hours ago', likes: 5 },
            { id: 2, author: 'alex', content: 'So proud of you man! 🎉', time: '2 hours ago', likes: 2 },
            { id: 3, author: 'lisa', content: 'Amazing news! Celebrate tonight!', time: '1 hour ago', likes: 1 },
            { id: 4, author: 'jun', content: 'Congrats bro! Let\'s celebrate this weekend!', time: '30 minutes ago', likes: 4 }
        ],
        shares: 12,
        reactions: { like: 45, love: 20, care: 2 },
        userReaction: 'love'
    },
    {
        id: 4,
        author: 'emma',
        time: '6 hours ago',
        content: 'Homemade pizza night with the family! Nothing beats quality time together. 🍕',
        image: 'https://via.placeholder.com/500x400/f39c12/ffffff?text=Pizza+Night',
        likes: 45,
        comments: [
            { id: 1, author: 'john', content: 'That looks delicious!', time: '5 hours ago', likes: 2 }
        ],
        shares: 7,
        reactions: { like: 35, love: 8, haha: 2 },
        userReaction: null
    },
    {
        id: 5,
        author: 'jun',
        time: '1 day ago',
        content: 'Started learning Korean traditional cooking from my grandmother today! 👵🏻 Made kimchi jjigae (김치찌개) for the first time and it turned out pretty good! Family recipes are the best. Can\'t wait to master more dishes. 🥢',
        image: 'https://via.placeholder.com/500x400/2c3e50/ffffff?text=Korean+Cooking',
        likes: 38,
        comments: [
            { id: 1, author: 'lisa', content: 'That looks so authentic! Recipe please?', time: '23 hours ago', likes: 5 },
            { id: 2, author: 'alex', content: 'Your grandma is the best teacher! 😊', time: '20 hours ago', likes: 3 },
            { id: 3, author: 'emma', content: 'I love Korean food! Teach me sometime!', time: '18 hours ago', likes: 2 }
        ],
        shares: 4,
        reactions: { like: 28, love: 9, haha: 1 },
        userReaction: null
    }
];

let stories = [
    { id: 1, author: 'jun', image: 'https://via.placeholder.com/120x200/2c3e50/ffffff?text=Jun', viewed: false },
    { id: 2, author: 'sarah', image: 'https://via.placeholder.com/120x200/42b883/ffffff?text=Sarah', viewed: false },
    { id: 3, author: 'mike', image: 'https://via.placeholder.com/120x200/e91e63/ffffff?text=Mike', viewed: true },
    { id: 4, author: 'emma', image: 'https://via.placeholder.com/120x200/f39c12/ffffff?text=Emma', viewed: false }
];

let currentPostId = null;
let currentStoryFile = null;
let uploadedMedia = [];

// Advanced analytics and tracking data
let userActivityLog = [];
let engagementStats = {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    postPerformance: [],
    bestPostingTimes: [],
    friendInteractionStats: {}
};

// User behavior tracking
function logUserActivity(action, details = {}) {
    const activity = {
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        sessionId: getSessionId()
    };

    userActivityLog.push(activity);

    // Keep only last 1000 activities to prevent memory issues
    if (userActivityLog.length > 1000) {
        userActivityLog.shift();
    }

    // Save to localStorage periodically
    if (userActivityLog.length % 10 === 0) {
        localStorage.setItem('fbActivityLog', JSON.stringify(userActivityLog.slice(-500)));
    }
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('fbSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('fbSessionId', sessionId);
    }
    return sessionId;
}

// Engagement analytics
function updateEngagementStats(action, postId = null) {
    const hour = new Date().getHours();

    switch (action) {
        case 'post_created':
            engagementStats.totalPosts++;
            break;
        case 'post_liked':
            engagementStats.totalLikes++;
            break;
        case 'comment_posted':
            engagementStats.totalComments++;
            break;
        case 'post_shared':
            engagementStats.totalShares++;
            break;
    }

    // Track posting times for optimization
    if (action === 'post_created') {
        engagementStats.bestPostingTimes.push(hour);
    }

    // Save updated stats
    localStorage.setItem('fbEngagementStats', JSON.stringify(engagementStats));
}

function getOptimalPostingTime() {
    if (engagementStats.bestPostingTimes.length === 0) return null;

    // Count frequency of each hour
    const hourCounts = {};
    engagementStats.bestPostingTimes.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find most frequent hour
    const sortedHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));

    return sortedHours.slice(0, 3); // Return top 3 optimal hours
}

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced script loading...');
    
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        try {
            loadEnhancedPosts();
            setupEnhancedEventListeners();
            setupEnhancedSearch();
            loadStories();
            console.log('Enhanced Facebook features loaded successfully!');
        } catch (error) {
            console.error('Error loading enhanced features:', error);
        }
    }, 100);
});

function setupEnhancedEventListeners() {
    // Enhanced post creation
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.addEventListener('click', openPostModal);
    }
    
    // Story creation
    const createStory = document.querySelector('.create-story');
    if (createStory) {
        createStory.addEventListener('click', openStoryModal);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Enhanced search with filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleEnhancedSearch);
        searchInput.addEventListener('focus', showSearchFilters);
    }
    
    // Navigation event listeners
    setupNavigationListeners();
}

function setupNavigationListeners() {
    // Navigation
    document.querySelectorAll('.nav-icon[data-page]').forEach(icon => {
        icon.addEventListener('click', () => {
            const page = icon.dataset.page;
            navigateToPage(page);
        });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // Notifications
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', toggleNotifications);
    }

    // Messages
    const messagesBtn = document.getElementById('messagesBtn');
    if (messagesBtn) {
        messagesBtn.addEventListener('click', toggleMessages);
    }

    // Profile menu
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.addEventListener('click', toggleProfileDropdown);
    }

    // Contact items for chat
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.user;
            if (userId) {
                openEnhancedChat(userId);
            }
        });
    });

    // Close panels when clicking outside
    document.addEventListener('click', closeOpenPanels);
}

// POST CREATION FUNCTIONALITY
function openPostModal() {
    document.getElementById('postModal').style.display = 'block';
    document.getElementById('postText').focus();
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('postText').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    uploadedMedia = [];
    updatePostButton();
}

function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

function triggerVideoUpload() {
    document.getElementById('videoUpload').click();
}

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedMedia.push({
                    type: 'image',
                    src: e.target.result,
                    file: file
                });
                updateMediaPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedMedia.push({
                type: 'video',
                src: e.target.result,
                file: file
            });
            updateMediaPreview();
        };
        reader.readAsDataURL(file);
    }
}

function updateMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = uploadedMedia.map((media, index) => `
        <div class="media-item">
            ${media.type === 'image' 
                ? `<img src="${media.src}" alt="Upload preview">` 
                : `<video src="${media.src}" controls></video>`}
            <button class="media-remove" onclick="removeMedia(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    updatePostButton();
}

function removeMedia(index) {
    uploadedMedia.splice(index, 1);
    updateMediaPreview();
}

function updatePostButton() {
    const postText = document.getElementById('postText');
    const submitBtn = document.getElementById('postSubmitBtn');
    
    if (!postText || !submitBtn) return;
    
    const hasContent = postText.value.trim().length > 0 || uploadedMedia.length > 0;
    
    submitBtn.disabled = !hasContent;
    submitBtn.style.background = hasContent ? '#1877f2' : '#e4e6ea';
}

function submitPost() {
    const postTextElement = document.getElementById('postText');
    const privacyElement = document.getElementById('postPrivacy');

    if (!postTextElement || !privacyElement) {
        console.error('Required form elements not found');
        return;
    }

    const postText = postTextElement.value.trim();
    const privacy = privacyElement.value;

    if (postText.length === 0 && uploadedMedia.length === 0) return;
    
    const newPost = {
        id: posts.length + 1,
        author: 'john',
        time: 'Just now',
        content: postText,
        image: uploadedMedia.length > 0 ? uploadedMedia[0].src : null,
        likes: 0,
        comments: [],
        shares: 0,
        reactions: {},
        userReaction: null,
        privacy: privacy
    };
    
    posts.unshift(newPost);
    loadEnhancedPosts();
    closePostModal();

    // Log activity and update stats
    logUserActivity('post_created', {
        postId: newPost.id,
        contentLength: postText.length,
        hasMedia: uploadedMedia.length > 0,
        privacy: privacy
    });
    updateEngagementStats('post_created', newPost.id);

    // Save data immediately
    saveDataToStorage();

    // Show success message
    showNotification('Post created successfully!', 'success');
}

// STORY FUNCTIONALITY
function openStoryModal() {
    document.getElementById('storyModal').style.display = 'block';
}

function closeStoryModal() {
    document.getElementById('storyModal').style.display = 'none';
    document.getElementById('storyPreview').innerHTML = '';
    document.getElementById('storySubmitBtn').disabled = true;
    currentStoryFile = null;
}

function triggerStoryUpload() {
    document.getElementById('storyUpload').click();
}

function handleStoryUpload(event) {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        currentStoryFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('storyPreview');
            preview.innerHTML = file.type.startsWith('image/') 
                ? `<img src="${e.target.result}" alt="Story preview">`
                : `<video src="${e.target.result}" controls></video>`;
            document.getElementById('storySubmitBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

function submitStory() {
    if (!currentStoryFile) return;
    
    const newStory = {
        id: stories.length + 1,
        author: 'john',
        image: 'https://via.placeholder.com/120x200/1877f2/ffffff?text=Your+Story',
        viewed: false
    };
    
    stories.unshift(newStory);
    loadStories();
    closeStoryModal();

    // Save data immediately
    saveDataToStorage();

    showNotification('Story shared successfully!', 'success');
}

// ENHANCED POST DISPLAY
function loadEnhancedPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = posts.map(post => createEnhancedPostHTML(post)).join('');
}

function createEnhancedPostHTML(post) {
    const user = users[post.author];
    const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);
    const commentsCount = post.comments ? post.comments.length : 0;
    
    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="post-author-info">
                    <h4>${user.name}</h4>
                    <div class="post-time">${post.time} · ${getPrivacyIcon(post.privacy)}</div>
                </div>
                <div class="post-menu" onclick="showPostMenu(${post.id})">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-media" onclick="openImageModal('${post.image}')">` : ''}
            </div>
            <div class="post-stats">
                <div class="post-likes" onclick="showReactionsList(${post.id})">
                    ${getReactionIcons(post.reactions)}
                    ${totalReactions > 0 ? `${totalReactions}` : ''}
                </div>
                <div class="post-comments-shares" onclick="openComments(${post.id})">
                    ${commentsCount > 0 ? `${commentsCount} comments` : ''} ${post.shares > 0 ? `· ${post.shares} shares` : ''}
                </div>
            </div>
            <div class="post-actions">
                <div class="post-action ${post.userReaction ? 'reacted ' + post.userReaction : ''}" 
                     onmouseenter="showReactionsPicker(event, ${post.id})" 
                     onmouseleave="hideReactionsPicker()"
                     onclick="toggleReaction(${post.id}, 'like')">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${post.userReaction ? capitalizeFirst(post.userReaction) : 'Like'}</span>
                </div>
                <div class="post-action" onclick="openComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </div>
                <div class="post-action" onclick="openShareModal(${post.id})">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
    `;
}

function getPrivacyIcon(privacy) {
    const icons = {
        public: '🌍 Public',
        friends: '👥 Friends',
        private: '🔒 Only me'
    };
    return icons[privacy] || '👥 Friends';
}

function getReactionIcons(reactions) {
    if (!reactions || Object.keys(reactions).length === 0) return '';
    
    const reactionIcons = {
        like: '👍',
        love: '❤️',
        care: '🤗',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
    };
    
    return Object.keys(reactions)
        .filter(reaction => reactions[reaction] > 0)
        .slice(0, 3)
        .map(reaction => reactionIcons[reaction])
        .join('');
}

// REACTIONS SYSTEM
let reactionTimer;

function showReactionsPicker(event, postId) {
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => {
        const picker = document.getElementById('reactionsPicker');
        const rect = event.currentTarget.getBoundingClientRect();
        
        picker.style.left = rect.left + 'px';
        picker.style.top = rect.top - 60 + 'px';
        picker.style.display = 'flex';
        picker.dataset.postId = postId;
    }, 500);
}

function hideReactionsPicker() {
    clearTimeout(reactionTimer);
    setTimeout(() => {
        document.getElementById('reactionsPicker').style.display = 'none';
    }, 100);
}

function selectReaction(reaction) {
    const picker = document.getElementById('reactionsPicker');
    const postId = parseInt(picker.dataset.postId);
    toggleReaction(postId, reaction);
    hideReactionsPicker();
}

function toggleReaction(postId, reaction) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Remove previous reaction
    if (post.userReaction) {
        post.reactions[post.userReaction] = Math.max(0, (post.reactions[post.userReaction] || 0) - 1);
    }
    
    // Add new reaction or remove if same
    if (post.userReaction === reaction) {
        post.userReaction = null;
    } else {
        post.userReaction = reaction;
        post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
    }

    // Log reaction activity
    logUserActivity('post_reaction', {
        postId: postId,
        reaction: reaction,
        removed: removedReaction
    });
    updateEngagementStats('post_liked', postId);

    // Save data immediately
    saveDataToStorage();

    loadEnhancedPosts();
}

// COMMENTS SYSTEM
function openComments(postId) {
    currentPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const modal = document.getElementById('commentsModal');
    const container = document.getElementById('commentsContainer');
    
    container.innerHTML = post.comments.map(comment => createCommentHTML(comment)).join('');
    modal.style.display = 'block';
}

function closeCommentsModal() {
    document.getElementById('commentsModal').style.display = 'none';
    currentPostId = null;
}

function createCommentHTML(comment) {
    const user = users[comment.author];
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="comment-content">
                <div class="comment-bubble">
                    <div class="comment-author">${user.name}</div>
                    <div class="comment-text">${comment.content}</div>
                </div>
                <div class="comment-actions">
                    <span class="comment-action" onclick="likeComment(${comment.id})">
                        Like ${comment.likes > 0 ? `(${comment.likes})` : ''}
                    </span>
                    <span class="comment-action" onclick="replyToComment(${comment.id})">Reply</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
            </div>
        </div>
    `;
}

function handleCommentKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitComment();
    }
}

function submitComment() {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (!content || !currentPostId) return;
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    const newComment = {
        id: (post.comments.length + 1),
        author: 'john',
        content: content,
        time: 'Just now',
        likes: 0
    };
    
    post.comments.push(newComment);
    input.value = '';
    
    // Refresh comments display
    const container = document.getElementById('commentsContainer');
    container.innerHTML = post.comments.map(comment => createCommentHTML(comment)).join('');
    container.scrollTop = container.scrollHeight;

    // Log comment activity
    logUserActivity('comment_posted', {
        postId: currentPostId,
        commentLength: content.length,
        authorId: newComment.author
    });
    updateEngagementStats('comment_posted', currentPostId);

    // Save data immediately
    saveDataToStorage();

    // Update post display
    loadEnhancedPosts();
}

function likeComment(commentId) {
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    const comment = post.comments.find(c => c.id === commentId);
    if (comment) {
        comment.likes = (comment.likes || 0) + 1;
        openComments(currentPostId); // Refresh
    }
}

// SHARING FUNCTIONALITY
function openShareModal(postId) {
    const modal = document.getElementById('shareModal');
    modal.dataset.postId = postId;
    modal.style.display = 'block';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function shareToTimeline() {
    const modal = document.getElementById('shareModal');
    const postId = parseInt(modal.dataset.postId);
    const originalPost = posts.find(p => p.id === postId);
    
    if (originalPost) {
        const sharedPost = {
            id: posts.length + 1,
            author: 'john',
            time: 'Just now',
            content: 'Shared a post',
            sharedPost: originalPost,
            likes: 0,
            comments: [],
            shares: 0,
            reactions: {},
            userReaction: null
        };
        
        posts.unshift(sharedPost);
        originalPost.shares++;
        loadEnhancedPosts();
        closeShareModal();
        showNotification('Post shared to your timeline!', 'success');
    }
}

function shareToStory() {
    closeShareModal();
    showNotification('Post shared to your story!', 'success');
}

function sendInMessage() {
    closeShareModal();
    showNotification('Post sent in message!', 'success');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href + '#post-' + document.getElementById('shareModal').dataset.postId);
    closeShareModal();
    showNotification('Link copied to clipboard!', 'success');
}

// ENHANCED SEARCH FUNCTIONALITY
function setupEnhancedSearch() {
    const searchInput = document.getElementById('searchInput');
    
    // Create search filters container
    const filtersHTML = `
        <div class="search-filters" id="searchFilters">
            <div class="search-filter-section">
                <h4>Filter by type</h4>
                <div class="search-filter-options">
                    <button class="search-filter-option active" data-filter="all">All</button>
                    <button class="search-filter-option" data-filter="people">People</button>
                    <button class="search-filter-option" data-filter="posts">Posts</button>
                    <button class="search-filter-option" data-filter="pages">Pages</button>
                    <button class="search-filter-option" data-filter="groups">Groups</button>
                </div>
            </div>
            <div class="search-filter-section">
                <h4>Posted by</h4>
                <div class="search-filter-options">
                    <button class="search-filter-option active" data-filter="anyone">Anyone</button>
                    <button class="search-filter-option" data-filter="friends">Friends</button>
                    <button class="search-filter-option" data-filter="me">You</button>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.search-bar').insertAdjacentHTML('afterend', filtersHTML);
    
    // Setup filter event listeners
    document.querySelectorAll('.search-filter-option').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const section = e.target.closest('.search-filter-section');
            section.querySelectorAll('.search-filter-option').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            handleEnhancedSearch();
        });
    });
}

function showSearchFilters() {
    const filters = document.getElementById('searchFilters');
    if (filters) {
        filters.style.display = 'block';
    }
}

function handleEnhancedSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    
    if (query.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    const typeFilter = document.querySelector('.search-filter-option.active[data-filter]')?.dataset.filter || 'all';
    const authorFilter = document.querySelectorAll('.search-filter-option.active')[1]?.dataset.filter || 'anyone';
    
    const results = performAdvancedSearch(query, typeFilter, authorFilter);
    displaySearchResults(results, query);
    searchResults.style.display = 'block';
}

function performAdvancedSearch(query, typeFilter, authorFilter) {
    let results = [];
    
    // Search people
    if (typeFilter === 'all' || typeFilter === 'people') {
        Object.entries(users).forEach(([id, user]) => {
            if (user.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'person',
                    id: id,
                    name: user.name,
                    subtitle: 'Friend',
                    avatar: user.avatar,
                    relevance: user.name.toLowerCase().indexOf(query)
                });
            }
        });
    }
    
    // Search posts
    if (typeFilter === 'all' || typeFilter === 'posts') {
        posts.forEach(post => {
            if (post.content.toLowerCase().includes(query)) {
                const author = users[post.author];
                if (authorFilter === 'anyone' || 
                    (authorFilter === 'friends' && post.author !== 'john') ||
                    (authorFilter === 'me' && post.author === 'john')) {
                    results.push({
                        type: 'post',
                        id: post.id,
                        name: `Post by ${author.name}`,
                        subtitle: post.content.substring(0, 50) + '...',
                        avatar: author.avatar,
                        relevance: post.content.toLowerCase().indexOf(query)
                    });
                }
            }
        });
    }
    
    // Sort by relevance
    return results.sort((a, b) => a.relevance - b.relevance);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="advanced-search-results">
                <p style="padding: 16px; text-align: center; color: #65676b;">No results found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    const groupedResults = results.reduce((groups, result) => {
        if (!groups[result.type]) groups[result.type] = [];
        groups[result.type].push(result);
        return groups;
    }, {});
    
    searchResults.innerHTML = `
        <div class="advanced-search-results">
            ${Object.entries(groupedResults).map(([type, items]) => `
                <div class="search-result-section">
                    <h3>${capitalizeFirst(type)}${type === 'person' ? 's' : type === 'post' ? 's' : ''}</h3>
                    ${items.map(item => `
                        <div class="search-result-item" onclick="selectSearchResult('${item.type}', '${item.id}', '${item.name}')">
                            <img src="${item.avatar}" alt="${item.name}">
                            <div class="search-result-info">
                                <div class="search-result-name">${highlightQuery(item.name, query)}</div>
                                <div class="search-result-subtitle">${highlightQuery(item.subtitle, query)}</div>
                            </div>
                            <i class="fas fa-${item.type === 'person' ? 'user' : item.type === 'post' ? 'file-alt' : 'flag'}"></i>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

function highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function selectSearchResult(type, id, name) {
    console.log(`Selected ${type}: ${id} - ${name}`);
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
    
    if (type === 'post') {
        // Scroll to post
        const postElement = document.querySelector(`[data-post-id="${id}"]`);
        if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postElement.style.outline = '2px solid #1877f2';
            setTimeout(() => {
                postElement.style.outline = '';
            }, 2000);
        }
    } else if (type === 'person') {
        navigateToPage('profile', name);
    }
}

// UTILITY FUNCTIONS
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#42b883' : type === 'error' ? '#e74c3c' : '#1877f2'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function closeAllModals() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('storyModal').style.display = 'none';
    document.getElementById('commentsModal').style.display = 'none';
    document.getElementById('shareModal').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
}

function loadStories() {
    const storiesSection = document.querySelector('.stories-section');
    const storyElements = stories.map(story => {
        const user = users[story.author];
        return `
            <div class="story ${story.viewed ? 'viewed' : ''}" onclick="viewStory(${story.id})">
                <img src="${story.image}" alt="Story">
                <div class="story-author">
                    <img src="${user.avatar}" alt="${user.name}">
                    <span>${user.name}</span>
                </div>
            </div>
        `;
    }).join('');
    
    storiesSection.innerHTML = `
        <div class="story create-story" onclick="openStoryModal()">
            <i class="fas fa-plus"></i>
            <span>Create Story</span>
        </div>
        ${storyElements}
    `;
}

function viewStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (story) {
        story.viewed = true;
        loadStories();
        showNotification('Viewing story...', 'info');
    }
}

// Auto-update post text button state
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'postText') {
        updatePostButton();
    }
});

// Handle post text changes
function setupPostTextListener() {
    const postText = document.getElementById('postText');
    if (postText) {
        postText.addEventListener('input', updatePostButton);
        postText.addEventListener('keyup', updatePostButton);
    }
}

// Data persistence functions
function saveDataToStorage() {
    try {
        localStorage.setItem('fbPosts', JSON.stringify(posts));
        localStorage.setItem('fbStories', JSON.stringify(stories));
        localStorage.setItem('fbLastSaved', new Date().toISOString());
    } catch (error) {
        console.warn('Failed to save data to localStorage:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedPosts = localStorage.getItem('fbPosts');
        const savedStories = localStorage.getItem('fbStories');
        const savedActivityLog = localStorage.getItem('fbActivityLog');
        const savedEngagementStats = localStorage.getItem('fbEngagementStats');

        if (savedPosts) {
            const parsedPosts = JSON.parse(savedPosts);
            if (Array.isArray(parsedPosts)) {
                posts = parsedPosts;
            }
        }

        if (savedStories) {
            const parsedStories = JSON.parse(savedStories);
            if (Array.isArray(parsedStories)) {
                stories = parsedStories;
            }
        }

        if (savedActivityLog) {
            const parsedActivityLog = JSON.parse(savedActivityLog);
            if (Array.isArray(parsedActivityLog)) {
                userActivityLog = parsedActivityLog;
            }
        }

        if (savedEngagementStats) {
            const parsedEngagementStats = JSON.parse(savedEngagementStats);
            if (parsedEngagementStats && typeof parsedEngagementStats === 'object') {
                engagementStats = { ...engagementStats, ...parsedEngagementStats };
            }
        }

        console.log('Data loaded from localStorage');
        console.log(`Loaded ${userActivityLog.length} activity logs and engagement stats`);
    } catch (error) {
        console.warn('Failed to load data from localStorage:', error);
        // Reset to default data on error
        posts = posts || [];
        stories = stories || [];
        userActivityLog = [];
    }
}

// Auto-save data every 30 seconds
setInterval(saveDataToStorage, 30000);

// Save data before page unload
window.addEventListener('beforeunload', saveDataToStorage);

// Birthday tracking and reminder system
function checkBirthdays() {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const todayDate = today.getDate();

    Object.entries(users).forEach(([userId, user]) => {
        if (user.birthday) {
            const birthday = new Date(user.birthday);
            const birthdayMonth = birthday.getMonth() + 1;
            const birthdayDate = birthday.getDate();

            if (birthdayMonth === todayMonth && birthdayDate === todayDate) {
                sendBirthdayMessage(userId);
                logUserActivity('birthday_reminder', {
                    targetUser: userId,
                    userName: user.name,
                    action: 'birthday_reminder_sent'
                });
            }
        }
    });
}

function sendBirthdayMessage(userId) {
    const user = users[userId];
    if (!user) return;

    const birthdayMessage = {
        id: generateId(),
        sender: 'currentUser',
        receiver: userId,
        text: `Happy Birthday ${user.firstName}! 🎉 Hope you have a wonderful day!`,
        timestamp: new Date().toISOString(),
        type: 'birthday_message',
        isRead: false
    };

    // Add to chat messages if structure exists
    if (typeof chatMessages !== 'undefined') {
        if (!chatMessages[userId]) {
            chatMessages[userId] = [];
        }
        chatMessages[userId].push(birthdayMessage);
    }

    // Create notification
    showNotification(`Birthday message sent to ${user.name}`, 'success');

    console.log(`Birthday reminder sent to ${user.name}`);
}

function getUpcomingBirthdays(daysAhead = 7) {
    const today = new Date();
    const upcomingBirthdays = [];

    Object.entries(users).forEach(([userId, user]) => {
        if (user.birthday) {
            const birthday = new Date(user.birthday);
            const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

            // If birthday already passed this year, check next year
            if (thisYearBirthday < today) {
                thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }

            const timeDiff = thisYearBirthday.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysDiff <= daysAhead) {
                upcomingBirthdays.push({
                    userId: userId,
                    name: user.name,
                    birthday: user.birthday,
                    daysUntil: daysDiff,
                    age: today.getFullYear() - birthday.getFullYear()
                });
            }
        }
    });

    return upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
}

function initializeBirthdaySystem() {
    // Check birthdays on page load
    checkBirthdays();

    // Set up daily birthday check (runs every 24 hours)
    setInterval(checkBirthdays, 24 * 60 * 60 * 1000);

    // Store birthday reminders in localStorage
    const upcomingBirthdays = getUpcomingBirthdays();
    localStorage.setItem('fbUpcomingBirthdays', JSON.stringify(upcomingBirthdays));

    console.log(`Birthday system initialized. Found ${upcomingBirthdays.length} upcoming birthdays.`);
}

// Update user interface with current user data
function updateUIWithUserData() {
    const userData = JSON.parse(localStorage.getItem('fbDemoUser') || '{}');

    if (userData.name) {
        // Update navigation
        const navUserName = document.getElementById('navUserName');
        if (navUserName) navUserName.textContent = userData.name;

        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName) sidebarUserName.textContent = userData.name;

        // Update post input placeholder
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.placeholder = `What's on your mind, ${userData.name.split(' ')[0]}?`;
        }
    }

    if (userData.avatar) {
        // Update profile pictures
        const navProfilePic = document.getElementById('navProfilePic');
        if (navProfilePic) navProfilePic.src = userData.avatar;

        const sidebarProfilePic = document.getElementById('sidebarProfilePic');
        if (sidebarProfilePic) sidebarProfilePic.src = userData.avatar;
    }
}

// Initialize everything when page loads
window.addEventListener('load', function() {
    console.log('Enhanced Facebook functionality loaded!');

    // Load saved data first
    loadDataFromStorage();

    // Update UI with user data
    updateUIWithUserData();

    // Initialize birthday system
    initializeBirthdaySystem();

    // Initialize friend interaction system
    initializeFriendInteractionSystem();

    // Initialize content moderation system
    initializeModerationSystem();

    // Setup additional listeners that might need DOM to be fully loaded
    setTimeout(() => {
        setupPostTextListener();
    }, 200);
});

// Export functions for global access
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.submitPost = submitPost;
window.triggerImageUpload = triggerImageUpload;
window.triggerVideoUpload = triggerVideoUpload;
window.handleImageUpload = handleImageUpload;
window.handleVideoUpload = handleVideoUpload;
window.removeMedia = removeMedia;
window.addFeeling = function() { showNotification('Feeling selector opened!', 'info'); };
window.addLocation = function() { showNotification('Location selector opened!', 'info'); };
window.tagFriends = function() { showNotification('Friend tagger opened!', 'info'); };

window.openStoryModal = openStoryModal;
window.closeStoryModal = closeStoryModal;
window.triggerStoryUpload = triggerStoryUpload;
window.handleStoryUpload = handleStoryUpload;
window.submitStory = submitStory;

window.openComments = openComments;
window.closeCommentsModal = closeCommentsModal;
window.handleCommentKeyPress = handleCommentKeyPress;
window.submitComment = submitComment;

window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.shareToTimeline = shareToTimeline;
window.shareToStory = shareToStory;
window.sendInMessage = sendInMessage;
window.copyLink = copyLink;

window.showReactionsPicker = showReactionsPicker;
window.hideReactionsPicker = hideReactionsPicker;
window.selectReaction = selectReaction;
window.toggleReaction = toggleReaction;

// Missing functions implementation
function replyToComment(commentId) {
    showNotification('Reply feature coming soon!', 'info');
}

function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;

    modal.innerHTML = `
        <img src="${imageSrc}" alt="Full size image"
             style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">
    `;

    modal.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
}

function showReactionsList(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.reactions) return;

    const reactionsText = Object.entries(post.reactions)
        .filter(([reaction, count]) => count > 0)
        .map(([reaction, count]) => `${reaction}: ${count}`)
        .join(', ');

    showNotification(`Reactions: ${reactionsText}`, 'info');
}

// Additional function exports for compatibility
window.openPostCreator = openPostModal;
window.showComments = openComments;
window.sharePost = openShareModal;
window.replyToComment = replyToComment;
window.openImageModal = openImageModal;
window.showReactionsList = showReactionsList;

// Analytics and tracking exports for advanced macro tasks
window.getUserActivityLog = () => userActivityLog;
window.getEngagementStats = () => engagementStats;
window.getOptimalPostingTime = getOptimalPostingTime;
window.logUserActivity = logUserActivity;
window.updateEngagementStats = updateEngagementStats;

// Birthday system exports
window.checkBirthdays = checkBirthdays;
window.sendBirthdayMessage = sendBirthdayMessage;
window.getUpcomingBirthdays = getUpcomingBirthdays;
window.initializeBirthdaySystem = initializeBirthdaySystem;

// Friend interaction tracking system
let friendInteractions = {
    userPairs: {},
    interactionHistory: [],
    relationshipStrengths: {}
};

function trackFriendInteraction(userId1, userId2, interactionType, metadata = {}) {
    const pairKey = [userId1, userId2].sort().join('-');

    if (!friendInteractions.userPairs[pairKey]) {
        friendInteractions.userPairs[pairKey] = {
            messages: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            profileViews: 0,
            photoTags: 0,
            lastInteraction: null,
            firstInteraction: new Date().toISOString(),
            totalInteractions: 0
        };
    }

    const interaction = friendInteractions.userPairs[pairKey];

    // Update interaction counts
    if (interaction.hasOwnProperty(interactionType)) {
        interaction[interactionType]++;
    }

    interaction.totalInteractions++;
    interaction.lastInteraction = new Date().toISOString();

    // Add to history
    const historyEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        users: [userId1, userId2],
        type: interactionType,
        metadata: metadata
    };

    friendInteractions.interactionHistory.push(historyEntry);

    // Calculate relationship strength
    updateRelationshipStrength(pairKey, userId1, userId2);

    // Log activity
    logUserActivity('friend_interaction', {
        users: [userId1, userId2],
        type: interactionType,
        pairKey: pairKey
    });

    // Save to localStorage
    localStorage.setItem('fbFriendInteractions', JSON.stringify(friendInteractions));
}

function updateRelationshipStrength(pairKey, userId1, userId2) {
    const interaction = friendInteractions.userPairs[pairKey];

    // Calculate strength based on weighted interactions
    const weights = {
        messages: 3,
        comments: 2,
        likes: 1,
        shares: 4,
        profileViews: 1,
        photoTags: 2
    };

    let totalScore = 0;
    Object.keys(weights).forEach(type => {
        totalScore += (interaction[type] || 0) * weights[type];
    });

    // Factor in recency (interactions in last 30 days get bonus)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInteractions = friendInteractions.interactionHistory.filter(entry =>
        entry.users.includes(userId1) &&
        entry.users.includes(userId2) &&
        new Date(entry.timestamp) > thirtyDaysAgo
    ).length;

    const recencyBonus = Math.min(recentInteractions * 0.5, 10);
    const finalScore = totalScore + recencyBonus;

    // Classify relationship strength
    let strength = 'weak';
    if (finalScore > 50) strength = 'very_strong';
    else if (finalScore > 30) strength = 'strong';
    else if (finalScore > 15) strength = 'moderate';
    else if (finalScore > 5) strength = 'weak';
    else strength = 'minimal';

    friendInteractions.relationshipStrengths[pairKey] = {
        score: finalScore,
        strength: strength,
        lastUpdated: new Date().toISOString()
    };
}

function getFriendInteractionData(userId1, userId2) {
    const pairKey = [userId1, userId2].sort().join('-');
    return {
        interactions: friendInteractions.userPairs[pairKey] || null,
        strength: friendInteractions.relationshipStrengths[pairKey] || null,
        history: friendInteractions.interactionHistory.filter(entry =>
            entry.users.includes(userId1) && entry.users.includes(userId2)
        )
    };
}

function getStrongestRelationships(userId, limit = 10) {
    const userRelationships = [];

    Object.entries(friendInteractions.relationshipStrengths).forEach(([pairKey, strength]) => {
        const [user1, user2] = pairKey.split('-');
        if (user1 === userId || user2 === userId) {
            const otherUser = user1 === userId ? user2 : user1;
            userRelationships.push({
                userId: otherUser,
                userName: users[otherUser]?.name || 'Unknown User',
                ...strength,
                interactions: friendInteractions.userPairs[pairKey]
            });
        }
    });

    return userRelationships
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function initializeFriendInteractionSystem() {
    // Load existing data
    const savedInteractions = localStorage.getItem('fbFriendInteractions');
    if (savedInteractions) {
        try {
            friendInteractions = JSON.parse(savedInteractions);
        } catch (error) {
            console.warn('Failed to load friend interactions:', error);
        }
    }

    // Set up automatic tracking for various interactions
    setupInteractionTracking();

    console.log('Friend interaction tracking system initialized');
}

function setupInteractionTracking() {
    // Override existing functions to track interactions
    const originalSubmitComment = window.submitComment;
    if (originalSubmitComment) {
        window.submitComment = function(postId) {
            const result = originalSubmitComment.call(this, postId);
            // Track comment interaction
            const post = posts.find(p => p.id === postId);
            if (post && post.author) {
                trackFriendInteraction('currentUser', post.author, 'comments', { postId });
            }
            return result;
        };
    }

    // Track likes
    const originalToggleReaction = window.toggleReaction;
    if (originalToggleReaction) {
        window.toggleReaction = function(postId, reaction) {
            const result = originalToggleReaction.call(this, postId, reaction);
            const post = posts.find(p => p.id === postId);
            if (post && post.author) {
                trackFriendInteraction('currentUser', post.author, 'likes', { postId, reaction });
            }
            return result;
        };
    }
}

// Friend interaction system exports
window.trackFriendInteraction = trackFriendInteraction;
window.getFriendInteractionData = getFriendInteractionData;
window.getStrongestRelationships = getStrongestRelationships;
window.initializeFriendInteractionSystem = initializeFriendInteractionSystem;

// Content moderation and spam detection system
let moderationSystem = {
    spamKeywords: [
        'buy now', 'click here', 'free money', 'limited time', 'act now',
        'urgent', 'congratulations', 'winner', 'cash prize', 'inheritance',
        'nigerian prince', 'work from home', 'make money fast', 'get rich',
        'miracle cure', 'lose weight fast', 'penis enlargement', 'viagra'
    ],
    suspiciousPatterns: [
        /(\w)\1{4,}/g,  // Repeated characters (aaaaaaa)
        /[A-Z]{5,}/g,   // All caps words
        /(https?:\/\/[^\s]+)/g,  // URLs
        /(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})/g,  // Credit card patterns
        /call\s*now/gi,
        /click\s*here/gi
    ],
    reportedContent: {},
    moderationActions: [],
    autoModerationEnabled: true
};

function detectSpam(content) {
    if (!content || typeof content !== 'string') return { isSpam: false, confidence: 0, reasons: [] };

    const reasons = [];
    let spamScore = 0;

    // Check for spam keywords
    const lowerContent = content.toLowerCase();
    const foundKeywords = moderationSystem.spamKeywords.filter(keyword =>
        lowerContent.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
        spamScore += foundKeywords.length * 10;
        reasons.push(`Contains spam keywords: ${foundKeywords.join(', ')}`);
    }

    // Check suspicious patterns
    moderationSystem.suspiciousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            spamScore += matches.length * 5;
            switch(index) {
                case 0: reasons.push('Contains excessive repeated characters'); break;
                case 1: reasons.push('Contains excessive capital letters'); break;
                case 2: reasons.push('Contains suspicious URLs'); break;
                case 3: reasons.push('Contains potential credit card numbers'); break;
                case 4:
                case 5: reasons.push('Contains suspicious call-to-action phrases'); break;
            }
        }
    });

    // Check content length vs caps ratio
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / content.length;
    if (capsRatio > 0.3 && content.length > 10) {
        spamScore += 15;
        reasons.push('Excessive use of capital letters');
    }

    // Check for excessive punctuation
    const punctuationCount = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationCount > 0) {
        spamScore += punctuationCount * 5;
        reasons.push('Excessive punctuation');
    }

    const confidence = Math.min(spamScore / 100, 1);
    const isSpam = spamScore >= 30;

    return {
        isSpam,
        confidence,
        score: spamScore,
        reasons
    };
}

function moderateContent(content, contentType = 'post', contentId = null) {
    const spamAnalysis = detectSpam(content);

    const moderationResult = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        contentId,
        contentType,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        spamAnalysis,
        action: 'none',
        autoModerated: false
    };

    if (moderationSystem.autoModerationEnabled && spamAnalysis.isSpam) {
        if (spamAnalysis.confidence > 0.7) {
            moderationResult.action = 'blocked';
            moderationResult.autoModerated = true;
        } else if (spamAnalysis.confidence > 0.4) {
            moderationResult.action = 'flagged';
            moderationResult.autoModerated = true;
        }
    }

    // Store moderation action
    moderationSystem.moderationActions.push(moderationResult);

    // Save to localStorage
    localStorage.setItem('fbModerationSystem', JSON.stringify(moderationSystem));

    // Log activity
    logUserActivity('content_moderation', {
        contentType,
        action: moderationResult.action,
        spamScore: spamAnalysis.score,
        autoModerated: moderationResult.autoModerated
    });

    return moderationResult;
}

function reportContent(contentId, contentType, reason, reportedBy = 'currentUser') {
    const reportId = generateId();

    if (!moderationSystem.reportedContent[contentId]) {
        moderationSystem.reportedContent[contentId] = {
            contentId,
            contentType,
            reports: [],
            status: 'pending',
            created: new Date().toISOString()
        };
    }

    moderationSystem.reportedContent[contentId].reports.push({
        id: reportId,
        reportedBy,
        reason,
        timestamp: new Date().toISOString()
    });

    // Auto-escalate if multiple reports
    const reportCount = moderationSystem.reportedContent[contentId].reports.length;
    if (reportCount >= 3) {
        moderationSystem.reportedContent[contentId].status = 'escalated';
    }

    localStorage.setItem('fbModerationSystem', JSON.stringify(moderationSystem));

    logUserActivity('content_report', {
        contentId,
        contentType,
        reason,
        reportCount
    });

    return reportId;
}

function getModerationStats() {
    const stats = {
        totalActions: moderationSystem.moderationActions.length,
        blockedContent: moderationSystem.moderationActions.filter(a => a.action === 'blocked').length,
        flaggedContent: moderationSystem.moderationActions.filter(a => a.action === 'flagged').length,
        autoModerated: moderationSystem.moderationActions.filter(a => a.autoModerated).length,
        totalReports: Object.values(moderationSystem.reportedContent).reduce((sum, item) => sum + item.reports.length, 0),
        pendingReports: Object.values(moderationSystem.reportedContent).filter(item => item.status === 'pending').length,
        escalatedReports: Object.values(moderationSystem.reportedContent).filter(item => item.status === 'escalated').length
    };

    return stats;
}

function initializeModerationSystem() {
    // Load existing data
    const savedModeration = localStorage.getItem('fbModerationSystem');
    if (savedModeration) {
        try {
            const loadedData = JSON.parse(savedModeration);
            moderationSystem = { ...moderationSystem, ...loadedData };
        } catch (error) {
            console.warn('Failed to load moderation system:', error);
        }
    }

    // Override post submission to include moderation
    const originalSubmitPost = window.submitPost;
    if (originalSubmitPost) {
        window.submitPost = function() {
            const postText = document.getElementById('postText');
            if (postText && postText.value) {
                const moderationResult = moderateContent(postText.value, 'post');

                if (moderationResult.action === 'blocked') {
                    showNotification('Your post was blocked due to policy violations', 'error');
                    return false;
                } else if (moderationResult.action === 'flagged') {
                    showNotification('Your post has been flagged for review', 'warning');
                }
            }

            return originalSubmitPost.call(this);
        };
    }

    // Override comment submission to include moderation
    const originalSubmitComment = window.submitComment;
    if (originalSubmitComment) {
        window.submitComment = function(postId) {
            const commentText = document.getElementById('commentText');
            if (commentText && commentText.value) {
                const moderationResult = moderateContent(commentText.value, 'comment');

                if (moderationResult.action === 'blocked') {
                    showNotification('Your comment was blocked due to policy violations', 'error');
                    return false;
                } else if (moderationResult.action === 'flagged') {
                    showNotification('Your comment has been flagged for review', 'warning');
                }
            }

            return originalSubmitComment.call(this, postId);
        };
    }

    console.log('Content moderation system initialized');
    console.log(`Loaded ${moderationSystem.moderationActions.length} previous moderation actions`);
}

// Content moderation system exports
window.detectSpam = detectSpam;
window.moderateContent = moderateContent;
window.reportContent = reportContent;
window.getModerationStats = getModerationStats;
window.initializeModerationSystem = initializeModerationSystem;

// Profile management functions
function openProfileModal(userId = 'john') {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    const user = users[userId];
    if (!user) {
        console.warn(`User ${userId} not found`);
        return;
    }

    // Populate profile modal with user data
    const avatar = document.getElementById('profileModalAvatar');
    const name = document.getElementById('profileModalName');
    const location = document.getElementById('profileModalLocation');
    const workplace = document.getElementById('profileWorkplace');
    const education = document.getElementById('profileEducation');
    const profileLocation = document.getElementById('profileLocation');
    const hometown = document.getElementById('profileHometown');
    const relationship = document.getElementById('profileRelationship');
    const birthday = document.getElementById('profileBirthday');
    const email = document.getElementById('profileEmail');
    const phone = document.getElementById('profilePhone');
    const website = document.getElementById('profileWebsite');
    const friendsCount = document.getElementById('profileFriendsCount');
    const followersCount = document.getElementById('profileFollowersCount');
    const postsCount = document.getElementById('profilePostsCount');

    if (avatar) avatar.src = user.avatar;
    if (name) name.textContent = user.name;
    if (location) location.textContent = user.location?.current || 'Location not specified';
    if (workplace) workplace.textContent = user.work?.company || 'Workplace not specified';
    if (education && user.education && user.education.length > 0) {
        education.textContent = user.education[0].school || 'Education not specified';
    }
    if (profileLocation) profileLocation.textContent = user.location?.current || 'Location not specified';
    if (hometown) hometown.textContent = user.location?.hometown || 'Hometown not specified';
    if (relationship) relationship.textContent = user.relationship?.status || 'Not specified';
    if (birthday) birthday.textContent = user.birthday ? new Date(user.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
    if (email) email.textContent = user.email || 'Not provided';
    if (phone) phone.textContent = user.phone || 'Not provided';
    if (website) website.textContent = user.socialMedia?.website || 'Not provided';
    if (friendsCount) friendsCount.textContent = user.stats?.friendsCount || '0';
    if (followersCount) followersCount.textContent = user.stats?.followersCount || '0';
    if (postsCount) postsCount.textContent = user.stats?.postsCount || '0';

    // Set privacy settings
    const profileVisibility = document.getElementById('profileVisibility');
    const contactVisibility = document.getElementById('contactVisibility');
    const allowFriendRequests = document.getElementById('allowFriendRequests');

    if (profileVisibility && user.privacy?.profileVisibility) {
        profileVisibility.value = user.privacy.profileVisibility;
    }
    if (contactVisibility && user.privacy?.contactVisibility) {
        contactVisibility.value = user.privacy.contactVisibility;
    }
    if (allowFriendRequests && user.privacy?.allowFriendRequests !== undefined) {
        allowFriendRequests.checked = user.privacy.allowFriendRequests;
    }

    modal.style.display = 'flex';
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function editProfile() {
    showNotification('Profile editing feature opened!', 'info');

    // Log activity
    logUserActivity('profile_edit', {
        action: 'edit_profile_opened',
        userId: 'currentUser'
    });
}

function loadProfilePage(userId = 'john') {
    openProfileModal(userId);

    logUserActivity('profile_view', {
        action: 'profile_viewed',
        targetUser: userId,
        viewedBy: 'currentUser'
    });

    // Track profile view interaction
    if (typeof trackFriendInteraction === 'function') {
        trackFriendInteraction('currentUser', userId, 'profileViews', {
            timestamp: new Date().toISOString()
        });
    }
}

function updateProfileSettings() {
    const profileVisibility = document.getElementById('profileVisibility')?.value;
    const contactVisibility = document.getElementById('contactVisibility')?.value;
    const allowFriendRequests = document.getElementById('allowFriendRequests')?.checked;

    const currentUser = users.john; // Assuming current user is john
    if (currentUser && currentUser.privacy) {
        currentUser.privacy.profileVisibility = profileVisibility;
        currentUser.privacy.contactVisibility = contactVisibility;
        currentUser.privacy.allowFriendRequests = allowFriendRequests;
    }

    // Save updated user data
    localStorage.setItem('fbUsers', JSON.stringify(users));

    logUserActivity('privacy_settings_update', {
        profileVisibility,
        contactVisibility,
        allowFriendRequests
    });

    showNotification('Privacy settings updated!', 'success');
}

// Profile system exports
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.editProfile = editProfile;
window.loadProfilePage = loadProfilePage;
window.updateProfileSettings = updateProfileSettings;