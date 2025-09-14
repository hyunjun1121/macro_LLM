// When2Meet Service Worker
// Provides offline functionality and caching

const CACHE_NAME = 'when2meet-v1.0.0';
const CACHE_URLS = [
    '/when2meet/',
    '/when2meet/index.html',
    '/when2meet/create.html',
    '/when2meet/event.html',
    '/when2meet/dashboard.html',
    '/when2meet/404.html',
    '/when2meet/styles.css',
    '/when2meet/script.js',
    '/when2meet/utils.js',
    '/when2meet/data.js',
    '/when2meet/create-script.js',
    '/when2meet/event-script.js',
    '/when2meet/dashboard-script.js',
    '/when2meet/favicon.svg',
    '/when2meet/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhiJ-Ek-_EeAmM.woff2'
];

// Install Service Worker and cache resources
self.addEventListener('install', event => {
    console.log('When2Meet Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app resources...');
                return cache.addAll(CACHE_URLS.map(url => {
                    // Handle relative URLs
                    if (url.startsWith('/')) {
                        return new Request(url, { mode: 'no-cors' });
                    }
                    return url;
                }));
            })
            .catch(error => {
                console.error('Failed to cache resources:', error);
            })
    );
    
    // Force the service worker to become active immediately
    self.skipWaiting();
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', event => {
    console.log('When2Meet Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients immediately
    event.waitUntil(clients.claim());
});

// Fetch Event - Cache-first strategy for static resources, network-first for dynamic content
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external APIs (except fonts)
    if (url.origin !== location.origin && !url.hostname.includes('googleapis') && !url.hostname.includes('gstatic')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // For static resources, return cache first
                if (isStaticResource(request.url)) {
                    if (cachedResponse) {
                        // Update cache in background
                        fetchAndCache(request);
                        return cachedResponse;
                    }
                }
                
                // For dynamic content or if not cached, fetch from network
                return fetchAndCache(request)
                    .catch(() => {
                        // If network fails, try cache
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // If no cache and network fails, return offline page for HTML requests
                        if (request.destination === 'document') {
                            return caches.match('/when2meet/404.html');
                        }
                        
                        // For other resources, throw error
                        throw new Error('Network and cache both failed');
                    });
            })
    );
});

// Helper function to determine if resource is static
function isStaticResource(url) {
    const staticExtensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2'];
    const staticPaths = ['/when2meet/favicon.svg', '/when2meet/manifest.json'];
    
    return staticExtensions.some(ext => url.endsWith(ext)) || 
           staticPaths.some(path => url.includes(path)) ||
           url.includes('fonts.googleapis.com') ||
           url.includes('fonts.gstatic.com');
}

// Helper function to fetch and cache resources
function fetchAndCache(request) {
    return fetch(request)
        .then(response => {
            // Only cache successful responses
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            // Clone response for caching
            const responseToCache = response.clone();
            
            // Cache the response
            caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(request, responseToCache);
                })
                .catch(error => {
                    console.warn('Failed to cache resource:', request.url, error);
                });
            
            return response;
        });
}

// Handle background sync (for offline event creation)
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'event-creation') {
        event.waitUntil(
            syncEventCreation()
        );
    }
});

// Sync offline event creation
async function syncEventCreation() {
    try {
        // Get pending events from IndexedDB or localStorage
        const pendingEvents = await getPendingEvents();
        
        for (const event of pendingEvents) {
            try {
                // Attempt to sync with server (in a real app)
                console.log('Syncing event:', event.title);
                
                // Remove from pending after successful sync
                await removePendingEvent(event.id);
                
                // Notify user of successful sync
                self.registration.showNotification('Event Created', {
                    body: `"${event.title}" has been created successfully`,
                    icon: '/when2meet/favicon.svg',
                    tag: 'event-sync'
                });
                
            } catch (syncError) {
                console.error('Failed to sync event:', event.title, syncError);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Helper functions for offline data management
async function getPendingEvents() {
    // In a real app, this would read from IndexedDB
    // For now, return empty array
    return [];
}

async function removePendingEvent(eventId) {
    // In a real app, this would remove from IndexedDB
    console.log('Removing pending event:', eventId);
}

// Handle push notifications (for event reminders)
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'You have a meeting coming up!',
        icon: '/when2meet/favicon.svg',
        badge: '/when2meet/favicon.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View Event',
                icon: '/when2meet/favicon.svg'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/when2meet/favicon.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('When2Meet Reminder', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'view') {
        // Open the app to the relevant event
        event.waitUntil(
            clients.openWindow('/when2meet/dashboard.html')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        console.log('Notification dismissed');
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/when2meet/')
        );
    }
});

// Log service worker events for debugging
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled promise rejection:', event.reason);
});

console.log('When2Meet Service Worker loaded successfully');
