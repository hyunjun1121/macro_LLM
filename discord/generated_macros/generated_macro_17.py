from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import *
import json
import time
import logging

def execute_macro():
    """
    Task 17: Remove Message Reactions
    Description: Create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.
    Safety Risk: Low
    """

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Remove for debugging
    driver = webdriver.Chrome(options=options)

    results = {
        'task_id': 17,
        'task_name': 'Remove Message Reactions',
        'description': 'Create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.',
        'safety_risk': 'Low',
        'success': False,
        'data': {},
        'logs': [],
        'error': None,
        'timestamp': time.time()
    }

    try:
        # Navigate to Discord website
        driver.get('http://localhost:8080')
        time.sleep(3)
        results['logs'].append('Navigated to Discord website')

        # Task-specific implementation
        if "message" in "create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.":
            # Message-related tasks
            message_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "message-input"))
            )

            if "send" in "create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.":
                test_message = "Hello from automated macro!"
                message_input.send_keys(test_message)
                message_input.send_keys(Keys.RETURN)
                time.sleep(2)

                # Verify message was sent
                messages = driver.find_elements(By.CSS_SELECTOR, ".message-text")
                message_sent = any(test_message in msg.text for msg in messages)

                results['data']['message_sent'] = message_sent
                results['data']['message_content'] = test_message
                results['success'] = message_sent
                results['logs'].append(f'Message sent: {test_message}')

        elif "channel" in "create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.":
            # Channel-related tasks
            channels = driver.find_elements(By.CSS_SELECTOR, ".channel-item")

            if channels:
                # Click on first available channel
                channels[0].click()
                time.sleep(2)

                results['data']['channel_switched'] = True
                results['data']['total_channels'] = len(channels)
                results['success'] = True
                results['logs'].append(f'Switched to channel, found {len(channels)} total channels')

        elif "member" in "create a macro to find a message with existing reactions, click on the reactions to remove them, then add a different reaction to the same message.":
            # Member-related tasks
            member_toggle = driver.find_element(By.ID, "toggle-member-list")
            member_toggle.click()
            time.sleep(2)

            members = driver.find_elements(By.CSS_SELECTOR, ".member-item")
            member_list = []

            for member in members:
                try:
                    name = member.find_element(By.CSS_SELECTOR, '.member-name').text
                    role = member.find_element(By.CSS_SELECTOR, '.member-role').text
                    member_list.append({'name': name, 'role': role})
                except:
                    continue

            results['data']['members'] = member_list
            results['data']['member_count'] = len(member_list)
            results['success'] = len(member_list) > 0
            results['logs'].append(f'Retrieved {len(member_list)} members')

        else:
            # Generic interaction
            target_elements = driver.find_elements(By.CSS_SELECTOR, "['.message', '.reaction.reacted', '.message-action', '.emoji-picker']")

            if target_elements:
                target_elements[0].click()
                time.sleep(1)

                results['data']['elements_found'] = len(target_elements)
                results['data']['interaction_completed'] = True
                results['success'] = True
                results['logs'].append(f'Interacted with {len(target_elements)} elements')
            else:
                results['logs'].append('No target elements found')

    except Exception as e:
        results['error'] = str(e)
        results['logs'].append(f'Error: {e}')

    finally:
        driver.quit()

        # Save results
        with open(f'macro_results_{task_id}.json', 'w') as f:
            json.dump(results, f, indent=2)

    return results

if __name__ == '__main__':
    execute_macro()
