// Mock data for When2Meet clone
// This includes jun account and various events/posts

// Current logged-in user
const currentUser = {
    id: 'user_jun',
    username: 'jun',
    email: 'jun@example.com',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAxMmMxLjY1NDQgMCAzLTEuMzQ1NiAzLTNzLTEuMzQ1Ni0zLTMtMy0zIDEuMzQ1Ni0zIDMgMS4zNDU2IDMgMyAzem0wIDFjLTIuMDA0NCAwLTYgMS4wMDc4LTYgM3YxaDE2di0xYzAtMS45OTIyLTMuOTk1Ni0zLTYtM3oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    timezone: 'America/New_York',
    preferences: {
        defaultEventDuration: 2,
        timeFormat: '12h',
        notifications: true
    },
    stats: {
        eventsCreated: 12,
        totalParticipants: 48,
        activeEvents: 7,
        completedEvents: 5
    }
};

// All users in the system
const users = {
    user_jun: {
        id: 'user_jun',
        username: 'jun',
        email: 'jun@example.com',
        avatar: currentUser.avatar,
        timezone: 'America/New_York'
    },
    user_alice: {
        id: 'user_alice',
        username: 'alice',
        email: 'alice@example.com',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFRjQ0NDQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAxMmMxLjY1NDQgMCAzLTEuMzQ1NiAzLTNzLTEuMzQ1Ni0zLTMtMy0zIDEuMzQ1Ni0zIDMgMS4zNDU2IDMgMyAzem0wIDFjLTIuMDA0NCAwLTYgMS4wMDc4LTYgM3YxaDE2di0xYzAtMS45OTIyLTMuOTk1Ni0zLTYtM3oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        timezone: 'America/Los_Angeles'
    },
    user_bob: {
        id: 'user_bob',
        username: 'bob',
        email: 'bob@example.com',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAxMmMxLjY1NDQgMCAzLTEuMzQ1NiAzLTNzLTEuMzQ1Ni0zLTMtMy0zIDEuMzQ1Ni0zIDMgMS4zNDU2IDMgMyAzem0wIDFjLTIuMDA0NCAwLTYgMS4wMDc4LTYgM3YxaDE2di0xYzAtMS45OTIyLTMuOTk1Ni0zLTYtM3oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        timezone: 'Europe/London'
    },
    user_carol: {
        id: 'user_carol',
        username: 'carol',
        email: 'carol@example.com',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGNTlFMEIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAxMmMxLjY1NDQgMCAzLTEuMzQ1NiAzLTNzLTEuMzQ1Ni0zLTMtMy0zIDEuMzQ1Ni0zIDMgMS4zNDU2IDMgMyAzem0wIDFjLTIuMDA0NCAwLTYgMS4wMDc4LTYgM3YxaDE2di0xYzAtMS45OTIyLTMuOTk1Ni0zLTYtM3oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        timezone: 'Asia/Tokyo'
    },
    user_david: {
        id: 'user_david',
        username: 'david',
        email: 'david@example.com',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAxMmMxLjY1NDQgMCAzLTEuMzQ1NiAzLTNzLTEuMzQ1Ni0zLTMtMy0zIDEuMzQ1Ni0zIDMgMS4zNDU2IDMgMyAzem0wIDFjLTIuMDA0NCAwLTYgMS4wMDc4LTYgM3YxaDE2di0xYzAtMS45OTIyLTMuOTk1Ni0zLTYtM3oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        timezone: 'Australia/Sydney'
    }
};

// Events/meetings data - includes events created by jun
const events = {
    event_1: {
        id: 'event_1',
        title: 'Weekly Team Standup',
        description: 'Our regular weekly team standup to discuss progress, blockers, and upcoming tasks.',
        creator: 'user_jun',
        createdAt: '2024-09-10T10:00:00Z',
        status: 'active',
        isPublic: false,
        eventCode: 'TEAM2024',
        dateRange: {
            start: '2024-09-16',
            end: '2024-09-20'
        },
        timeRange: {
            start: '09:00',
            end: '18:00'
        },
        timeSlotDuration: 30, // minutes
        timezone: 'America/New_York',
        participants: ['user_jun', 'user_alice', 'user_bob', 'user_carol'],
        responses: {
            user_jun: {
                '2024-09-16_09:00': 'available',
                '2024-09-16_09:30': 'available',
                '2024-09-16_10:00': 'available',
                '2024-09-16_10:30': 'available',
                '2024-09-17_14:00': 'available',
                '2024-09-17_14:30': 'available',
                '2024-09-17_15:00': 'available'
            },
            user_alice: {
                '2024-09-16_10:00': 'available',
                '2024-09-16_10:30': 'available',
                '2024-09-16_11:00': 'available',
                '2024-09-17_14:00': 'maybe',
                '2024-09-17_14:30': 'available',
                '2024-09-17_15:00': 'available'
            },
            user_bob: {
                '2024-09-16_09:30': 'available',
                '2024-09-16_10:00': 'available',
                '2024-09-16_10:30': 'available',
                '2024-09-17_14:30': 'available',
                '2024-09-17_15:00': 'maybe'
            },
            user_carol: {
                '2024-09-16_10:00': 'available',
                '2024-09-16_10:30': 'available',
                '2024-09-17_14:00': 'available',
                '2024-09-17_14:30': 'available',
                '2024-09-17_15:00': 'available'
            }
        },
        tags: ['work', 'weekly', 'team'],
        settings: {
            allowMaybe: true,
            showParticipantNames: true,
            requireAuth: false,
            autoReminders: true
        }
    },
    event_2: {
        id: 'event_2',
        title: 'Q4 Planning Workshop',
        description: 'Strategic planning session for Q4 objectives, budget allocation, and team goals.',
        creator: 'user_jun',
        createdAt: '2024-09-08T15:30:00Z',
        status: 'active',
        isPublic: false,
        eventCode: 'Q4PLAN',
        dateRange: {
            start: '2024-09-23',
            end: '2024-09-27'
        },
        timeRange: {
            start: '08:00',
            end: '17:00'
        },
        timeSlotDuration: 60,
        timezone: 'America/New_York',
        participants: ['user_jun', 'user_alice', 'user_bob', 'user_david'],
        responses: {
            user_jun: {
                '2024-09-23_09:00': 'available',
                '2024-09-23_10:00': 'available',
                '2024-09-23_11:00': 'available',
                '2024-09-24_14:00': 'available',
                '2024-09-24_15:00': 'available',
                '2024-09-24_16:00': 'available'
            },
            user_alice: {
                '2024-09-23_10:00': 'available',
                '2024-09-23_11:00': 'available',
                '2024-09-24_14:00': 'available',
                '2024-09-24_15:00': 'available'
            }
        },
        tags: ['planning', 'strategic', 'Q4'],
        settings: {
            allowMaybe: true,
            showParticipantNames: true,
            requireAuth: true,
            autoReminders: true
        }
    },
    event_3: {
        id: 'event_3',
        title: 'Coffee Chat with New Hires',
        description: 'Casual coffee chat to welcome new team members and help them get acquainted.',
        creator: 'user_jun',
        createdAt: '2024-09-12T09:15:00Z',
        status: 'active',
        isPublic: true,
        eventCode: 'COFFEE24',
        dateRange: {
            start: '2024-09-18',
            end: '2024-09-19'
        },
        timeRange: {
            start: '14:00',
            end: '17:00'
        },
        timeSlotDuration: 30,
        timezone: 'America/New_York',
        participants: ['user_jun', 'user_alice', 'user_carol'],
        responses: {
            user_jun: {
                '2024-09-18_14:00': 'available',
                '2024-09-18_14:30': 'available',
                '2024-09-18_15:00': 'available',
                '2024-09-18_15:30': 'available',
                '2024-09-19_14:00': 'available',
                '2024-09-19_14:30': 'maybe'
            },
            user_alice: {
                '2024-09-18_14:30': 'available',
                '2024-09-18_15:00': 'available',
                '2024-09-19_14:00': 'available'
            },
            user_carol: {
                '2024-09-18_15:00': 'available',
                '2024-09-18_15:30': 'available',
                '2024-09-19_14:00': 'maybe',
                '2024-09-19_14:30': 'available'
            }
        },
        tags: ['social', 'onboarding', 'coffee'],
        settings: {
            allowMaybe: true,
            showParticipantNames: false,
            requireAuth: false,
            autoReminders: false
        }
    },
    event_4: {
        id: 'event_4',
        title: 'Project Kickoff Meeting',
        description: 'Initial meeting to discuss project scope, timeline, and resource allocation for the new product launch.',
        creator: 'user_jun',
        createdAt: '2024-09-05T14:20:00Z',
        status: 'completed',
        isPublic: false,
        eventCode: 'LAUNCH24',
        dateRange: {
            start: '2024-09-09',
            end: '2024-09-13'
        },
        timeRange: {
            start: '10:00',
            end: '16:00'
        },
        timeSlotDuration: 30,
        timezone: 'America/New_York',
        participants: ['user_jun', 'user_alice', 'user_bob', 'user_carol', 'user_david'],
        finalSelection: {
            date: '2024-09-11',
            time: '14:00',
            duration: 120
        },
        responses: {
            user_jun: {
                '2024-09-11_14:00': 'available',
                '2024-09-11_14:30': 'available',
                '2024-09-11_15:00': 'available',
                '2024-09-11_15:30': 'available'
            }
        },
        tags: ['project', 'kickoff', 'planning'],
        settings: {
            allowMaybe: true,
            showParticipantNames: true,
            requireAuth: true,
            autoReminders: true
        }
    },
    event_5: {
        id: 'event_5',
        title: 'Book Club Discussion',
        description: 'Monthly book club meeting to discuss "The Art of Readable Code" and share insights.',
        creator: 'user_alice',
        createdAt: '2024-09-11T11:00:00Z',
        status: 'active',
        isPublic: true,
        eventCode: 'BOOKS24',
        dateRange: {
            start: '2024-09-21',
            end: '2024-09-22'
        },
        timeRange: {
            start: '18:00',
            end: '21:00'
        },
        timeSlotDuration: 30,
        timezone: 'America/New_York',
        participants: ['user_alice', 'user_jun', 'user_carol', 'user_david'],
        responses: {
            user_alice: {
                '2024-09-21_18:00': 'available',
                '2024-09-21_18:30': 'available',
                '2024-09-21_19:00': 'available',
                '2024-09-22_18:00': 'available',
                '2024-09-22_18:30': 'maybe'
            },
            user_jun: {
                '2024-09-21_18:30': 'available',
                '2024-09-21_19:00': 'available',
                '2024-09-22_18:00': 'available'
            }
        },
        tags: ['book-club', 'social', 'learning'],
        settings: {
            allowMaybe: true,
            showParticipantNames: false,
            requireAuth: false,
            autoReminders: true
        }
    },
    event_6: {
        id: 'event_6',
        title: 'Client Presentation Rehearsal',
        description: 'Practice run for the important client presentation next week. Let\'s make sure we\'re all synchronized.',
        creator: 'user_jun',
        createdAt: '2024-09-13T16:45:00Z',
        status: 'pending',
        isPublic: false,
        eventCode: 'REHEARSE',
        dateRange: {
            start: '2024-09-25',
            end: '2024-09-26'
        },
        timeRange: {
            start: '13:00',
            end: '18:00'
        },
        timeSlotDuration: 30,
        timezone: 'America/New_York',
        participants: ['user_jun', 'user_bob'],
        responses: {
            user_jun: {
                '2024-09-25_13:00': 'available',
                '2024-09-25_13:30': 'available',
                '2024-09-25_14:00': 'available',
                '2024-09-25_14:30': 'maybe',
                '2024-09-26_15:00': 'available',
                '2024-09-26_15:30': 'available'
            }
        },
        tags: ['presentation', 'client', 'rehearsal'],
        settings: {
            allowMaybe: true,
            showParticipantNames: true,
            requireAuth: true,
            autoReminders: true
        }
    }
};

// Public events that appear in search/browse
const publicEvents = Object.values(events).filter(event => event.isPublic);

// Quick access functions
function getCurrentUser() {
    return currentUser;
}

function getAllUsers() {
    return users;
}

function getUserById(userId) {
    return users[userId];
}

function getAllEvents() {
    return events;
}

function getEventById(eventId) {
    return events[eventId];
}

function getEventsByCreator(userId) {
    return Object.values(events).filter(event => event.creator === userId);
}

function getEventsByParticipant(userId) {
    return Object.values(events).filter(event => 
        event.participants && event.participants.includes(userId)
    );
}

function getPublicEvents() {
    return publicEvents;
}

function getRecentEvents(limit = 6) {
    return Object.values(events)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

function getUserStats(userId = currentUser.id) {
    const userEvents = getEventsByCreator(userId);
    const participantEvents = getEventsByParticipant(userId);
    
    return {
        eventsCreated: userEvents.length,
        totalParticipants: userEvents.reduce((sum, event) => 
            sum + (event.participants ? event.participants.length : 0), 0
        ),
        activeEvents: userEvents.filter(event => event.status === 'active').length,
        completedEvents: userEvents.filter(event => event.status === 'completed').length,
        participatingIn: participantEvents.length
    };
}

// Search functionality
function searchEvents(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    return Object.values(events).filter(event => {
        const title = event.title.toLowerCase();
        const description = event.description.toLowerCase();
        const creator = users[event.creator] ? users[event.creator].username.toLowerCase() : '';
        const tags = event.tags ? event.tags.join(' ').toLowerCase() : '';
        
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               creator.includes(searchTerm) || 
               tags.includes(searchTerm) ||
               event.eventCode.toLowerCase().includes(searchTerm);
    });
}

// Event code validation
function findEventByCode(code) {
    return Object.values(events).find(event => 
        event.eventCode.toLowerCase() === code.toLowerCase()
    );
}

// Time slot utilities
function generateTimeSlots(event) {
    const slots = [];
    const startDate = new Date(event.dateRange.start + 'T00:00:00');
    const endDate = new Date(event.dateRange.end + 'T23:59:59');
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Parse time range
        const [startHour, startMin] = event.timeRange.start.split(':').map(Number);
        const [endHour, endMin] = event.timeRange.end.split(':').map(Number);
        
        let currentTime = startHour * 60 + startMin; // minutes from midnight
        const endTime = endHour * 60 + endMin;
        
        while (currentTime < endTime) {
            const hour = Math.floor(currentTime / 60);
            const min = currentTime % 60;
            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            const slotId = `${dateStr}_${timeStr}`;
            
            slots.push({
                id: slotId,
                date: dateStr,
                time: timeStr,
                datetime: new Date(`${dateStr}T${timeStr}:00`)
            });
            
            currentTime += event.timeSlotDuration;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return slots;
}

// Get availability for a time slot
function getSlotAvailability(eventId, slotId) {
    const event = events[eventId];
    if (!event || !event.responses) return [];
    
    const availability = [];
    for (const [userId, responses] of Object.entries(event.responses)) {
        if (responses[slotId]) {
            availability.push({
                userId,
                username: users[userId] ? users[userId].username : 'Unknown',
                status: responses[slotId]
            });
        }
    }
    
    return availability;
}

// Get best times (slots with most availability)
function getBestTimes(eventId, limit = 5) {
    const event = events[eventId];
    if (!event) return [];
    
    const slots = generateTimeSlots(event);
    const slotScores = slots.map(slot => {
        const availability = getSlotAvailability(eventId, slot.id);
        const availableCount = availability.filter(a => a.status === 'available').length;
        const maybeCount = availability.filter(a => a.status === 'maybe').length;
        
        // Score: available counts as 1, maybe as 0.5
        const score = availableCount + (maybeCount * 0.5);
        
        return {
            ...slot,
            availability,
            score,
            availableCount,
            maybeCount
        };
    });
    
    return slotScores
        .filter(slot => slot.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        currentUser,
        users,
        events,
        publicEvents,
        getCurrentUser,
        getAllUsers,
        getUserById,
        getAllEvents,
        getEventById,
        getEventsByCreator,
        getEventsByParticipant,
        getPublicEvents,
        getRecentEvents,
        getUserStats,
        searchEvents,
        findEventByCode,
        generateTimeSlots,
        getSlotAvailability,
        getBestTimes
    };
}
