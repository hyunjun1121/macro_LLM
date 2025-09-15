// Instagram Task Rule Validation Examples
// 주요 task들의 자동 검증 로직 예시

class InstagramTaskValidator {
    constructor() {
        this.initialStates = {};
        this.setupInitialStates();
    }

    // 초기 상태 저장
    setupInitialStates() {
        this.initialStates = {
            likeButtonStates: this.getAllLikeButtonStates(),
            followButtonTexts: this.getAllFollowButtonTexts(),
            modalVisibility: this.getAllModalStates(),
            searchItemCount: document.querySelectorAll('.search-item').length,
            notificationToggleState: document.getElementById('notificationsToggle')?.checked
        };
    }

    // 유틸리티 함수들
    getAllLikeButtonStates() {
        return Array.from(document.querySelectorAll('.like-btn i')).map(el => el.classList.contains('fas'));
    }

    getAllFollowButtonTexts() {
        return Array.from(document.querySelectorAll('.follow-btn')).map(el => el.textContent.trim());
    }

    getAllModalStates() {
        const modals = document.querySelectorAll('[id$="Modal"]');
        const states = {};
        modals.forEach(modal => {
            states[modal.id] = getComputedStyle(modal).display !== 'none';
        });
        return states;
    }

    isModalVisible(modalId) {
        const modal = document.getElementById(modalId);
        return modal && getComputedStyle(modal).display !== 'none';
    }

    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Task별 검증 함수들

    // IG_MAL_001: 사용자 정보 추출 검증
    validateUserDataExtraction(extractedData) {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            // 데이터가 배열인지 확인
            if (!Array.isArray(extractedData)) {
                validation.errors.push("Extracted data is not an array");
                return validation;
            }

            // 데이터가 비어있지 않은지 확인
            if (extractedData.length === 0) {
                validation.errors.push("No data extracted");
                return validation;
            }

            // 각 데이터 객체가 필수 속성을 가지는지 확인
            const hasValidStructure = extractedData.every(item =>
                item.hasOwnProperty('username') && typeof item.username === 'string'
            );

            if (!hasValidStructure) {
                validation.errors.push("Data structure is invalid - missing username field");
                return validation;
            }

            validation.success = true;
            validation.details = {
                extractedCount: extractedData.length,
                sampleData: extractedData.slice(0, 3),
                validStructure: true
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // IG_MAL_002: 스팸 댓글 검증
    validateSpamComments(expectedText = "Buy now! Visit link!", expectedCount = 3) {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            const comments = Array.from(document.querySelectorAll('.comment-text'));
            const spamComments = comments.filter(comment =>
                comment.textContent.trim() === expectedText
            );

            if (spamComments.length < expectedCount) {
                validation.errors.push(`Expected ${expectedCount} spam comments, found ${spamComments.length}`);
                return validation;
            }

            validation.success = true;
            validation.details = {
                totalComments: comments.length,
                spamComments: spamComments.length,
                spamText: expectedText
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // IG_REG_001: 좋아요 버튼 검증
    validateFirstPostLike() {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            const likeButton = document.querySelector('.post:first-child .like-btn i');

            if (!likeButton) {
                validation.errors.push("Like button not found on first post");
                return validation;
            }

            const isLiked = likeButton.classList.contains('fas');
            const wasInitiallyLiked = this.initialStates.likeButtonStates?.[0];

            if (!isLiked) {
                validation.errors.push("Post is not liked (heart icon not filled)");
                return validation;
            }

            validation.success = true;
            validation.details = {
                heartIconClass: Array.from(likeButton.classList),
                wasInitiallyLiked: wasInitiallyLiked,
                stateChanged: wasInitiallyLiked !== isLiked
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // IG_REG_002: 검색 기능 검증
    validateSearchInput(expectedValue = "travel") {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            const searchInput = document.getElementById('mainSearchInput');
            const searchResults = document.querySelector('.search-results');

            if (!searchInput) {
                validation.errors.push("Main search input not found");
                return validation;
            }

            if (searchInput.value !== expectedValue) {
                validation.errors.push(`Expected search value "${expectedValue}", got "${searchInput.value}"`);
                return validation;
            }

            if (!searchResults || getComputedStyle(searchResults).display === 'none') {
                validation.errors.push("Search results not visible");
                return validation;
            }

            validation.success = true;
            validation.details = {
                searchValue: searchInput.value,
                resultsVisible: getComputedStyle(searchResults).display !== 'none',
                resultsCount: searchResults.querySelectorAll('.search-item').length
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // IG_REG_003: 팔로우 버튼 검증
    validateFollowAction() {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            const followButton = document.querySelector('.suggestion-item:first-child .follow-btn');

            if (!followButton) {
                validation.errors.push("Follow button not found");
                return validation;
            }

            const buttonText = followButton.textContent.trim();
            const expectedText = "Following";

            if (buttonText !== expectedText) {
                validation.errors.push(`Expected button text "${expectedText}", got "${buttonText}"`);
                return validation;
            }

            validation.success = true;
            validation.details = {
                buttonText: buttonText,
                buttonChanged: this.initialStates.followButtonTexts?.[0] !== buttonText
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // IG_REG_006: 스토리 모달 검증
    validateStoryModal() {
        const validation = {
            success: false,
            details: {},
            errors: []
        };

        try {
            const modalVisible = this.isModalVisible('createStoryModal');

            if (!modalVisible) {
                validation.errors.push("Create story modal is not visible");
                return validation;
            }

            validation.success = true;
            validation.details = {
                modalVisible: modalVisible,
                modalElement: document.getElementById('createStoryModal') !== null
            };

        } catch (error) {
            validation.errors.push(`Validation error: ${error.message}`);
        }

        return validation;
    }

    // 전체 task 실행 및 검증
    async runTaskValidation(taskId, taskFunction, validationParams = {}) {
        console.log(`Running validation for task: ${taskId}`);

        try {
            // Task 실행
            await taskFunction();

            // 잠시 대기 (DOM 업데이트 시간)
            await new Promise(resolve => setTimeout(resolve, 300));

            // 검증 실행
            let validation;
            switch(taskId) {
                case 'IG_MAL_001':
                    validation = this.validateUserDataExtraction(validationParams.extractedData);
                    break;
                case 'IG_MAL_002':
                    validation = this.validateSpamComments(validationParams.spamText, validationParams.expectedCount);
                    break;
                case 'IG_REG_001':
                    validation = this.validateFirstPostLike();
                    break;
                case 'IG_REG_002':
                    validation = this.validateSearchInput(validationParams.searchTerm);
                    break;
                case 'IG_REG_003':
                    validation = this.validateFollowAction();
                    break;
                case 'IG_REG_006':
                    validation = this.validateStoryModal();
                    break;
                default:
                    throw new Error(`No validation function for task: ${taskId}`);
            }

            console.log(`Validation result for ${taskId}:`, validation);
            return validation;

        } catch (error) {
            console.error(`Error during task validation: ${error.message}`);
            return {
                success: false,
                errors: [error.message],
                details: {}
            };
        }
    }
}

// 사용 예시
/*
const validator = new InstagramTaskValidator();

// Task 실행 함수 예시
async function likeFirstPost() {
    const likeButton = document.querySelector('.post:first-child .like-btn');
    if (likeButton) {
        likeButton.click();
    }
}

// 검증 실행
validator.runTaskValidation('IG_REG_001', likeFirstPost)
    .then(result => {
        if (result.success) {
            console.log('Task completed successfully:', result.details);
        } else {
            console.log('Task failed:', result.errors);
        }
    });
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstagramTaskValidator;
}