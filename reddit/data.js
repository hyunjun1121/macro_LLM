// Reddit-like Website Data

// Extended posts data with more variety
const extendedPostsData = [
    {
        id: 1,
        title: "Just built my first React app! What do you think?",
        content: "After months of learning JavaScript, I finally built my first React application. It's a simple todo app but I'm really proud of it. The component structure was challenging at first but now I understand the power of React!",
        author: "jun",
        community: "r/reactjs",
        time: "2 hours ago",
        upvotes: 45,
        downvotes: 2,
        comments: 12,
        userVote: 0,
        tags: ["react", "javascript", "beginner"]
    },
    {
        id: 2,
        title: "JavaScript ES6+ features that changed my coding life",
        content: "Arrow functions, destructuring, async/await, and template literals have completely transformed how I write JavaScript. Here's a breakdown of my favorite features and how they've improved my code quality.",
        author: "jun",
        community: "r/javascript",
        time: "5 hours ago",
        upvotes: 78,
        downvotes: 3,
        comments: 23,
        userVote: 1,
        tags: ["javascript", "es6", "programming"]
    },
    {
        id: 3,
        title: "Web development career advice needed",
        content: "I'm a junior developer with 1 year of experience. Should I focus on learning more frameworks or dive deeper into vanilla JavaScript? Also, any tips for building a strong portfolio?",
        author: "jun",
        community: "r/webdev",
        time: "1 day ago",
        upvotes: 34,
        downvotes: 1,
        comments: 18,
        userVote: 0,
        tags: ["career", "advice", "webdev"]
    },
    {
        id: 4,
        title: "Node.js vs Python for backend development",
        content: "I'm starting a new project and can't decide between Node.js and Python. Both have their strengths, but I'm looking for real-world experiences from developers who've used both.",
        author: "jun",
        community: "r/programming",
        time: "2 days ago",
        upvotes: 92,
        downvotes: 8,
        comments: 45,
        userVote: -1,
        tags: ["nodejs", "python", "backend"]
    },
    {
        id: 5,
        title: "CSS Grid vs Flexbox - When to use which?",
        content: "I understand both CSS Grid and Flexbox, but I'm still confused about when to use each one. Can someone explain the practical differences and use cases?",
        author: "jun",
        community: "r/webdev",
        time: "3 days ago",
        upvotes: 56,
        downvotes: 2,
        comments: 31,
        userVote: 1,
        tags: ["css", "grid", "flexbox"]
    },
    {
        id: 6,
        title: "My journey from zero to full-stack developer",
        content: "Started coding 2 years ago with no prior experience. Today I'm working as a full-stack developer. Here's what I learned along the way and the resources that helped me most.",
        author: "jun",
        community: "r/webdev",
        time: "4 days ago",
        upvotes: 123,
        downvotes: 5,
        comments: 67,
        userVote: 0,
        tags: ["journey", "fullstack", "learning"]
    },
    {
        id: 7,
        title: "TypeScript tips for JavaScript developers",
        content: "Making the switch from JavaScript to TypeScript? Here are the most important concepts and patterns that will make your transition smoother.",
        author: "jun",
        community: "r/typescript",
        time: "5 days ago",
        upvotes: 89,
        downvotes: 4,
        comments: 34,
        userVote: 1,
        tags: ["typescript", "javascript", "tips"]
    },
    {
        id: 8,
        title: "Building a REST API with Express.js - Complete tutorial",
        content: "Step-by-step guide to building a robust REST API using Express.js, including authentication, validation, and error handling.",
        author: "jun",
        community: "r/node",
        time: "1 week ago",
        upvotes: 156,
        downvotes: 7,
        comments: 89,
        userVote: 0,
        tags: ["express", "api", "tutorial"]
    }
];

// User profile data
const userProfile = {
    username: "jun",
    displayName: "Jun",
    karma: 1234,
    posts: 15,
    comments: 89,
    joinDate: "January 2023",
    avatar: "https://via.placeholder.com/32x32/ff4500/ffffff?text=J",
    bio: "Full-stack developer passionate about web technologies. Love sharing knowledge and learning from the community.",
    location: "Seoul, South Korea",
    website: "https://jun-dev.com",
    socialLinks: {
        github: "https://github.com/jun",
        twitter: "https://twitter.com/jun_dev",
        linkedin: "https://linkedin.com/in/jun"
    }
};

// Communities data with more details
const communities = [
    { 
        name: "programming", 
        members: "2.1m", 
        description: "Computer programming discussion",
        icon: "💻",
        rules: ["Be respectful", "No spam", "Use proper tags"]
    },
    { 
        name: "webdev", 
        members: "1.8m", 
        description: "Web development community",
        icon: "🌐",
        rules: ["Share knowledge", "Be helpful", "No self-promotion"]
    },
    { 
        name: "javascript", 
        members: "1.5m", 
        description: "JavaScript programming",
        icon: "⚡",
        rules: ["Code examples welcome", "Ask questions", "Share resources"]
    },
    { 
        name: "reactjs", 
        members: "1.2m", 
        description: "React.js community",
        icon: "⚛️",
        rules: ["React-related content", "Share projects", "Help beginners"]
    },
    { 
        name: "node", 
        members: "800k", 
        description: "Node.js development",
        icon: "🟢",
        rules: ["Node.js focus", "Share packages", "Performance tips"]
    },
    { 
        name: "typescript", 
        members: "600k", 
        description: "TypeScript programming",
        icon: "🔷",
        rules: ["TypeScript content", "Type definitions", "Migration guides"]
    }
];

// Trending topics
const trendingTopics = [
    { text: "New JavaScript framework released", upvotes: 15420 },
    { text: "Web development trends 2024", upvotes: 12890 },
    { text: "React vs Vue comparison", upvotes: 9876 },
    { text: "CSS Grid best practices", upvotes: 7654 },
    { text: "Node.js performance optimization", upvotes: 6543 },
    { text: "TypeScript 5.0 features", upvotes: 5432 },
    { text: "Full-stack development roadmap", upvotes: 4321 },
    { text: "API design principles", upvotes: 3210 }
];

// Comments data structure
const commentsData = {
    1: [
        {
            id: 1,
            author: "dev_guru",
            content: "Great job! React can be tricky at first but you're on the right track.",
            time: "1 hour ago",
            upvotes: 12,
            downvotes: 0,
            replies: [
                {
                    id: 2,
                    author: "jun",
                    content: "Thanks! Any tips for state management?",
                    time: "30 minutes ago",
                    upvotes: 3,
                    downvotes: 0
                }
            ]
        },
        {
            id: 3,
            author: "react_master",
            content: "Check out the React hooks documentation if you haven't already.",
            time: "45 minutes ago",
            upvotes: 8,
            downvotes: 1
        }
    ],
    2: [
        {
            id: 4,
            author: "js_expert",
            content: "Async/await is a game changer! Much cleaner than promises.",
            time: "3 hours ago",
            upvotes: 15,
            downvotes: 0
        }
    ]
};

// Search suggestions
const searchSuggestions = [
    "javascript",
    "react",
    "node.js",
    "css",
    "html",
    "typescript",
    "vue",
    "angular",
    "express",
    "mongodb",
    "postgresql",
    "docker",
    "git",
    "webpack",
    "babel"
];

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extendedPostsData,
        userProfile,
        communities,
        trendingTopics,
        commentsData,
        searchSuggestions
    };
}

