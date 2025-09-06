// Extended mock data for jun account and posts
const junAccountData = {
    profile: {
        id: 'jun',
        username: '@jun',
        displayName: 'Jun',
        bio: 'Content Creator | Dance Enthusiast | Food Lover',
        avatar: 'https://via.placeholder.com/120x120/ff0050/ffffff?text=J',
        coverPhoto: 'https://via.placeholder.com/800x200/ff0050/ffffff?text=Jun+Channel',
        followers: '15.8M',
        following: '1.2M',
        likes: '2.3B',
        verified: true,
        joinDate: '2020-03-15',
        location: 'Seoul, South Korea'
    },
    
    posts: [
        {
            id: 1,
            title: 'Amazing dance moves! #dance #viral #trending',
            description: 'Just learned this new dance routine and had to share it with you all! What do you think?',
            thumbnail: 'https://via.placeholder.com/200x300/ff0050/ffffff?text=Dance+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            likes: '1.2M',
            comments: '15.3K',
            shares: '8.9K',
            views: '45.2M',
            uploadDate: '2024-01-15',
            duration: '0:15',
            hashtags: ['#dance', '#viral', '#trending', '#choreography'],
            music: 'Original Sound - Jun'
        },
        {
            id: 2,
            title: 'Cooking tutorial time! #cooking #food #recipe',
            description: 'Making my favorite Korean dish today. Follow along and try it yourself!',
            thumbnail: 'https://via.placeholder.com/200x300/00f2ea/ffffff?text=Cooking+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            likes: '856K',
            comments: '8.9K',
            shares: '5.2K',
            views: '23.7M',
            uploadDate: '2024-01-12',
            duration: '0:30',
            hashtags: ['#cooking', '#food', '#recipe', '#koreanfood'],
            music: 'Cooking Vibes - Jun'
        },
        {
            id: 3,
            title: 'New song cover! What do you think? #music #cover #singing',
            description: 'Covering one of my favorite songs. Hope you like it!',
            thumbnail: 'https://via.placeholder.com/200x300/ff6b6b/ffffff?text=Music+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            likes: '2.1M',
            comments: '32.7K',
            shares: '12.4K',
            views: '67.8M',
            uploadDate: '2024-01-10',
            duration: '0:45',
            hashtags: ['#music', '#cover', '#singing', '#acoustic'],
            music: 'Song Cover - Jun'
        },
        {
            id: 4,
            title: 'Morning workout routine #fitness #workout #healthy',
            description: 'Start your day right with this energizing workout!',
            thumbnail: 'https://via.placeholder.com/200x300/4ecdc4/ffffff?text=Workout+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            likes: '743K',
            comments: '6.2K',
            shares: '3.8K',
            views: '18.9M',
            uploadDate: '2024-01-08',
            duration: '0:20',
            hashtags: ['#fitness', '#workout', '#healthy', '#morningroutine'],
            music: 'Workout Beat - Jun'
        },
        {
            id: 5,
            title: 'Travel vlog: Exploring Seoul #travel #seoul #vlog',
            description: 'Showing you around my favorite spots in Seoul!',
            thumbnail: 'https://via.placeholder.com/200x300/45b7d1/ffffff?text=Travel+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            likes: '1.5M',
            comments: '22.1K',
            shares: '9.7K',
            views: '52.3M',
            uploadDate: '2024-01-05',
            duration: '1:00',
            hashtags: ['#travel', '#seoul', '#vlog', '#korea'],
            music: 'Travel Vibes - Jun'
        },
        {
            id: 6,
            title: 'Fashion haul! #fashion #style #haul',
            description: 'New outfits for the season. Which one is your favorite?',
            thumbnail: 'https://via.placeholder.com/200x300/f9ca24/ffffff?text=Fashion+1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            likes: '987K',
            comments: '12.4K',
            shares: '7.3K',
            views: '31.6M',
            uploadDate: '2024-01-03',
            duration: '0:35',
            hashtags: ['#fashion', '#style', '#haul', '#ootd'],
            music: 'Fashion Forward - Jun'
        }
    ],
    
    likedVideos: [
        {
            id: 'liked_1',
            title: 'Amazing street art #art #streetart',
            author: '@art_lover',
            thumbnail: 'https://via.placeholder.com/200x300/6c5ce7/ffffff?text=Art+1',
            likes: '234K'
        },
        {
            id: 'liked_2',
            title: 'Funny pet compilation #pets #funny',
            author: '@pet_lover',
            thumbnail: 'https://via.placeholder.com/200x300/a29bfe/ffffff?text=Pets+1',
            likes: '567K'
        },
        {
            id: 'liked_3',
            title: 'Cooking hack that changed my life #cooking #hack',
            author: '@chef_mike',
            thumbnail: 'https://via.placeholder.com/200x300/fd79a8/ffffff?text=Hack+1',
            likes: '1.2M'
        }
    ],
    
    following: [
        {
            id: 'alex_creator',
            username: '@alex_creator',
            displayName: 'Alex Creator',
            avatar: 'https://via.placeholder.com/48x48/00f2ea/ffffff?text=A',
            followers: '2.3M',
            isFollowing: true
        },
        {
            id: 'music_lover',
            username: '@music_lover',
            displayName: 'Music Lover',
            avatar: 'https://via.placeholder.com/48x48/ff6b6b/ffffff?text=M',
            followers: '5.7M',
            isFollowing: true
        },
        {
            id: 'dance_queen',
            username: '@dance_queen',
            displayName: 'Dance Queen',
            avatar: 'https://via.placeholder.com/48x48/4ecdc4/ffffff?text=D',
            followers: '8.9M',
            isFollowing: true
        }
    ],
    
    analytics: {
        totalViews: '2.3B',
        totalLikes: '45.7M',
        totalComments: '1.2M',
        totalShares: '567K',
        averageEngagement: '8.5%',
        topHashtags: ['#dance', '#viral', '#cooking', '#music', '#travel'],
        peakHours: ['7:00 PM', '8:00 PM', '9:00 PM'],
        demographics: {
            ageGroups: {
                '13-17': '15%',
                '18-24': '35%',
                '25-34': '30%',
                '35-44': '15%',
                '45+': '5%'
            },
            countries: {
                'South Korea': '40%',
                'United States': '25%',
                'Japan': '15%',
                'Thailand': '10%',
                'Others': '10%'
            }
        }
    }
};

// Additional trending content
const trendingContent = {
    hashtags: [
        { name: '#dance', posts: '2.3B', trending: true },
        { name: '#viral', posts: '1.8B', trending: true },
        { name: '#cooking', posts: '1.5B', trending: true },
        { name: '#music', posts: '2.1B', trending: true },
        { name: '#funny', posts: '1.9B', trending: true },
        { name: '#art', posts: '1.2B', trending: false },
        { name: '#fashion', posts: '1.7B', trending: true },
        { name: '#travel', posts: '1.4B', trending: false },
        { name: '#food', posts: '1.6B', trending: true },
        { name: '#comedy', posts: '1.3B', trending: false }
    ],
    
    sounds: [
        { name: 'Original Sound - Jun', uses: '45.2M', trending: true },
        { name: 'Trending Beat 2024', uses: '123.7M', trending: true },
        { name: 'Viral Dance Music', uses: '89.3M', trending: true },
        { name: 'Cooking Vibes - Jun', uses: '23.7M', trending: false },
        { name: 'Workout Beat - Jun', uses: '18.9M', trending: false }
    ],
    
    effects: [
        { name: 'Green Screen', uses: '234.5M', trending: true },
        { name: 'Time Warp', uses: '156.8M', trending: true },
        { name: 'Beauty Filter', uses: '445.2M', trending: true },
        { name: 'Slow Motion', uses: '178.9M', trending: false },
        { name: 'Speed Up', uses: '123.4M', trending: false }
    ]
};

// Search suggestions
const searchSuggestions = [
    '@jun',
    '@alex_creator',
    '@music_lover',
    '@dance_queen',
    '#dance',
    '#viral',
    '#cooking',
    '#music',
    '#funny',
    '#art',
    '#fashion',
    '#travel',
    '#food',
    '#comedy',
    '#fitness',
    '#workout',
    '#healthy',
    '#morningroutine',
    '#seoul',
    '#vlog',
    '#korea',
    '#style',
    '#haul',
    '#ootd'
];

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        junAccountData,
        trendingContent,
        searchSuggestions
    };
}

