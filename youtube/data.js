// Mock data for YouTube clone
const mockData = {
    user: {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://via.placeholder.com/32x32?text=JD',
        subscribedChannels: ['channel1', 'channel2', 'channel3', 'channel4', 'channel5', 'jun'],
        watchHistory: ['video1', 'video2', 'video3', 'video5', 'video7', 'video8'],
        likedVideos: ['video1', 'video3', 'video5'],
        watchLater: ['video2', 'video4', 'video6'],
        playlists: [],
        preferences: {
            autoplay: true,
            notifications: true,
            quality: 'auto',
            captions: false
        },
        activityLog: [
            { timestamp: '2024-09-13T10:30:00Z', action: 'video_watch', videoId: 'video1', duration: 180 },
            { timestamp: '2024-09-13T11:15:00Z', action: 'comment_post', videoId: 'video1', commentId: 'comment1' },
            { timestamp: '2024-09-13T12:00:00Z', action: 'like_video', videoId: 'video3' },
            { timestamp: '2024-09-13T12:30:00Z', action: 'subscribe_channel', channelId: 'jun' },
            { timestamp: '2024-09-13T13:45:00Z', action: 'playlist_create', playlistId: 'user_playlist_1' },
            { timestamp: '2024-09-13T14:20:00Z', action: 'video_search', query: 'cooking tutorial' },
            { timestamp: '2024-09-13T15:10:00Z', action: 'video_share', videoId: 'video2', platform: 'twitter' }
        ],
        engagementStats: {
            totalWatchTime: 3600,
            averageSessionLength: 25,
            videosWatchedToday: 5,
            commentsPostedThisWeek: 8,
            likesGivenThisMonth: 23,
            searchesThisWeek: 12,
            preferredCategories: ['cooking', 'technology', 'education'],
            peakActivityHours: [19, 20, 21],
            deviceUsage: { desktop: 60, mobile: 35, tablet: 5 }
        }
    },

    channels: {
        channel1: {
            id: 'channel1',
            name: 'National Geographic',
            subscribers: '22.4M',
            avatar: 'https://via.placeholder.com/36x36?text=NG',
            banner: 'https://via.placeholder.com/1280x300?text=National+Geographic',
            description: 'The official National Geographic YouTube channel. Inspiring people to care about the planet.',
            verified: true
        },
        channel2: {
            id: 'channel2',
            name: 'Code Academy',
            subscribers: '1.8M',
            avatar: 'https://via.placeholder.com/36x36?text=CA',
            banner: 'https://via.placeholder.com/1280x300?text=Code+Academy',
            description: 'Learn to code with our comprehensive programming tutorials.',
            verified: true
        },
        channel3: {
            id: 'channel3',
            name: 'Gaming Central',
            subscribers: '5.2M',
            avatar: 'https://via.placeholder.com/36x36?text=GC',
            banner: 'https://via.placeholder.com/1280x300?text=Gaming+Central',
            description: 'Your ultimate destination for gaming content, reviews, and highlights.',
            verified: true
        },
        channel4: {
            id: 'channel4',
            name: "Chef's Kitchen",
            subscribers: '980K',
            avatar: 'https://via.placeholder.com/36x36?text=CK',
            banner: 'https://via.placeholder.com/1280x300?text=Chef+Kitchen',
            description: 'Delicious recipes and cooking tips from professional chefs.',
            verified: false
        },
        channel5: {
            id: 'channel5',
            name: 'Science Today',
            subscribers: '3.1M',
            avatar: 'https://via.placeholder.com/36x36?text=ST',
            banner: 'https://via.placeholder.com/1280x300?text=Science+Today',
            description: 'Breaking scientific discoveries and educational content.',
            verified: true
        },
        jun: {
            id: 'jun',
            name: 'jun',
            subscribers: '856K',
            avatar: 'https://via.placeholder.com/36x36?text=JUN&background=ff6b6b&color=ffffff',
            banner: 'https://via.placeholder.com/1280x300?text=jun+Channel&background=ff6b6b&color=ffffff',
            description: 'Creative content creator sharing daily life, tutorials, and entertainment. Welcome to my channel!',
            verified: true,
            joinDate: '2021-03-15',
            totalViews: '45.2M',
            location: 'Seoul, South Korea'
        },
        channel_movies: {
            id: 'channel_movies',
            name: 'Movie Central',
            subscribers: '2.4M',
            avatar: 'https://via.placeholder.com/36x36?text=MC&background=8e44ad&color=ffffff',
            banner: 'https://via.placeholder.com/1280x300?text=Movie+Central&background=8e44ad&color=ffffff',
            description: 'Your ultimate destination for movie reviews, rankings, and film analysis. We cover everything from blockbusters to indie gems.',
            verified: true,
            joinDate: '2019-08-12',
            totalViews: '87.5M',
            location: 'Los Angeles, CA'
        }
    },

    videos: {
        video1: {
            id: 'video1',
            title: 'Amazing Nature Documentary - Wildlife Adventures',
            channelId: 'channel1',
            channelName: 'National Geographic',
            views: '1.2M',
            uploadDate: '2 days ago',
            duration: '10:32',
            thumbnail: 'https://via.placeholder.com/320x180?text=Nature+Documentary',
            description: 'Join us on an incredible journey through the world\'s most spectacular wildlife habitats. From the African savanna to the Amazon rainforest, witness nature at its finest.',
            likes: 45000,
            dislikes: 1200,
            comments: [],
            category: 'education',
            tags: ['nature', 'wildlife', 'documentary', 'animals']
        },
        video2: {
            id: 'video2',
            title: 'Top 10 Programming Tips for Beginners',
            channelId: 'channel2',
            channelName: 'Code Academy',
            views: '587K',
            uploadDate: '1 week ago',
            duration: '15:24',
            thumbnail: 'https://via.placeholder.com/320x180?text=Programming+Tips',
            description: 'Essential programming tips every beginner should know. From choosing your first language to debugging techniques.',
            likes: 23000,
            dislikes: 500,
            comments: [],
            category: 'education',
            tags: ['programming', 'coding', 'tutorial', 'beginner']
        },
        video3: {
            id: 'video3',
            title: 'Epic Gaming Moments - Best Highlights',
            channelId: 'channel3',
            channelName: 'Gaming Central',
            views: '2.1M',
            uploadDate: '3 days ago',
            duration: '8:15',
            thumbnail: 'https://via.placeholder.com/320x180?text=Gaming+Highlights',
            description: 'The most epic gaming moments and highlights from popular games. Watch incredible plays and funny moments.',
            likes: 78000,
            dislikes: 2100,
            comments: [],
            category: 'gaming',
            tags: ['gaming', 'highlights', 'epic', 'funny']
        },
        video4: {
            id: 'video4',
            title: 'Delicious Recipe: Perfect Chocolate Cake',
            channelId: 'channel4',
            channelName: "Chef's Kitchen",
            views: '756K',
            uploadDate: '5 days ago',
            duration: '12:07',
            thumbnail: 'https://via.placeholder.com/320x180?text=Chocolate+Cake',
            description: 'Learn how to make the perfect chocolate cake with this easy-to-follow recipe. Moist, rich, and absolutely delicious!',
            likes: 34000,
            dislikes: 800,
            comments: [],
            category: 'cooking',
            tags: ['cooking', 'recipe', 'chocolate', 'cake', 'dessert']
        },
        video5: {
            id: 'video5',
            title: 'Breaking News: Major Scientific Discovery',
            channelId: 'channel5',
            channelName: 'Science Today',
            views: '3.2M',
            uploadDate: '1 day ago',
            duration: '20:33',
            thumbnail: 'https://via.placeholder.com/320x180?text=Scientific+Discovery',
            description: 'Scientists have made a groundbreaking discovery that could change our understanding of the universe.',
            likes: 125000,
            dislikes: 3200,
            comments: [],
            category: 'news',
            tags: ['science', 'discovery', 'news', 'research']
        },
        video6: {
            id: 'video6',
            title: "Travel Vlog: Exploring Tokyo's Hidden Gems",
            channelId: 'channel6',
            channelName: 'Adventure Seekers',
            views: '1.3M',
            uploadDate: '4 days ago',
            duration: '7:45',
            thumbnail: 'https://via.placeholder.com/320x180?text=Tokyo+Travel',
            description: 'Join us as we explore Tokyo\'s hidden gems and secret spots that most tourists never see.',
            likes: 56000,
            dislikes: 1500,
            comments: [],
            category: 'travel',
            tags: ['travel', 'tokyo', 'japan', 'vlog', 'adventure']
        },
        video7: {
            id: 'video7',
            title: 'Football Highlights - Championship Finals',
            channelId: 'channel7',
            channelName: 'Sports Network',
            views: '892K',
            uploadDate: '6 days ago',
            duration: '14:22',
            thumbnail: 'https://via.placeholder.com/320x180?text=Football+Highlights',
            description: 'Watch the best moments from the championship finals. Incredible goals, saves, and match-winning plays.',
            likes: 42000,
            dislikes: 1800,
            comments: [],
            category: 'sports',
            tags: ['football', 'soccer', 'highlights', 'championship', 'sports']
        },
        video8: {
            id: 'video8',
            title: 'Music Mix: Best Pop Songs 2024',
            channelId: 'channel8',
            channelName: 'Music World',
            views: '2.5M',
            uploadDate: '2 days ago',
            duration: '11:18',
            thumbnail: 'https://via.placeholder.com/320x180?text=Pop+Music+Mix',
            description: 'The hottest pop songs of 2024 in one amazing mix. Perfect for workouts, parties, or just relaxing.',
            likes: 89000,
            dislikes: 2500,
            comments: [],
            category: 'music',
            tags: ['music', 'pop', '2024', 'mix', 'playlist']
        },
        video_jun1: {
            id: 'video_jun1',
            title: 'Morning Routine That Changed My Life',
            channelId: 'jun',
            channelName: 'jun',
            views: '1.8M',
            uploadDate: '1 day ago',
            duration: '12:34',
            thumbnail: 'https://via.placeholder.com/320x180?text=Morning+Routine&background=ff9999&color=000000',
            description: 'Sharing my morning routine that completely transformed my productivity and mindset. These simple habits have made such a huge difference in my daily life. Hope this helps you too! ✨\n\nWhat I cover in this video:\n- 5:30 AM wake up routine\n- Meditation and journaling\n- Healthy breakfast ideas\n- Exercise routine\n- Planning for the day\n\nLet me know in the comments what your morning routine looks like!',
            likes: 142000,
            dislikes: 3200,
            comments: [],
            category: 'lifestyle',
            tags: ['morning routine', 'productivity', 'lifestyle', 'self improvement', 'daily habits']
        },
        video_jun2: {
            id: 'video_jun2',
            title: 'Trying Korean Street Food for 24 Hours',
            channelId: 'jun',
            channelName: 'jun',
            views: '2.3M',
            uploadDate: '3 days ago',
            duration: '18:45',
            thumbnail: 'https://via.placeholder.com/320x180?text=Korean+Street+Food&background=ffcc99&color=000000',
            description: 'I spent an entire day eating only Korean street food! From tteokbokki to hotteok, I tried everything I could find in Myeongdong. This was such an amazing food adventure! 🇰🇷🍜\n\nFood I tried:\n- Tteokbokki (spicy rice cakes)\n- Hotteok (sweet pancakes)\n- Korean corn dogs\n- Bungeoppang (fish-shaped pastry)\n- Korean fried chicken\n- And so much more!\n\nWhich Korean street food should I try next?',
            likes: 198000,
            dislikes: 4100,
            comments: [],
            category: 'food',
            tags: ['korean food', 'street food', 'food challenge', 'korea', 'mukbang']
        },
        video_jun3: {
            id: 'video_jun3',
            title: 'Room Makeover on a Budget | Before & After',
            channelId: 'jun',
            channelName: 'jun',
            views: '3.1M',
            uploadDate: '1 week ago',
            duration: '16:22',
            thumbnail: 'https://via.placeholder.com/320x180?text=Room+Makeover&background=99ccff&color=000000',
            description: 'Completely transformed my room with just $200! I can\'t believe how much of a difference small changes can make. This makeover took me about a week to complete and I\'m so happy with the results! 🏠✨\n\nWhat I changed:\n- Painted the walls\n- Added LED strip lights\n- DIY wall art\n- Reorganized furniture\n- Added plants and decorations\n\nAll items linked in the description! Let me know what you think of the transformation!',
            likes: 267000,
            dislikes: 5800,
            comments: [],
            category: 'lifestyle',
            tags: ['room makeover', 'diy', 'budget', 'home decor', 'transformation']
        },
        video_jun4: {
            id: 'video_jun4',
            title: 'Learning a New Language in 30 Days Challenge',
            channelId: 'jun',
            channelName: 'jun',
            views: '1.2M',
            uploadDate: '2 weeks ago',
            duration: '14:55',
            thumbnail: 'https://via.placeholder.com/320x180?text=Language+Challenge&background=ccff99&color=000000',
            description: 'I challenged myself to learn as much Spanish as possible in 30 days! This was definitely harder than I expected but so rewarding. Here\'s my journey and what I learned along the way. 🇪🇸📚\n\nMy learning method:\n- 2 hours daily study\n- Language exchange apps\n- Spanish movies and music\n- Speaking practice with native speakers\n- Grammar and vocabulary drills\n\nResult: I can now have basic conversations! Not perfect, but I\'m so proud of the progress. What language should I try next?',
            likes: 89000,
            dislikes: 2100,
            comments: [],
            category: 'education',
            tags: ['language learning', '30 day challenge', 'spanish', 'education', 'self improvement']
        },
        video_jun5: {
            id: 'video_jun5',
            title: 'My Honest Opinion on Social Media Detox',
            channelId: 'jun',
            channelName: 'jun',
            views: '956K',
            uploadDate: '3 weeks ago',
            duration: '11:28',
            thumbnail: 'https://via.placeholder.com/320x180?text=Social+Media+Detox&background=ff99cc&color=000000',
            description: 'I took a complete break from social media for 2 weeks and here\'s what happened. This experience was eye-opening and I learned so much about myself and my relationship with technology. 📱✨\n\nWhat I did:\n- Deleted all social media apps\n- No checking feeds or stories\n- Focused on real-life activities\n- Read books instead of scrolling\n- Spent more time outdoors\n\nThe results surprised me! Watch to see how this affected my mental health, productivity, and relationships. Would you try a social media detox?',
            likes: 78000,
            dislikes: 1800,
            comments: [],
            category: 'lifestyle',
            tags: ['social media detox', 'digital wellbeing', 'mental health', 'lifestyle', 'self care']
        },
        video9: {
            id: 'video9',
            title: 'Ultimate Productivity Setup for 2024',
            channelId: 'channel2',
            channelName: 'Code Academy',
            views: '1.8M',
            uploadDate: '1 day ago',
            duration: '18:32',
            thumbnail: 'https://via.placeholder.com/320x180?text=Productivity+Setup',
            description: 'My complete productivity setup for 2024 including hardware, software, and workflow optimization. Everything you need to maximize your productivity.',
            likes: 87000,
            dislikes: 2100,
            comments: [],
            category: 'education',
            tags: ['productivity', 'setup', 'workflow', 'tech']
        },
        video10: {
            id: 'video10',
            title: 'Cinematic Food Photography Tutorial',
            channelId: 'channel4',
            channelName: "Chef's Kitchen",
            views: '445K',
            uploadDate: '2 hours ago',
            duration: '14:55',
            thumbnail: 'https://via.placeholder.com/320x180?text=Food+Photography',
            description: 'Learn professional food photography techniques to make your dishes look amazing. From lighting to composition, I cover everything.',
            likes: 21000,
            dislikes: 456,
            comments: [],
            category: 'cooking',
            tags: ['photography', 'food', 'tutorial', 'cooking']
        },
        video11: {
            id: 'video11',
            title: 'Breaking: Space Mission Update',
            channelId: 'channel5',
            channelName: 'Science Today',
            views: '2.9M',
            uploadDate: '4 hours ago',
            duration: '12:18',
            thumbnail: 'https://via.placeholder.com/320x180?text=Space+Mission',
            description: 'Latest updates from the Mars mission including new discoveries and future exploration plans.',
            likes: 145000,
            dislikes: 3400,
            comments: [],
            category: 'news',
            tags: ['space', 'mars', 'mission', 'science', 'exploration']
        },
        video12: {
            id: 'video12',
            title: 'Best Horror Movies of 2024 Ranked',
            channelId: 'channel_movies',
            channelName: 'Movie Central',
            views: '789K',
            uploadDate: '1 day ago',
            duration: '22:45',
            thumbnail: 'https://via.placeholder.com/320x180?text=Horror+Movies+2024',
            description: 'My ranking of the best horror movies released in 2024. From psychological thrillers to supernatural scares, here are the films that kept us up at night.',
            likes: 42000,
            dislikes: 1200,
            comments: [],
            category: 'movies',
            tags: ['horror', 'movies', '2024', 'ranking', 'review']
        }
    },

    comments: {
        video1: [
            {
                id: 'comment1',
                userId: 'user456',
                username: 'NatureLover22',
                avatar: 'https://via.placeholder.com/24x24?text=NL',
                text: 'Absolutely stunning footage! National Geographic never disappoints.',
                likes: 234,
                timestamp: '2 hours ago',
                replies: [
                    {
                        id: 'reply1',
                        userId: 'user789',
                        username: 'WildlifeExpert',
                        avatar: 'https://via.placeholder.com/24x24?text=WE',
                        text: 'Agreed! The cinematography is incredible.',
                        likes: 45,
                        timestamp: '1 hour ago'
                    }
                ]
            },
            {
                id: 'comment2',
                userId: 'user321',
                username: 'DocumentaryFan',
                avatar: 'https://via.placeholder.com/24x24?text=DF',
                text: 'This made me want to become a wildlife photographer!',
                likes: 156,
                timestamp: '4 hours ago',
                replies: []
            }
        ],
        video_jun1: [
            {
                id: 'comment_jun1_1',
                userId: 'user123',
                username: 'MorningPerson',
                avatar: 'https://via.placeholder.com/24x24?text=MP&background=4CAF50&color=white',
                text: 'This routine literally changed my life! Been following it for 3 weeks now and I feel so much more productive. Thank you jun! 🙏',
                likes: 1245,
                timestamp: '12 hours ago',
                replies: [
                    {
                        id: 'reply_jun1_1',
                        userId: 'jun',
                        username: 'jun',
                        avatar: 'https://via.placeholder.com/24x24?text=JUN&background=ff6b6b&color=ffffff',
                        text: 'So happy to hear that! Keep it up! 💪',
                        likes: 342,
                        timestamp: '10 hours ago',
                        hearted: true
                    }
                ]
            },
            {
                id: 'comment_jun1_2',
                userId: 'user567',
                username: 'HealthyLiving',
                avatar: 'https://via.placeholder.com/24x24?text=HL&background=FF9800&color=white',
                text: 'The meditation part really resonates with me. Started doing 10 minutes every morning and it\'s amazing how much calmer I feel throughout the day.',
                likes: 892,
                timestamp: '18 hours ago',
                replies: []
            },
            {
                id: 'comment_jun1_3',
                userId: 'user890',
                username: 'EarlyBird',
                avatar: 'https://via.placeholder.com/24x24?text=EB&background=2196F3&color=white',
                text: 'I\'ve been trying to wake up at 5:30 AM but it\'s so hard! Any tips for making it easier?',
                likes: 234,
                timestamp: '1 day ago',
                replies: [
                    {
                        id: 'reply_jun1_2',
                        userId: 'jun',
                        username: 'jun',
                        avatar: 'https://via.placeholder.com/24x24?text=JUN&background=ff6b6b&color=ffffff',
                        text: 'Start by going to bed 15 minutes earlier each night until you reach your target bedtime! Also, put your alarm across the room so you have to get up to turn it off 😊',
                        likes: 156,
                        timestamp: '20 hours ago',
                        hearted: true
                    }
                ]
            }
        ],
        video_jun2: [
            {
                id: 'comment_jun2_1',
                userId: 'user234',
                username: 'KoreanFoodLover',
                avatar: 'https://via.placeholder.com/24x24?text=KF&background=E91E63&color=white',
                text: 'OMG the tteokbokki looked so good! 🤤 I\'m definitely going to Myeongdong next time I\'m in Seoul. Which stall was your favorite?',
                likes: 2134,
                timestamp: '2 days ago',
                replies: [
                    {
                        id: 'reply_jun2_1',
                        userId: 'jun',
                        username: 'jun',
                        avatar: 'https://via.placeholder.com/24x24?text=JUN&background=ff6b6b&color=ffffff',
                        text: 'The one near the main entrance! The ajumma there makes the best tteokbokki I\'ve ever had! 🔥',
                        likes: 567,
                        timestamp: '2 days ago',
                        hearted: true
                    }
                ]
            },
            {
                id: 'comment_jun2_2',
                userId: 'user345',
                username: 'Foodie_Seoul',
                avatar: 'https://via.placeholder.com/24x24?text=FS&background=795548&color=white',
                text: 'As a Korean, I\'m so happy to see you enjoying our street food! You picked all the best ones 👍 Next time try sundae (blood sausage) if you\'re feeling adventurous!',
                likes: 1876,
                timestamp: '3 days ago',
                replies: []
            }
        ],
        video_jun3: [
            {
                id: 'comment_jun3_1',
                userId: 'user456',
                username: 'DIYQueen',
                avatar: 'https://via.placeholder.com/24x24?text=DQ&background=9C27B0&color=white',
                text: 'The transformation is incredible! Can you please do a detailed tutorial on how you painted those accent walls? The technique looks amazing!',
                likes: 1456,
                timestamp: '1 week ago',
                replies: [
                    {
                        id: 'reply_jun3_1',
                        userId: 'jun',
                        username: 'jun',
                        avatar: 'https://via.placeholder.com/24x24?text=JUN&background=ff6b6b&color=ffffff',
                        text: 'Great idea! I\'ll make a separate tutorial video for the wall painting technique. Stay tuned! 🎨',
                        likes: 234,
                        timestamp: '6 days ago',
                        hearted: true
                    }
                ]
            }
        ]
    },

    trending: [
        'video11', 'video_jun2', 'video9', 'video5', 'video_jun3', 'video12', 'video3', 'video8', 'video_jun1', 'video10', 'video1', 'video6', 'video7', 'video2', 'video4'
    ],

    searchResults: {},

    categories: {
        all: ['video11', 'video10', 'video9', 'video_jun1', 'video_jun2', 'video_jun3', 'video_jun4', 'video_jun5', 'video1', 'video2', 'video3', 'video4', 'video5', 'video6', 'video7', 'video8', 'video12'],
        music: ['video8'],
        gaming: ['video3'],
        news: ['video5', 'video11'],
        sports: ['video7'],
        movies: ['video12'],
        cooking: ['video4', 'video_jun2', 'video10'],
        education: ['video1', 'video2', 'video_jun4', 'video9'],
        technology: ['video2', 'video9'],
        travel: ['video6'],
        lifestyle: ['video_jun1', 'video_jun3', 'video_jun5']
    }
};

// Advanced search filters
const advancedFilters = {
    uploadDate: ['any', 'hour', 'day', 'week', 'month', 'year'],
    duration: ['any', 'short', 'medium', 'long'], // <4min, 4-20min, >20min
    features: ['live', 'hd', 'subtitles', '4k', 'vr'],
    sortBy: ['relevance', 'date', 'viewCount', 'rating']
};

// Apply advanced search filters
function applyAdvancedFilters(videos, filters) {
    let filteredVideos = [...videos];

    if (filters.uploadDate && filters.uploadDate !== 'any') {
        const now = new Date();
        const filterDate = new Date();

        switch(filters.uploadDate) {
            case 'hour': filterDate.setHours(now.getHours() - 1); break;
            case 'day': filterDate.setDate(now.getDate() - 1); break;
            case 'week': filterDate.setDate(now.getDate() - 7); break;
            case 'month': filterDate.setMonth(now.getMonth() - 1); break;
            case 'year': filterDate.setFullYear(now.getFullYear() - 1); break;
        }

        filteredVideos = filteredVideos.filter(videoId => {
            const video = typeof videoId === 'string' ? mockData.videos[videoId] : videoId;
            const uploadDate = new Date(video.uploadDate || '2024-01-01');
            return uploadDate >= filterDate;
        });
    }

    if (filters.duration && filters.duration !== 'any') {
        filteredVideos = filteredVideos.filter(videoId => {
            const video = typeof videoId === 'string' ? mockData.videos[videoId] : videoId;
            const duration = video.duration;
            const [mins, secs] = duration.split(':').map(Number);
            const totalSeconds = mins * 60 + secs;

            switch(filters.duration) {
                case 'short': return totalSeconds < 240; // < 4 minutes
                case 'medium': return totalSeconds >= 240 && totalSeconds <= 1200; // 4-20 minutes
                case 'long': return totalSeconds > 1200; // > 20 minutes
                default: return true;
            }
        });
    }

    return filteredVideos;
}

// Generate search results dynamically with advanced filters
function generateSearchResults(query, filters = {}) {
    const allVideos = Object.values(mockData.videos);
    let matchedVideos = allVideos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channelName.toLowerCase().includes(query.toLowerCase()) ||
        (video.tags && video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );

    // Apply advanced filters
    if (filters && Object.keys(filters).length > 0) {
        matchedVideos = applyAdvancedFilters(matchedVideos, filters);
    }

    // Sort results based on sortBy filter
    if (filters.sortBy) {
        matchedVideos.sort((a, b) => {
            switch(filters.sortBy) {
                case 'date':
                    return new Date(b.uploadDate || '2024-01-01') - new Date(a.uploadDate || '2024-01-01');
                case 'viewCount':
                    const aViews = parseInt(a.views.replace(/[^\d]/g, ''));
                    const bViews = parseInt(b.views.replace(/[^\d]/g, ''));
                    return bViews - aViews;
                case 'rating':
                    return (b.likes / (b.likes + b.dislikes)) - (a.likes / (a.likes + a.dislikes));
                default: // relevance
                    return 0;
            }
        });
    }

    return matchedVideos;
}

// Add more videos for infinite scroll
function generateMoreVideos(count = 4) {
    const templates = [
        { title: 'Amazing Cooking Tutorial', channel: "Chef's Kitchen", category: 'cooking' },
        { title: 'Gaming Review: Latest Release', channel: 'Gaming Central', category: 'gaming' },
        { title: 'Science Explained Simply', channel: 'Science Today', category: 'education' },
        { title: 'Travel Adventure in Europe', channel: 'Adventure Seekers', category: 'travel' },
        { title: 'Breaking Sports News', channel: 'Sports Network', category: 'sports' },
        { title: 'Pop Music Hits Compilation', channel: 'Music World', category: 'music' },
        { title: 'Programming Tutorial Advanced', channel: 'Code Academy', category: 'education' },
        { title: 'Wildlife Documentary Series', channel: 'National Geographic', category: 'education' }
    ];

    const newVideos = [];
    for (let i = 0; i < count; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const videoId = 'video' + Date.now() + i;
        const views = Math.floor(Math.random() * 5000000) + 100000;
        const duration = Math.floor(Math.random() * 20) + 5;
        const days = Math.floor(Math.random() * 30) + 1;
        
        newVideos.push({
            id: videoId,
            title: template.title + ' #' + Math.floor(Math.random() * 1000),
            channelName: template.channel,
            views: formatViews(views),
            uploadDate: days + (days === 1 ? ' day ago' : ' days ago'),
            duration: duration + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            thumbnail: `https://via.placeholder.com/320x180?text=${encodeURIComponent(template.title)}`,
            category: template.category
        });
    }
    return newVideos;
}

function formatViews(views) {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(0) + 'K';
    }
    return views.toString();
}

// Make functions globally available
// User activity analysis functions
const userAnalytics = {
    // Get activity by date range
    getActivityByDateRange(startDate, endDate) {
        return mockData.user.activityLog.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= new Date(startDate) && activityDate <= new Date(endDate);
        });
    },

    // Get activity patterns by hour
    getActivityPatterns() {
        const hourlyActivity = new Array(24).fill(0);
        mockData.user.activityLog.forEach(activity => {
            const hour = new Date(activity.timestamp).getHours();
            hourlyActivity[hour]++;
        });
        return hourlyActivity;
    },

    // Analyze video engagement
    getVideoEngagementData() {
        const videoEngagement = {};
        mockData.user.activityLog.forEach(activity => {
            if (activity.videoId) {
                if (!videoEngagement[activity.videoId]) {
                    videoEngagement[activity.videoId] = {
                        watches: 0,
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        totalWatchTime: 0
                    };
                }

                switch(activity.action) {
                    case 'video_watch':
                        videoEngagement[activity.videoId].watches++;
                        videoEngagement[activity.videoId].totalWatchTime += activity.duration || 0;
                        break;
                    case 'like_video':
                        videoEngagement[activity.videoId].likes++;
                        break;
                    case 'comment_post':
                        videoEngagement[activity.videoId].comments++;
                        break;
                    case 'video_share':
                        videoEngagement[activity.videoId].shares++;
                        break;
                }
            }
        });
        return videoEngagement;
    },

    // Get category preferences based on watch history
    getCategoryPreferences() {
        const categoryStats = {};
        mockData.user.watchHistory.forEach(videoId => {
            const video = mockData.videos[videoId];
            if (video && video.category) {
                categoryStats[video.category] = (categoryStats[video.category] || 0) + 1;
            }
        });

        // Sort by preference
        return Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    },

    // Generate personalized recommendations
    getPersonalizedRecommendations(limit = 10) {
        const preferences = this.getCategoryPreferences();
        const topCategories = Object.keys(preferences).slice(0, 3);

        const recommendations = [];
        for (const category of topCategories) {
            const categoryVideos = mockData.categories[category] || [];
            const unwatchedVideos = categoryVideos.filter(videoId =>
                !mockData.user.watchHistory.includes(videoId)
            );
            recommendations.push(...unwatchedVideos.slice(0, Math.ceil(limit / topCategories.length)));
        }

        return recommendations.slice(0, limit);
    },

    // Export user data for analysis
    exportUserData() {
        return {
            user: mockData.user,
            watchHistory: mockData.user.watchHistory.map(videoId => ({
                videoId,
                video: mockData.videos[videoId],
                watchedAt: mockData.user.activityLog.find(log =>
                    log.action === 'video_watch' && log.videoId === videoId
                )?.timestamp
            })),
            engagementData: this.getVideoEngagementData(),
            categoryPreferences: this.getCategoryPreferences(),
            activityPatterns: this.getActivityPatterns(),
            recommendations: this.getPersonalizedRecommendations()
        };
    },

    // CSV Export functions
    exportToCSV(data, filename = 'youtube_data.csv') {
        let csvContent = '';

        if (Array.isArray(data) && data.length > 0) {
            // Get headers from first object
            const headers = Object.keys(data[0]);
            csvContent += headers.join(',') + '\n';

            // Add data rows
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header] || '';
                    // Escape quotes and wrap in quotes if contains comma
                    return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                });
                csvContent += values.join(',') + '\n';
            });
        } else if (typeof data === 'object') {
            // Export object as key-value pairs
            csvContent = 'Key,Value\n';
            Object.entries(data).forEach(([key, value]) => {
                const formattedValue = typeof value === 'object'
                    ? JSON.stringify(value).replace(/"/g, '""')
                    : value;
                csvContent += `"${key}","${formattedValue}"\n`;
            });
        }

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    // Export watch history to CSV
    exportWatchHistoryCSV() {
        const watchHistoryData = mockData.user.watchHistory.map(videoId => {
            const video = mockData.videos[videoId];
            const watchActivity = mockData.user.activityLog.find(log =>
                log.action === 'video_watch' && log.videoId === videoId
            );

            return {
                videoId,
                title: video?.title || 'Unknown',
                channel: video?.channelName || 'Unknown',
                category: video?.category || 'Unknown',
                duration: video?.duration || 'Unknown',
                views: video?.views || '0',
                uploadDate: video?.uploadDate || 'Unknown',
                watchedAt: watchActivity?.timestamp ? new Date(watchActivity.timestamp).toISOString() : 'Unknown'
            };
        });

        this.exportToCSV(watchHistoryData, 'youtube_watch_history.csv');
    },

    // Export liked videos to CSV
    exportLikedVideosCSV() {
        const likedVideosData = mockData.user.likedVideos.map(videoId => {
            const video = mockData.videos[videoId];

            return {
                videoId,
                title: video?.title || 'Unknown',
                channel: video?.channelName || 'Unknown',
                category: video?.category || 'Unknown',
                duration: video?.duration || 'Unknown',
                views: video?.views || '0',
                likes: video?.likes || '0',
                uploadDate: video?.uploadDate || 'Unknown'
            };
        });

        this.exportToCSV(likedVideosData, 'youtube_liked_videos.csv');
    },

    // Export video engagement data to CSV
    exportEngagementDataCSV() {
        const engagementData = this.getVideoEngagementData();
        const engagementArray = Object.entries(engagementData).map(([videoId, data]) => {
            const video = mockData.videos[videoId];
            return {
                videoId,
                title: video?.title || 'Unknown',
                channel: video?.channelName || 'Unknown',
                watches: data.watches,
                likes: data.likes,
                comments: data.comments,
                shares: data.shares,
                totalWatchTime: data.totalWatchTime,
                avgWatchTime: data.watches > 0 ? Math.round(data.totalWatchTime / data.watches) : 0
            };
        });

        this.exportToCSV(engagementArray, 'youtube_engagement_data.csv');
    },

    // Export user activity log to CSV
    exportActivityLogCSV() {
        const activityData = mockData.user.activityLog.map(activity => {
            const video = activity.videoId ? mockData.videos[activity.videoId] : null;

            return {
                timestamp: new Date(activity.timestamp).toISOString(),
                action: activity.action,
                videoId: activity.videoId || '',
                videoTitle: video?.title || '',
                channel: video?.channelName || '',
                duration: activity.duration || 0,
                details: activity.details || ''
            };
        });

        this.exportToCSV(activityData, 'youtube_activity_log.csv');
    },

    // Export category preferences to CSV
    exportCategoryPreferencesCSV() {
        const preferences = this.getCategoryPreferences();
        const preferencesArray = Object.entries(preferences).map(([category, count]) => ({
            category,
            watchCount: count,
            percentage: Math.round((count / mockData.user.watchHistory.length) * 100)
        }));

        this.exportToCSV(preferencesArray, 'youtube_category_preferences.csv');
    },

    // Export complete user analytics to CSV
    exportCompleteAnalyticsCSV() {
        const userData = this.exportUserData();

        // Create summary data
        const summaryData = [{
            totalWatchedVideos: userData.watchHistory.length,
            totalLikedVideos: mockData.user.likedVideos.length,
            totalPlaylists: mockData.user.playlists.length,
            totalSubscriptions: mockData.user.subscriptions.length,
            totalActivityLogEntries: mockData.user.activityLog.length,
            accountCreated: mockData.user.joinDate,
            lastActive: mockData.user.activityLog.length > 0
                ? new Date(Math.max(...mockData.user.activityLog.map(log => log.timestamp))).toISOString()
                : 'Never',
            topCategory: Object.keys(userData.categoryPreferences)[0] || 'None'
        }];

        this.exportToCSV(summaryData, 'youtube_complete_analytics.csv');
    }
};

window.mockData = mockData;
window.generateSearchResults = generateSearchResults;
window.generateMoreVideos = generateMoreVideos;
window.formatViews = formatViews;
window.advancedFilters = advancedFilters;
window.applyAdvancedFilters = applyAdvancedFilters;
window.userAnalytics = userAnalytics;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockData, generateSearchResults, generateMoreVideos, formatViews };
}