// Mock data for LinkedIn clone

const mockData = {
    // Mock user data
    currentUser: {
        id: 1,
        name: "John Smith",
        title: "Software Engineer at Microsoft",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&h=70&fit=crop&crop=face",
        connections: 500,
        profileViews: 123,
        postImpressions: 1234
    },

    // Mock posts data
    posts: [
        {
            id: 4,
            author: {
                id: "jun-kim",
                name: "Jun",
                title: "Full Stack Developer | AI Enthusiast",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
            },
            content: "Just finished building an amazing LinkedIn clone with complete functionality! 🚀 From advanced search to job applications, messaging to post management - it's got everything you'd expect from a modern social platform. The React components are clean, the UX is smooth, and the feature set is comprehensive. #WebDevelopment #React #LinkedIn #FullStack #JavaScript",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop",
            likes: 89,
            comments: 18,
            reposts: 12,
            views: 2456,
            time: "1h ago",
            liked: false,
            reactions: { like: 45, love: 12, laugh: 2, wow: 30, sad: 0, angry: 0 }
        },
        {
            id: 5,
            author: {
                id: "jun-kim",
                name: "Jun",
                title: "Full Stack Developer | AI Enthusiast",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
            },
            content: "Diving deep into the latest AI trends and how they're reshaping software development. The integration of AI tools in our daily coding workflow has been a game-changer. What's your experience with AI-assisted development? Drop your thoughts below! 🤖✨ #AI #MachineLearning #SoftwareDevelopment #Innovation #TechTrends",
            poll: {
                question: "Which AI tool has most improved your development workflow?",
                options: [
                    { text: "GitHub Copilot", percentage: 52, votes: 520 },
                    { text: "ChatGPT/Claude", percentage: 28, votes: 280 },
                    { text: "Custom AI solutions", percentage: 15, votes: 150 },
                    { text: "Haven't used AI tools yet", percentage: 5, votes: 50 }
                ]
            },
            likes: 156,
            comments: 34,
            reposts: 28,
            views: 3842,
            time: "4h ago",
            liked: true,
            reactions: { like: 89, love: 25, laugh: 8, wow: 34, sad: 0, angry: 0 }
        },
        {
            id: 6,
            author: {
                id: "jun-kim", 
                name: "Jun",
                title: "Full Stack Developer | AI Enthusiast",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
            },
            content: "Weekend project complete! 🎉 Built a real-time collaborative whiteboard app using WebRTC and Canvas API. The peer-to-peer connection handling was tricky, but the end result is so satisfying. There's nothing quite like the feeling of seeing your code come to life and actually solve real problems. Always learning, always building! 💻⚡",
            media: {
                type: "video",
                url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
                duration: "1:23"
            },
            likes: 72,
            comments: 15,
            reposts: 8,
            views: 1923,
            time: "2d ago",
            liked: false,
            reactions: { like: 45, love: 18, laugh: 3, wow: 6, sad: 0, angry: 0 }
        },
        {
            id: 1,
            author: {
                name: "Michael Johnson",
                title: "Senior Frontend Developer at Google",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
            },
            content: "I've been exploring React 18's Concurrent Features and I'm fascinated by the possibilities with Suspense. The useDeferredValue hook is particularly interesting for performance optimization. Looking forward to implementing these in our upcoming projects!",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=300&fit=crop",
            likes: 32,
            comments: 5,
            reposts: 2,
            time: "3h ago",
            liked: false
        },
        {
            id: 2,
            author: {
                name: "Emily Chen",
                title: "UX Designer at Apple",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"
            },
            content: "The most important aspect of UX design is accurately understanding user needs. I'm excited to share some insights from recent user interviews in our latest project. The findings were quite surprising and will shape our design decisions moving forward.",
            likes: 28,
            comments: 12,
            reposts: 7,
            time: "5h ago",
            liked: false
        },
        {
            id: 3,
            author: {
                name: "Alex Rodriguez",
                title: "Data Scientist at Netflix",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=face"
            },
            content: "Machine learning models are only as good as the data we feed them. Just finished a comprehensive analysis of our recommendation algorithm and the results are promising. Clean data truly makes all the difference!",
            poll: {
                question: "What's the biggest challenge in ML projects?",
                options: [
                    { text: "Data quality", percentage: 45, votes: 450 },
                    { text: "Model selection", percentage: 25, votes: 250 },
                    { text: "Deployment", percentage: 30, votes: 300 }
                ]
            },
            likes: 67,
            comments: 23,
            reposts: 15,
            time: "1d ago",
            liked: false
        }
    ],

    // Mock connections data
    connectionRequests: [
        {
            id: 1,
            name: "Jennifer Williams",
            title: "Product Manager at Amazon",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
            mutualConnections: 15
        },
        {
            id: 2,
            name: "Robert Johnson",
            title: "DevOps Engineer at Meta",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
            mutualConnections: 8
        }
    ],

    // Mock people suggestions
    peopleSuggestions: [
        {
            id: 1,
            name: "Mark Thompson",
            title: "Senior Developer at Spotify",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
            mutualConnections: 5
        },
        {
            id: 2,
            name: "Lisa Chang",
            title: "Marketing Director at Adobe",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face",
            mutualConnections: 12
        },
        {
            id: 3,
            name: "James Wilson",
            title: "Full Stack Developer at Uber",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face",
            mutualConnections: 3
        }
    ],

    // Mock jobs data
    jobs: [
        {
            id: 1,
            title: "Senior Frontend Developer",
            company: "Google",
            location: "Mountain View, CA",
            posted: "2 days ago",
            description: "We are looking for an experienced Frontend Developer to join our team and help build the next generation of web applications...",
            tags: ["React", "TypeScript", "JavaScript"],
            logo: "https://logo.clearbit.com/google.com",
            saved: false
        },
        {
            id: 2,
            title: "Software Engineer",
            company: "Microsoft",
            location: "Seattle, WA",
            posted: "1 week ago",
            description: "Join our team to work on cutting-edge cloud technologies and help millions of users worldwide...",
            tags: ["C#", "Azure", ".NET"],
            logo: "https://logo.clearbit.com/microsoft.com",
            saved: false
        },
        {
            id: 3,
            title: "iOS Developer",
            company: "Apple",
            location: "Cupertino, CA",
            posted: "3 days ago",
            description: "Help create amazing user experiences on iOS devices. Work with our world-class design and engineering teams...",
            tags: ["Swift", "iOS", "Objective-C"],
            logo: "https://logo.clearbit.com/apple.com",
            saved: false
        },
        {
            id: 4,
            title: "Full Stack Developer",
            company: "Netflix",
            location: "Los Gatos, CA",
            posted: "5 days ago",
            description: "Build scalable web applications that serve millions of users worldwide...",
            tags: ["React", "Node.js", "Python"],
            logo: "https://logo.clearbit.com/netflix.com",
            saved: false
        },
        {
            id: 5,
            title: "DevOps Engineer",
            company: "Amazon",
            location: "Remote",
            posted: "1 day ago",
            description: "Design and implement cloud infrastructure solutions using AWS services...",
            tags: ["AWS", "Docker", "Kubernetes"],
            logo: "https://logo.clearbit.com/amazon.com",
            saved: false
        }
    ],

    // Mock conversations data
    conversations: [
        {
            id: 1,
            contact: {
                name: "Emily Chen",
                title: "UX Designer at Apple",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"
            },
            lastMessage: "Thanks for sharing that article!",
            time: "2h ago",
            unread: 1,
            messages: [
                {
                    id: 1,
                    content: "Hi John! I saw your post about React 18. Really insightful!",
                    sender: "contact",
                    timestamp: "Yesterday 3:24 PM"
                },
                {
                    id: 2,
                    content: "Thanks Emily! Have you had a chance to try out the new features yet?",
                    sender: "user",
                    timestamp: "Yesterday 3:30 PM"
                },
                {
                    id: 3,
                    content: "Not yet, but I'm planning to experiment with them in our next project. The concurrent rendering sounds promising for our performance issues.",
                    sender: "contact",
                    timestamp: "Today 10:15 AM"
                },
                {
                    id: 4,
                    content: "Thanks for sharing that article!",
                    sender: "contact",
                    timestamp: "2 hours ago"
                }
            ]
        },
        {
            id: 2,
            contact: {
                name: "Michael Johnson",
                title: "Senior Frontend Developer at Google",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
            },
            lastMessage: "Are you available for a quick call?",
            time: "5h ago",
            unread: 0,
            messages: [
                {
                    id: 1,
                    content: "Hey John, great post about React performance!",
                    sender: "contact",
                    timestamp: "2 days ago"
                },
                {
                    id: 2,
                    content: "Are you available for a quick call?",
                    sender: "contact",
                    timestamp: "5 hours ago"
                }
            ]
        },
        {
            id: 3,
            contact: {
                name: "Jun",
                title: "Full Stack Developer | AI Enthusiast",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
            },
            lastMessage: "Your LinkedIn clone looks amazing! 🚀",
            time: "30min ago",
            unread: 2,
            messages: [
                {
                    id: 1,
                    content: "Hey! I saw your LinkedIn clone project. The functionality is incredible!",
                    sender: "contact",
                    timestamp: "1 hour ago"
                },
                {
                    id: 2,
                    content: "Your LinkedIn clone looks amazing! 🚀",
                    sender: "contact",
                    timestamp: "30 minutes ago"
                }
            ]
        },
        {
            id: 4,
            contact: {
                name: "Alex Rodriguez",
                title: "Data Scientist at Netflix",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=face"
            },
            lastMessage: "Great presentation yesterday!",
            time: "1d ago",
            unread: 0,
            messages: [
                {
                    id: 1,
                    content: "Great presentation yesterday!",
                    sender: "contact",
                    timestamp: "1 day ago"
                }
            ]
        }
    ],

    // Mock notifications data
    notifications: [
        {
            id: 1,
            type: "like",
            user: {
                name: "Emily Chen",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"
            },
            content: "liked your post about React 18 features",
            time: "2 hours ago",
            unread: true
        },
        {
            id: 2,
            type: "comment",
            user: {
                name: "Michael Johnson",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
            },
            content: "commented on your post",
            time: "4 hours ago",
            unread: true
        },
        {
            id: 3,
            type: "job",
            content: "New job alert: Senior Frontend Developer at Google matches your preferences",
            time: "1 day ago",
            unread: false,
            icon: "fas fa-briefcase"
        },
        {
            id: 4,
            type: "follow",
            user: {
                name: "Alex Rodriguez",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=face"
            },
            content: "started following you",
            time: "2 days ago",
            unread: false
        },
        {
            id: 5,
            type: "connection",
            content: "You have 5 new connection requests",
            time: "3 days ago",
            unread: false,
            icon: "fas fa-users"
        }
    ],

    // Mock search data
    searchResults: {
        people: [
            {
                id: "jun-kim",
                name: "Jun",
                title: "Full Stack Developer | AI Enthusiast",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
                mutualConnections: 23
            },
            {
                id: 1,
                name: "Sarah Wilson",
                title: "Frontend Engineer at Facebook",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face",
                mutualConnections: 12
            },
            {
                id: 2,
                name: "David Kim",
                title: "Product Manager at Stripe",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
                mutualConnections: 8
            },
            {
                id: 3,
                name: "Rachel Green",
                title: "UX Designer at Airbnb",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face",
                mutualConnections: 15
            }
        ],
        companies: [
            {
                id: 1,
                name: "Google",
                industry: "Technology",
                followers: "12.5M",
                logo: "https://logo.clearbit.com/google.com"
            },
            {
                id: 2,
                name: "Microsoft",
                industry: "Technology",
                followers: "8.2M",
                logo: "https://logo.clearbit.com/microsoft.com"
            },
            {
                id: 3,
                name: "Apple",
                industry: "Technology",
                followers: "15.1M",
                logo: "https://logo.clearbit.com/apple.com"
            }
        ],
        posts: [
            {
                id: 4,
                author: "Jun",
                content: "Just finished building an amazing LinkedIn clone with complete functionality...",
                time: "1h ago"
            },
            {
                id: 5,
                author: "Jun", 
                content: "Diving deep into the latest AI trends and how they're reshaping software development...",
                time: "4h ago"
            },
            {
                id: 1,
                author: "Michael Johnson",
                content: "React 18 concurrent features are game-changing...",
                time: "3h ago"
            },
            {
                id: 2,
                author: "Emily Chen",
                content: "Understanding user needs in UX design...",
                time: "5h ago"
            }
        ]
    },

    // Mock news data
    news: [
        {
            id: 1,
            title: "AI technology reshaping job market",
            time: "3h ago",
            readers: "1,234"
        },
        {
            id: 2,
            title: "Remote work trends analysis",
            time: "5h ago",
            readers: "892"
        },
        {
            id: 3,
            title: "Startup investment trends",
            time: "8h ago",
            readers: "567"
        },
        {
            id: 4,
            title: "Tech giants hiring spree continues",
            time: "12h ago",
            readers: "2,341"
        }
    ]
};

// Export for use in other files
window.mockData = mockData;