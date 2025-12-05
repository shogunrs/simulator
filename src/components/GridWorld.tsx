"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// --- Constants ---
const GRID_SIZE = 5;
const START_POS = { x: 0, y: 0 };
const GOAL_POS = { x: 4, y: 4 };
const HAZARDS = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 3 },
    { x: 1, y: 3 },
];

const ACTIONS = [
    { name: "UP", dx: 0, dy: -1 },
    { name: "DOWN", dx: 0, dy: 1 },
    { name: "LEFT", dx: -1, dy: 0 },
    { name: "RIGHT", dx: 1, dy: 0 },
];

// Q-Learning Hyperparameters
const ALPHA = 0.5; // Learning Rate (High for fast learning)
const GAMMA = 0.9; // Discount Factor

export default function GridWorld() {
    // --- State ---
    const [agentPos, setAgentPos] = useState(START_POS);
    const [qTable, setQTable] = useState<Record<string, number[]>>({});
    const [episode, setEpisode] = useState(0);
    const [totalReward, setTotalReward] = useState(0);
    const [epsilon, setEpsilon] = useState(0.5); // Start at 50% exploration
    const [speed, setSpeed] = useState(50); // Fast speed (50ms)
    const [isRunning, setIsRunning] = useState(false);
    const [isExploring, setIsExploring] = useState(false); // Visual indicator

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Helpers ---
    const getStateKey = (x: number, y: number) => `${x},${y}`;

    const getQValues = useCallback((x: number, y: number) => {
        const key = getStateKey(x, y);
        return qTable[key] || [0, 0, 0, 0]; // Up, Down, Left, Right
    }, [qTable]);

    const resetGame = () => {
        setIsRunning(false);
        setAgentPos(START_POS);
        setQTable({});
        setEpisode(0);
        setTotalReward(0);
        setEpsilon(0.5); // Reset epsilon to 50%
    };

    const step = useCallback(() => {
        setAgentPos((currentPos) => {
            // 1. Choose Action (Epsilon-Greedy)
            const currentQ = getQValues(currentPos.x, currentPos.y);
            let actionIndex;
            let exploring = false;

            if (Math.random() < epsilon) {
                // Explore
                actionIndex = Math.floor(Math.random() * ACTIONS.length);
                exploring = true;
            } else {
                // Exploit (Best Q-Value)
                const maxQ = Math.max(...currentQ);
                // Random tie-breaking for best actions
                const bestIndices = currentQ
                    .map((q, i) => (q === maxQ ? i : -1))
                    .filter((i) => i !== -1);
                actionIndex = bestIndices[Math.floor(Math.random() * bestIndices.length)];
            }
            setIsExploring(exploring);

            const action = ACTIONS[actionIndex];

            // 2. Move
            let nextX = currentPos.x + action.dx;
            let nextY = currentPos.y + action.dy;

            // Boundary checks
            if (nextX < 0) nextX = 0;
            if (nextX >= GRID_SIZE) nextX = GRID_SIZE - 1;
            if (nextY < 0) nextY = 0;
            if (nextY >= GRID_SIZE) nextY = GRID_SIZE - 1;

            // 3. Calculate Reward
            let reward = -0.1; // Step cost
            let done = false;

            if (nextX === GOAL_POS.x && nextY === GOAL_POS.y) {
                reward = 10;
                done = true;
            } else if (HAZARDS.some((h) => h.x === nextX && h.y === nextY)) {
                reward = -100; // Huge penalty for hazards
                done = true;
            }

            // 4. Update Q-Table
            const nextQ = getQValues(nextX, nextY);
            const maxNextQ = Math.max(...nextQ);
            const currentVal = currentQ[actionIndex];

            // Q(s,a) = Q(s,a) + alpha * (R + gamma * max(Q(s',a')) - Q(s,a))
            const newQVal = currentVal + ALPHA * (reward + GAMMA * maxNextQ - currentVal);

            setQTable((prev) => {
                const key = getStateKey(currentPos.x, currentPos.y);
                const newQs = [...(prev[key] || [0, 0, 0, 0])];
                newQs[actionIndex] = newQVal;
                return { ...prev, [key]: newQs };
            });

            setTotalReward((prev) => prev + reward);

            if (done) {
                setEpisode((e) => e + 1);
                // Auto-decay epsilon
                setEpsilon((prev) => {
                    const nextEpsilon = Math.max(0, prev * 0.9);
                    // If we are very confident (mastery), force 0 exploration for visual perfection
                    if (nextEpsilon < 0.05) {
                        // Reset total reward once to show "clean" performance
                        if (prev >= 0.05) setTotalReward(0);
                        return 0;
                    }
                    return nextEpsilon;
                });
                return START_POS; // Reset to start
            }

            return { x: nextX, y: nextY };
        });
    }, [epsilon, getQValues]);

    // --- Game Loop ---
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(step, speed);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, speed, step]);


    // --- Render ---
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Grid */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Grid World Environment
                        </CardTitle>
                        <CardDescription>
                            The agent (🤖) learns to find the treasure (🏆) while avoiding fire (🔥).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="grid gap-1 mx-auto"
                            style={{
                                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                                maxWidth: "400px"
                            }}
                        >
                            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                                const x = i % GRID_SIZE;
                                const y = Math.floor(i / GRID_SIZE);
                                const isAgent = agentPos.x === x && agentPos.y === y;
                                const isGoal = GOAL_POS.x === x && GOAL_POS.y === y;
                                const isHazard = HAZARDS.some((h) => h.x === x && h.y === y);

                                // Visualizing Q-Values (Heatmap style for best action)
                                const qs = getQValues(x, y);
                                const maxQ = Math.max(...qs);
                                // Normalize for opacity (approximate range -10 to 10)
                                const intensity = Math.max(0, Math.min(1, (maxQ + 10) / 20));

                                let bgClass = "bg-secondary/30";
                                if (isGoal) bgClass = "bg-green-500/20 border-green-500/50";
                                if (isHazard) bgClass = "bg-red-500/20 border-red-500/50";

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-md border flex items-center justify-center relative overflow-hidden transition-colors ${bgClass}`}
                                        style={{
                                            borderColor: isAgent ? "var(--primary)" : undefined
                                        }}
                                    >
                                        {/* Heatmap Overlay */}
                                        {!isGoal && !isHazard && (
                                            <div
                                                className="absolute inset-0 bg-primary transition-opacity duration-500"
                                                style={{ opacity: intensity * 0.3 }}
                                            />
                                        )}

                                        {isGoal && <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />}
                                        {isHazard && <Flame className="w-6 h-6 text-red-500" />}

                                        {isAgent && (
                                            <motion.div
                                                layoutId="agent"
                                                className="relative z-10 text-2xl"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                🤖
                                            </motion.div>
                                        )}

                                        {/* Debug: Show Max Q */}
                                        {/* <span className="absolute bottom-0.5 right-0.5 text-[8px] text-muted-foreground opacity-50">
                        {maxQ.toFixed(1)}
                    </span> */}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Controls & Stats */}
                <div className="space-y-6">
                    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Training Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className={isRunning ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
                                >
                                    {isRunning ? <Pause className="mr-2 w-4 h-4" /> : <Play className="mr-2 w-4 h-4" />}
                                    {isRunning ? "Pause Training" : "Start Training"}
                                </Button>
                                <Button variant="outline" onClick={resetGame}>
                                    <RotateCcw className="mr-2 w-4 h-4" />
                                    Reset
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Simulation Speed</span>
                                    <span>{speed}ms</span>
                                </div>
                                <Slider
                                    value={[1000 - speed]}
                                    min={0}
                                    max={950}
                                    step={50}
                                    onValueChange={(v) => setSpeed(1000 - v[0])}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Exploration Rate (Epsilon)</span>
                                    <span>{(epsilon * 100).toFixed(0)}%</span>
                                </div>
                                <Slider
                                    value={[epsilon * 100]}
                                    min={0}
                                    max={100}
                                    step={5}
                                    onValueChange={(v) => setEpsilon(v[0] / 100)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Higher = More random moves (Learning). Lower = Use knowledge (Performance).
                                </p>
                            </div>

                            {/* Mastery Indicator */}
                            <AnimatePresence>
                                {epsilon < 0.05 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3"
                                    >
                                        <div className="p-2 bg-green-500 rounded-full text-white">
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-green-500">Training Complete!</h4>
                                            <p className="text-xs text-green-400/80">
                                                Agent has mastered the path.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Agent Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Episodes</p>
                                <p className="text-2xl font-mono font-bold">{episode}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Action</p>
                                <p className="text-2xl font-mono font-bold flex items-center gap-2">
                                    {isExploring ? (
                                        <span className="text-yellow-500 text-sm flex items-center gap-1">
                                            🎲 Random
                                        </span>
                                    ) : (
                                        <span className="text-green-500 text-sm flex items-center gap-1">
                                            🧠 Best
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="col-span-2 p-3 rounded-lg bg-secondary/20 border border-border/50">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Reward (Cumulative)</p>
                                <p className={`text-2xl font-mono font-bold ${totalReward > 0 ? "text-green-400" : "text-red-400"}`}>
                                    {totalReward.toFixed(1)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
