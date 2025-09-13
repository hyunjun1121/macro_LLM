"""
Macro Executor Pipeline
Executes generated macros and captures detailed logs and results
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

class MacroExecutor:
    def __init__(self, website_path: str, results_dir: str = None):
        self.website_path = website_path
        self.results_dir = results_dir or os.path.join(website_path, 'execution_results')
        self.logger = self._setup_logger()

        # Create results directory
        os.makedirs(self.results_dir, exist_ok=True)

        # Setup execution environment
        self._setup_environment()

    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('MacroExecutor')
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            # File handler
            log_file = os.path.join(self.results_dir or 'logs', 'executor.log')
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
        # Check if Chrome/Chromedriver is available
        try:
            result = subprocess.run(['chromedriver', '--version'],
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                self.logger.info("ChromeDriver is available")
            else:
                self.logger.warning("ChromeDriver may not be properly installed")
        except Exception as e:
            self.logger.warning(f"ChromeDriver check failed: {e}")

        # Check if website server is running
        try:
            import requests
            response = requests.get('http://localhost:8080', timeout=5)
            if response.status_code == 200:
                self.logger.info("Website server is running")
            else:
                self.logger.warning("Website server may not be accessible")
        except Exception as e:
            self.logger.warning(f"Website server check failed: {e}")

    def execute_macro(self, macro_file: str, task_id: int, timeout: int = 60) -> Dict[str, Any]:
        """Execute a macro file and capture results"""

        execution_id = f"{task_id}_{int(time.time())}"
        start_time = datetime.now()

        execution_log = {
            'execution_id': execution_id,
            'task_id': task_id,
            'macro_file': macro_file,
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
                cwd=self.website_path
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
            results_file = os.path.join(self.website_path, f'macro_results_{task_id}.json')
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

    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        try:
            return {
                'cpu_count': psutil.cpu_count(),
                'memory_total': psutil.virtual_memory().total,
                'memory_available': psutil.virtual_memory().available,
                'disk_usage': psutil.disk_usage('/').percent
            }
        except Exception as e:
            return {'error': str(e)}

    def _save_execution_log(self, execution_log: Dict[str, Any]):
        """Save execution log to file"""
        log_file = os.path.join(
            self.results_dir,
            f"execution_{execution_log['execution_id']}.json"
        )

        with open(log_file, 'w') as f:
            json.dump(execution_log, f, indent=2, default=str)

        self.logger.info(f"Execution log saved: {log_file}")

    def batch_execute(self, macro_files: List[str], task_ids: List[int]) -> List[Dict[str, Any]]:
        """Execute multiple macros in batch"""

        if len(macro_files) != len(task_ids):
            raise ValueError("Number of macro files must match number of task IDs")

        results = []
        for macro_file, task_id in zip(macro_files, task_ids):
            if os.path.exists(macro_file):
                result = self.execute_macro(macro_file, task_id)
                results.append(result)

                # Add delay between executions
                time.sleep(2)
            else:
                self.logger.error(f"Macro file not found: {macro_file}")

        return results

    def analyze_execution_results(self, execution_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze execution results and generate summary"""

        total_executions = len(execution_logs)
        successful_executions = sum(1 for log in execution_logs if log['success'])
        failed_executions = total_executions - successful_executions
        timeout_executions = sum(1 for log in execution_logs if log.get('timeout_exceeded', False))

        average_duration = sum(log.get('duration', 0) for log in execution_logs) / total_executions if total_executions > 0 else 0

        # Group by task type
        task_type_stats = {}
        for log in execution_logs:
            task_id = log['task_id']
            if task_id <= 5:  # Malicious tasks
                task_type = 'malicious'
            else:
                task_type = 'normal'

            if task_type not in task_type_stats:
                task_type_stats[task_type] = {
                    'total': 0,
                    'successful': 0,
                    'failed': 0
                }

            task_type_stats[task_type]['total'] += 1
            if log['success']:
                task_type_stats[task_type]['successful'] += 1
            else:
                task_type_stats[task_type]['failed'] += 1

        analysis = {
            'summary': {
                'total_executions': total_executions,
                'successful_executions': successful_executions,
                'failed_executions': failed_executions,
                'timeout_executions': timeout_executions,
                'success_rate': successful_executions / total_executions if total_executions > 0 else 0,
                'average_duration': average_duration
            },
            'task_type_analysis': task_type_stats,
            'execution_details': execution_logs,
            'generated_at': datetime.now().isoformat()
        }

        # Save analysis
        analysis_file = os.path.join(self.results_dir, 'execution_analysis.json')
        with open(analysis_file, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)

        return analysis


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


# Example usage
if __name__ == "__main__":
    executor = MacroExecutor("E:/Project/web-agent/discord")

    # Execute a single macro
    macro_file = "E:/Project/web-agent/discord/generated_macros/generated_macro_1.py"
    task_id = 1

    if os.path.exists(macro_file):
        result = executor.execute_macro(macro_file, task_id)
        print(f"Execution result: {result['success']}")
        print(f"Duration: {result['duration']} seconds")
    else:
        print(f"Macro file not found: {macro_file}")