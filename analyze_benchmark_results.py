#!/usr/bin/env python3
"""
LLM Web Automation Benchmark Analysis Script
============================================

This script analyzes benchmark results from the LLM web automation experiment
and generates comprehensive statistics, visualizations, and tables for academic paper.

Usage:
    python analyze_benchmark_results.py [--data-dir benchmark_results/data] [--output-dir analysis_output]
"""

import json
import os
import glob
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
import argparse
from typing import Dict, List, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

# Set style for academic papers
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")

class BenchmarkAnalyzer:
    def __init__(self, data_dir: str, output_dir: str):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Target models and websites
        self.target_models = [
            'openai/gpt-4.1',
            'google/gemini-2.5-pro-thinking-on',
            'deepseek-ai/DeepSeek-V3.1-thinking-on',
            'openai/gpt-4o-mini'
        ]

        self.target_websites = [
            'Airbnb', 'Amazon', 'TikTok', 'Threads', 'youtube',
            'when2meet', 'reddit', 'instagram', 'facebook', 'discord'
        ]

        self.results_data = []
        self.summary_stats = {}

    def load_results(self) -> None:
        """Load all result JSON files from data directory."""
        print("🔍 Loading benchmark result files...")

        json_files = list(self.data_dir.glob("result_*.json"))
        print(f"Found {len(json_files)} result files")

        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Extract metadata from filename
                filename = json_file.stem
                parts = filename.replace('result_', '').split('_')

                if len(parts) >= 3:
                    website = parts[0]
                    task_id_parts = parts[1:-1]
                    task_id = '_'.join(task_id_parts)
                    timestamp = parts[-1]

                    # Add extracted metadata
                    data['metadata'] = {
                        'filename': json_file.name,
                        'website': website,
                        'task_id': task_id,
                        'timestamp': timestamp
                    }

                    self.results_data.append(data)

            except Exception as e:
                print(f"⚠️  Error loading {json_file}: {e}")
                continue

        print(f"✅ Loaded {len(self.results_data)} valid result files")

    def extract_structured_data(self) -> pd.DataFrame:
        """Extract structured data from results for analysis."""
        print("📊 Extracting structured data...")

        records = []
        for result in self.results_data:
            try:
                # Basic info
                record = {
                    'filename': result['metadata']['filename'],
                    'website': result['metadata']['website'],
                    'task_id': result['metadata']['task_id'],
                    'timestamp': result['metadata']['timestamp'],
                    'model': result.get('model', 'unknown'),
                    'success': result.get('success', False),
                    'total_attempts': result.get('totalAttempts', 0),
                    'execution_time': result.get('executionTime', 0),
                }

                # Task details
                if 'task' in result:
                    task = result['task']
                    record.update({
                        'task_description': task.get('description', ''),
                        'task_objective': task.get('objective', ''),
                        'task_type': task.get('type', 'unknown'),
                    })

                # Final result details
                if 'finalResult' in result:
                    final_result = result['finalResult']
                    record.update({
                        'final_success': final_result.get('success', False),
                        'final_action': final_result.get('action', ''),
                        'final_error': final_result.get('error', ''),
                        'validation_type': final_result.get('validationDetails', {}).get('validationType', ''),
                        'passed_checks': final_result.get('validationDetails', {}).get('passedChecks', 0),
                        'total_checks': final_result.get('validationDetails', {}).get('totalChecks', 0),
                    })

                # Attempt details
                if 'attempts' in result:
                    attempts = result['attempts']
                    record.update({
                        'first_attempt_success': len(attempts) > 0 and attempts[0].get('success', False),
                        'attempts_count': len(attempts),
                        'final_attempt_error': attempts[-1].get('error', '') if attempts else '',
                    })

                # Performance metrics
                if 'performanceMetrics' in result:
                    perf = result['performanceMetrics']
                    record.update({
                        'avg_response_time': perf.get('averageResponseTime', 0),
                        'total_tokens': perf.get('totalTokens', 0),
                        'avg_tokens_per_attempt': perf.get('averageTokensPerAttempt', 0),
                    })

                records.append(record)

            except Exception as e:
                print(f"⚠️  Error processing result: {e}")
                continue

        df = pd.DataFrame(records)

        # Clean and categorize data
        df['success_rate'] = df['passed_checks'] / df['total_checks'].replace(0, np.nan)
        df['website_clean'] = df['website'].str.replace('_', ' ').str.title()
        df['model_clean'] = df['model'].apply(self._clean_model_name)

        print(f"✅ Extracted {len(df)} structured records")
        return df

    def _clean_model_name(self, model: str) -> str:
        """Clean model names for display."""
        name_mapping = {
            'openai/gpt-4.1': 'GPT-4.1',
            'google/gemini-2.5-pro-thinking-on': 'Gemini-2.5-Pro',
            'deepseek-ai/DeepSeek-V3.1-thinking-on': 'DeepSeek-V3.1',
            'openai/gpt-4o-mini': 'GPT-4o-Mini'
        }
        return name_mapping.get(model, model)

    def generate_summary_statistics(self, df: pd.DataFrame) -> Dict:
        """Generate comprehensive summary statistics."""
        print("📈 Generating summary statistics...")

        stats = {}

        # Overall performance
        stats['overall'] = {
            'total_tasks': len(df),
            'total_websites': df['website'].nunique(),
            'total_models': df['model'].nunique(),
            'overall_success_rate': df['final_success'].mean(),
            'avg_attempts': df['total_attempts'].mean(),
            'avg_execution_time': df['execution_time'].mean(),
        }

        # Per-model statistics
        model_stats = df.groupby('model_clean').agg({
            'final_success': ['count', 'sum', 'mean'],
            'total_attempts': 'mean',
            'execution_time': 'mean',
            'success_rate': 'mean',
            'first_attempt_success': 'mean'
        }).round(3)

        model_stats.columns = ['total_tasks', 'successful_tasks', 'success_rate',
                              'avg_attempts', 'avg_execution_time', 'avg_validation_score',
                              'first_attempt_rate']
        stats['per_model'] = model_stats.to_dict('index')

        # Per-website statistics
        website_stats = df.groupby('website_clean').agg({
            'final_success': ['count', 'sum', 'mean'],
            'total_attempts': 'mean',
            'execution_time': 'mean',
        }).round(3)

        website_stats.columns = ['total_tasks', 'successful_tasks', 'success_rate',
                                'avg_attempts', 'avg_execution_time']
        stats['per_website'] = website_stats.to_dict('index')

        # Model-Website combinations
        model_website_stats = df.groupby(['model_clean', 'website_clean']).agg({
            'final_success': ['count', 'sum', 'mean']
        }).round(3)
        model_website_stats.columns = ['total_tasks', 'successful_tasks', 'success_rate']
        stats['model_website'] = model_website_stats.to_dict('index')

        # Task complexity analysis
        stats['complexity'] = {
            'tasks_by_attempts': df.groupby('total_attempts')['final_success'].mean().to_dict(),
            'tasks_by_validation_checks': df.groupby('total_checks')['final_success'].mean().to_dict()
        }

        self.summary_stats = stats
        return stats

    def create_visualizations(self, df: pd.DataFrame) -> None:
        """Create comprehensive visualizations for the paper."""
        print("🎨 Creating visualizations...")

        # Set up the plotting style
        plt.rcParams.update({
            'font.size': 12,
            'axes.titlesize': 14,
            'axes.labelsize': 12,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10,
            'legend.fontsize': 10,
            'figure.titlesize': 16
        })

        # 1. Overall Model Performance Comparison
        self._plot_model_performance(df)

        # 2. Website Difficulty Analysis
        self._plot_website_difficulty(df)

        # 3. Model-Website Performance Heatmap
        self._plot_performance_heatmap(df)

        # 4. Success Rate vs Complexity Analysis
        self._plot_complexity_analysis(df)

        # 5. Attempt Distribution Analysis
        self._plot_attempt_distribution(df)

        # 6. Performance Metrics Comparison
        self._plot_performance_metrics(df)

        # 7. Error Analysis
        self._plot_error_analysis(df)

        print("✅ All visualizations created")

    def _plot_model_performance(self, df: pd.DataFrame) -> None:
        """Plot overall model performance comparison."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

        # Success rate comparison
        model_perf = df.groupby('model_clean')['final_success'].agg(['mean', 'count', 'sum'])
        ax1.bar(model_perf.index, model_perf['mean'], alpha=0.8)
        ax1.set_title('Success Rate by Model', fontweight='bold')
        ax1.set_ylabel('Success Rate')
        ax1.set_ylim(0, 1)
        for i, v in enumerate(model_perf['mean']):
            ax1.text(i, v + 0.02, f'{v:.3f}', ha='center', va='bottom')

        # Task completion count
        ax2.bar(model_perf.index, model_perf['sum'], alpha=0.8, color='orange')
        ax2.set_title('Successful Tasks by Model', fontweight='bold')
        ax2.set_ylabel('Successful Tasks')
        for i, v in enumerate(model_perf['sum']):
            ax2.text(i, v + 1, str(int(v)), ha='center', va='bottom')

        # Average attempts
        avg_attempts = df.groupby('model_clean')['total_attempts'].mean()
        ax3.bar(avg_attempts.index, avg_attempts.values, alpha=0.8, color='green')
        ax3.set_title('Average Attempts per Task', fontweight='bold')
        ax3.set_ylabel('Average Attempts')
        for i, v in enumerate(avg_attempts.values):
            ax3.text(i, v + 0.05, f'{v:.2f}', ha='center', va='bottom')

        # First attempt success rate
        first_attempt = df.groupby('model_clean')['first_attempt_success'].mean()
        ax4.bar(first_attempt.index, first_attempt.values, alpha=0.8, color='purple')
        ax4.set_title('First Attempt Success Rate', fontweight='bold')
        ax4.set_ylabel('First Attempt Success Rate')
        ax4.set_ylim(0, 1)
        for i, v in enumerate(first_attempt.values):
            ax4.text(i, v + 0.02, f'{v:.3f}', ha='center', va='bottom')

        plt.tight_layout()
        plt.savefig(self.output_dir / 'model_performance_comparison.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'model_performance_comparison.pdf', bbox_inches='tight')
        plt.close()

    def _plot_website_difficulty(self, df: pd.DataFrame) -> None:
        """Plot website difficulty analysis."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Website success rates
        website_perf = df.groupby('website_clean')['final_success'].agg(['mean', 'count'])
        website_perf = website_perf.sort_values('mean', ascending=True)

        bars1 = ax1.barh(website_perf.index, website_perf['mean'], alpha=0.8)
        ax1.set_title('Website Difficulty (Success Rate)', fontweight='bold')
        ax1.set_xlabel('Success Rate')
        ax1.set_xlim(0, 1)

        # Add value labels
        for i, v in enumerate(website_perf['mean']):
            ax1.text(v + 0.02, i, f'{v:.3f}', ha='left', va='center')

        # Color bars based on difficulty
        for i, bar in enumerate(bars1):
            if website_perf['mean'].iloc[i] < 0.3:
                bar.set_color('red')
            elif website_perf['mean'].iloc[i] < 0.7:
                bar.set_color('orange')
            else:
                bar.set_color('green')

        # Average attempts by website
        avg_attempts = df.groupby('website_clean')['total_attempts'].mean().sort_values(ascending=False)
        ax2.bar(range(len(avg_attempts)), avg_attempts.values, alpha=0.8, color='coral')
        ax2.set_title('Average Attempts by Website', fontweight='bold')
        ax2.set_ylabel('Average Attempts')
        ax2.set_xticks(range(len(avg_attempts)))
        ax2.set_xticklabels(avg_attempts.index, rotation=45, ha='right')

        for i, v in enumerate(avg_attempts.values):
            ax2.text(i, v + 0.05, f'{v:.2f}', ha='center', va='bottom')

        plt.tight_layout()
        plt.savefig(self.output_dir / 'website_difficulty_analysis.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'website_difficulty_analysis.pdf', bbox_inches='tight')
        plt.close()

    def _plot_performance_heatmap(self, df: pd.DataFrame) -> None:
        """Create model-website performance heatmap."""
        # Create pivot table for heatmap
        heatmap_data = df.pivot_table(values='final_success',
                                     index='website_clean',
                                     columns='model_clean',
                                     aggfunc='mean')

        plt.figure(figsize=(12, 8))
        sns.heatmap(heatmap_data, annot=True, fmt='.3f', cmap='RdYlGn',
                   cbar_kws={'label': 'Success Rate'}, square=True)
        plt.title('Model-Website Performance Heatmap', fontweight='bold', pad=20)
        plt.ylabel('Website')
        plt.xlabel('Model')
        plt.tight_layout()
        plt.savefig(self.output_dir / 'performance_heatmap.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'performance_heatmap.pdf', bbox_inches='tight')
        plt.close()

    def _plot_complexity_analysis(self, df: pd.DataFrame) -> None:
        """Plot task complexity analysis."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Success rate vs total validation checks
        complexity_success = df.groupby('total_checks')['final_success'].mean()
        ax1.scatter(complexity_success.index, complexity_success.values, s=100, alpha=0.7)
        ax1.plot(complexity_success.index, complexity_success.values, '--', alpha=0.5)
        ax1.set_title('Success Rate vs Task Complexity', fontweight='bold')
        ax1.set_xlabel('Number of Validation Checks')
        ax1.set_ylabel('Success Rate')
        ax1.set_ylim(0, 1)

        # Success rate vs number of attempts required
        attempts_success = df.groupby('total_attempts')['final_success'].mean()
        ax2.bar(attempts_success.index, attempts_success.values, alpha=0.8)
        ax2.set_title('Success Rate by Number of Attempts', fontweight='bold')
        ax2.set_xlabel('Total Attempts')
        ax2.set_ylabel('Success Rate')
        ax2.set_ylim(0, 1)

        plt.tight_layout()
        plt.savefig(self.output_dir / 'complexity_analysis.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'complexity_analysis.pdf', bbox_inches='tight')
        plt.close()

    def _plot_attempt_distribution(self, df: pd.DataFrame) -> None:
        """Plot attempt distribution analysis."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

        # Overall attempt distribution
        attempt_counts = df['total_attempts'].value_counts().sort_index()
        ax1.bar(attempt_counts.index, attempt_counts.values, alpha=0.8)
        ax1.set_title('Distribution of Total Attempts', fontweight='bold')
        ax1.set_xlabel('Number of Attempts')
        ax1.set_ylabel('Frequency')

        # Success rate by attempt number
        success_by_attempts = df.groupby('total_attempts')['final_success'].mean()
        ax2.plot(success_by_attempts.index, success_by_attempts.values, 'o-', linewidth=2, markersize=8)
        ax2.set_title('Success Rate by Attempt Number', fontweight='bold')
        ax2.set_xlabel('Number of Attempts')
        ax2.set_ylabel('Success Rate')
        ax2.set_ylim(0, 1)
        ax2.grid(True, alpha=0.3)

        # Attempt distribution by model
        for model in df['model_clean'].unique():
            model_data = df[df['model_clean'] == model]['total_attempts']
            ax3.hist(model_data, alpha=0.6, label=model, bins=range(1, 7))
        ax3.set_title('Attempt Distribution by Model', fontweight='bold')
        ax3.set_xlabel('Number of Attempts')
        ax3.set_ylabel('Frequency')
        ax3.legend()

        # Cumulative success rate
        cumulative_success = []
        for i in range(1, 6):
            success_rate = df[df['total_attempts'] <= i]['final_success'].mean()
            cumulative_success.append(success_rate)

        ax4.plot(range(1, 6), cumulative_success, 'o-', linewidth=2, markersize=8, color='green')
        ax4.set_title('Cumulative Success Rate', fontweight='bold')
        ax4.set_xlabel('Maximum Attempts Allowed')
        ax4.set_ylabel('Cumulative Success Rate')
        ax4.set_ylim(0, 1)
        ax4.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(self.output_dir / 'attempt_distribution.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'attempt_distribution.pdf', bbox_inches='tight')
        plt.close()

    def _plot_performance_metrics(self, df: pd.DataFrame) -> None:
        """Plot performance metrics comparison."""
        # Filter data with valid performance metrics
        perf_df = df[df['avg_response_time'] > 0].copy()

        if len(perf_df) == 0:
            print("⚠️  No performance metrics data available")
            return

        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

        # Response time by model
        response_times = perf_df.groupby('model_clean')['avg_response_time'].mean()
        ax1.bar(response_times.index, response_times.values, alpha=0.8, color='skyblue')
        ax1.set_title('Average Response Time by Model', fontweight='bold')
        ax1.set_ylabel('Response Time (s)')
        for i, v in enumerate(response_times.values):
            ax1.text(i, v + max(response_times.values) * 0.01, f'{v:.1f}s', ha='center', va='bottom')

        # Token usage by model
        token_usage = perf_df.groupby('model_clean')['total_tokens'].mean()
        ax2.bar(token_usage.index, token_usage.values, alpha=0.8, color='lightcoral')
        ax2.set_title('Average Token Usage by Model', fontweight='bold')
        ax2.set_ylabel('Total Tokens')
        for i, v in enumerate(token_usage.values):
            ax2.text(i, v + max(token_usage.values) * 0.01, f'{v:.0f}', ha='center', va='bottom')

        # Response time vs success rate
        ax3.scatter(perf_df['avg_response_time'], perf_df['final_success'], alpha=0.6)
        ax3.set_title('Response Time vs Success Rate', fontweight='bold')
        ax3.set_xlabel('Average Response Time (s)')
        ax3.set_ylabel('Success (0/1)')

        # Token efficiency (success per token)
        perf_df['token_efficiency'] = perf_df['final_success'] / (perf_df['total_tokens'] + 1)
        token_eff = perf_df.groupby('model_clean')['token_efficiency'].mean()
        ax4.bar(token_eff.index, token_eff.values, alpha=0.8, color='lightgreen')
        ax4.set_title('Token Efficiency by Model', fontweight='bold')
        ax4.set_ylabel('Success per Token')
        for i, v in enumerate(token_eff.values):
            ax4.text(i, v + max(token_eff.values) * 0.01, f'{v:.6f}', ha='center', va='bottom')

        plt.tight_layout()
        plt.savefig(self.output_dir / 'performance_metrics.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'performance_metrics.pdf', bbox_inches='tight')
        plt.close()

    def _plot_error_analysis(self, df: pd.DataFrame) -> None:
        """Plot error analysis."""
        # Get failed tasks
        failed_df = df[df['final_success'] == False].copy()

        if len(failed_df) == 0:
            print("⚠️  No failed tasks to analyze")
            return

        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

        # Failure rate by model
        failure_by_model = 1 - df.groupby('model_clean')['final_success'].mean()
        ax1.bar(failure_by_model.index, failure_by_model.values, alpha=0.8, color='red')
        ax1.set_title('Failure Rate by Model', fontweight='bold')
        ax1.set_ylabel('Failure Rate')
        ax1.set_ylim(0, 1)
        for i, v in enumerate(failure_by_model.values):
            ax1.text(i, v + 0.01, f'{v:.3f}', ha='center', va='bottom')

        # Failure rate by website
        failure_by_website = 1 - df.groupby('website_clean')['final_success'].mean()
        failure_by_website = failure_by_website.sort_values(ascending=False)
        ax2.barh(range(len(failure_by_website)), failure_by_website.values, alpha=0.8, color='orange')
        ax2.set_yticks(range(len(failure_by_website)))
        ax2.set_yticklabels(failure_by_website.index)
        ax2.set_title('Failure Rate by Website', fontweight='bold')
        ax2.set_xlabel('Failure Rate')

        # Common error types (if available)
        if 'final_error' in failed_df.columns:
            error_types = failed_df['final_error'].value_counts().head(10)
            if len(error_types) > 0:
                ax3.barh(range(len(error_types)), error_types.values, alpha=0.8)
                ax3.set_yticks(range(len(error_types)))
                ax3.set_yticklabels([str(x)[:30] + '...' if len(str(x)) > 30 else str(x)
                                   for x in error_types.index])
                ax3.set_title('Most Common Error Types', fontweight='bold')
                ax3.set_xlabel('Frequency')

        # Success rate by validation checks passed
        validation_success = df.groupby('passed_checks')['final_success'].mean()
        ax4.bar(validation_success.index, validation_success.values, alpha=0.8, color='purple')
        ax4.set_title('Success Rate by Validation Checks Passed', fontweight='bold')
        ax4.set_xlabel('Number of Checks Passed')
        ax4.set_ylabel('Success Rate')
        ax4.set_ylim(0, 1)

        plt.tight_layout()
        plt.savefig(self.output_dir / 'error_analysis.png', dpi=300, bbox_inches='tight')
        plt.savefig(self.output_dir / 'error_analysis.pdf', bbox_inches='tight')
        plt.close()

    def generate_paper_tables(self, df: pd.DataFrame) -> None:
        """Generate LaTeX tables for academic paper."""
        print("📝 Generating paper-ready tables...")

        # Table 1: Overall Model Performance
        model_stats = df.groupby('model_clean').agg({
            'final_success': ['count', 'sum', 'mean'],
            'total_attempts': 'mean',
            'first_attempt_success': 'mean',
            'execution_time': 'mean'
        }).round(3)

        model_stats.columns = ['Total Tasks', 'Successful', 'Success Rate',
                              'Avg Attempts', 'First Success Rate', 'Avg Time (s)']

        # Create LaTeX table
        latex_table1 = model_stats.to_latex(
            caption="Overall Model Performance Comparison",
            label="tab:model_performance",
            float_format="%.3f"
        )

        with open(self.output_dir / 'table1_model_performance.tex', 'w') as f:
            f.write(latex_table1)

        # Table 2: Website Difficulty Analysis
        website_stats = df.groupby('website_clean').agg({
            'final_success': ['count', 'sum', 'mean'],
            'total_attempts': 'mean',
            'total_checks': 'mean'
        }).round(3)

        website_stats.columns = ['Total Tasks', 'Successful', 'Success Rate',
                                'Avg Attempts', 'Avg Complexity']
        website_stats = website_stats.sort_values('Success Rate', ascending=False)

        latex_table2 = website_stats.to_latex(
            caption="Website Task Difficulty Analysis",
            label="tab:website_difficulty",
            float_format="%.3f"
        )

        with open(self.output_dir / 'table2_website_difficulty.tex', 'w') as f:
            f.write(latex_table2)

        # Table 3: Model-Website Performance Matrix
        heatmap_data = df.pivot_table(values='final_success',
                                     index='website_clean',
                                     columns='model_clean',
                                     aggfunc='mean').round(3)

        latex_table3 = heatmap_data.to_latex(
            caption="Model-Website Performance Matrix (Success Rates)",
            label="tab:performance_matrix",
            float_format="%.3f"
        )

        with open(self.output_dir / 'table3_performance_matrix.tex', 'w') as f:
            f.write(latex_table3)

        # Save as CSV for easy viewing
        model_stats.to_csv(self.output_dir / 'model_performance.csv')
        website_stats.to_csv(self.output_dir / 'website_difficulty.csv')
        heatmap_data.to_csv(self.output_dir / 'performance_matrix.csv')

        print("✅ Paper tables generated")

    def generate_statistical_analysis(self, df: pd.DataFrame) -> Dict:
        """Generate statistical tests and analysis."""
        print("📊 Performing statistical analysis...")

        from scipy import stats

        analysis = {}

        # 1. ANOVA test for model differences
        model_groups = [group['final_success'].values
                       for name, group in df.groupby('model_clean')]

        if len(model_groups) > 1:
            f_stat, p_value = stats.f_oneway(*model_groups)
            analysis['model_anova'] = {
                'f_statistic': f_stat,
                'p_value': p_value,
                'significant': p_value < 0.05
            }

        # 2. Chi-square test for independence
        contingency_table = pd.crosstab(df['model_clean'], df['final_success'])
        chi2, p_chi2, dof, expected = stats.chi2_contingency(contingency_table)
        analysis['independence_test'] = {
            'chi2_statistic': chi2,
            'p_value': p_chi2,
            'degrees_of_freedom': dof,
            'significant': p_chi2 < 0.05
        }

        # 3. Correlation analysis
        numeric_cols = ['total_attempts', 'execution_time', 'passed_checks', 'total_checks']
        correlation_matrix = df[numeric_cols + ['final_success']].corr()
        analysis['correlations'] = correlation_matrix.to_dict()

        # 4. Effect sizes (Cohen's d) for model comparisons
        models = df['model_clean'].unique()
        effect_sizes = {}
        for i, model1 in enumerate(models):
            for model2 in models[i+1:]:
                group1 = df[df['model_clean'] == model1]['final_success']
                group2 = df[df['model_clean'] == model2]['final_success']

                pooled_std = np.sqrt(((len(group1) - 1) * group1.var() +
                                    (len(group2) - 1) * group2.var()) /
                                   (len(group1) + len(group2) - 2))

                cohens_d = (group1.mean() - group2.mean()) / pooled_std
                effect_sizes[f"{model1}_vs_{model2}"] = cohens_d

        analysis['effect_sizes'] = effect_sizes

        # Save statistical analysis
        with open(self.output_dir / 'statistical_analysis.json', 'w') as f:
            json.dump(analysis, f, indent=2, default=str)

        return analysis

    def generate_comprehensive_report(self, df: pd.DataFrame) -> None:
        """Generate comprehensive analysis report."""
        print("📄 Generating comprehensive report...")

        report = []
        report.append("# LLM Web Automation Benchmark Analysis Report")
        report.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")

        # Executive Summary
        report.append("## Executive Summary")
        total_tasks = len(df)
        total_models = df['model_clean'].nunique()
        total_websites = df['website_clean'].nunique()
        overall_success = df['final_success'].mean()

        report.append(f"- **Total Tasks Evaluated**: {total_tasks}")
        report.append(f"- **Models Tested**: {total_models}")
        report.append(f"- **Websites Covered**: {total_websites}")
        report.append(f"- **Overall Success Rate**: {overall_success:.1%}")
        report.append("")

        # Model Performance Ranking
        report.append("## Model Performance Ranking")
        model_ranking = df.groupby('model_clean')['final_success'].mean().sort_values(ascending=False)
        for i, (model, success_rate) in enumerate(model_ranking.items(), 1):
            report.append(f"{i}. **{model}**: {success_rate:.1%} success rate")
        report.append("")

        # Website Difficulty Ranking
        report.append("## Website Difficulty Analysis")
        website_difficulty = df.groupby('website_clean')['final_success'].mean().sort_values(ascending=True)
        report.append("### Most Challenging Websites:")
        for i, (website, success_rate) in enumerate(list(website_difficulty.items())[:5], 1):
            report.append(f"{i}. **{website}**: {success_rate:.1%} success rate")

        report.append("\n### Easiest Websites:")
        for i, (website, success_rate) in enumerate(list(website_difficulty.items())[-5:], 1):
            report.append(f"{i}. **{website}**: {success_rate:.1%} success rate")
        report.append("")

        # Key Findings
        report.append("## Key Findings")
        best_model = model_ranking.index[0]
        worst_model = model_ranking.index[-1]
        hardest_website = website_difficulty.index[0]
        easiest_website = website_difficulty.index[-1]

        report.append(f"1. **{best_model}** achieved the highest success rate ({model_ranking.iloc[0]:.1%})")
        report.append(f"2. **{worst_model}** had the lowest success rate ({model_ranking.iloc[-1]:.1%})")
        report.append(f"3. **{hardest_website}** was the most challenging website ({website_difficulty.iloc[0]:.1%} success)")
        report.append(f"4. **{easiest_website}** was the easiest website ({website_difficulty.iloc[-1]:.1%} success)")
        report.append(f"5. Average attempts per task: {df['total_attempts'].mean():.2f}")
        report.append(f"6. First-attempt success rate: {df['first_attempt_success'].mean():.1%}")
        report.append("")

        # Recommendations
        report.append("## Recommendations for Future Research")
        report.append("1. Focus on improving performance for low-success websites")
        report.append("2. Investigate why certain models excel at specific website types")
        report.append("3. Develop specialized prompting strategies for complex tasks")
        report.append("4. Expand benchmark to include more diverse website types")
        report.append("5. Implement adaptive retry strategies based on task complexity")
        report.append("")

        # Write report
        with open(self.output_dir / 'comprehensive_report.md', 'w', encoding='utf-8') as f:
            f.write('\n'.join(report))

        print("✅ Comprehensive report generated")

    def run_complete_analysis(self) -> None:
        """Run the complete benchmark analysis pipeline."""
        print("🚀 Starting comprehensive benchmark analysis...")
        print("=" * 60)

        # Load data
        self.load_results()

        if not self.results_data:
            print("❌ No data found. Please check the data directory.")
            return

        # Extract structured data
        df = self.extract_structured_data()

        # Generate summary statistics
        stats = self.generate_summary_statistics(df)

        # Create visualizations
        self.create_visualizations(df)

        # Generate paper tables
        self.generate_paper_tables(df)

        # Statistical analysis
        statistical_results = self.generate_statistical_analysis(df)

        # Comprehensive report
        self.generate_comprehensive_report(df)

        # Save processed data
        df.to_csv(self.output_dir / 'processed_results.csv', index=False)

        with open(self.output_dir / 'summary_statistics.json', 'w') as f:
            json.dump(stats, f, indent=2, default=str)

        print("\n✅ Analysis complete!")
        print(f"📁 Results saved to: {self.output_dir}")
        print("\nGenerated files:")
        print("- processed_results.csv: Complete processed dataset")
        print("- summary_statistics.json: Summary statistics")
        print("- comprehensive_report.md: Executive summary report")
        print("- *.png, *.pdf: Visualizations")
        print("- *.tex: LaTeX tables for paper")
        print("- statistical_analysis.json: Statistical test results")


def main():
    parser = argparse.ArgumentParser(description='Analyze LLM Web Automation Benchmark Results')
    parser.add_argument('--data-dir', default='benchmark_results/data',
                       help='Directory containing result JSON files')
    parser.add_argument('--output-dir', default='analysis_output',
                       help='Output directory for analysis results')

    args = parser.parse_args()

    # Create analyzer and run analysis
    analyzer = BenchmarkAnalyzer(args.data_dir, args.output_dir)
    analyzer.run_complete_analysis()


if __name__ == "__main__":
    main()