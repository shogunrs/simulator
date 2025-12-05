"use client";

import GridWorld from "@/components/GridWorld";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RLExplainerPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-card p-6">
            <div className="max-w-4xl mx-auto mb-8">
                <Link
                    href="/simulator"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Simulator
                </Link>
                <h1 className="text-4xl font-bold text-primary mb-2">Reinforcement Learning 101</h1>
                <p className="text-lg text-muted-foreground">
                    A simple "Grid World" demonstration. The agent learns to navigate the grid by exploring,
                    getting rewarded for reaching the goal, and punished for hitting hazards.
                </p>
            </div>

            <GridWorld />
        </div>
    );
}
