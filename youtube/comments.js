// Enhanced Comment System with full CRUD operations

class CommentSystem {
    constructor() {
        this.currentVideoId = null;
        this.replyingTo = null;
        this.editingComment = null;
        this.sortBy = 'top';
    }

    init(videoId) {
        this.currentVideoId = videoId;
        this.attachCommentListeners();
        this.loadComments();
    }

    attachCommentListeners() {
        // Main comment input
        const commentInput = document.querySelector('.comment-input');
        if (commentInput) {
            commentInput.addEventListener('focus', () => {
                this.showCommentActions();
            });

            commentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    this.addComment();
                }
            });
        }

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeSortOrder(e.target.textContent.toLowerCase().includes('top') ? 'top' : 'newest');
            });
        });
    }

    showCommentActions() {
        const commentInput = document.querySelector('.comment-input');
        const existingActions = document.querySelector('.comment-actions');
        
        if (existingActions) return;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'comment-actions';
        actionsDiv.innerHTML = `
            <div class="comment-formatting">
                <button class="format-btn" title="Bold" onclick="window.commentSystem && window.commentSystem.formatText('bold')">
                    <i class="fas fa-bold"></i>
                </button>
                <button class="format-btn" title="Italic" onclick="window.commentSystem && window.commentSystem.formatText('italic')">
                    <i class="fas fa-italic"></i>
                </button>
                <button class="format-btn" title="Add link" onclick="window.commentSystem && window.commentSystem.showLinkDialog()">
                    <i class="fas fa-link"></i>
                </button>
                <button class="format-btn" title="Add emoji" onclick="window.commentSystem && window.commentSystem.showEmojiPicker()">
                    <i class="fas fa-smile"></i>
                </button>
            </div>
            <div class="comment-buttons">
                <button class="btn-secondary" onclick="window.commentSystem && window.commentSystem.cancelComment()">Cancel</button>
                <button class="btn-primary comment-submit" onclick="window.commentSystem && window.commentSystem.addComment()">Comment</button>
            </div>
        `;
        
        commentInput.parentElement.appendChild(actionsDiv);
    }

    addComment() {
        const commentInput = document.querySelector('.comment-input');
        const text = commentInput.value.trim();
        
        if (!text) return;

        const comment = {
            id: 'comment_' + Date.now(),
            userId: mockData.user.id,
            username: mockData.user.name,
            avatar: mockData.user.avatar,
            text: text,
            likes: 0,
            dislikes: 0,
            timestamp: 'Just now',
            replies: [],
            edited: false,
            pinned: false,
            hearted: false
        };

        // Add to mock data
        if (!mockData.comments[this.currentVideoId]) {
            mockData.comments[this.currentVideoId] = [];
        }

        if (this.replyingTo) {
            // Add as reply
            const parentComment = this.findComment(this.replyingTo);
            if (parentComment) {
                comment.parentId = this.replyingTo;
                parentComment.replies.push(comment);
            }
            this.replyingTo = null;
        } else {
            // Add as main comment
            mockData.comments[this.currentVideoId].unshift(comment);
        }

        this.refreshComments();
        commentInput.value = '';
        this.hideCommentActions();
    }

    replyToComment(commentId) {
        this.replyingTo = commentId;
        const commentInput = document.querySelector('.comment-input');
        const parentComment = this.findComment(commentId);
        
        commentInput.placeholder = `Reply to @${parentComment.username}...`;
        commentInput.focus();
        this.showCommentActions();
    }

    editComment(commentId) {
        const comment = this.findComment(commentId);
        if (!comment || comment.userId !== mockData.user.id) return;

        this.editingComment = commentId;
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        const textElement = commentElement.querySelector('.comment-text');
        
        const originalText = comment.text;
        textElement.innerHTML = `
            <div class="edit-comment">
                <textarea class="edit-textarea">${originalText}</textarea>
                <div class="edit-actions">
                    <button class="btn-secondary" onclick="window.commentSystem && window.commentSystem.cancelEdit('${commentId}', '${originalText}')">Cancel</button>
                    <button class="btn-primary" onclick="window.commentSystem && window.commentSystem.saveEdit('${commentId}')">Save</button>
                </div>
            </div>
        `;
    }

    saveEdit(commentId) {
        const textarea = document.querySelector('.edit-textarea');
        const newText = textarea.value.trim();
        
        if (!newText) return;

        const comment = this.findComment(commentId);
        comment.text = newText;
        comment.edited = true;
        
        this.editingComment = null;
        this.refreshComments();
    }

    cancelEdit(commentId, originalText) {
        this.editingComment = null;
        this.refreshComments();
    }

    deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        const comment = this.findComment(commentId);
        if (!comment || comment.userId !== mockData.user.id) return;

        if (comment.parentId) {
            // Remove reply
            const parentComment = this.findComment(comment.parentId);
            parentComment.replies = parentComment.replies.filter(reply => reply.id !== commentId);
        } else {
            // Remove main comment
            mockData.comments[this.currentVideoId] = mockData.comments[this.currentVideoId]
                .filter(c => c.id !== commentId);
        }

        this.refreshComments();
    }

    likeComment(commentId) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        // Toggle like
        if (comment.likedByUser) {
            comment.likes--;
            comment.likedByUser = false;
        } else {
            comment.likes++;
            comment.likedByUser = true;
            // Remove dislike if exists
            if (comment.dislikedByUser) {
                comment.dislikes--;
                comment.dislikedByUser = false;
            }
        }

        this.updateCommentActions(commentId);
    }

    dislikeComment(commentId) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        // Toggle dislike
        if (comment.dislikedByUser) {
            comment.dislikes--;
            comment.dislikedByUser = false;
        } else {
            comment.dislikes++;
            comment.dislikedByUser = true;
            // Remove like if exists
            if (comment.likedByUser) {
                comment.likes--;
                comment.likedByUser = false;
            }
        }

        this.updateCommentActions(commentId);
    }

    pinComment(commentId) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        // Unpin all other comments
        mockData.comments[this.currentVideoId].forEach(c => c.pinned = false);
        
        // Pin this comment
        comment.pinned = true;
        this.refreshComments();
    }

    heartComment(commentId) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        comment.hearted = !comment.hearted;
        this.updateCommentActions(commentId);
    }

    reportComment(commentId) {
        const reasons = [
            'Spam or misleading',
            'Hateful or abusive content',
            'Harassment or bullying',
            'Harmful or dangerous content',
            'Child safety',
            'Promotes terrorism',
            'Spam or scams',
            'Infringes my rights'
        ];

        const reason = prompt(`Report this comment for:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEnter number (1-8):`);
        
        if (reason && reason >= 1 && reason <= 8) {
            alert(`Comment reported for: ${reasons[reason - 1]}\nThank you for helping keep YouTube safe.`);
        }
    }

    changeSortOrder(sortBy) {
        this.sortBy = sortBy;
        
        // Update UI
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = sortBy === 'top' ? 
            document.querySelector('.sort-btn[onclick*="top"]') : 
            document.querySelector('.sort-btn[onclick*="newest"]');
        if (activeBtn) activeBtn.classList.add('active');

        this.refreshComments();
    }

    findComment(commentId) {
        const comments = mockData.comments[this.currentVideoId] || [];
        
        // Search in main comments
        let comment = comments.find(c => c.id === commentId);
        if (comment) return comment;
        
        // Search in replies
        for (const mainComment of comments) {
            comment = mainComment.replies.find(r => r.id === commentId);
            if (comment) return comment;
        }
        
        return null;
    }

    loadComments() {
        // Initialize comments if they don't exist
        if (!mockData.comments[this.currentVideoId]) {
            mockData.comments[this.currentVideoId] = [];
        }

        this.refreshComments();
    }

    refreshComments() {
        const commentsList = document.querySelector('.comments-list');
        if (!commentsList) return;

        let comments = [...(mockData.comments[this.currentVideoId] || [])];

        // Sort comments
        if (this.sortBy === 'top') {
            comments.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return (b.likes - b.dislikes) - (a.likes - a.dislikes);
            });
        } else {
            comments.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        }

        commentsList.innerHTML = comments.map(comment => this.renderComment(comment)).join('');
        
        // Update comment count
        const totalComments = this.countTotalComments();
        const commentHeader = document.querySelector('.comments-header h3');
        if (commentHeader) {
            commentHeader.textContent = `${totalComments} Comment${totalComments !== 1 ? 's' : ''}`;
        }
    }

    countTotalComments() {
        const comments = mockData.comments[this.currentVideoId] || [];
        let total = comments.length;
        comments.forEach(comment => {
            total += comment.replies.length;
        });
        return total;
    }

    renderComment(comment) {
        const isOwner = comment.userId === mockData.user.id;
        const canModerate = true; // Assume current user is video owner
        
        return `
            <div class="comment comment-item" data-comment-id="${comment.id}">
                ${comment.pinned ? '<div class="pinned-indicator"><i class="fas fa-thumbtack"></i> Pinned by creator</div>' : ''}
                <img src="${comment.avatar}" alt="${comment.username}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.username}</span>
                        <span class="comment-time comment-timestamp">${comment.timestamp}${comment.edited ? ' (edited)' : ''}</span>
                        ${comment.hearted ? '<i class="fas fa-heart hearted" title="Hearted by creator"></i>' : ''}
                    </div>
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-actions">
                        <button class="comment-action comment-likes ${comment.likedByUser ? 'active' : ''}" onclick="window.commentSystem && window.commentSystem.likeComment('${comment.id}')">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${comment.likes || ''}</span>
                        </button>
                        <button class="comment-action ${comment.dislikedByUser ? 'active' : ''}" onclick="window.commentSystem && window.commentSystem.dislikeComment('${comment.id}')">
                            <i class="fas fa-thumbs-down"></i>
                            ${comment.dislikes ? `<span>${comment.dislikes}</span>` : ''}
                        </button>
                        <button class="comment-action reply-btn" onclick="window.commentSystem && window.commentSystem.replyToComment('${comment.id}')">Reply</button>
                        
                        <div class="comment-menu">
                            <button class="comment-action menu-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="comment-dropdown" style="display: none;">
                                ${isOwner ? `
                                    <button onclick="window.commentSystem && window.commentSystem.editComment('${comment.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="window.commentSystem && window.commentSystem.deleteComment('${comment.id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                ` : ''}
                                ${canModerate ? `
                                    <button onclick="window.commentSystem && window.commentSystem.pinComment('${comment.id}')">
                                        <i class="fas fa-thumbtack"></i> ${comment.pinned ? 'Unpin' : 'Pin'}
                                    </button>
                                    <button onclick="window.commentSystem && window.commentSystem.heartComment('${comment.id}')">
                                        <i class="fas fa-heart"></i> ${comment.hearted ? 'Remove heart' : 'Heart'}
                                    </button>
                                ` : ''}
                                <button onclick="window.commentSystem && window.commentSystem.reportComment('${comment.id}')">
                                    <i class="fas fa-flag"></i> Report
                                </button>
                            </div>
                        </div>
                    </div>
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            <button class="show-replies" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                                <i class="fas fa-chevron-down"></i>
                                ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}
                            </button>
                            <div class="replies-list">
                                ${comment.replies.map(reply => this.renderReply(reply)).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderReply(reply) {
        const isOwner = reply.userId === mockData.user.id;
        
        return `
            <div class="comment-reply" data-comment-id="${reply.id}">
                <img src="${reply.avatar}" alt="${reply.username}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${reply.username}</span>
                        <span class="comment-time">${reply.timestamp}${reply.edited ? ' (edited)' : ''}</span>
                        ${reply.hearted ? '<i class="fas fa-heart hearted" title="Hearted by creator"></i>' : ''}
                    </div>
                    <p class="comment-text">${reply.text}</p>
                    <div class="comment-actions">
                        <button class="comment-action ${reply.likedByUser ? 'active' : ''}" onclick="window.commentSystem && window.commentSystem.likeComment('${reply.id}')">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${reply.likes || ''}</span>
                        </button>
                        <button class="comment-action ${reply.dislikedByUser ? 'active' : ''}" onclick="window.commentSystem && window.commentSystem.dislikeComment('${reply.id}')">
                            <i class="fas fa-thumbs-down"></i>
                            ${reply.dislikes ? `<span>${reply.dislikes}</span>` : ''}
                        </button>
                        
                        <div class="comment-menu">
                            <button class="comment-action menu-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="comment-dropdown" style="display: none;">
                                ${isOwner ? `
                                    <button onclick="window.commentSystem && window.commentSystem.editComment('${reply.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="window.commentSystem && window.commentSystem.deleteComment('${reply.id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                ` : ''}
                                <button onclick="window.commentSystem && window.commentSystem.heartComment('${reply.id}')">
                                    <i class="fas fa-heart"></i> ${reply.hearted ? 'Remove heart' : 'Heart'}
                                </button>
                                <button onclick="window.commentSystem && window.commentSystem.reportComment('${reply.id}')">
                                    <i class="fas fa-flag"></i> Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCommentActions(commentId) {
        const comment = this.findComment(commentId);
        const element = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!comment || !element) return;

        // Update like button
        const likeBtn = element.querySelector('.comment-action[onclick*="likeComment"]');
        const likeSpan = likeBtn.querySelector('span');
        likeBtn.classList.toggle('active', comment.likedByUser);
        likeSpan.textContent = comment.likes || '';

        // Update dislike button
        const dislikeBtn = element.querySelector('.comment-action[onclick*="dislikeComment"]');
        const dislikeSpan = dislikeBtn.querySelector('span');
        dislikeBtn.classList.toggle('active', comment.dislikedByUser);
        if (dislikeSpan) {
            dislikeSpan.textContent = comment.dislikes || '';
        }

        // Update heart icon
        const heartIcon = element.querySelector('.hearted');
        if (comment.hearted && !heartIcon) {
            const heartEl = document.createElement('i');
            heartEl.className = 'fas fa-heart hearted';
            heartEl.title = 'Hearted by creator';
            element.querySelector('.comment-header').appendChild(heartEl);
        } else if (!comment.hearted && heartIcon) {
            heartIcon.remove();
        }
    }

    hideCommentActions() {
        const actions = document.querySelector('.comment-actions');
        if (actions) actions.remove();
        
        const commentInput = document.querySelector('.comment-input');
        if (commentInput) {
            commentInput.placeholder = 'Add a comment...';
        }
    }

    cancelComment() {
        const commentInput = document.querySelector('.comment-input');
        commentInput.value = '';
        this.hideCommentActions();
        this.replyingTo = null;
    }

    formatText(format) {
        const commentInput = document.querySelector('.comment-input');
        const start = commentInput.selectionStart;
        const end = commentInput.selectionEnd;
        const selectedText = commentInput.value.substring(start, end);
        
        let formattedText;
        switch (format) {
            case 'bold':
                formattedText = `*${selectedText}*`;
                break;
            case 'italic':
                formattedText = `_${selectedText}_`;
                break;
            default:
                return;
        }
        
        commentInput.value = 
            commentInput.value.substring(0, start) + 
            formattedText + 
            commentInput.value.substring(end);
        
        commentInput.focus();
        commentInput.setSelectionRange(start + 1, start + 1 + selectedText.length);
    }

    showLinkDialog() {
        const url = prompt('Enter the URL:');
        if (url) {
            const text = prompt('Enter the display text (optional):') || url;
            const commentInput = document.querySelector('.comment-input');
            const start = commentInput.selectionStart;
            const linkText = `[${text}](${url})`;
            
            commentInput.value = 
                commentInput.value.substring(0, start) + 
                linkText + 
                commentInput.value.substring(commentInput.selectionEnd);
        }
    }

    showEmojiPicker() {
        const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '😢', '😮', '😡'];
        const emoji = prompt(`Choose an emoji:\n${emojis.map((e, i) => `${i + 1}. ${e}`).join(' ')}\n\nEnter number (1-${emojis.length}):`);
        
        if (emoji && emoji >= 1 && emoji <= emojis.length) {
            const commentInput = document.querySelector('.comment-input');
            const start = commentInput.selectionStart;
            const selectedEmoji = emojis[emoji - 1];
            
            commentInput.value = 
                commentInput.value.substring(0, start) + 
                selectedEmoji + 
                commentInput.value.substring(commentInput.selectionEnd);
            
            commentInput.focus();
        }
    }
}

// Make CommentSystem globally available
window.CommentSystem = CommentSystem;

// Initialize comment system will be done in script.js