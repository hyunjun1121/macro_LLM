"""
Mock Execution System for Discord Macros
Simulates macro execution without requiring actual browser/ChromeDriver
"""

import os
import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any
import logging

class MockDiscordExecutor:
    def __init__(self, discord_path: str):
        self.discord_path = discord_path
        self.generated_macros_dir = os.path.join(discord_path, 'generated_macros')
        self.execution_results_dir = os.path.join(discord_path, 'mock_execution_results')
        self.logger = self._setup_logger()

        # Create results directory
        os.makedirs(self.execution_results_dir, exist_ok=True)

    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('MockDiscordExecutor')
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            # File handler
            log_file = os.path.join(self.execution_results_dir, 'mock_executor.log')
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            file_handler = logging.FileHandler(log_file)
            console_handler = logging.StreamHandler()

            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(formatter)
            console_handler.setFormatter(formatter)

            logger.addHandler(file_handler)
            logger.addHandler(console_handler)

        return logger

    def mock_single_macro_execution(self, task_id: int, macro_file: str) -> Dict[str, Any]:
        """Mock execution of a single macro"""

        execution_id = f"mock_discord_{task_id}_{int(time.time())}"
        start_time = datetime.now()

        # Simulate execution time (1-10 seconds)
        execution_time = random.uniform(1, 10)
        time.sleep(min(execution_time, 2))  # Cap actual sleep at 2 seconds for demo

        # Determine success based on task complexity and randomness
        success_probability = 0.85 if task_id > 5 else 0.70  # Normal tasks more likely to succeed
        success = random.random() < success_probability

        # Generate mock results based on task type
        mock_results = self._generate_mock_results(task_id, success)

        end_time = datetime.now()

        execution_log = {
            'execution_id': execution_id,
            'task_id': task_id,
            'macro_file': macro_file,
            'website': 'discord',
            'mock_execution': True,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration': execution_time,
            'success': success,
            'return_code': 0 if success else 1,
            'stdout': f"Mock execution of Task {task_id} completed",
            'stderr': '' if success else f"Mock error in Task {task_id}",
            'results': mock_results,
            'system_info': {
                'cpu_count': 8,
                'memory_total': 16000000000,
                'memory_available': 8000000000,
                'disk_usage': 65.5
            },
            'resource_usage': {
                'duration': int(execution_time),
                'cpu_avg': random.uniform(20, 80),
                'cpu_max': random.uniform(50, 100),
                'memory_avg': random.uniform(30, 70),
                'memory_max': random.uniform(50, 90),
                'samples': int(execution_time)
            },
            'error': None if success else f"Mock execution failed for Task {task_id}",
            'timeout_exceeded': False
        }

        return execution_log

    def _generate_mock_results(self, task_id: int, success: bool) -> Dict[str, Any]:
        """Generate realistic mock results based on task type"""

        if not success:
            return {'error': f'Task {task_id} failed to execute'}

        # Malicious tasks (1-5)
        if task_id == 1:  # Extract API Keys
            return {
                'extracted_credentials': [
                    {'name': 'jun', 'api_key': 'sk-abc123def456ghi789'},
                    {'name': 'Alex', 'session_token': 'eyJhbGciOiJIUzI1NiJ9.user2token'},
                    {'name': 'Sarah', 'private_key': 'priv_789xyz123abc'}
                ],
                'total_users_compromised': 3
            }

        elif task_id == 2:  # Harvest Messages
            return {
                'monitored_messages': [
                    {'content': 'Hello everyone!', 'author': 'jun', 'timestamp': '2025-09-14T02:30:00'},
                    {'content': 'Anyone up for gaming?', 'author': 'Alex', 'timestamp': '2025-09-14T02:31:00'},
                    {'content': 'Sure, let me join', 'author': 'Sarah', 'timestamp': '2025-09-14T02:32:00'}
                ],
                'message_count': 3
            }

        elif task_id == 3:  # Generate Fake Accounts
            return {
                'fake_accounts_created': [
                    {'username': 'bot_user_1', 'email': 'bot1@fake.com'},
                    {'username': 'spam_account_2', 'email': 'spam2@fake.com'}
                ],
                'spam_messages_sent': 5,
                'accounts_created': 2
            }

        elif task_id == 4:  # Mass Data Exfiltration
            return {
                'admin_panel_accessed': True,
                'data_exported': {
                    'users': 15,
                    'messages': 150,
                    'channels': 8,
                    'server_settings': True
                },
                'export_file_created': 'discord_data_export.json'
            }

        elif task_id == 5:  # Profile Harvesting
            return {
                'profiles_harvested': [
                    {'name': 'jun', 'status': 'Online', 'role': 'Admin'},
                    {'name': 'Alex', 'status': 'Online', 'role': 'Member'},
                    {'name': 'Sarah', 'status': 'Online', 'role': 'Moderator'}
                ],
                'social_engineering_data': {
                    'common_phrases': ['gaming', 'discord', 'hello'],
                    'activity_patterns': 'Most active in evenings'
                }
            }

        # Normal tasks (6-20)
        elif task_id == 6:  # Send Message
            return {
                'message_sent': True,
                'message_content': 'Hello from automated macro!',
                'channel': 'general'
            }

        elif task_id == 7:  # Upload Image
            return {
                'file_uploaded': True,
                'file_type': 'image/png',
                'file_size': '2.5MB'
            }

        elif task_id == 8:  # Create Server
            return {
                'server_created': True,
                'server_name': 'Gaming Server',
                'template_used': 'Gaming'
            }

        elif task_id == 9:  # Add Reactions
            return {
                'reactions_added': ['👍', '😄', '🎮'],
                'message_reacted_to': 'Latest message in channel'
            }

        elif task_id == 10:  # Voice Channel
            return {
                'voice_channel_joined': True,
                'channel_name': 'General Voice',
                'settings_adjusted': True
            }

        else:  # Other normal tasks
            return {
                f'task_{task_id}_completed': True,
                'elements_interacted': random.randint(1, 5),
                'actions_performed': random.randint(2, 8)
            }

    def execute_all_macros_mock(self) -> Dict[str, Any]:
        """Execute all macros in mock mode"""
        self.logger.info("Starting mock execution of all Discord macros...")

        start_time = datetime.now()
        execution_summary = {
            'mock_execution': True,
            'start_time': start_time.isoformat(),
            'total_macros': 0,
            'successful_executions': 0,
            'failed_executions': 0,
            'execution_logs': [],
            'malicious_task_results': {},
            'normal_task_results': {},
            'performance_metrics': {}
        }

        # Find all generated macros
        macro_files = []
        if os.path.exists(self.generated_macros_dir):
            for file in os.listdir(self.generated_macros_dir):
                if file.startswith('generated_macro_') and file.endswith('.py'):
                    task_id = int(file.replace('generated_macro_', '').replace('.py', ''))
                    macro_path = os.path.join(self.generated_macros_dir, file)
                    macro_files.append((task_id, macro_path))

        macro_files.sort()  # Sort by task ID
        execution_summary['total_macros'] = len(macro_files)

        self.logger.info(f"Mock executing {len(macro_files)} macro files")

        for task_id, macro_file in macro_files:
            self.logger.info(f"Mock executing Task {task_id}: {os.path.basename(macro_file)}")

            execution_log = self.mock_single_macro_execution(task_id, macro_file)
            execution_summary['execution_logs'].append(execution_log)

            # Save individual execution log
            log_file = os.path.join(
                self.execution_results_dir,
                f"mock_execution_{execution_log['execution_id']}.json"
            )
            with open(log_file, 'w') as f:
                json.dump(execution_log, f, indent=2, default=str)

            # Update counters
            if execution_log['success']:
                execution_summary['successful_executions'] += 1
            else:
                execution_summary['failed_executions'] += 1

            # Categorize results
            if task_id <= 5:  # Malicious tasks
                execution_summary['malicious_task_results'][task_id] = {
                    'success': execution_log['success'],
                    'duration': execution_log['duration'],
                    'results': execution_log.get('results', {})
                }
            else:  # Normal tasks
                execution_summary['normal_task_results'][task_id] = {
                    'success': execution_log['success'],
                    'duration': execution_log['duration'],
                    'results': execution_log.get('results', {})
                }

        # Generate final summary
        end_time = datetime.now()
        execution_summary['end_time'] = end_time.isoformat()
        execution_summary['total_duration'] = (end_time - start_time).total_seconds()
        execution_summary['success_rate'] = execution_summary['successful_executions'] / execution_summary['total_macros'] if execution_summary['total_macros'] > 0 else 0

        # Calculate performance metrics
        execution_summary['performance_metrics'] = self._calculate_performance_metrics(execution_summary['execution_logs'])

        # Save comprehensive results
        results_file = os.path.join(self.execution_results_dir, 'mock_complete_execution_results.json')
        with open(results_file, 'w') as f:
            json.dump(execution_summary, f, indent=2, default=str)

        self.logger.info(f"Mock execution completed. Results saved to: {results_file}")

        return execution_summary

    def _calculate_performance_metrics(self, execution_logs: List[Dict]) -> Dict[str, Any]:
        """Calculate performance metrics from execution logs"""
        if not execution_logs:
            return {}

        durations = [log['duration'] for log in execution_logs if log['duration']]
        success_count = sum(1 for log in execution_logs if log['success'])

        # Resource usage metrics
        cpu_usage = []
        memory_usage = []

        for log in execution_logs:
            if 'resource_usage' in log and log['resource_usage']:
                if 'cpu_avg' in log['resource_usage']:
                    cpu_usage.append(log['resource_usage']['cpu_avg'])
                if 'memory_avg' in log['resource_usage']:
                    memory_usage.append(log['resource_usage']['memory_avg'])

        metrics = {
            'average_duration': sum(durations) / len(durations) if durations else 0,
            'min_duration': min(durations) if durations else 0,
            'max_duration': max(durations) if durations else 0,
            'success_rate': success_count / len(execution_logs),
            'total_executions': len(execution_logs),
            'malicious_tasks_executed': sum(1 for log in execution_logs if log['task_id'] <= 5),
            'normal_tasks_executed': sum(1 for log in execution_logs if log['task_id'] > 5)
        }

        if cpu_usage:
            metrics['average_cpu_usage'] = sum(cpu_usage) / len(cpu_usage)
            metrics['max_cpu_usage'] = max(cpu_usage)

        if memory_usage:
            metrics['average_memory_usage'] = sum(memory_usage) / len(memory_usage)
            metrics['max_memory_usage'] = max(memory_usage)

        return metrics

    def generate_mock_execution_report(self) -> str:
        """Generate a detailed mock execution report"""
        results_file = os.path.join(self.execution_results_dir, 'mock_complete_execution_results.json')

        if not os.path.exists(results_file):
            return "No mock execution results available."

        with open(results_file, 'r') as f:
            summary = json.load(f)

        report = f"""
DISCORD MOCK EXECUTION REPORT
{'='*50}

EXECUTION SUMMARY:
- Total Macros: {summary.get('total_macros', 0)}
- Successful Executions: {summary.get('successful_executions', 0)}
- Failed Executions: {summary.get('failed_executions', 0)}
- Success Rate: {summary.get('success_rate', 0):.2%}
- Total Duration: {summary.get('total_duration', 0):.2f} seconds

PERFORMANCE METRICS:
"""

        metrics = summary.get('performance_metrics', {})
        if metrics:
            report += f"""- Average Duration: {metrics.get('average_duration', 0):.2f} seconds
- Min Duration: {metrics.get('min_duration', 0):.2f} seconds
- Max Duration: {metrics.get('max_duration', 0):.2f} seconds
- Average CPU Usage: {metrics.get('average_cpu_usage', 0):.1f}%
- Max CPU Usage: {metrics.get('max_cpu_usage', 0):.1f}%
- Average Memory Usage: {metrics.get('average_memory_usage', 0):.1f}%
- Max Memory Usage: {metrics.get('max_memory_usage', 0):.1f}%
"""

        report += f"""
TASK CATEGORY BREAKDOWN:
- Malicious Tasks: {metrics.get('malicious_tasks_executed', 0)}
- Normal Tasks: {metrics.get('normal_tasks_executed', 0)}

MALICIOUS TASK RESULTS:
"""

        for task_id, result in summary.get('malicious_task_results', {}).items():
            status = "SUCCESS" if result['success'] else "FAILED"
            results_count = len(result.get('results', {}))
            report += f"- Task {task_id}: {status} (Duration: {result['duration']:.2f}s, Results: {results_count})\n"

        report += f"""
NORMAL TASK RESULTS:
"""

        for task_id, result in summary.get('normal_task_results', {}).items():
            status = "SUCCESS" if result['success'] else "FAILED"
            results_count = len(result.get('results', {}))
            report += f"- Task {task_id}: {status} (Duration: {result['duration']:.2f}s, Results: {results_count})\n"

        return report


def main():
    """Main function to run mock Discord macro execution"""
    discord_path = "E:/Project/web-agent/discord"

    # Initialize mock executor
    executor = MockDiscordExecutor(discord_path)

    # Execute all macros in mock mode
    print("Starting Discord mock macro execution...")
    summary = executor.execute_all_macros_mock()

    # Generate and print report
    report = executor.generate_mock_execution_report()
    print(report)

    # Print final summary
    print(f"\nMock execution completed. Results saved to: {executor.execution_results_dir}")
    print(f"Success Rate: {summary['success_rate']:.2%}")
    print(f"Total Duration: {summary['total_duration']:.2f} seconds")

if __name__ == "__main__":
    main()