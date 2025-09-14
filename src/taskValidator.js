export class TaskValidator {
  constructor() {
    this.validationRules = {};
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    this.validationRules = {
      // Button click validations
      'button_click': {
        validate: async (page, task, initialState) => {
          const results = {
            success: false,
            validations: [],
            evidence: {}
          };

          // Check if button was clicked (common indicators)
          const buttonClickEvidence = await page.evaluate(() => {
            const clickedButtons = document.querySelectorAll('button.clicked, button[aria-pressed="true"], button.active');
            const focusedElements = document.activeElement;
            const modalDialogs = document.querySelectorAll('.modal, .dialog, [role="dialog"]');

            return {
              clickedButtons: clickedButtons.length,
              activeElement: focusedElements ? focusedElements.tagName + (focusedElements.className ? '.' + focusedElements.className : '') : null,
              modalsOpened: modalDialogs.length,
              urlChanged: window.location.href
            };
          });

          results.evidence.buttonClick = buttonClickEvidence;

          // Validation criteria
          if (buttonClickEvidence.clickedButtons > 0) {
            results.validations.push({ check: 'button_has_clicked_state', passed: true });
          }
          if (buttonClickEvidence.modalsOpened > 0) {
            results.validations.push({ check: 'modal_opened', passed: true });
          }
          if (buttonClickEvidence.urlChanged !== initialState.url) {
            results.validations.push({ check: 'url_changed', passed: true });
          }

          // Success if any validation passes
          results.success = results.validations.some(v => v.passed);
          return results;
        }
      },

      // Form submission validations
      'form_submit': {
        validate: async (page, task, initialState) => {
          const results = {
            success: false,
            validations: [],
            evidence: {}
          };

          const formEvidence = await page.evaluate(() => {
            const forms = document.querySelectorAll('form');
            const successMessages = document.querySelectorAll('.success, .submitted, .thank-you, [class*="success"]');
            const errorMessages = document.querySelectorAll('.error, .invalid, [class*="error"]');
            const loadingIndicators = document.querySelectorAll('.loading, .spinner, [class*="loading"]');

            return {
              totalForms: forms.length,
              successMessages: successMessages.length,
              errorMessages: errorMessages.length,
              loadingIndicators: loadingIndicators.length,
              urlChanged: window.location.href
            };
          });

          results.evidence.form = formEvidence;

          // Validation criteria
          if (formEvidence.successMessages > 0) {
            results.validations.push({ check: 'success_message_shown', passed: true });
          }
          if (formEvidence.urlChanged !== initialState.url) {
            results.validations.push({ check: 'redirect_after_submit', passed: true });
          }
          if (formEvidence.errorMessages === 0) {
            results.validations.push({ check: 'no_error_messages', passed: true });
          }

          results.success = results.validations.some(v => v.passed);
          return results;
        }
      },

      // Navigation validations
      'navigation': {
        validate: async (page, task, initialState) => {
          const results = {
            success: false,
            validations: [],
            evidence: {}
          };

          const navEvidence = await page.evaluate(() => {
            const currentUrl = window.location.href;
            const currentTitle = document.title;
            const breadcrumbs = document.querySelectorAll('.breadcrumb, nav[aria-label="breadcrumb"], .breadcrumbs');
            const activeNavItems = document.querySelectorAll('nav .active, .nav-active, [aria-current="page"]');

            return {
              currentUrl,
              currentTitle,
              breadcrumbs: breadcrumbs.length,
              activeNavItems: activeNavItems.length
            };
          });

          results.evidence.navigation = navEvidence;

          // Validation criteria
          if (navEvidence.currentUrl !== initialState.url) {
            results.validations.push({ check: 'url_changed', passed: true });
          }
          if (navEvidence.currentTitle !== initialState.title) {
            results.validations.push({ check: 'title_changed', passed: true });
          }
          if (navEvidence.activeNavItems > 0) {
            results.validations.push({ check: 'nav_item_highlighted', passed: true });
          }

          results.success = results.validations.some(v => v.passed);
          return results;
        }
      },

      // Search validations
      'search': {
        validate: async (page, task, initialState) => {
          const results = {
            success: false,
            validations: [],
            evidence: {}
          };

          const searchEvidence = await page.evaluate(() => {
            const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], .search-input');
            const searchResults = document.querySelectorAll('.search-results, .results, [class*="search-result"]');
            const resultCount = document.querySelectorAll('.result-count, .search-count, [class*="result-count"]');
            const noResults = document.querySelectorAll('.no-results, .no-search-results, [class*="no-result"]');

            let searchValue = '';
            if (searchInputs.length > 0) {
              searchValue = searchInputs[0].value;
            }

            return {
              searchInputValue: searchValue,
              searchResults: searchResults.length,
              resultCount: resultCount.length,
              noResultsMsg: noResults.length,
              urlChanged: window.location.href
            };
          });

          results.evidence.search = searchEvidence;

          // Validation criteria
          if (searchEvidence.searchInputValue.length > 0) {
            results.validations.push({ check: 'search_term_entered', passed: true });
          }
          if (searchEvidence.searchResults > 0) {
            results.validations.push({ check: 'search_results_shown', passed: true });
          }
          if (searchEvidence.urlChanged !== initialState.url) {
            results.validations.push({ check: 'search_url_changed', passed: true });
          }

          results.success = results.validations.some(v => v.passed);
          return results;
        }
      },

      // Generic interaction validation
      'interaction': {
        validate: async (page, task, initialState) => {
          const results = {
            success: false,
            validations: [],
            evidence: {}
          };

          const interactionEvidence = await page.evaluate((initial) => {
            // Compare DOM changes
            const currentHTML = document.documentElement.outerHTML;
            const currentUrl = window.location.href;
            const currentTitle = document.title;
            const alerts = document.querySelectorAll('.alert, .notification, .message');
            const modals = document.querySelectorAll('.modal, .popup, [role="dialog"]');

            return {
              htmlChanged: currentHTML !== initial.html,
              urlChanged: currentUrl !== initial.url,
              titleChanged: currentTitle !== initial.title,
              alertsShown: alerts.length,
              modalsShown: modals.length,
              currentUrl,
              currentTitle
            };
          }, initialState);

          results.evidence.interaction = interactionEvidence;

          // Validation criteria
          if (interactionEvidence.htmlChanged) {
            results.validations.push({ check: 'dom_changed', passed: true });
          }
          if (interactionEvidence.urlChanged) {
            results.validations.push({ check: 'url_changed', passed: true });
          }
          if (interactionEvidence.alertsShown > 0) {
            results.validations.push({ check: 'alerts_shown', passed: true });
          }
          if (interactionEvidence.modalsShown > 0) {
            results.validations.push({ check: 'modals_opened', passed: true });
          }

          results.success = results.validations.some(v => v.passed);
          return results;
        }
      }
    };
  }

  async captureInitialState(page) {
    return await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        html: document.documentElement.outerHTML
      };
    });
  }

  async validateTask(page, task, initialState) {
    console.log(`      [VALIDATOR] Validating task: ${task.description}`);

    // Determine validation type based on task description/category
    let validationType = this.determineValidationType(task);

    console.log(`      [VALIDATOR] Using validation type: ${validationType}`);

    if (!this.validationRules[validationType]) {
      console.warn(`      [VALIDATOR] No validation rule for type: ${validationType}, using 'interaction'`);
      validationType = 'interaction';
    }

    const validator = this.validationRules[validationType];
    const results = await validator.validate(page, task, initialState);

    // Enhanced validation with task-specific ground truth
    const enhancedResults = await this.enhanceWithGroundTruth(results, task, page);

    console.log(`      [VALIDATOR] Validation result: ${enhancedResults.success}`);
    console.log(`      [VALIDATOR] Passed checks: ${enhancedResults.validations.filter(v => v.passed).length}/${enhancedResults.validations.length}`);

    return enhancedResults;
  }

  async enhanceWithGroundTruth(results, task, page) {
    // Add task-specific validations based on expectedResult
    if (task.expectedResult) {
      const groundTruthChecks = await this.createGroundTruthChecks(task, page);
      results.validations.push(...groundTruthChecks);
    }

    // Add task difficulty-based scoring
    if (task.difficulty) {
      results.difficultyScore = this.calculateDifficultyScore(results, task.difficulty);
    }

    // Recalculate success based on enhanced validations
    const passedChecks = results.validations.filter(v => v.passed).length;
    const totalChecks = results.validations.length;

    // Success threshold: at least 50% of checks must pass
    results.success = passedChecks >= Math.max(1, Math.ceil(totalChecks * 0.5));
    results.successRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    return results;
  }

  async createGroundTruthChecks(task, page) {
    const checks = [];
    const expectedResult = task.expectedResult?.toLowerCase() || '';

    // Parse expected result for specific validations
    if (expectedResult.includes('button') && expectedResult.includes('click')) {
      const buttonCheck = await page.evaluate(() => {
        const clickedButtons = document.querySelectorAll('button.clicked, button[aria-pressed="true"], button.active');
        return clickedButtons.length > 0;
      });
      checks.push({
        check: 'expected_button_clicked',
        passed: buttonCheck,
        description: 'Expected button click behavior'
      });
    }

    if (expectedResult.includes('form') && expectedResult.includes('submit')) {
      const formCheck = await page.evaluate(() => {
        const successIndicators = document.querySelectorAll('.success, .submitted, .thank-you');
        return successIndicators.length > 0;
      });
      checks.push({
        check: 'expected_form_submission',
        passed: formCheck,
        description: 'Expected form submission behavior'
      });
    }

    if (expectedResult.includes('navigate') || expectedResult.includes('redirect')) {
      const currentUrl = await page.url();
      const urlChanged = !currentUrl.includes('index.html'); // Simple check
      checks.push({
        check: 'expected_navigation',
        passed: urlChanged,
        description: 'Expected navigation behavior'
      });
    }

    if (expectedResult.includes('search')) {
      const searchCheck = await page.evaluate(() => {
        const searchResults = document.querySelectorAll('.search-results, .results, [class*="result"]');
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        return searchResults.length > 0 || Array.from(searchInputs).some(input => input.value.length > 0);
      });
      checks.push({
        check: 'expected_search_behavior',
        passed: searchCheck,
        description: 'Expected search behavior'
      });
    }

    return checks;
  }

  calculateDifficultyScore(results, difficulty) {
    const baseScore = results.success ? 100 : 0;
    const difficultyMultiplier = {
      'easy': 1.0,
      'medium': 1.2,
      'hard': 1.5,
      'expert': 2.0
    };

    return Math.round(baseScore * (difficultyMultiplier[difficulty] || 1.0));
  }

  determineValidationType(task) {
    const description = task.description?.toLowerCase() || '';
    const category = task.category?.toLowerCase() || '';

    // Button click patterns
    if (description.includes('click') && (description.includes('button') || description.includes('submit'))) {
      return 'button_click';
    }

    // Form submission patterns
    if (description.includes('submit') || description.includes('form') || category.includes('form')) {
      return 'form_submit';
    }

    // Navigation patterns
    if (description.includes('navigate') || description.includes('go to') || description.includes('visit')) {
      return 'navigation';
    }

    // Search patterns
    if (description.includes('search') || description.includes('find') || category.includes('search')) {
      return 'search';
    }

    // Default to generic interaction
    return 'interaction';
  }

  // Add custom validation rule
  addValidationRule(type, validationFunction) {
    this.validationRules[type] = {
      validate: validationFunction
    };
  }
}