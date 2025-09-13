// Amazon Website Simulation - Main JavaScript File

// Global variables
let currentView = 'home';
let currentProducts = [...allProducts];
let currentCategory = 'all';
let currentSearchTerm = '';
let currentSort = 'relevance';
let currentViewMode = 'grid';
let minPrice = 0;
let maxPrice = 10000;

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    loadFeaturedProducts();
    loadJunProducts();
    updateCartCounter();
    setupSearchFunctionality();
    setupEventListeners();
    loadRecentlyViewed();
    console.log('Amazon website initialized successfully');
}

// ==================== SEARCH FUNCTIONALITY ====================

function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    // Real-time search suggestions
    searchInput.addEventListener('input', function() {
        showSearchSuggestions(this.value);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Search button click
    searchBtn.addEventListener('click', performSearch);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });
}

function showSearchSuggestions(query) {
    if (query.length < 2) {
        hideSearchSuggestions();
        return;
    }
    
    const suggestions = getSearchSuggestions(query);
    if (suggestions.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    let suggestionBox = document.getElementById('searchSuggestions');
    if (!suggestionBox) {
        suggestionBox = document.createElement('div');
        suggestionBox.id = 'searchSuggestions';
        suggestionBox.className = 'search-suggestions';
        document.querySelector('.search-container').appendChild(suggestionBox);
    }
    
    suggestionBox.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
    ).join('');
    
    suggestionBox.style.display = 'block';
}

function hideSearchSuggestions() {
    const suggestionBox = document.getElementById('searchSuggestions');
    if (suggestionBox) {
        suggestionBox.style.display = 'none';
    }
}

function getSearchSuggestions(query) {
    const suggestions = new Set();
    const queryLower = query.toLowerCase();
    
    // Add from search history
    searchHistory.forEach(term => {
        if (term.toLowerCase().includes(queryLower)) {
            suggestions.add(term);
        }
    });
    
    // Add from product titles
    allProducts.forEach(product => {
        const title = product.title.toLowerCase();
        if (title.includes(queryLower)) {
            // Extract meaningful words from title
            const words = product.title.split(' ').slice(0, 4).join(' ');
            suggestions.add(words);
        }
    });
    
    return Array.from(suggestions).slice(0, 8);
}

function selectSuggestion(suggestion) {
    document.getElementById('searchInput').value = suggestion;
    hideSearchSuggestions();
    performSearch();
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    const category = document.querySelector('.search-category').value;
    
    if (!searchTerm) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    // Add to search history
    addToSearchHistory(searchTerm);
    
    // Filter products
    currentProducts = filterProducts(searchTerm, category);
    currentSearchTerm = searchTerm;
    currentCategory = category;
    
    // Update UI
    updateMainContent('search');
    hideSearchSuggestions();
    
    console.log(`Search performed: "${searchTerm}" in category "${category}", found ${currentProducts.length} results`);
}

function filterProducts(searchTerm, category) {
    let filtered = allProducts;
    
    // Filter by category
    if (category !== 'all') {
        filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(product => 
            product.title.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            product.seller.toLowerCase().includes(searchLower)
        );
    }
    
    return filtered;
}

function addToSearchHistory(term) {
    if (!searchHistory.includes(term)) {
        searchHistory.unshift(term);
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
        localStorage.setItem('amazonSearchHistory', JSON.stringify(searchHistory));
    }
}

// ==================== PRODUCT DISPLAY ====================

function loadFeaturedProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const featuredProducts = products.slice(0, 8);
    
    productsGrid.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
}

function loadJunProducts() {
    const junProductsGrid = document.getElementById('junProductsGrid');
    junProductsGrid.innerHTML = junProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    const stars = generateStars(product.rating);
    
    return `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/250x200?text=Image+Not+Available'">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                ${product.prime ? '<div class="prime-badge">Prime</div>' : ''}
            </div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${product.reviewCount.toLocaleString()})</span>
            </div>
            <div class="product-price">
                $${product.price.toFixed(2)}
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="seller-info">by ${product.seller}</div>
            ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})" 
                    ${!product.inStock ? 'disabled' : ''}>
                Add to Cart
            </button>
            <button class="buy-now" onclick="event.stopPropagation(); buyNow(${product.id})"
                    ${!product.inStock ? 'disabled' : ''}>
                Buy Now
            </button>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '☆';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// ==================== PRODUCT DETAIL MODAL ====================

function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Add to recently viewed
    addToRecentlyViewed(product);
    
    const modal = document.getElementById('productModal');
    const productDetail = document.getElementById('productDetail');
    
    const stars = generateStars(product.rating);
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    
    // Get Jun's review if exists
    const junReview = junReviews.find(review => review.productId === productId);
    
    productDetail.innerHTML = `
        <div class="product-detail-image">
            <img src="${product.image}" alt="${product.title}" 
                 onerror="this.src='https://via.placeholder.com/400x400?text=Image+Not+Available'">
            ${discount > 0 ? `<div class="discount-badge-large">-${discount}% OFF</div>` : ''}
        </div>
        <div class="product-detail-info">
            <h2 class="product-detail-title">${product.title}</h2>
            <div class="product-detail-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${product.rating} out of 5</span>
                <span class="rating-count">(${product.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div class="product-detail-price">
                $${product.price.toFixed(2)}
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="seller-info"><strong>Sold by:</strong> ${product.seller}</div>
            ${product.prime ? '<div class="prime-info">📦 FREE One-Day Delivery with Prime</div>' : ''}
            <div class="stock-info ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>
            
            <div class="product-detail-description">
                <h3>Product Description</h3>
                <p>${product.description}</p>
            </div>
            
            <div class="product-detail-features">
                <h3>Key Features</h3>
                <ul>
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            ${junReview ? `
                <div class="jun-review">
                    <h3>Review by Jun</h3>
                    <div class="review-rating">
                        <span class="stars">${generateStars(junReview.rating)}</span>
                        <span class="review-title">"${junReview.title}"</span>
                    </div>
                    <p class="review-content">${junReview.content}</p>
                    <div class="review-meta">
                        <span class="review-date">${new Date(junReview.date).toLocaleDateString()}</span>
                        ${junReview.verified ? '<span class="verified-purchase">✓ Verified Purchase</span>' : ''}
                        <span class="helpful-count">${junReview.helpful} people found this helpful</span>
                    </div>
                </div>
            ` : ''}
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <label for="quantity">Quantity:</label>
                    <select id="quantity">
                        ${Array.from({length: 10}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
                    </select>
                </div>
                <button class="add-to-cart large" onclick="addToCart(${product.id})" 
                        ${!product.inStock ? 'disabled' : ''}>
                    Add to Cart
                </button>
                <button class="buy-now large" onclick="buyNow(${product.id})"
                        ${!product.inStock ? 'disabled' : ''}>
                    Buy Now
                </button>
                <button class="add-to-wishlist" onclick="addToWishlist(${product.id})">
                    Add to Wish List
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ==================== CART FUNCTIONALITY ====================

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    if (!product.inStock) {
        showNotification('This product is currently out of stock', 'warning');
        return;
    }
    
    const quantitySelect = document.getElementById('quantity');
    const quantity = quantitySelect ? parseInt(quantitySelect.value) : 1;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            seller: product.seller,
            quantity: quantity
        });
    }
    
    updateCartStorage();
    updateCartCounter();
    showNotification(`${product.title} added to cart!`, 'success');
    
    console.log(`Added ${quantity} of product ${productId} to cart`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartStorage();
    updateCartCounter();
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartStorage();
            updateCartDisplay();
        }
    }
}

function updateCartStorage() {
    localStorage.setItem('amazonCart', JSON.stringify(cart));
}

function updateCartCounter() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    const cartModal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-seller">by ${item.seller}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
    
    cartModal.style.display = 'block';
}

function updateCartDisplay() {
    if (document.getElementById('cartModal').style.display === 'block') {
        showCart(); // Refresh cart display
    }
    updateCartCounter();
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function buyNow(productId) {
    addToCart(productId);
    showCart();
    showNotification('Redirecting to checkout...', 'info');
    // In a real application, this would redirect to checkout
}

// ==================== WISHLIST FUNCTIONALITY ====================

function addToWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = wishlist.find(item => item.id === productId);
    if (existingItem) {
        showNotification('Item already in wishlist', 'info');
        return;
    }
    
    wishlist.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        addedDate: new Date().toISOString()
    });
    
    localStorage.setItem('amazonWishlist', JSON.stringify(wishlist));
    showNotification('Added to wishlist!', 'success');
}

function showWishlist() {
    updateMainContent('wishlist');
}

// ==================== USER PROFILE & ACCOUNT ====================

function showProfile() {
    updateMainContent('profile');
}

function showOrders() {
    updateMainContent('orders');
}

function showRecommendations() {
    updateMainContent('recommendations');
}

// ==================== CATEGORY NAVIGATION ====================

function showCategory(category) {
    currentCategory = category;
    currentProducts = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    currentSearchTerm = '';
    
    document.getElementById('searchInput').value = '';
    updateMainContent('category');
}

// ==================== RECENTLY VIEWED ====================

function addToRecentlyViewed(product) {
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
    
    // Add to beginning
    recentlyViewed.unshift({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        viewedDate: new Date().toISOString()
    });
    
    // Keep only last 20 items
    if (recentlyViewed.length > 20) {
        recentlyViewed = recentlyViewed.slice(0, 20);
    }
    
    localStorage.setItem('amazonRecentlyViewed', JSON.stringify(recentlyViewed));
}

function loadRecentlyViewed() {
    // This would be called to display recently viewed products
    console.log(`Loaded ${recentlyViewed.length} recently viewed products`);
}

// ==================== MAIN CONTENT UPDATES ====================

function updateMainContent(view) {
    const mainContent = document.getElementById('mainContent');
    currentView = view;
    
    switch(view) {
        case 'search':
            mainContent.innerHTML = createSearchResultsHTML();
            break;
        case 'category':
            mainContent.innerHTML = createCategoryHTML();
            break;
        case 'profile':
            mainContent.innerHTML = createProfileHTML();
            break;
        case 'orders':
            mainContent.innerHTML = createOrdersHTML();
            break;
        case 'wishlist':
            mainContent.innerHTML = createWishlistHTML();
            break;
        case 'recommendations':
            mainContent.innerHTML = createRecommendationsHTML();
            break;
        default:
            loadFeaturedProducts();
            loadJunProducts();
    }
}

function createSearchResultsHTML() {
    const sortFilterControls = createSortFilterControls();
    
    return `
        <div class="search-results">
            <h2>Search Results for "${currentSearchTerm}" ${currentCategory !== 'all' ? `in ${categories[currentCategory]}` : ''}</h2>
            <div class="results-count">${currentProducts.length} results found</div>
            ${sortFilterControls}
            <div class="${currentViewMode === 'grid' ? 'products-grid' : 'products-list'}">
                ${currentViewMode === 'grid' ? 
                    currentProducts.map(product => createProductCard(product)).join('') :
                    currentProducts.map(product => createProductCardList(product)).join('')
                }
            </div>
            ${currentProducts.length === 0 ? '<div class="no-results">No products found. Try different search terms or adjust filters.</div>' : ''}
        </div>
    `;
}

function createCategoryHTML() {
    const sortFilterControls = createSortFilterControls();
    
    return `
        <div class="category-results">
            <h2>${categories[currentCategory] || 'All Products'}</h2>
            <div class="results-count">${currentProducts.length} products</div>
            ${sortFilterControls}
            <div class="${currentViewMode === 'grid' ? 'products-grid' : 'products-list'}">
                ${currentViewMode === 'grid' ? 
                    currentProducts.map(product => createProductCard(product)).join('') :
                    currentProducts.map(product => createProductCardList(product)).join('')
                }
            </div>
        </div>
    `;
}

function createProfileHTML() {
    return `
        <div class="profile-page">
            <div class="profile-header">
                <img src="${junProfile.profileImage}" alt="${junProfile.fullName}" class="profile-image">
                <div class="profile-info">
                    <h2>${junProfile.fullName}</h2>
                    <p class="username">@${junProfile.username}</p>
                    <p class="bio">${junProfile.bio}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-number">${junProfile.totalOrders}</span>
                            <span class="stat-label">Orders</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${junProfile.totalReviews}</span>
                            <span class="stat-label">Reviews</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${junProfile.sellerRating}</span>
                            <span class="stat-label">Seller Rating</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-sections">
                <div class="section">
                    <h3>Products by Jun</h3>
                    <div class="products-grid">
                        ${junProducts.map(product => createProductCard(product)).join('')}
                    </div>
                </div>
                <div class="section">
                    <h3>Jun's Recent Reviews</h3>
                    <div class="reviews-list">
                        ${junReviews.map(review => createReviewHTML(review)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createOrdersHTML() {
    return `
        <div class="orders-page">
            <h2>Your Orders</h2>
            <div class="orders-list">
                ${orderHistory.map(order => `
                    <div class="order-item">
                        <div class="order-header">
                            <div class="order-id">Order #${order.id}</div>
                            <div class="order-date">${new Date(order.date).toLocaleDateString()}</div>
                            <div class="order-total">$${order.total.toFixed(2)}</div>
                            <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
                        </div>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-product">
                                    <img src="${item.image}" alt="${item.title}" class="order-product-image">
                                    <div class="order-product-details">
                                        <div class="order-product-title">${item.title}</div>
                                        <div class="order-product-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-address">Delivered to: ${order.deliveryAddress}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createWishlistHTML() {
    return `
        <div class="wishlist-page">
            <h2>Your Wish List</h2>
            <div class="wishlist-items">
                ${wishlist.length === 0 ? '<div class="empty-wishlist">Your wish list is empty</div>' : 
                wishlist.map(item => `
                    <div class="wishlist-item">
                        <img src="${item.image}" alt="${item.title}" class="wishlist-image">
                        <div class="wishlist-details">
                            <h3 class="wishlist-title">${item.title}</h3>
                            <div class="wishlist-price">$${item.price.toFixed(2)}</div>
                            <div class="wishlist-actions">
                                <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>
                                <button class="remove-wishlist" onclick="removeFromWishlist(${item.id})">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createRecommendationsHTML() {
    const recommendedProducts = allProducts.slice(0, 12); // Simple recommendation logic
    return `
        <div class="recommendations-page">
            <h2>Recommended for You</h2>
            <p>Based on your browsing history and purchases</p>
            <div class="products-grid">
                ${recommendedProducts.map(product => createProductCard(product)).join('')}
            </div>
        </div>
    `;
}

function createReviewHTML(review) {
    const product = allProducts.find(p => p.id === review.productId);
    return `
        <div class="review-item">
            <div class="review-product">
                <img src="${product.image}" alt="${product.title}" class="review-product-image">
                <div class="review-product-title">${product.title}</div>
            </div>
            <div class="review-content-wrapper">
                <div class="review-rating">
                    <span class="stars">${generateStars(review.rating)}</span>
                    <span class="review-title">"${review.title}"</span>
                </div>
                <p class="review-content">${review.content}</p>
                <div class="review-meta">
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                    ${review.verified ? '<span class="verified-purchase">✓ Verified Purchase</span>' : ''}
                    <span class="helpful-count">${review.helpful} people found this helpful</span>
                </div>
            </div>
        </div>
    `;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('amazonWishlist', JSON.stringify(wishlist));
    if (currentView === 'wishlist') {
        updateMainContent('wishlist');
    }
    showNotification('Removed from wishlist', 'info');
}

// ==================== UTILITY FUNCTIONS ====================

function goHome() {
    currentView = 'home';
    currentCategory = 'all';
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="hero-banner">
            <div class="banner-content">
                <h2>Great deals on electronics</h2>
                <p>Shop the latest tech at unbeatable prices</p>
                <button class="cta-button" onclick="showCategory('electronics')">Shop now</button>
            </div>
            <img src="https://m.media-amazon.com/images/I/61jxqXl6PlL._AC_UL640_QL65_.jpg" alt="Hero Product" class="hero-image">
        </div>
        <div class="categories-grid">
            <div class="category-card" onclick="showCategory('electronics')">
                <h3>Electronics</h3>
                <img src="https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_UY327_FMwebp_QL65_.jpg" alt="Electronics">
                <a href="#">Shop electronics</a>
            </div>
            <div class="category-card" onclick="showCategory('books')">
                <h3>Books</h3>
                <img src="https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UY327_FMwebp_QL65_.jpg" alt="Books">
                <a href="#">Shop books</a>
            </div>
            <div class="category-card" onclick="showCategory('clothing')">
                <h3>Fashion</h3>
                <img src="https://m.media-amazon.com/images/I/51eg55uWmdL._AC_UX679_.jpg" alt="Fashion">
                <a href="#">Shop fashion</a>
            </div>
            <div class="category-card" onclick="showCategory('home')">
                <h3>Home & Kitchen</h3>
                <img src="https://m.media-amazon.com/images/I/81vTlC7cWsL._AC_SL1500_.jpg" alt="Home">
                <a href="#">Shop home</a>
            </div>
        </div>
        <div class="featured-section">
            <h2>Featured Products</h2>
            <div class="products-grid" id="productsGrid"></div>
        </div>
        <div class="seller-section">
            <h2>Products by Jun</h2>
            <div class="products-grid" id="junProductsGrid"></div>
        </div>
    `;
    
    loadFeaturedProducts();
    loadJunProducts();
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function setupEventListeners() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const productModal = document.getElementById('productModal');
        const cartModal = document.getElementById('cartModal');
        
        if (event.target === productModal) {
            closeModal();
        }
        if (event.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeCartModal();
            hideSearchSuggestions();
        }
    });
}

// ==================== ERROR HANDLING ====================

window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Handle image loading errors
document.addEventListener('error', function(event) {
    if (event.target.tagName === 'IMG') {
        event.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
    }
}, true);

// ==================== MOBILE MENU FUNCTIONALITY ====================

function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ==================== SORTING AND FILTERING ====================

function createSortFilterControls() {
    return `
        <div class="sort-filter-controls">
            <div class="sort-controls">
                <label for="sortSelect">Sort by:</label>
                <select id="sortSelect" onchange="handleSortChange(this.value)">
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="reviews">Most Reviews</option>
                </select>
            </div>
            <div class="view-toggle">
                <button class="view-btn ${currentViewMode === 'grid' ? 'active' : ''}" 
                        onclick="toggleView('grid')" title="Grid View">
                    <i class="fas fa-th"></i>
                </button>
                <button class="view-btn ${currentViewMode === 'list' ? 'active' : ''}" 
                        onclick="toggleView('list')" title="List View">
                    <i class="fas fa-list"></i>
                </button>
            </div>
        </div>
    `;
}

function handleSortChange(sortValue) {
    currentSort = sortValue;
    const sortedProducts = sortProducts([...currentProducts], sortValue);
    currentProducts = sortedProducts;
    renderProductsView();
    showNotification(`Sorted by ${getSortDisplayName(sortValue)}`, 'info');
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'reviews':
            return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        case 'newest':
            return sorted.sort((a, b) => b.id - a.id);
        case 'relevance':
        default:
            return sorted;
    }
}

function getSortDisplayName(sortValue) {
    const names = {
        'relevance': 'Relevance',
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low',
        'rating': 'Customer Rating',
        'newest': 'Newest Arrivals',
        'reviews': 'Most Reviews'
    };
    return names[sortValue] || 'Relevance';
}

function toggleView(viewMode) {
    currentViewMode = viewMode;
    renderProductsView();
    
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    buttons.forEach(btn => {
        if ((viewMode === 'grid' && btn.title === 'Grid View') || 
            (viewMode === 'list' && btn.title === 'List View')) {
            btn.classList.add('active');
        }
    });
    
    showNotification(`Switched to ${viewMode} view`, 'info');
}

// ==================== ENHANCED PRODUCT DISPLAY ====================

function renderProductsView() {
    const container = document.querySelector('.products-grid') || document.querySelector('.products-list');
    if (!container) return;
    
    if (currentViewMode === 'grid') {
        container.className = 'products-grid';
        container.innerHTML = currentProducts.map(product => createProductCard(product)).join('');
    } else {
        container.className = 'products-list';
        container.innerHTML = currentProducts.map(product => createProductCardList(product)).join('');
    }
}

function createProductCardList(product) {
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    const stars = generateStars(product.rating);
    
    return `
        <div class="product-card-list" onclick="showProductDetail(${product.id})">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/150x150?text=Image+Not+Available'">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                ${product.prime ? '<div class="prime-badge">Prime</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">(${product.reviewCount.toLocaleString()})</span>
                </div>
                <div class="product-price">
                    $${product.price.toFixed(2)}
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="seller-info">by ${product.seller}</div>
                <p class="product-description">${product.description}</p>
                ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
            <div class="product-actions">
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})" 
                        ${!product.inStock ? 'disabled' : ''}>
                    Add to Cart
                </button>
                <button class="buy-now" onclick="event.stopPropagation(); buyNow(${product.id})"
                        ${!product.inStock ? 'disabled' : ''}>
                    Buy Now
                </button>
            </div>
        </div>
    `;
}

// ==================== KEYBOARD NAVIGATION ====================

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Handle global keyboard shortcuts
        switch(event.key) {
            case 'Escape':
                closeModal();
                closeCartModal();
                closeMobileMenu();
                hideSearchSuggestions();
                break;
            case '/':
                if (!event.ctrlKey && !event.metaKey && !event.altKey && !isInputFocused()) {
                    event.preventDefault();
                    document.getElementById('searchInput').focus();
                }
                break;
        }
    });
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
    );
}

// ==================== ENHANCED INITIALIZATION ====================

function initializeWebsite() {
    loadFeaturedProducts();
    loadJunProducts();
    updateCartCounter();
    setupSearchFunctionality();
    setupEventListeners();
    setupKeyboardNavigation();
    loadRecentlyViewed();
    
    console.log('Amazon website initialized successfully with enhanced features');
}

console.log('Amazon simulation script loaded successfully');
