// Complete LinkedIn Features - All Missing Functionality

// Add to existing enhanced-script.js or use separately

// Notification System
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Feed Controls and Sorting
function setupFeedControls() {
    const feed = document.querySelector('.feed');
    
    // Add feed controls at the top
    const feedControls = document.createElement('div');
    feedControls.className = 'feed-controls';
    feedControls.innerHTML = `
        <div class="feed-controls-header">
            <h3>Recent Activity</h3>
            <div class="feed-options">
                <button class="feed-option-btn"><i class="fas fa-cog"></i></button>
            </div>
        </div>
        <div class="sort-options">
            <button class="sort-option active" data-sort="recent">Recent</button>
            <button class="sort-option" data-sort="relevant">Most relevant</button>
            <button class="sort-option" data-sort="comments">Most commented</button>
            <button class="sort-option" data-sort="connections">From connections</button>
        </div>
    `;
    
    feed.insertBefore(feedControls, feed.firstChild);
    
    // Sort functionality
    feedControls.querySelectorAll('.sort-option').forEach(btn => {
        btn.addEventListener('click', function() {
            feedControls.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const sortType = this.dataset.sort;
            sortFeed(sortType);
        });
    });
}

function sortFeed(sortType) {
    const posts = Array.from(document.querySelectorAll('.post'));
    const postsContainer = document.querySelector('.feed');
    const feedControls = postsContainer.querySelector('.feed-controls');
    const postComposer = postsContainer.querySelector('.post-composer');
    
    // Remove posts from DOM
    posts.forEach(post => post.remove());
    
    // Sort posts based on type
    let sortedPosts = [...mockData.posts];
    
    switch(sortType) {
        case 'recent':
            sortedPosts.sort((a, b) => new Date(b.time) - new Date(a.time));
            break;
        case 'relevant':
            sortedPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
            break;
        case 'comments':
            sortedPosts.sort((a, b) => b.comments - a.comments);
            break;
        case 'connections':
            sortedPosts = sortedPosts.filter(post => 
                ['Michael Johnson', 'Emily Chen', 'Alex Rodriguez'].includes(post.author.name)
            );
            break;
    }
    
    // Re-render sorted posts
    sortedPosts.forEach(postData => {
        const postElement = createEnhancedPostElement(postData);
        postsContainer.appendChild(postElement);
    });
}

// Post Management (Edit, Delete, Save)
function setupEnhancedPostOptions(moreBtn, postData) {
    const existingOptions = document.querySelector('.post-options');
    if (existingOptions) {
        existingOptions.remove();
        return;
    }
    
    const isOwnPost = postData.author.id === currentUser.id;
    
    const options = document.createElement('div');
    options.className = 'post-options enhanced';
    options.innerHTML = `
        ${isOwnPost ? `
            <div class="option-item" data-action="edit">
                <i class="fas fa-edit"></i> Edit post
            </div>
            <div class="option-item" data-action="delete">
                <i class="fas fa-trash"></i> Delete post
            </div>
            <div class="option-item" data-action="analytics">
                <i class="fas fa-chart-line"></i> View analytics
            </div>
        ` : `
            <div class="option-item" data-action="save">
                <i class="far fa-bookmark"></i> Save post
            </div>
            <div class="option-item" data-action="hide">
                <i class="fas fa-eye-slash"></i> Hide post
            </div>
            <div class="option-item" data-action="report">
                <i class="fas fa-flag"></i> Report post
            </div>
            <div class="option-item" data-action="unfollow">
                <i class="fas fa-user-minus"></i> Unfollow ${postData.author.name}
            </div>
        `}
        <div class="option-item" data-action="copy">
            <i class="fas fa-link"></i> Copy link to post
        </div>
        <div class="option-item" data-action="embed">
            <i class="fas fa-code"></i> Embed post
        </div>
    `;
    
    moreBtn.appendChild(options);
    
    // Handle option clicks
    options.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            handlePostOption(action, postData);
            options.remove();
        });
    });
    
    // Close when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeOptions() {
            if (options.parentNode) {
                options.remove();
            }
            document.removeEventListener('click', closeOptions);
        });
    }, 100);
}

function handlePostOption(action, postData) {
    const post = document.querySelector(`[data-post-id="${postData.id}"]`);
    
    switch(action) {
        case 'edit':
            editPost(postData);
            break;
        case 'delete':
            deletePost(postData, post);
            break;
        case 'analytics':
            showPostAnalytics(postData);
            break;
        case 'save':
            toggleSavePost(post, postData);
            break;
        case 'hide':
            hidePost(post, postData);
            break;
        case 'report':
            reportPost(postData);
            break;
        case 'unfollow':
            unfollowUser(postData.author);
            break;
        case 'copy':
            copyPostLink(postData);
            break;
        case 'embed':
            embedPost(postData);
            break;
    }
}

function editPost(postData) {
    const modal = document.createElement('div');
    modal.className = 'post-modal-overlay';
    modal.innerHTML = `
        <div class="post-modal">
            <div class="modal-header">
                <h3>Edit post</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-content">
                <div class="composer-profile">
                    <img src="${currentUser.avatar}" alt="Profile" class="modal-avatar">
                    <span>${currentUser.name}</span>
                </div>
                <textarea class="modal-textarea">${postData.content}</textarea>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const textarea = modal.querySelector('.modal-textarea');
    const saveBtn = modal.querySelector('.save-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const closeBtn = modal.querySelector('.close-modal');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', () => {
        const newContent = textarea.value.trim();
        if (newContent && newContent !== postData.content) {
            postData.content = newContent;
            postData.edited = true;
            postData.editedTime = 'now';
            
            // Update post in DOM
            const post = document.querySelector(`[data-post-id="${postData.id}"]`);
            const postText = post.querySelector('.post-text');
            postText.innerHTML = formatPostContent(newContent);
            
            // Add edited indicator
            const postTime = post.querySelector('.post-time');
            postTime.innerHTML = `${postData.time} • <span class="edited-indicator">Edited</span>`;
            
            showNotification('Post updated successfully!', 'success');
        }
        closeModal();
    });
    
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function deletePost(postData, post) {
    const modal = document.createElement('div');
    modal.className = 'post-modal-overlay';
    modal.innerHTML = `
        <div class="delete-modal">
            <div class="modal-header">
                <h3>Delete post</h3>
            </div>
            <div class="modal-content">
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">Cancel</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const deleteBtn = modal.querySelector('.delete-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    cancelBtn.addEventListener('click', closeModal);
    
    deleteBtn.addEventListener('click', () => {
        // Remove from DOM
        post.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            post.remove();
        }, 300);
        
        // Remove from data
        const index = mockData.posts.findIndex(p => p.id === postData.id);
        if (index > -1) {
            mockData.posts.splice(index, 1);
        }
        
        showNotification('Post deleted', 'success');
        closeModal();
    });
}

function toggleSavePost(post, postData) {
    const saveBtn = post.querySelector('.save-btn');
    const isSaved = saveBtn.classList.contains('saved');
    
    if (isSaved) {
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
        showNotification('Post removed from saved items', 'info');
    } else {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        showNotification('Post saved!', 'success');
    }
}

function hidePost(post, postData) {
    post.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        post.style.display = 'none';
    }, 300);
    showNotification(`Hidden post from ${postData.author.name}`, 'info');
}

function reportPost(postData) {
    const modal = document.createElement('div');
    modal.className = 'post-modal-overlay';
    modal.innerHTML = `
        <div class="report-modal">
            <div class="modal-header">
                <h3>Report post</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-content">
                <p>Why are you reporting this post?</p>
                <div class="report-reasons">
                    <label><input type="radio" name="reason" value="spam"> It's spam</label>
                    <label><input type="radio" name="reason" value="harassment"> Harassment or bullying</label>
                    <label><input type="radio" name="reason" value="inappropriate"> Inappropriate content</label>
                    <label><input type="radio" name="reason" value="misinformation"> Misinformation</label>
                    <label><input type="radio" name="reason" value="other"> Other</label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">Cancel</button>
                <button class="report-btn" disabled>Report</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const reportBtn = modal.querySelector('.report-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const closeBtn = modal.querySelector('.close-modal');
    const reasonInputs = modal.querySelectorAll('input[name="reason"]');
    
    reasonInputs.forEach(input => {
        input.addEventListener('change', () => {
            reportBtn.disabled = false;
        });
    });
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    reportBtn.addEventListener('click', () => {
        showNotification('Thank you for your report. We\'ll review this content.', 'success');
        closeModal();
    });
}

function copyPostLink(postData) {
    const link = `https://linkedin.com/posts/${postData.id}`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Link copied to clipboard!', 'success');
    });
}

// User Profile System
function showUserProfile(userId) {
    const userData = getUserData(userId);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Create or show profile section
    let profileSection = document.getElementById(`profile-${userId}`);
    if (!profileSection) {
        profileSection = createProfileSection(userData);
        document.querySelector('.container').appendChild(profileSection);
    }
    
    profileSection.classList.add('active');
    currentActiveSection = `profile-${userId}`;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

function createProfileSection(userData) {
    const section = document.createElement('section');
    section.id = `profile-${userData.id}`;
    section.className = 'content-section profile-section';
    
    section.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-cover"></div>
                <div class="profile-main">
                    <div class="profile-photo-container">
                        <img src="${userData.avatar}" alt="${userData.name}" class="profile-photo">
                        ${userData.id === currentUser.id ? '<button class="edit-photo-btn"><i class="fas fa-camera"></i></button>' : ''}
                    </div>
                    <div class="profile-info">
                        <div class="profile-name-section">
                            <h1>${userData.name}</h1>
                            <p class="profile-headline">${userData.title}</p>
                            <p class="profile-location"><i class="fas fa-map-marker-alt"></i> ${userData.location || 'San Francisco, CA'}</p>
                        </div>
                        <div class="profile-actions">
                            ${userData.id === currentUser.id ? `
                                <button class="btn-primary profile-btn">
                                    <i class="fas fa-plus"></i> Add profile section
                                </button>
                                <button class="btn-secondary profile-btn">
                                    <i class="fas fa-edit"></i> Edit profile
                                </button>
                            ` : `
                                <button class="btn-primary profile-btn connect-btn">
                                    <i class="fas fa-user-plus"></i> Connect
                                </button>
                                <button class="btn-secondary profile-btn">
                                    <i class="fas fa-envelope"></i> Message
                                </button>
                                <button class="btn-secondary profile-btn">
                                    <i class="fas fa-ellipsis-h"></i> More
                                </button>
                            `}
                        </div>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <strong>${userData.connections || '500+'}</strong>
                        <span>connections</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-content">
                <div class="profile-main-content">
                    <div class="profile-section about-section">
                        <h2>About</h2>
                        <div class="about-content">
                            <p>${userData.about || 'Passionate software engineer with expertise in modern web technologies. I love building scalable applications and contributing to open source projects.'}</p>
                            ${userData.id === currentUser.id ? '<button class="edit-section-btn"><i class="fas fa-edit"></i></button>' : ''}
                        </div>
                    </div>
                    
                    <div class="profile-section experience-section">
                        <h2>Experience</h2>
                        <div class="experience-list">
                            ${generateExperienceHTML(userData)}
                        </div>
                        ${userData.id === currentUser.id ? '<button class="add-experience-btn">+ Add experience</button>' : ''}
                    </div>
                    
                    <div class="profile-section education-section">
                        <h2>Education</h2>
                        <div class="education-list">
                            ${generateEducationHTML(userData)}
                        </div>
                        ${userData.id === currentUser.id ? '<button class="add-education-btn">+ Add education</button>' : ''}
                    </div>
                    
                    <div class="profile-section skills-section">
                        <h2>Skills</h2>
                        <div class="skills-list">
                            ${generateSkillsHTML(userData)}
                        </div>
                        ${userData.id === currentUser.id ? '<button class="add-skill-btn">+ Add skill</button>' : ''}
                    </div>
                </div>
                
                <div class="profile-sidebar">
                    <div class="profile-widget">
                        <h3>People also viewed</h3>
                        <div class="people-list">
                            ${generateSuggestedPeopleHTML()}
                        </div>
                    </div>
                    
                    <div class="profile-widget">
                        <h3>People you may know</h3>
                        <div class="suggestions-list">
                            ${generateConnectionSuggestionsHTML()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setupProfileInteractions(section, userData);
    return section;
}

function getUserData(userId) {
    // Mock user data based on ID
    const users = {
        'michael-johnson': {
            id: 'michael-johnson',
            name: 'Michael Johnson',
            title: 'Senior Frontend Developer at Google',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            location: 'Mountain View, CA',
            connections: '500+',
            about: 'Passionate frontend developer with 8+ years of experience building scalable web applications. I specialize in React, TypeScript, and modern web technologies.',
            experience: [
                {
                    title: 'Senior Frontend Developer',
                    company: 'Google',
                    duration: '2021 - Present',
                    location: 'Mountain View, CA',
                    description: 'Leading frontend development for Google Search features, improving performance and user experience for millions of users worldwide.'
                },
                {
                    title: 'Frontend Developer',
                    company: 'Facebook',
                    duration: '2019 - 2021',
                    location: 'Menlo Park, CA',
                    description: 'Developed React components for Facebook\'s main platform, focusing on accessibility and performance optimization.'
                }
            ],
            education: [
                {
                    school: 'Stanford University',
                    degree: 'Master of Science in Computer Science',
                    duration: '2017 - 2019'
                }
            ],
            skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'GraphQL', 'CSS', 'HTML']
        },
        // Add more user data as needed
    };
    
    return users[userId] || {
        id: userId,
        name: 'LinkedIn User',
        title: 'Professional',
        avatar: 'https://via.placeholder.com/150x150',
        connections: '100+',
        about: 'Professional with experience in various industries.',
        experience: [],
        education: [],
        skills: []
    };
}

// Enhanced Messaging with File Sharing and Emojis
function setupEnhancedMessaging() {
    setupConversationList();
    setupEnhancedMessageInput();
    
    if (mockData.conversations.length > 0) {
        loadConversation(mockData.conversations[0]);
    }
}

function setupEnhancedMessageInput() {
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.btn-send');
    const chatArea = document.querySelector('.chat-area');
    
    // Add enhanced input controls
    const inputContainer = document.querySelector('.message-input-container');
    const enhancedControls = document.createElement('div');
    enhancedControls.className = 'message-enhanced-controls';
    enhancedControls.innerHTML = `
        <button class="msg-control-btn" data-action="emoji" title="Add emoji">
            <i class="far fa-smile"></i>
        </button>
        <button class="msg-control-btn" data-action="attachment" title="Attach file">
            <i class="fas fa-paperclip"></i>
        </button>
        <button class="msg-control-btn" data-action="image" title="Send image">
            <i class="far fa-image"></i>
        </button>
        <button class="msg-control-btn" data-action="gif" title="Send GIF">
            <i class="fas fa-film"></i>
        </button>
    `;
    
    inputContainer.insertBefore(enhancedControls, sendBtn);
    
    // Enhanced controls functionality
    enhancedControls.querySelectorAll('.msg-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            handleMessageAction(action);
        });
    });
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentConversation) return;
        
        const newMessage = {
            id: Date.now(),
            content: text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'text'
        };
        
        currentConversation.messages.push(newMessage);
        currentConversation.lastMessage = text;
        currentConversation.time = 'now';
        
        loadConversation(currentConversation);
        messageInput.value = '';
        
        // Simulate response
        setTimeout(() => {
            simulateResponse();
        }, 1000 + Math.random() * 2000);
    }
    
    function handleMessageAction(action) {
        switch(action) {
            case 'emoji':
                showEmojiPicker();
                break;
            case 'attachment':
                simulateFileAttachment();
                break;
            case 'image':
                simulateImageAttachment();
                break;
            case 'gif':
                showGifPicker();
                break;
        }
    }
    
    function simulateResponse() {
        const responses = [
            "Thanks for your message!",
            "That sounds great!",
            "I'll get back to you on that.",
            "Interesting point!",
            "Let me think about it.",
            "Absolutely agree!",
            "Could you elaborate on that?",
            "I'll check and let you know.",
            "Perfect timing!",
            "Looking forward to it!"
        ];
        
        const response = {
            id: Date.now() + 1,
            content: responses[Math.floor(Math.random() * responses.length)],
            sender: 'contact',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'text'
        };
        
        currentConversation.messages.push(response);
        currentConversation.lastMessage = response.content;
        loadConversation(currentConversation);
    }
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
}

// Job Application System
function setupEnhancedJobs() {
    setupJobSearch();
    setupJobFilters();
    renderJobCards();
}

function renderJobCards() {
    const jobsList = document.querySelector('.jobs-list');
    jobsList.innerHTML = '';
    
    mockData.jobs.forEach(job => {
        const jobCard = createEnhancedJobCard(job);
        jobsList.appendChild(jobCard);
    });
}

function createEnhancedJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card enhanced';
    card.innerHTML = `
        <div class="job-header">
            <img src="${job.logo}" alt="Company" class="company-logo">
            <div class="job-info">
                <h3 class="job-title">${job.title}</h3>
                <p class="job-company">${job.company}</p>
                <div class="job-meta">
                    <span class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                    <span class="job-type"><i class="fas fa-clock"></i> ${job.type || 'Full-time'}</span>
                    <span class="job-posted"><i class="fas fa-calendar"></i> ${job.posted}</span>
                </div>
            </div>
            <div class="job-actions">
                <button class="btn-save-job ${job.saved ? 'saved' : ''}" data-job-id="${job.id}">
                    <i class="${job.saved ? 'fas' : 'far'} fa-bookmark"></i>
                    ${job.saved ? 'Saved' : 'Save'}
                </button>
                <button class="btn-more-job"><i class="fas fa-ellipsis-h"></i></button>
            </div>
        </div>
        <div class="job-details">
            <p class="job-description">${job.description}</p>
            <div class="job-requirements" style="display: none;">
                <h4>Requirements:</h4>
                <ul>
                    <li>5+ years of experience in ${job.tags[0]}</li>
                    <li>Strong knowledge of ${job.tags.join(', ')}</li>
                    <li>Experience with agile development methodologies</li>
                    <li>Excellent communication skills</li>
                </ul>
            </div>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="job-footer">
                <div class="applicant-info">
                    <span class="applicant-count">${Math.floor(Math.random() * 100) + 20} applicants</span>
                    <span class="application-status">Be among the first 25 applicants</span>
                </div>
                <div class="job-card-actions">
                    <button class="btn-apply" data-job-id="${job.id}">
                        <i class="fas fa-paper-plane"></i> Easy Apply
                    </button>
                    <button class="btn-view-details" data-job-id="${job.id}">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
    
    setupJobCardInteractions(card, job);
    return card;
}

function setupJobCardInteractions(card, job) {
    const saveBtn = card.querySelector('.btn-save-job');
    const applyBtn = card.querySelector('.btn-apply');
    const viewDetailsBtn = card.querySelector('.btn-view-details');
    const jobTitle = card.querySelector('.job-title');
    
    saveBtn.addEventListener('click', () => {
        toggleJobSave(job, saveBtn);
    });
    
    applyBtn.addEventListener('click', () => {
        showJobApplicationModal(job);
    });
    
    viewDetailsBtn.addEventListener('click', () => {
        showJobDetails(job);
    });
    
    jobTitle.addEventListener('click', () => {
        showJobDetails(job);
    });
}

function toggleJobSave(job, saveBtn) {
    job.saved = !job.saved;
    
    if (job.saved) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        showNotification('Job saved!', 'success');
    } else {
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
        showNotification('Job removed from saved', 'info');
    }
}

function showJobApplicationModal(job) {
    const modal = document.createElement('div');
    modal.className = 'post-modal-overlay job-application-modal';
    modal.innerHTML = `
        <div class="job-application-modal-content">
            <div class="modal-header">
                <div class="job-info-header">
                    <img src="${job.logo}" alt="${job.company}" class="company-logo">
                    <div>
                        <h3>${job.title}</h3>
                        <p>${job.company} • ${job.location}</p>
                    </div>
                </div>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-content application-form">
                <div class="application-step active" data-step="1">
                    <h4>Contact info</h4>
                    <div class="form-row">
                        <input type="email" value="${currentUser.email || 'john.smith@email.com'}" readonly>
                        <input type="tel" placeholder="Phone number" value="+1 (555) 123-4567">
                    </div>
                </div>
                
                <div class="application-step" data-step="2">
                    <h4>Resume</h4>
                    <div class="resume-section">
                        <div class="current-resume">
                            <i class="fas fa-file-pdf"></i>
                            <div class="resume-info">
                                <span>John_Smith_Resume.pdf</span>
                                <small>Last updated: 2 weeks ago</small>
                            </div>
                            <button class="btn-change-resume">Change</button>
                        </div>
                    </div>
                </div>
                
                <div class="application-step" data-step="3">
                    <h4>Additional questions</h4>
                    <div class="form-group">
                        <label>Why are you interested in this position?</label>
                        <textarea placeholder="Share your motivation..." rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Years of experience with ${job.tags[0]}?</label>
                        <select>
                            <option>Please select</option>
                            <option>Less than 1 year</option>
                            <option>1-2 years</option>
                            <option>3-5 years</option>
                            <option>5+ years</option>
                        </select>
                    </div>
                </div>
                
                <div class="application-step" data-step="4">
                    <h4>Review your application</h4>
                    <div class="application-summary">
                        <div class="summary-section">
                            <h5>Contact Information</h5>
                            <p>${currentUser.email || 'john.smith@email.com'}</p>
                            <p>+1 (555) 123-4567</p>
                        </div>
                        <div class="summary-section">
                            <h5>Resume</h5>
                            <p>John_Smith_Resume.pdf</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-back" style="display: none;">Back</button>
                <div class="step-indicator">
                    <span class="step active">1</span>
                    <span class="step">2</span>
                    <span class="step">3</span>
                    <span class="step">4</span>
                </div>
                <button class="btn-next">Next</button>
                <button class="btn-submit-application" style="display: none;">Submit application</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupJobApplicationFlow(modal, job);
}

function setupJobApplicationFlow(modal, job) {
    let currentStep = 1;
    const totalSteps = 4;
    
    const nextBtn = modal.querySelector('.btn-next');
    const backBtn = modal.querySelector('.btn-back');
    const submitBtn = modal.querySelector('.btn-submit-application');
    const closeBtn = modal.querySelector('.close-modal');
    const steps = modal.querySelectorAll('.application-step');
    const stepIndicators = modal.querySelectorAll('.step-indicator .step');
    
    function updateStep() {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        stepIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Show current step
        modal.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        stepIndicators[currentStep - 1].classList.add('active');
        
        // Update buttons
        backBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    }
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });
    
    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });
    
    submitBtn.addEventListener('click', () => {
        // Simulate application submission
        modal.remove();
        showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success', 5000);
        
        // Mark as applied
        job.applied = true;
        
        // Update job card
        const jobCard = document.querySelector(`[data-job-id="${job.id}"] .btn-apply`);
        if (jobCard) {
            jobCard.innerHTML = '<i class="fas fa-check"></i> Applied';
            jobCard.disabled = true;
            jobCard.classList.add('applied');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Initialize all enhanced features
function initializeCompleteFeatures() {
    setupFeedControls();
    showNotification('LinkedIn Clone loaded successfully!', 'success');
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(-100%); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .edited-indicator {
            color: #666;
            font-size: 11px;
            font-style: italic;
        }
        
        .job-card.enhanced {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .job-card.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .btn-apply.applied {
            background-color: #10b981;
            border-color: #10b981;
            color: white;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
            margin-left: auto;
        }
    `;
    document.head.appendChild(style);
}

// Call initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCompleteFeatures);
} else {
    initializeCompleteFeatures();
}