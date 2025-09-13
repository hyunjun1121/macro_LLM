// Mock data for Amazon website simulation

// Jun's profile data
const junProfile = {
    username: "jun",
    fullName: "Jun Kim",
    email: "jun@example.com",
    joinDate: "2020-03-15",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    totalOrders: 47,
    totalReviews: 23,
    sellerRating: 4.8,
    bio: "Tech enthusiast and product reviewer. Love finding great deals and sharing honest reviews!"
};

// Product categories
const categories = {
    all: "All Departments",
    electronics: "Electronics",
    books: "Books",
    clothing: "Clothing, Shoes & Jewelry", 
    home: "Home & Kitchen",
    sports: "Sports & Outdoors",
    automotive: "Automotive",
    bestsellers: "Best Sellers",
    "new-releases": "New Releases"
};

// Mock products data
const products = [
    {
        id: 1,
        title: "Apple iPhone 15 Pro Max, 256GB, Natural Titanium",
        price: 1199.99,
        originalPrice: 1299.99,
        category: "electronics",
        image: "https://m.media-amazon.com/images/I/81Os1SDWpcL._AC_UY327_FMwebp_QL65_.jpg",
        rating: 4.6,
        reviewCount: 2847,
        seller: "Apple Store",
        inStock: true,
        prime: true,
        description: "The most advanced iPhone yet with titanium design, A17 Pro chip, and advanced camera system.",
        features: [
            "6.7-inch Super Retina XDR display",
            "A17 Pro chip with 6-core GPU",
            "Pro camera system with 48MP main camera",
            "Up to 29 hours video playback",
            "Action Button for quick shortcuts"
        ]
    },
    {
        id: 2,
        title: "Samsung 65-Inch QLED 4K Smart TV",
        price: 897.99,
        originalPrice: 1299.99,
        category: "electronics",
        image: "https://m.media-amazon.com/images/I/81VktWkYYsL._AC_UY327_FMwebp_QL65_.jpg",
        rating: 4.4,
        reviewCount: 1205,
        seller: "Samsung",
        inStock: true,
        prime: true,
        description: "Experience brilliant colors and sharp detail with Quantum Dot technology.",
        features: [
            "65-inch QLED 4K display",
            "Quantum HDR technology",
            "Smart TV with Tizen OS",
            "Voice control with Alexa built-in",
            "Multiple HDMI and USB ports"
        ]
    },
    {
        id: 3,
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        price: 328.00,
        originalPrice: 399.99,
        category: "electronics",
        image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_UY327_FMwebp_QL65_.jpg",
        rating: 4.7,
        reviewCount: 892,
        seller: "Sony",
        inStock: true,
        prime: true,
        description: "Industry-leading noise canceling with exceptional sound quality.",
        features: [
            "Industry-leading noise canceling",
            "30-hour battery life",
            "Quick charge: 3 min = 3 hours",
            "Multipoint connection",
            "Speak-to-Chat technology"
        ]
    },
    {
        id: 4,
        title: "The Seven Husbands of Evelyn Hugo: A Novel",
        price: 13.49,
        originalPrice: 17.00,
        category: "books",
        image: "https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UY327_FMwebp_QL65_.jpg",
        rating: 4.6,
        reviewCount: 89234,
        seller: "Amazon.com",
        inStock: true,
        prime: true,
        description: "A captivating novel about a reclusive Hollywood icon who finally decides to tell her story.",
        features: [
            "Paperback: 400 pages",
            "Publisher: Atria Books",
            "Language: English",
            "#1 New York Times Bestseller",
            "Perfect for book clubs"
        ]
    },
    {
        id: 5,
        title: "Levi's Men's 501 Original Fit Jeans",
        price: 59.50,
        originalPrice: 79.99,
        category: "clothing",
        image: "https://m.media-amazon.com/images/I/51eg55uWmdL._AC_UX679_.jpg",
        rating: 4.3,
        reviewCount: 12847,
        seller: "Levi's",
        inStock: true,
        prime: true,
        description: "The original blue jean since 1873. A blank canvas for self-expression.",
        features: [
            "100% Cotton denim",
            "Original straight fit",
            "Button fly closure",
            "Available in multiple sizes",
            "Classic 5-pocket design"
        ]
    },
    {
        id: 6,
        title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt",
        price: 79.95,
        originalPrice: 99.95,
        category: "home",
        image: "https://m.media-amazon.com/images/I/81vTlC7cWsL._AC_SL1500_.jpg",
        rating: 4.6,
        reviewCount: 156789,
        seller: "Instant Pot",
        inStock: true,
        prime: true,
        description: "7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker and warmer.",
        features: [
            "6-quart capacity feeds up to 6 people",
            "7-in-1 functionality",
            "10+ safety features",
            "Dishwasher safe components",
            "Free iOS and Android app"
        ]
    },
    {
        id: 7,
        title: "Nike Air Max 270 Men's Running Shoes",
        price: 129.99,
        originalPrice: 150.00,
        category: "sports",
        image: "https://m.media-amazon.com/images/I/51d+OSJgnnL._AC_UX679_.jpg",
        rating: 4.4,
        reviewCount: 3456,
        seller: "Nike",
        inStock: true,
        prime: true,
        description: "Nike's biggest heel Air unit yet delivers maximum comfort and style.",
        features: [
            "Air Max 270 heel unit",
            "Engineered mesh upper",
            "Rubber outsole with waffle pattern",
            "Available in multiple colors",
            "True to size fit"
        ]
    },
    {
        id: 8,
        title: "Chemical Guys Car Wash Kit (16 Items)",
        price: 89.99,
        originalPrice: 129.99,
        category: "automotive",
        image: "https://m.media-amazon.com/images/I/81LJFchIVOL._AC_SL1500_.jpg",
        rating: 4.5,
        reviewCount: 2341,
        seller: "Chemical Guys",
        inStock: true,
        prime: true,
        description: "Complete car care kit with everything needed for professional results.",
        features: [
            "16-piece complete kit",
            "Professional grade products",
            "Includes wash mitt and towels",
            "Safe for all paint types",
            "Step-by-step instructions included"
        ]
    }
];

// Jun's posted products (products sold by Jun)
const junProducts = [
    {
        id: 101,
        title: "Jun's Tech Review: MacBook Pro M3 Guide Book",
        price: 24.99,
        originalPrice: 29.99,
        category: "books",
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
        rating: 4.8,
        reviewCount: 156,
        seller: "jun",
        sellerProfile: junProfile,
        inStock: true,
        prime: false,
        description: "Comprehensive guide to getting the most out of your MacBook Pro M3, written by tech expert Jun.",
        features: [
            "200+ pages of detailed guides",
            "Performance optimization tips",
            "Software recommendations",
            "Troubleshooting section",
            "Regular updates included"
        ]
    },
    {
        id: 102,
        title: "Premium USB-C Hub by Jun Tech",
        price: 49.99,
        originalPrice: 69.99,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop",
        rating: 4.6,
        reviewCount: 89,
        seller: "jun",
        sellerProfile: junProfile,
        inStock: true,
        prime: false,
        description: "High-quality USB-C hub designed and tested by Jun for maximum compatibility.",
        features: [
            "7-in-1 connectivity",
            "4K HDMI output",
            "USB 3.0 super speed",
            "100W power delivery",
            "Aluminum construction"
        ]
    },
    {
        id: 103,
        title: "Jun's Productivity Planner 2024",
        price: 19.99,
        originalPrice: 24.99,
        category: "books",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        rating: 4.7,
        reviewCount: 234,
        seller: "jun",
        sellerProfile: junProfile,
        inStock: true,
        prime: false,
        description: "Scientifically designed productivity planner based on Jun's 5 years of research.",
        features: [
            "365-day planning system",
            "Goal tracking templates",
            "Time management techniques",
            "High-quality paper",
            "Compact portable size"
        ]
    }
];

// Jun's reviews on other products
const junReviews = [
    {
        productId: 1,
        rating: 5,
        title: "Absolutely love this iPhone!",
        content: "As a tech reviewer, I've tested many phones, but the iPhone 15 Pro Max truly stands out. The camera quality is exceptional, especially in low light. The titanium build feels premium and the battery life easily gets me through a full day of heavy usage. Highly recommended!",
        date: "2024-01-15",
        verified: true,
        helpful: 127
    },
    {
        productId: 3,
        rating: 4,
        title: "Great headphones with minor issues",
        content: "The noise canceling is indeed industry-leading, and the sound quality is superb. However, I found the touch controls can be a bit sensitive sometimes. The battery life is excellent though. Overall a solid purchase for the price.",
        date: "2024-01-08",
        verified: true,
        helpful: 89
    },
    {
        productId: 6,
        rating: 5,
        title: "Game changer for my kitchen!",
        content: "This Instant Pot has completely transformed how I cook. The versatility is amazing - I use it almost daily for different functions. The yogurt function is surprisingly good, and pressure cooking saves so much time. Worth every penny!",
        date: "2023-12-22",
        verified: true,
        helpful: 203
    }
];

// User's cart (stored in localStorage)
let cart = JSON.parse(localStorage.getItem('amazonCart')) || [];

// User's wishlist
let wishlist = JSON.parse(localStorage.getItem('amazonWishlist')) || [];

// User's order history
const orderHistory = [
    {
        id: "112-3456789-1234567",
        date: "2024-01-20",
        total: 1199.99,
        status: "Delivered",
        items: [
            {
                productId: 1,
                title: "Apple iPhone 15 Pro Max, 256GB",
                price: 1199.99,
                quantity: 1,
                image: "https://m.media-amazon.com/images/I/81Os1SDWpcL._AC_UY327_FMwebp_QL65_.jpg"
            }
        ],
        deliveryAddress: "123 Main St, New York, NY 10001"
    },
    {
        id: "112-3456789-1234568",
        date: "2024-01-15",
        total: 407.00,
        status: "Delivered",
        items: [
            {
                productId: 3,
                title: "Sony WH-1000XM5 Wireless Headphones",
                price: 328.00,
                quantity: 1,
                image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_UY327_FMwebp_QL65_.jpg"
            },
            {
                productId: 6,
                title: "Instant Pot Duo 7-in-1",
                price: 79.95,
                quantity: 1,
                image: "https://m.media-amazon.com/images/I/81vTlC7cWsL._AC_SL1500_.jpg"
            }
        ],
        deliveryAddress: "123 Main St, New York, NY 10001"
    },
    {
        id: "112-3456789-1234569",
        date: "2024-01-10",
        total: 149.48,
        status: "Delivered",
        items: [
            {
                productId: 7,
                title: "Nike Air Max 270 Men's Shoes",
                price: 129.99,
                quantity: 1,
                image: "https://m.media-amazon.com/images/I/51d+OSJgnnL._AC_UX679_.jpg"
            },
            {
                productId: 4,
                title: "The Seven Husbands of Evelyn Hugo",
                price: 13.49,
                quantity: 1,
                image: "https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UY327_FMwebp_QL65_.jpg"
            }
        ],
        deliveryAddress: "123 Main St, New York, NY 10001"
    }
];

// Search history
let searchHistory = JSON.parse(localStorage.getItem('amazonSearchHistory')) || [
    "iPhone 15",
    "wireless headphones",
    "instant pot",
    "nike shoes",
    "productivity planner"
];

// Recently viewed products
let recentlyViewed = JSON.parse(localStorage.getItem('amazonRecentlyViewed')) || [];

// Combine all products for search functionality
const allProducts = [...products, ...junProducts];

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        junProfile,
        categories,
        products,
        junProducts,
        junReviews,
        allProducts,
        cart,
        wishlist,
        orderHistory,
        searchHistory,
        recentlyViewed
    };
}
