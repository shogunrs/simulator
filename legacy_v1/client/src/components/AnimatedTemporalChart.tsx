import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export default function AnimatedTemporalChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generate synthetic temporal data
    const timesteps = Array.from({ length: 50 }, (_, i) => i);
    
    // Workload pattern (sine wave with spikes)
    const workload = timesteps.map(t => 100 + Math.sin(t / 8) * 80 + 80);
    
    // Traditional: Reactive (lags behind workload)
    const traditionalInstances = timesteps.map((t, i) => {
      const w = workload[i];
      if (w > 180) return Math.min(6, Math.ceil((w - 100) / 50) + 1);
      if (w < 120) return Math.max(2, Math.floor(w / 60));
      return 3;
    });

    // RL: Proactive (anticipates workload)
    const rlInstances = timesteps.map((t, i) => {
      // Look ahead 3 steps
      const futureIdx = Math.min(i + 3, timesteps.length - 1);
      const futureW = workload[futureIdx];
      if (futureW > 160) return Math.min(6, Math.ceil((futureW - 80) / 50) + 1);
      if (futureW < 130) return Math.max(2, Math.floor(futureW / 60));
      return 3;
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: timesteps,
        datasets: [
          {
            label: 'Workload (req/s)',
            data: workload,
            borderColor: 'rgba(251, 191, 36, 1)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 2,
            fill: true,
            yAxisID: 'y',
            tension: 0.4,
          },
          {
            label: 'Traditional Instances',
            data: traditionalInstances,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderWidth: 3,
            fill: false,
            yAxisID: 'y1',
            stepped: true,
          },
          {
            label: 'RL Instances',
            data: rlInstances,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 3,
            fill: false,
            yAxisID: 'y1',
            stepped: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 3000,
          easing: 'easeInOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 60;
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
            text: 'Temporal Analysis: Proactive vs Reactive Scaling',
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
            title: {
              display: true,
              text: 'Time (steps)',
              color: 'oklch(0.92 0.01 240)',
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
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Workload (req/s)',
              color: 'rgba(251, 191, 36, 1)',
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
              text: 'Number of Instances',
              color: 'rgba(16, 185, 129, 1)',
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
              stepSize: 1,
            },
            min: 0,
            max: 7,
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
          <h2 className="text-3xl font-bold text-primary mb-2">Temporal Behavior Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Notice how RL scales <strong>before</strong> workload peaks, while Traditional reacts <strong>after</strong>
          </p>
        </div>
        
        <div className="flex-1 bg-card/50 border border-primary/30 rounded-lg p-6">
          <canvas ref={chartRef} />
        </div>

        {/* Annotations */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
            <h4 className="text-sm font-bold text-destructive mb-2">❌ Traditional (Reactive)</h4>
            <p className="text-xs text-foreground/80">
              Scales <strong>after</strong> workload increases → Performance degradation → SLA violations
            </p>
          </div>
          <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
            <h4 className="text-sm font-bold text-accent mb-2">✓ RL (Proactive)</h4>
            <p className="text-xs text-foreground/80">
              Anticipates workload changes → Scales <strong>before</strong> spikes → Maintains performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
