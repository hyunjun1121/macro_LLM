// Mock data for Threads application
const mockData = {
    currentUser: {
        id: 'current_user',
        username: 'current_user',
        handle: '@current_user',
        avatar: 'https://via.placeholder.com/40x40/007bff/ffffff?text=U',
        bio: 'Welcome to my Threads!',
        followers: 1234,
        following: 567,
        threads: 89
    },

    users: [
        {
            id: 'jun',
            username: 'jun',
            handle: '@jun',
            avatar: 'https://via.placeholder.com/40x40/28a745/ffffff?text=J',
            bio: 'Software developer and tech enthusiast. Building amazing things with code!',
            followers: 2847,
            following: 342,
            threads: 156,
            isFollowing: false
        },
        {
            id: 'sarah_tech',
            username: 'sarah_tech',
            handle: '@sarah_tech',
            avatar: 'https://via.placeholder.com/40x40/e91e63/ffffff?text=S',
            bio: 'Tech blogger and AI researcher. Sharing insights about the future of technology.',
            followers: 15234,
            following: 892,
            threads: 423,
            isFollowing: true
        },
        {
            id: 'mike_design',
            username: 'mike_design',
            handle: '@mike_design',
            avatar: 'https://via.placeholder.com/40x40/ff9800/ffffff?text=M',
            bio: 'UI/UX Designer. Creating beautiful and functional digital experiences.',
            followers: 8934,
            following: 234,
            threads: 267,
            isFollowing: false
        },
        {
            id: 'alex_dev',
            username: 'alex_dev',
            handle: '@alex_dev',
            avatar: 'https://via.placeholder.com/40x40/9c27b0/ffffff?text=A',
            bio: 'Full-stack developer. Love building scalable web applications.',
            followers: 5678,
            following: 456,
            threads: 189,
            isFollowing: true
        },
        {
            id: 'lisa_ai',
            username: 'lisa_ai',
            handle: '@lisa_ai',
            avatar: 'https://via.placeholder.com/40x40/00bcd4/ffffff?text=L',
            bio: 'AI/ML Engineer. Exploring the intersection of artificial intelligence and human creativity.',
            followers: 12345,
            following: 678,
            threads: 312,
            isFollowing: false
        }
    ],

    threads: [
        {
            id: 'thread_1',
            author: 'jun',
            content: 'Just finished building a new web application using React and Node.js! The development process was challenging but incredibly rewarding. Can\'t wait to share it with everyone! 🚀',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            likes: 24,
            replies: 8,
            reposts: 3,
            isLiked: false,
            isReposted: false
        },
        {
            id: 'thread_2',
            author: 'jun',
            content: 'Working on some exciting new features for my latest project. The code is getting cleaner and more maintainable with each iteration. Always learning something new! 💻',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            likes: 18,
            replies: 5,
            reposts: 2,
            isLiked: true,
            isReposted: false
        },
        {
            id: 'thread_3',
            author: 'jun',
            content: 'Coffee and coding - the perfect combination for a productive day! ☕️ What\'s everyone working on today?',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            likes: 31,
            replies: 12,
            reposts: 4,
            isLiked: false,
            isReposted: true
        },
        {
            id: 'thread_4',
            author: 'sarah_tech',
            content: 'The future of AI is here, and it\'s more accessible than ever. Excited to see how developers will use these tools to create amazing applications! 🤖',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            likes: 156,
            replies: 23,
            reposts: 45,
            isLiked: true,
            isReposted: false
        },
        {
            id: 'thread_5',
            author: 'mike_design',
            content: 'Design is not just how it looks and feels. Design is how it works. - Steve Jobs. Always keeping this in mind when creating user experiences.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            likes: 89,
            replies: 15,
            reposts: 12,
            isLiked: false,
            isReposted: false
        },
        {
            id: 'thread_6',
            author: 'alex_dev',
            content: 'Just deployed a new microservice to production. The monitoring looks good and performance is exactly where we expected it to be. 🎉',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            likes: 67,
            replies: 9,
            reposts: 8,
            isLiked: true,
            isReposted: false
        },
        {
            id: 'thread_7',
            author: 'lisa_ai',
            content: 'Machine learning models are only as good as the data they\'re trained on. Data quality and diversity are crucial for building robust AI systems.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            likes: 234,
            replies: 34,
            reposts: 56,
            isLiked: false,
            isReposted: true
        },
        {
            id: 'thread_8',
            author: 'jun',
            content: 'Debugging can be frustrating, but there\'s something satisfying about finally finding that one line of code that was causing the issue. The "aha!" moment is priceless! 🐛',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            likes: 42,
            replies: 18,
            reposts: 7,
            isLiked: true,
            isReposted: false
        },
        {
            id: 'thread_9',
            author: 'jun',
            content: 'Version control is a developer\'s best friend. Git has saved me countless times when experiments go wrong. Always commit early and often! 📝',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
            likes: 28,
            replies: 6,
            reposts: 3,
            isLiked: false,
            isReposted: false
        },
        {
            id: 'thread_10',
            author: 'sarah_tech',
            content: 'The tech industry moves fast, but the fundamentals remain the same. Focus on learning core concepts that will serve you throughout your career.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            likes: 198,
            replies: 41,
            reposts: 67,
            isLiked: true,
            isReposted: false
        }
    ],

    activities: [
        {
            id: 'activity_1',
            type: 'like',
            user: 'sarah_tech',
            target: 'thread_1',
            timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
            id: 'activity_2',
            type: 'follow',
            user: 'mike_design',
            target: 'current_user',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            id: 'activity_3',
            type: 'repost',
            user: 'alex_dev',
            target: 'thread_3',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
            id: 'activity_4',
            type: 'like',
            user: 'lisa_ai',
            target: 'thread_2',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        }
    ],

    suggestedAccounts: [
        {
            id: 'tech_guru',
            username: 'tech_guru',
            handle: '@tech_guru',
            avatar: 'https://via.placeholder.com/40x40/ff5722/ffffff?text=T',
            followers: 45678,
            isFollowing: false
        },
        {
            id: 'code_master',
            username: 'code_master',
            handle: '@code_master',
            avatar: 'https://via.placeholder.com/40x40/3f51b5/ffffff?text=C',
            followers: 23456,
            isFollowing: false
        },
        {
            id: 'web_wizard',
            username: 'web_wizard',
            handle: '@web_wizard',
            avatar: 'https://via.placeholder.com/40x40/4caf50/ffffff?text=W',
            followers: 12345,
            isFollowing: false
        }
    ],

    trendingTopics: [
        { tag: '#React', count: 1234 },
        { tag: '#JavaScript', count: 987 },
        { tag: '#WebDev', count: 756 },
        { tag: '#AI', count: 654 },
        { tag: '#TechNews', count: 543 },
        { tag: '#Coding', count: 432 },
        { tag: '#Startup', count: 321 },
        { tag: '#Design', count: 210 }
    ],

    replies: [
        {
            id: 'reply_1',
            threadId: 'thread_1',
            author: 'sarah_tech',
            content: 'Amazing work! What technologies did you use for the backend?',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: 12,
            isLiked: false
        },
        {
            id: 'reply_2',
            threadId: 'thread_1',
            author: 'alex_dev',
            content: 'Love seeing fellow developers sharing their projects! Keep it up! 🚀',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            likes: 8,
            isLiked: true
        },
        {
            id: 'reply_3',
            threadId: 'thread_2',
            author: 'mike_design',
            content: 'Clean code is beautiful code! What\'s your favorite refactoring technique?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 5,
            isLiked: false
        }
    ],

    bookmarks: [
        'thread_1',
        'thread_4',
        'thread_7'
    ],

    notifications: [
        {
            id: 'notif_1',
            type: 'like',
            user: 'sarah_tech',
            target: 'thread_1',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            read: false
        },
        {
            id: 'notif_2',
            type: 'follow',
            user: 'mike_design',
            target: 'current_user',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false
        },
        {
            id: 'notif_3',
            type: 'reply',
            user: 'alex_dev',
            target: 'thread_1',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            read: true
        }
    ]
};

// Helper functions
function getUserById(id) {
    return mockData.users.find(user => user.id === id) || mockData.currentUser;
}

function getThreadsByUser(userId) {
    return mockData.threads.filter(thread => thread.author === userId);
}

function getThreadById(id) {
    return mockData.threads.find(thread => thread.id === id);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return `${minutes}m`;
    } else if (hours < 24) {
        return `${hours}h`;
    } else {
        return `${days}d`;
    }
}

function searchUsers(query) {
    const lowercaseQuery = query.toLowerCase();
    return mockData.users.filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.handle.toLowerCase().includes(lowercaseQuery) ||
        user.bio.toLowerCase().includes(lowercaseQuery)
    );
}

function searchThreads(query) {
    const lowercaseQuery = query.toLowerCase();
    return mockData.threads.filter(thread => 
        thread.content.toLowerCase().includes(lowercaseQuery)
    );
}

function getRepliesByThreadId(threadId) {
    return mockData.replies.filter(reply => reply.threadId === threadId);
}

function getTrendingTopics() {
    return mockData.trendingTopics;
}

function getNotifications() {
    return mockData.notifications;
}

function getUnreadNotificationCount() {
    return mockData.notifications.filter(notif => !notif.read).length;
}

function isBookmarked(threadId) {
    return mockData.bookmarks.includes(threadId);
}

function toggleBookmark(threadId) {
    const index = mockData.bookmarks.indexOf(threadId);
    if (index > -1) {
        mockData.bookmarks.splice(index, 1);
        return false;
    } else {
        mockData.bookmarks.push(threadId);
        return true;
    }
}

function extractHashtags(text) {
    const hashtagRegex = /#\w+/g;
    return text.match(hashtagRegex) || [];
}

function extractMentions(text) {
    const mentionRegex = /@\w+/g;
    return text.match(mentionRegex) || [];
}

function formatTextWithLinks(text) {
    // Replace hashtags with clickable links
    text = text.replace(/#\w+/g, '<span class="hashtag">$&</span>');
    // Replace mentions with clickable links
    text = text.replace(/@\w+/g, '<span class="mention">$&</span>');
    // Replace URLs with clickable links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return text;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockData,
        getUserById,
        getThreadsByUser,
        getThreadById,
        formatTimeAgo,
        searchUsers,
        searchThreads,
        getRepliesByThreadId,
        getTrendingTopics,
        getNotifications,
        getUnreadNotificationCount,
        isBookmarked,
        toggleBookmark,
        extractHashtags,
        extractMentions,
        formatTextWithLinks
    };
}

