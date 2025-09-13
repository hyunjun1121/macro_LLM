// Airbnb Clone JavaScript - Complete functionality

class AirbnbApp {
    constructor() {
        this.currentUser = window.airbnbData.currentUser;
        this.listings = window.airbnbData.listings;
        this.users = window.airbnbData.users;
        this.reviews = window.airbnbData.reviews;
        this.experiences = window.airbnbData.experiences;
        this.searchUtils = window.airbnbData.searchUtils;
        this.storageUtils = window.airbnbData.storageUtils;
        
        this.filteredListings = [...this.listings];
        this.currentFilters = {
            location: '',
            checkin: '',
            checkout: '',
            guests: 0,
            category: 'all',
            minPrice: null,
            maxPrice: null,
            instantBook: false,
            superhost: false
        };
        
        this.guestCounts = {
            adults: 0,
            children: 0,
            infants: 0
        };
        
        this.favorites = this.storageUtils.getFavorites();
        this.searchHistory = this.storageUtils.getSearchHistory();
        this.bookings = this.storageUtils.getBookings();
        
        this.currentGalleryIndex = new Map();
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupIntersectionObserver();
        this.setupKeyboardNavigation();
        this.updateFavorites();
    }
    
    setupEventListeners() {
        // Search functionality
        const locationInput = document.getElementById('locationInput');
        const checkinInput = document.getElementById('checkinInput');
        const checkoutInput = document.getElementById('checkoutInput');
        const searchBtn = document.querySelector('.search-btn');
        
        if (locationInput) {
            locationInput.addEventListener('input', this.debounce(() => {
                this.updateSearch();
            }, 300));
        }
        
        if (checkinInput) {
            checkinInput.addEventListener('change', () => this.updateSearch());
        }
        
        if (checkoutInput) {
            checkoutInput.addEventListener('change', () => this.updateSearch());
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.applyFilter(filter);
            });
        });
        
        // Guest selector
        const guestSelector = document.querySelector('.guest-selector');
        if (guestSelector) {
            guestSelector.addEventListener('click', () => this.toggleGuestMenu());
        }
        
        // Guest counters
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="updateGuests"]')) {
                e.preventDefault();
                const onclick = e.target.getAttribute('onclick');
                const matches = onclick.match(/updateGuests\('(\w+)', (-?\d+)\)/);
                if (matches) {
                    this.updateGuests(matches[1], parseInt(matches[2]));
                }
            }
        });
        
        // Profile menu
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.toggleProfileMenu());
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.guest-menu')) {
                this.closeGuestMenu();
            }
            if (!e.target.closest('.profile-menu')) {
                this.closeProfileMenu();
            }
        });
        
        // Search tabs
        const searchTabs = document.querySelectorAll('.search-tab');
        searchTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchSearchTab(tab.dataset.tab));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                locationInput?.focus();
            }
        });
        
        // Infinite scroll
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 100));
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    setupIntersectionObserver() {
        // Lazy loading for images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        // Animation observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });
        
        // Apply observers to existing elements
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        document.querySelectorAll('.listing-card').forEach(card => {
            animationObserver.observe(card);
        });
        
        this.imageObserver = imageObserver;
        this.animationObserver = animationObserver;
    }
    
    setupKeyboardNavigation() {
        // ARIA roles and keyboard navigation
        const cards = document.querySelectorAll('.listing-card');
        cards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View ${card.querySelector('.listing-location')?.textContent || 'property'}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.viewListing(card.dataset.listingId);
                }
            });
        });
    }
    
    loadInitialData() {
        this.renderListings();
        this.updateGuestDisplay();
        this.setMinDates();
    }
    
    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = document.getElementById('checkinInput');
        const checkoutInput = document.getElementById('checkoutInput');
        
        if (checkinInput) {
            checkinInput.min = today;
            checkinInput.addEventListener('change', () => {
                if (checkoutInput) {
                    checkoutInput.min = checkinInput.value;
                }
            });
        }
    }
    
    // Search functionality
    updateSearch() {
        const locationInput = document.getElementById('locationInput');
        const checkinInput = document.getElementById('checkinInput');
        const checkoutInput = document.getElementById('checkoutInput');
        
        this.currentFilters.location = locationInput?.value || '';
        this.currentFilters.checkin = checkinInput?.value || '';
        this.currentFilters.checkout = checkoutInput?.value || '';
        
        this.applyFilters();
    }
    
    performSearch() {
        const query = {
            location: this.currentFilters.location,
            checkin: this.currentFilters.checkin,
            checkout: this.currentFilters.checkout,
            guests: this.currentFilters.guests,
            timestamp: new Date().toISOString()
        };
        
        // Add to search history
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, 10);
        this.storageUtils.saveSearchHistory(this.searchHistory);
        
        // Apply filters and show results
        this.applyFilters();
        this.showMessage('Searching for the perfect places...', 'success');
        
        // Scroll to results
        const listingsGrid = document.getElementById('listingsGrid');
        if (listingsGrid) {
            listingsGrid.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    applyFilter(category) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.currentFilters.category = category;
        this.applyFilters();
    }
    
    applyFilters() {
        this.showLoading();
        
        setTimeout(() => {
            let filtered = [...this.listings];
            
            // Apply location filter
            if (this.currentFilters.location) {
                filtered = this.searchUtils.filterByLocation(filtered, this.currentFilters.location);
            }
            
            // Apply category filter
            filtered = this.searchUtils.filterByCategory(filtered, this.currentFilters.category);
            
            // Apply guest filter
            if (this.currentFilters.guests > 0) {
                filtered = this.searchUtils.filterByGuests(filtered, this.currentFilters.guests);
            }
            
            // Apply price filter
            if (this.currentFilters.minPrice || this.currentFilters.maxPrice) {
                filtered = this.searchUtils.filterByPrice(
                    filtered, 
                    this.currentFilters.minPrice, 
                    this.currentFilters.maxPrice
                );
            }
            
            // Apply date filter
            if (this.currentFilters.checkin && this.currentFilters.checkout) {
                filtered = this.searchUtils.filterByDates(
                    filtered, 
                    this.currentFilters.checkin, 
                    this.currentFilters.checkout
                );
            }
            
            // Apply instant book filter
            if (this.currentFilters.instantBook) {
                filtered = filtered.filter(listing => listing.instantBook);
            }
            
            // Apply superhost filter
            if (this.currentFilters.superhost) {
                filtered = filtered.filter(listing => listing.superhost);
            }
            
            this.filteredListings = filtered;
            this.hideLoading();
            this.renderListings();
        }, 500);
    }
    
    // Guest selection
    toggleGuestMenu() {
        const guestMenu = document.getElementById('guestMenu');
        if (guestMenu) {
            guestMenu.classList.toggle('active');
        }
    }
    
    closeGuestMenu() {
        const guestMenu = document.getElementById('guestMenu');
        if (guestMenu) {
            guestMenu.classList.remove('active');
        }
    }
    
    updateGuests(type, change) {
        const currentCount = this.guestCounts[type];
        const newCount = Math.max(0, currentCount + change);
        
        // Limit maximum guests
        if (type === 'adults' && newCount > 16) return;
        if (type === 'children' && newCount > 8) return;
        if (type === 'infants' && newCount > 5) return;
        
        this.guestCounts[type] = newCount;
        
        // Update display
        const countElement = document.getElementById(type);
        if (countElement) {
            countElement.textContent = newCount;
        }
        
        // Update buttons
        const container = countElement?.closest('.guest-option');
        if (container) {
            const buttons = container.querySelectorAll('button');
            if (buttons[0]) buttons[0].disabled = newCount === 0;
        }
        
        // Update total guest count
        this.currentFilters.guests = this.guestCounts.adults + this.guestCounts.children;
        this.updateGuestDisplay();
    }
    
    updateGuestDisplay() {
        const guestCountElement = document.getElementById('guestCount');
        if (guestCountElement) {
            const totalGuests = this.currentFilters.guests;
            const infants = this.guestCounts.infants;
            
            if (totalGuests === 0 && infants === 0) {
                guestCountElement.textContent = 'Add guests';
            } else {
                let text = '';
                if (totalGuests > 0) {
                    text += `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
                }
                if (infants > 0) {
                    if (text) text += ', ';
                    text += `${infants} infant${infants > 1 ? 's' : ''}`;
                }
                guestCountElement.textContent = text;
            }
        }
    }
    
    // Profile menu
    toggleProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
    
    closeProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
    
    closeAllDropdowns() {
        this.closeGuestMenu();
        this.closeProfileMenu();
    }
    
    // Tab switching
    switchSearchTab(tab) {
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // In a real app, this would show different search forms
        console.log(`Switched to ${tab} tab`);
    }
    
    // Listing rendering
    renderListings() {
        const grid = document.getElementById('listingsGrid');
        const noResults = document.getElementById('noResults');
        
        if (!grid) return;
        
        if (this.filteredListings.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        if (noResults) noResults.style.display = 'none';
        
        const listingCards = this.filteredListings.map(listing => this.createListingCard(listing));
        grid.innerHTML = listingCards.join('');
        
        // Re-apply observers to new elements
        this.setupCardObservers();
        this.setupGalleryNavigation();
    }
    
    createListingCard(listing) {
        const host = this.users.find(u => u.id === listing.hostId);
        const isFavorite = this.favorites.includes(listing.id);
        const imageGallery = this.createImageGallery(listing);
        
        return `
            <div class="listing-card" data-listing-id="${listing.id}" onclick="viewListing('${listing.id}')">
                ${imageGallery}
                
                <button class="listing-favorite ${isFavorite ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${listing.id}')"
                        aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-heart"></i>
                </button>
                
                <div class="listing-content">
                    <div class="listing-header">
                        <div>
                            ${listing.superhost ? '<span class="listing-superhost">Superhost</span>' : ''}
                            <div class="listing-location">${listing.location}</div>
                            <div class="listing-host">Hosted by ${host?.name || 'Host'}</div>
                        </div>
                        <div class="listing-rating">
                            <i class="fas fa-star"></i>
                            <span>${listing.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <div class="listing-dates">
                        ${this.getListingDates(listing)}
                    </div>
                    
                    <div class="listing-price">
                        <span class="amount">$${listing.price}</span>
                        <span class="period">night</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createImageGallery(listing) {
        if (listing.images.length === 1) {
            return `
                <div class="listing-image-container">
                    <img class="listing-image" src="${listing.images[0]}" alt="${listing.title}" loading="lazy">
                </div>
            `;
        }
        
        return `
            <div class="listing-gallery" data-listing-id="${listing.id}">
                <div class="listing-gallery-images">
                    ${listing.images.map(img => `
                        <img class="listing-gallery-image" src="${img}" alt="${listing.title}" loading="lazy">
                    `).join('')}
                </div>
                <button class="gallery-nav prev" onclick="event.stopPropagation(); previousImage('${listing.id}')" aria-label="Previous image">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="gallery-nav next" onclick="event.stopPropagation(); nextImage('${listing.id}')" aria-label="Next image">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }
    
    getListingDates(listing) {
        if (this.currentFilters.checkin && this.currentFilters.checkout) {
            const checkin = new Date(this.currentFilters.checkin);
            const checkout = new Date(this.currentFilters.checkout);
            return `${checkin.toLocaleDateString()} - ${checkout.toLocaleDateString()}`;
        }
        return `Available dates`;
    }
    
    setupCardObservers() {
        document.querySelectorAll('.listing-card').forEach(card => {
            if (this.animationObserver) {
                this.animationObserver.observe(card);
            }
        });
        
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            }
        });
    }
    
    setupGalleryNavigation() {
        document.querySelectorAll('.listing-gallery').forEach(gallery => {
            const listingId = gallery.dataset.listingId;
            this.currentGalleryIndex.set(listingId, 0);
            this.updateGalleryDisplay(listingId);
        });
    }
    
    // Gallery navigation
    previousImage(listingId) {
        const currentIndex = this.currentGalleryIndex.get(listingId) || 0;
        const listing = this.listings.find(l => l.id === listingId);
        const newIndex = currentIndex === 0 ? listing.images.length - 1 : currentIndex - 1;
        this.currentGalleryIndex.set(listingId, newIndex);
        this.updateGalleryDisplay(listingId);
    }
    
    nextImage(listingId) {
        const currentIndex = this.currentGalleryIndex.get(listingId) || 0;
        const listing = this.listings.find(l => l.id === listingId);
        const newIndex = (currentIndex + 1) % listing.images.length;
        this.currentGalleryIndex.set(listingId, newIndex);
        this.updateGalleryDisplay(listingId);
    }
    
    updateGalleryDisplay(listingId) {
        const gallery = document.querySelector(`[data-listing-id="${listingId}"] .listing-gallery-images`);
        const index = this.currentGalleryIndex.get(listingId) || 0;
        
        if (gallery) {
            gallery.style.transform = `translateX(-${index * 100}%)`;
        }
    }
    
    // Favorites
    toggleFavorite(listingId) {
        const index = this.favorites.indexOf(listingId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showMessage('Removed from favorites', 'success');
        } else {
            this.favorites.push(listingId);
            this.showMessage('Added to favorites', 'success');
        }
        
        this.storageUtils.saveFavorites(this.favorites);
        this.updateFavorites();
    }
    
    updateFavorites() {
        document.querySelectorAll('.listing-favorite').forEach(btn => {
            const listingId = btn.closest('.listing-card').dataset.listingId;
            const isFavorite = this.favorites.includes(listingId);
            
            btn.classList.toggle('active', isFavorite);
            btn.setAttribute('aria-label', 
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
            );
        });
    }
    
    // Navigation
    viewListing(listingId) {
        // In a real app, this would navigate to the listing detail page
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            this.openListingModal(listing);
        }
    }
    
    openListingModal(listing) {
        const host = this.users.find(u => u.id === listing.hostId);
        const reviews = this.reviews.filter(r => r.listingId === listing.id);
        
        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()" aria-hidden="false">
                <div class="modal-content listing-modal" onclick="event.stopPropagation()" role="dialog" aria-labelledby="modal-title">
                    <button class="modal-close" onclick="closeModal()" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="listing-modal-content">
                        <h1 id="modal-title">${listing.title}</h1>
                        
                        <div class="listing-modal-header">
                            <div class="listing-rating">
                                <i class="fas fa-star"></i>
                                <span>${listing.rating.toFixed(1)}</span>
                                <span>(${listing.reviewCount} reviews)</span>
                            </div>
                            <div class="listing-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${listing.location}
                            </div>
                        </div>
                        
                        <div class="listing-modal-images">
                            ${listing.images.map(img => `
                                <img src="${img}" alt="${listing.title}" onclick="openImageGallery('${listing.id}')">
                            `).join('')}
                        </div>
                        
                        <div class="listing-modal-info">
                            <div class="listing-details">
                                <h2>About this space</h2>
                                <p>${listing.description}</p>
                                
                                <div class="listing-specs">
                                    <span><i class="fas fa-users"></i> ${listing.maxGuests} guests</span>
                                    <span><i class="fas fa-bed"></i> ${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? 's' : ''}</span>
                                    <span><i class="fas fa-bath"></i> ${listing.bathrooms} bathroom${listing.bathrooms !== 1 ? 's' : ''}</span>
                                </div>
                                
                                <div class="listing-amenities">
                                    <h3>Amenities</h3>
                                    <div class="amenities-list">
                                        ${listing.amenities?.slice(0, 6).map(amenity => `
                                            <span class="amenity-tag">${amenity}</span>
                                        `).join('') || ''}
                                    </div>
                                    ${listing.amenities?.length > 6 ? `<button class="show-all-amenities">Show all ${listing.amenities.length} amenities</button>` : ''}
                                </div>
                                
                                <div class="host-section">
                                    <h3>Hosted by ${host?.name}</h3>
                                    <div class="host-info">
                                        <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar">
                                        <div class="host-details">
                                            <p>${host?.bio || 'Great host!'}</p>
                                            ${host?.superhost ? '<span class="superhost-badge">Superhost</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                                
                                ${reviews.length > 0 ? `
                                <div class="reviews-section">
                                    <h3>Reviews (${reviews.length})</h3>
                                    <div class="reviews-list">
                                        ${reviews.slice(0, 3).map(review => `
                                            <div class="review-item">
                                                <div class="review-header">
                                                    <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                                                    <div class="reviewer-info">
                                                        <h4>${review.userName}</h4>
                                                        <div class="review-rating">
                                                            ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                                                        </div>
                                                    </div>
                                                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                                                </div>
                                                <p class="review-text">${review.text}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                    ${reviews.length > 3 ? '<button class="show-all-reviews">Show all reviews</button>' : ''}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="booking-widget">
                                <div class="booking-header">
                                    <div class="booking-price">
                                        <span class="price-amount">$${listing.price}</span>
                                        <span class="price-period">night</span>
                                    </div>
                                    <div class="booking-rating">
                                        <i class="fas fa-star"></i>
                                        <span>${listing.rating.toFixed(1)}</span>
                                        <span>(${listing.reviewCount})</span>
                                    </div>
                                </div>
                                
                                <form class="booking-form" onsubmit="bookListing('${listing.id}'); return false;">
                                    <div class="booking-dates">
                                        <div class="date-field">
                                            <label>Check in</label>
                                            <input type="date" id="modal-checkin" required>
                                        </div>
                                        <div class="date-field">
                                            <label>Check out</label>
                                            <input type="date" id="modal-checkout" required>
                                        </div>
                                    </div>
                                    
                                    <div class="booking-guests">
                                        <label>Guests</label>
                                        <select id="modal-guests" required>
                                            ${Array.from({length: listing.maxGuests}, (_, i) => `
                                                <option value="${i + 1}">${i + 1} guest${i > 0 ? 's' : ''}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <button type="submit" class="book-btn">
                                        ${listing.instantBook ? 'Book now' : 'Request to book'}
                                    </button>
                                </form>
                                
                                <div class="booking-note">
                                    You won't be charged yet
                                </div>
                                
                                <div class="booking-breakdown">
                                    <div class="cost-item">
                                        <span>$${listing.price} x <span id="nights-count">0</span> nights</span>
                                        <span id="subtotal">$0</span>
                                    </div>
                                    <div class="cost-item">
                                        <span>Service fee</span>
                                        <span id="service-fee">$0</span>
                                    </div>
                                    <div class="cost-item total">
                                        <span>Total</span>
                                        <span id="total-cost">$0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Setup modal functionality
        this.setupModalBooking(listing);
        
        // Focus management for accessibility
        const modal = document.querySelector('.modal-content');
        modal.focus();
        
        // Trap focus within modal
        this.trapFocus(modal);
    }
    
    setupModalBooking(listing) {
        const checkinInput = document.getElementById('modal-checkin');
        const checkoutInput = document.getElementById('modal-checkout');
        const guestsSelect = document.getElementById('modal-guests');
        
        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        checkinInput.min = today;
        
        checkinInput.addEventListener('change', () => {
            checkoutInput.min = checkinInput.value;
            this.updateBookingCosts(listing);
        });
        
        checkoutInput.addEventListener('change', () => {
            this.updateBookingCosts(listing);
        });
        
        guestsSelect.addEventListener('change', () => {
            this.updateBookingCosts(listing);
        });
    }
    
    updateBookingCosts(listing) {
        const checkin = document.getElementById('modal-checkin').value;
        const checkout = document.getElementById('modal-checkout').value;
        
        if (checkin && checkout) {
            const startDate = new Date(checkin);
            const endDate = new Date(checkout);
            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            if (nights > 0) {
                const subtotal = listing.price * nights;
                const serviceFee = Math.round(subtotal * 0.14);
                const total = subtotal + serviceFee;
                
                document.getElementById('nights-count').textContent = nights;
                document.getElementById('subtotal').textContent = `$${subtotal}`;
                document.getElementById('service-fee').textContent = `$${serviceFee}`;
                document.getElementById('total-cost').textContent = `$${total}`;
            }
        }
    }
    
    bookListing(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        const checkin = document.getElementById('modal-checkin').value;
        const checkout = document.getElementById('modal-checkout').value;
        const guests = document.getElementById('modal-guests').value;
        
        if (!checkin || !checkout || !guests) {
            this.showMessage('Please fill in all booking details', 'error');
            return;
        }
        
        const booking = {
            id: 'booking_' + Date.now(),
            listingId: listingId,
            userId: this.currentUser.id,
            checkin: checkin,
            checkout: checkout,
            guests: parseInt(guests),
            status: listing.instantBook ? 'confirmed' : 'pending',
            bookedAt: new Date().toISOString(),
            totalCost: document.getElementById('total-cost').textContent
        };
        
        this.storageUtils.saveBooking(booking);
        this.closeModal();
        
        this.showMessage(
            listing.instantBook ? 
                'Booking confirmed! Check your email for details.' : 
                'Booking request sent! The host will respond within 24 hours.',
            'success'
        );
    }
    
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
    
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    // Loading states
    showLoading() {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('listingsGrid');
        
        if (loading) loading.style.display = 'flex';
        if (grid) grid.style.opacity = '0.5';
        this.isLoading = true;
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('listingsGrid');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.opacity = '1';
        this.isLoading = false;
    }
    
    // Messages
    showMessage(text, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.toast-message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `toast-message ${type}`;
        message.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${text}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast-message {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    max-width: 300px;
                }
                .toast-message.success { border-left: 4px solid #28a745; }
                .toast-message.error { border-left: 4px solid #dc3545; }
                .toast-content { display: flex; align-items: center; gap: 8px; flex: 1; }
                .toast-close { background: none; border: none; cursor: pointer; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    }
    
    // Scroll handling
    handleScroll() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        
        if (scrolled > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        
        // Infinite scroll (for future implementation)
        if ((window.innerHeight + scrolled) >= document.body.offsetHeight - 1000) {
            // Load more listings
        }
    }
    
    // Window resize handling
    handleResize() {
        // Adjust layout for mobile
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
    }
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Global functions for onclick handlers
function viewListing(listingId) {
    window.airbnbApp.viewListing(listingId);
}

function toggleFavorite(listingId) {
    window.airbnbApp.toggleFavorite(listingId);
}

function previousImage(listingId) {
    window.airbnbApp.previousImage(listingId);
}

function nextImage(listingId) {
    window.airbnbApp.nextImage(listingId);
}

function closeModal() {
    window.airbnbApp.closeModal();
}

function bookListing(listingId) {
    window.airbnbApp.bookListing(listingId);
}

function applyFilter(category) {
    window.airbnbApp.applyFilter(category);
}

function updateGuests(type, change) {
    window.airbnbApp.updateGuests(type, change);
}

function toggleGuestMenu() {
    window.airbnbApp.toggleGuestMenu();
}

function toggleProfileMenu() {
    window.airbnbApp.toggleProfileMenu();
}

function performSearch() {
    window.airbnbApp.performSearch();
}

function switchMode(mode) {
    window.airbnbApp.switchSearchTab(mode);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.airbnbApp = new AirbnbApp();
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
