import { Link } from "wouter";

const metrics = [
  { label: "SLA violation rate", threshold: "8.7%", rl: "2.1%", insight: "−75.6% violations (Table 1)" },
  { label: "Avg cost ($/h)", threshold: "$2.85", rl: "$4.25", insight: "+49.1% infra to buy reliability" },
  { label: "Scaling actions (run)", threshold: "342", rl: "156", insight: "−54.4% thrashing" },
];

export default function Presentation() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background/60 to-card text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Executive deck</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Autonomous Cloud Resource Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Prescriptive analytics with PPO-based autoscaling, benchmarked against a reactive threshold baseline.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Window: 6h (6AM → 12PM)</span>
            <span>SLA p95: 200ms</span>
            <span>Costs: m5.large $0.096/h · n1-standard-2 $0.089/h</span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Agenda</p>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• Business problem & SLA pain</li>
              <li>• RL formulation (MDP, reward)</li>
              <li>• Implementation: Gymnasium + PPO</li>
              <li>• Results vs threshold baseline</li>
              <li>• ROI: cost vs penalties</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-3 lg:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Key outcomes (Table 1)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map(metric => (
                <div key={metric.label} className="rounded-lg border border-border/40 bg-card/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground">{metric.label}</p>
                  <div className="flex justify-between items-end mt-2 text-lg font-mono">
                    <span className="text-red-300">Threshold {metric.threshold}</span>
                    <span className="text-green-300">RL {metric.rl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metric.insight}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              RL buys reliability: fewer violations and smoother scaling, at the expense of ~49% higher infra. When penalties and revenue
              impact are factored, total cost often flips in favor of RL.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Live demo</p>
            <h2 className="text-2xl font-semibold text-foreground">Interactive simulation</h2>
            <p className="text-sm text-muted-foreground">
              Use the controls to run the 6h scenario. Toggle between “Live Simulation” and “Results Dashboard” to view capacity,
              latencies, violations, and total cost (infra + SLA penalties).
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/">
                <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                  Open simulator
                </button>
              </Link>
              <span className="text-xs text-muted-foreground">Defaults: RL active, 200ms SLA, capacity 50 req/s per instance.</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-3">
            <p className="text-sm text-muted-foreground">What to look for</p>
            <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
              <li>p95 latency stays below 200ms on RL during the morning spike.</li>
              <li>RL scales early (instances jump before 8:00) vs. delayed threshold steps.</li>
              <li>Cumulative SLA violations flatten quickly for RL; threshold keeps accruing.</li>
              <li>Total cost card blends infra + $0.10/violation to show true TCO.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
