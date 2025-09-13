import openai
import anthropic
import requests
import json
import time
import logging
from typing import Dict, Optional

class LLMIntegration:
    def __init__(self, provider='openai', api_key=None, model_name=None):
        """
        Initialize LLM integration

        Args:
            provider: 'openai', 'anthropic', 'claude', or 'local'
            api_key: API key for the service
            model_name: Specific model to use
        """
        self.provider = provider.lower()
        self.api_key = api_key
        self.model_name = model_name or self._get_default_model()
        self.logger = logging.getLogger(__name__)

        self._setup_client()

    def _get_default_model(self):
        """Get default model for each provider"""
        defaults = {
            'openai': 'gpt-4',
            'anthropic': 'claude-3-sonnet-20240229',
            'claude': 'claude-3-sonnet-20240229',
            'local': 'llama2'  # For local Ollama or similar
        }
        return defaults.get(self.provider, 'gpt-4')

    def _setup_client(self):
        """Setup API client based on provider"""
        if self.provider == 'openai':
            if self.api_key:
                openai.api_key = self.api_key
            self.client = openai
        elif self.provider in ['anthropic', 'claude']:
            if self.api_key:
                self.client = anthropic.Anthropic(api_key=self.api_key)
            else:
                self.logger.warning("No API key provided for Anthropic")
                self.client = None
        elif self.provider == 'local':
            self.base_url = "http://localhost:11434"  # Default Ollama URL
            self.client = None
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    def generate_response(self, prompt: str, max_retries: int = 3) -> Dict:
        """
        Generate response from LLM

        Args:
            prompt: The input prompt
            max_retries: Maximum number of retry attempts

        Returns:
            Dict with 'response' and 'metadata'
        """
        for attempt in range(max_retries):
            try:
                if self.provider == 'openai':
                    return self._openai_request(prompt)
                elif self.provider in ['anthropic', 'claude']:
                    return self._anthropic_request(prompt)
                elif self.provider == 'local':
                    return self._local_request(prompt)
                else:
                    raise ValueError(f"Unsupported provider: {self.provider}")

            except Exception as e:
                self.logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff

    def _openai_request(self, prompt: str) -> Dict:
        """Make request to OpenAI API"""
        try:
            response = self.client.ChatCompletion.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert Python developer specializing in web automation with Selenium. Create robust, production-ready code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.1  # Low temperature for more deterministic code generation
            )

            return {
                'response': response.choices[0].message.content,
                'metadata': {
                    'provider': 'openai',
                    'model': self.model_name,
                    'tokens_used': response.usage.total_tokens,
                    'cost_estimate': self._estimate_cost(response.usage.total_tokens, 'openai')
                }
            }

        except Exception as e:
            self.logger.error(f"OpenAI API error: {str(e)}")
            raise

    def _anthropic_request(self, prompt: str) -> Dict:
        """Make request to Anthropic Claude API"""
        if not self.client:
            raise ValueError("Anthropic client not initialized - API key required")

        try:
            message = self.client.messages.create(
                model=self.model_name,
                max_tokens=4000,
                temperature=0.1,
                system="You are an expert Python developer specializing in web automation with Selenium. Create robust, production-ready code.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return {
                'response': message.content[0].text,
                'metadata': {
                    'provider': 'anthropic',
                    'model': self.model_name,
                    'tokens_used': message.usage.input_tokens + message.usage.output_tokens,
                    'cost_estimate': self._estimate_cost(message.usage.input_tokens + message.usage.output_tokens, 'anthropic')
                }
            }

        except Exception as e:
            self.logger.error(f"Anthropic API error: {str(e)}")
            raise

    def _local_request(self, prompt: str) -> Dict:
        """Make request to local LLM (e.g., Ollama)"""
        try:
            url = f"{self.base_url}/api/generate"

            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            }

            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()

            result = response.json()

            return {
                'response': result.get('response', ''),
                'metadata': {
                    'provider': 'local',
                    'model': self.model_name,
                    'tokens_used': 0,  # Local doesn't track tokens the same way
                    'cost_estimate': 0.0
                }
            }

        except Exception as e:
            self.logger.error(f"Local LLM error: {str(e)}")
            raise

    def _estimate_cost(self, tokens: int, provider: str) -> float:
        """Estimate API cost based on token usage"""
        # Rough cost estimates (as of 2024) - update as needed
        costs_per_1k_tokens = {
            'openai': {
                'gpt-4': 0.03,
                'gpt-3.5-turbo': 0.002
            },
            'anthropic': {
                'claude-3-sonnet-20240229': 0.015,
                'claude-3-haiku-20240307': 0.0025
            }
        }

        provider_costs = costs_per_1k_tokens.get(provider, {})
        cost_per_1k = provider_costs.get(self.model_name, 0.0)

        return (tokens / 1000) * cost_per_1k

# Updated benchmark system to use LLM integration
class EnhancedMacroBenchmarkSystem:
    def __init__(self, base_path="E:\\Project\\web-agent", llm_provider='openai', llm_api_key=None):
        from macro_benchmark_system import MacroBenchmarkSystem

        # Inherit from base system
        self.benchmark = MacroBenchmarkSystem(base_path)

        # Add LLM integration
        self.llm = LLMIntegration(provider=llm_provider, api_key=llm_api_key)

        self.logger = self.benchmark.logger

    def generate_macro_with_llm(self, prompt: str) -> str:
        """Generate macro code using actual LLM"""
        try:
            result = self.llm.generate_response(prompt)

            # Log metadata
            self.logger.info(f"LLM Response generated - Provider: {result['metadata']['provider']}, "
                           f"Model: {result['metadata']['model']}, "
                           f"Tokens: {result['metadata']['tokens_used']}, "
                           f"Est. Cost: ${result['metadata']['cost_estimate']:.4f}")

            return result['response']

        except Exception as e:
            self.logger.error(f"Failed to generate LLM response: {str(e)}")
            # Fallback to simulation
            return self.benchmark.simulate_llm_response(prompt)

    def run_enhanced_task(self, website_name: str, task: Dict, max_attempts: int = 5) -> Dict:
        """Enhanced task runner with real LLM integration"""
        self.logger.info(f"Starting enhanced task: {task.get('Task_ID', 'Unknown')}")

        # Read website code
        website_code = self.benchmark.read_website_code(website_name)

        experiment_data = {
            'task_id': task.get('Task_ID', 'Unknown'),
            'website_name': website_name,
            'task_description': task.get('Task_Description', ''),
            'category': task.get('Category', ''),
            'difficulty': task.get('Difficulty', ''),
            'attempts': [],
            'final_success': False,
            'start_time': time.time(),
            'llm_metadata': []
        }

        previous_logs = None

        for attempt in range(1, max_attempts + 1):
            self.logger.info(f"Attempt {attempt}/{max_attempts}")

            try:
                # Create prompt
                prompt = self.benchmark.create_macro_prompt(task, website_code, attempt, previous_logs)

                # Generate response with real LLM
                llm_response = self.generate_macro_with_llm(prompt)

                # Extract and execute macro
                macro_code = self.benchmark.extract_code_from_response(llm_response)
                execution_result = self.benchmark.execute_macro(macro_code)

                # Store attempt data
                attempt_data = {
                    'attempt_number': attempt,
                    'prompt_length': len(prompt),
                    'llm_response_length': len(llm_response),
                    'macro_code_lines': len(macro_code.split('\n')),
                    'execution_result': execution_result,
                    'timestamp': time.time()
                }

                experiment_data['attempts'].append(attempt_data)

                if execution_result['success']:
                    experiment_data['final_success'] = True
                    self.logger.info(f"Task completed successfully on attempt {attempt}")
                    break
                else:
                    previous_logs = execution_result

            except Exception as e:
                self.logger.error(f"Error in attempt {attempt}: {str(e)}")
                continue

        experiment_data['end_time'] = time.time()
        experiment_data['total_duration'] = experiment_data['end_time'] - experiment_data['start_time']

        return experiment_data

    def run_full_benchmark(self, website_names: list, task_filters: dict = None):
        """Run benchmark across multiple websites"""
        all_results = {}

        for website_name in website_names:
            self.logger.info(f"Processing website: {website_name}")

            # Extract tasks for this website
            tasks = self.benchmark.extract_tasks_from_xlsx(website_name)

            if not tasks:
                self.logger.warning(f"No tasks found for {website_name}")
                continue

            # Apply filters if specified
            if task_filters and website_name in task_filters:
                filter_criteria = task_filters[website_name]
                if isinstance(filter_criteria, list):
                    tasks = [t for t in tasks if t.get('Task_ID', '') in filter_criteria]
                elif isinstance(filter_criteria, str):
                    tasks = [t for t in tasks if filter_criteria.lower() in t.get('Category', '').lower()]

            website_results = []

            for task in tasks:
                try:
                    result = self.run_enhanced_task(website_name, task)
                    website_results.append(result)

                    # Save intermediate results
                    self._save_intermediate_results(website_name, website_results)

                except Exception as e:
                    self.logger.error(f"Failed to process task {task.get('Task_ID', 'Unknown')}: {str(e)}")

            all_results[website_name] = website_results

        # Save final results
        self._save_final_results(all_results)

        return all_results

    def _save_intermediate_results(self, website_name: str, results: list):
        """Save intermediate results during benchmark"""
        timestamp = int(time.time())
        file_path = self.benchmark.results_dir / f"{website_name}_intermediate_{timestamp}.json"

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

    def _save_final_results(self, all_results: dict):
        """Save final comprehensive results"""
        timestamp = int(time.time())

        # Save as JSON
        json_path = self.benchmark.results_dir / f"final_benchmark_{timestamp}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)

        # Create summary statistics
        summary_stats = self._generate_summary_stats(all_results)

        summary_path = self.benchmark.results_dir / f"benchmark_summary_{timestamp}.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary_stats, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Final results saved to {json_path}")
        self.logger.info(f"Summary statistics saved to {summary_path}")

    def _generate_summary_stats(self, all_results: dict) -> dict:
        """Generate summary statistics from benchmark results"""
        stats = {
            'total_websites': len(all_results),
            'website_stats': {},
            'overall_stats': {
                'total_tasks': 0,
                'successful_tasks': 0,
                'average_attempts': 0,
                'category_breakdown': {},
                'difficulty_breakdown': {}
            }
        }

        total_attempts = 0

        for website_name, results in all_results.items():
            website_stats = {
                'total_tasks': len(results),
                'successful_tasks': sum(1 for r in results if r['final_success']),
                'average_attempts': sum(len(r['attempts']) for r in results) / len(results) if results else 0,
                'success_rate': 0,
                'categories': {},
                'difficulties': {}
            }

            if results:
                website_stats['success_rate'] = website_stats['successful_tasks'] / website_stats['total_tasks']

            # Category and difficulty breakdown
            for result in results:
                category = result.get('category', 'Unknown')
                difficulty = result.get('difficulty', 'Unknown')

                if category not in website_stats['categories']:
                    website_stats['categories'][category] = {'total': 0, 'successful': 0}
                website_stats['categories'][category]['total'] += 1
                if result['final_success']:
                    website_stats['categories'][category]['successful'] += 1

                if difficulty not in website_stats['difficulties']:
                    website_stats['difficulties'][difficulty] = {'total': 0, 'successful': 0}
                website_stats['difficulties'][difficulty]['total'] += 1
                if result['final_success']:
                    website_stats['difficulties'][difficulty]['successful'] += 1

            stats['website_stats'][website_name] = website_stats

            # Update overall stats
            stats['overall_stats']['total_tasks'] += website_stats['total_tasks']
            stats['overall_stats']['successful_tasks'] += website_stats['successful_tasks']
            total_attempts += sum(len(r['attempts']) for r in results)

        if stats['overall_stats']['total_tasks'] > 0:
            stats['overall_stats']['success_rate'] = (
                stats['overall_stats']['successful_tasks'] / stats['overall_stats']['total_tasks']
            )
            stats['overall_stats']['average_attempts'] = total_attempts / stats['overall_stats']['total_tasks']

        return stats

# Example usage
def main():
    # Initialize with your preferred LLM provider
    # For OpenAI: provider='openai', api_key='your-openai-key'
    # For Anthropic: provider='anthropic', api_key='your-anthropic-key'
    # For local: provider='local' (requires Ollama or similar)

    benchmark = EnhancedMacroBenchmarkSystem(
        llm_provider='local',  # Change to 'openai' or 'anthropic' with API key
        llm_api_key=None
    )

    # Run benchmark on specific websites and tasks
    results = benchmark.run_full_benchmark(
        website_names=['youtube'],
        task_filters={
            'youtube': ['YT_BEN_001', 'YT_BEN_007']  # Test with easy tasks first
        }
    )

    print("Benchmark completed!")
    print(f"Results saved to: {benchmark.benchmark.results_dir}")

if __name__ == "__main__":
    main()