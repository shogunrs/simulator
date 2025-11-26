import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface ComparisonData {
  method: string;
  cost: number;
  slaViolations: number;
  cpuUtil: number;
  latency: number;
}

export default function AnimatedComparisonChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const data: ComparisonData[] = [
    { method: 'RL Agent', cost: 0.4071, slaViolations: 7.1, cpuUtil: 39.0, latency: 76.1 },
    { method: 'Rule-Based', cost: 0.2730, slaViolations: 29.1, cpuUtil: 52.5, latency: 85.2 },
    { method: 'Adaptive', cost: 0.2878, slaViolations: 26.3, cpuUtil: 49.5, latency: 82.0 },
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(d => d.method),
        datasets: [
          {
            label: 'SLA Violations',
            data: data.map(d => d.slaViolations),
            backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green (accent)
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            label: 'Cost ($)',
            data: data.map(d => d.cost),
            backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue (primary)
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            yAxisID: 'y1',
          },
          {
            label: 'Latency (ms)',
            data: data.map(d => d.latency),
            backgroundColor: 'rgba(251, 191, 36, 0.6)', // Yellow
            borderColor: 'rgba(251, 191, 36, 1)',
            borderWidth: 2,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 300 + context.datasetIndex * 100;
            }
            return delay;
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Performance Comparison: RL vs Traditional Methods',
            color: 'oklch(0.70 0.15 195)',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'oklch(0.92 0.01 240)',
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'oklch(0.70 0.15 195)',
            bodyColor: 'oklch(0.92 0.01 240)',
            borderColor: 'oklch(0.70 0.15 195)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'oklch(0.92 0.01 240)',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'SLA Violations',
              color: 'rgba(16, 185, 129, 1)',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'oklch(0.92 0.01 240)',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cost ($)',
              color: 'rgba(59, 130, 246, 1)',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: 'oklch(0.92 0.01 240)',
            },
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-full p-8 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">Results: Animated Performance Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Interactive comparison showing RL's superior performance in reducing SLA violations
          </p>
        </div>
        
        <div className="flex-1 bg-card/50 border border-primary/30 rounded-lg p-6">
          <canvas ref={chartRef} />
        </div>

        {/* Key Insight */}
        <div className="mt-6 bg-accent/10 border-t-4 border-accent p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="text-lg font-bold text-accent">Key Finding</h3>
              <p className="text-sm text-foreground/90">
                RL Agent achieves <strong className="text-accent">75.6% fewer SLA violations</strong> (7.1 vs 29.1) 
                compared to rule-based methods, with only a modest cost increase (49.1%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
