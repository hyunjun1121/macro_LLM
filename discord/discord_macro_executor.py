"""
Discord Macro Execution System
Executes generated Discord macros and captures detailed execution logs
"""

import os
import json
import subprocess
import time
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any
import psutil
import threading
import queue

class DiscordMacroExecutor:
    def __init__(self, discord_path: str):
        self.discord_path = discord_path
        self.generated_macros_dir = os.path.join(discord_path, 'generated_macros')
        self.execution_results_dir = os.path.join(discord_path, 'execution_results')
        self.logger = self._setup_logger()

        # Create results directory
        os.makedirs(self.execution_results_dir, exist_ok=True)

        # Setup execution environment
        self._setup_environment()

    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('DiscordMacroExecutor')
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            # File handler
            log_file = os.path.join(self.execution_results_dir, 'executor.log')
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

    def _setup_environment(self):
        """Setup execution environment"""
        # Check if ChromeDriver is available
        try:
            result = subprocess.run(['chromedriver', '--version'],
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                self.logger.info("ChromeDriver is available")
            else:
                self.logger.warning("ChromeDriver may not be properly installed")
        except Exception as e:
            self.logger.warning(f"ChromeDriver check failed: {e}")

        # Check if Discord website is available (assuming local server)
        self.logger.info("Discord macro execution environment initialized")

    def execute_single_macro(self, macro_file: str, task_id: int, timeout: int = 120) -> Dict[str, Any]:
        """Execute a single macro file and capture results"""

        execution_id = f"discord_{task_id}_{int(time.time())}"
        start_time = datetime.now()

        execution_log = {
            'execution_id': execution_id,
            'task_id': task_id,
            'macro_file': macro_file,
            'website': 'discord',
            'start_time': start_time.isoformat(),
            'end_time': None,
            'duration': None,
            'success': False,
            'return_code': None,
            'stdout': '',
            'stderr': '',
            'results': {},
            'system_info': self._get_system_info(),
            'error': None,
            'timeout_exceeded': False
        }

        self.logger.info(f"Starting macro execution: {execution_id}")

        try:
            # Monitor system resources during execution
            resource_monitor = ResourceMonitor()
            resource_monitor.start()

            # Execute the macro
            process = subprocess.Popen(
                ['python', macro_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=self.discord_path
            )

            try:
                stdout, stderr = process.communicate(timeout=timeout)
                execution_log['return_code'] = process.returncode
                execution_log['stdout'] = stdout
                execution_log['stderr'] = stderr

                if process.returncode == 0:
                    execution_log['success'] = True
                    self.logger.info(f"Macro executed successfully: {execution_id}")
                else:
                    self.logger.warning(f"Macro failed with return code {process.returncode}: {execution_id}")

            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                execution_log['timeout_exceeded'] = True
                execution_log['stdout'] = stdout
                execution_log['stderr'] = stderr
                self.logger.error(f"Macro execution timeout: {execution_id}")

            # Stop resource monitoring
            resource_monitor.stop()
            execution_log['resource_usage'] = resource_monitor.get_stats()

            # Try to load macro results if they exist
            results_file = os.path.join(self.discord_path, f'macro_results_{task_id}.json')
            if os.path.exists(results_file):
                try:
                    with open(results_file, 'r') as f:
                        execution_log['results'] = json.load(f)
                except Exception as e:
                    self.logger.warning(f"Failed to load macro results: {e}")

        except Exception as e:
            execution_log['error'] = str(e)
            execution_log['stderr'] = traceback.format_exc()
            self.logger.error(f"Macro execution error: {e}")

        finally:
            end_time = datetime.now()
            execution_log['end_time'] = end_time.isoformat()
            execution_log['duration'] = (end_time - start_time).total_seconds()

            # Save execution log
            self._save_execution_log(execution_log)

        return execution_log

    def execute_all_macros(self, timeout_per_macro: int = 120) -> Dict[str, Any]:
        """Execute all generated macros"""
        self.logger.info("Starting execution of all Discord macros...")

        start_time = datetime.now()
        execution_summary = {
            'start_time': start_time.isoformat(),
            'total_macros': 0,
            'successful_executions': 0,
            'failed_executions': 0,
            'timeout_executions': 0,
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

        self.logger.info(f"Found {len(macro_files)} macro files to execute")

        for task_id, macro_file in macro_files:
            self.logger.info(f"Executing Task {task_id}: {os.path.basename(macro_file)}")

            execution_log = self.execute_single_macro(macro_file, task_id, timeout_per_macro)
            execution_summary['execution_logs'].append(execution_log)

            # Update counters
            if execution_log['success']:
                execution_summary['successful_executions'] += 1
            else:
                execution_summary['failed_executions'] += 1

            if execution_log['timeout_exceeded']:
                execution_summary['timeout_executions'] += 1

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

            # Add delay between executions to prevent conflicts
            time.sleep(3)

        # Generate final summary
        end_time = datetime.now()
        execution_summary['end_time'] = end_time.isoformat()
        execution_summary['total_duration'] = (end_time - start_time).total_seconds()
        execution_summary['success_rate'] = execution_summary['successful_executions'] / execution_summary['total_macros'] if execution_summary['total_macros'] > 0 else 0

        # Calculate performance metrics
        execution_summary['performance_metrics'] = self._calculate_performance_metrics(execution_summary['execution_logs'])

        # Save comprehensive results
        results_file = os.path.join(self.execution_results_dir, 'complete_execution_results.json')
        with open(results_file, 'w') as f:
            json.dump(execution_summary, f, indent=2, default=str)

        self.logger.info(f"All macro executions completed. Results saved to: {results_file}")

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

    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        try:
            return {
                'cpu_count': psutil.cpu_count(),
                'memory_total': psutil.virtual_memory().total,
                'memory_available': psutil.virtual_memory().available,
                'disk_usage': psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:\\').percent
            }
        except Exception as e:
            return {'error': str(e)}

    def _save_execution_log(self, execution_log: Dict[str, Any]):
        """Save execution log to file"""
        log_file = os.path.join(
            self.execution_results_dir,
            f"execution_{execution_log['execution_id']}.json"
        )

        with open(log_file, 'w') as f:
            json.dump(execution_log, f, indent=2, default=str)

        self.logger.info(f"Execution log saved: {log_file}")

    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of all executions"""
        summary_file = os.path.join(self.execution_results_dir, 'complete_execution_results.json')

        if os.path.exists(summary_file):
            with open(summary_file, 'r') as f:
                return json.load(f)
        else:
            return {'error': 'No execution results found'}

    def generate_execution_report(self) -> str:
        """Generate a detailed execution report"""
        summary = self.get_execution_summary()

        if 'error' in summary:
            return "No execution results available."

        report = f"""
DISCORD MACRO EXECUTION REPORT
{'='*50}

EXECUTION SUMMARY:
- Total Macros: {summary.get('total_macros', 0)}
- Successful Executions: {summary.get('successful_executions', 0)}
- Failed Executions: {summary.get('failed_executions', 0)}
- Timeout Executions: {summary.get('timeout_executions', 0)}
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

DETAILED RESULTS:
"""

        # Add detailed results for each task
        for log in summary.get('execution_logs', []):
            task_type = "MALICIOUS" if log['task_id'] <= 5 else "NORMAL"
            status = "SUCCESS" if log['success'] else "FAILED"
            report += f"""
Task {log['task_id']} ({task_type}): {status}
- Duration: {log.get('duration', 0):.2f}s
- Results: {len(log.get('results', {}))} items extracted
"""

        return report


class ResourceMonitor:
    """Monitor system resources during macro execution"""

    def __init__(self):
        self.monitoring = False
        self.stats = []
        self.monitor_thread = None

    def start(self):
        """Start monitoring"""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor)
        self.monitor_thread.start()

    def stop(self):
        """Stop monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()

    def _monitor(self):
        """Monitor system resources"""
        while self.monitoring:
            try:
                self.stats.append({
                    'timestamp': time.time(),
                    'cpu_percent': psutil.cpu_percent(),
                    'memory_percent': psutil.virtual_memory().percent,
                    'memory_used': psutil.virtual_memory().used
                })
                time.sleep(1)
            except Exception:
                break

    def get_stats(self) -> Dict[str, Any]:
        """Get monitoring statistics"""
        if not self.stats:
            return {}

        cpu_values = [s['cpu_percent'] for s in self.stats]
        memory_values = [s['memory_percent'] for s in self.stats]

        return {
            'duration': len(self.stats),
            'cpu_avg': sum(cpu_values) / len(cpu_values),
            'cpu_max': max(cpu_values),
            'memory_avg': sum(memory_values) / len(memory_values),
            'memory_max': max(memory_values),
            'samples': len(self.stats)
        }


def main():
    """Main function to run Discord macro execution"""
    discord_path = "E:/Project/web-agent/discord"

    # Initialize executor
    executor = DiscordMacroExecutor(discord_path)

    # Execute all macros
    print("Starting Discord macro execution...")
    summary = executor.execute_all_macros()

    # Generate and print report
    report = executor.generate_execution_report()
    print(report)

    # Print final summary
    print(f"\nExecution completed. Results saved to: {executor.execution_results_dir}")

if __name__ == "__main__":
    main()