'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, ArrowRight } from 'lucide-react';

interface VisualData {
    nodes: string[];
    links: { source: number; target: number; label: string }[];
}

interface Props {
    externalStep?: number;
    visualData?: VisualData;
}

const FALLBACK_DATA: VisualData = {
    nodes: ["Input", "Encoder", "Core", "Decoder", "Output", "Loss"],
    links: [
        { source: 0, target: 1, label: "feeds" },
        { source: 1, target: 2, label: "processes" },
        { source: 2, target: 3, label: "transforms" },
        { source: 3, target: 4, label: "outputs" },
        { source: 4, target: 5, label: "evaluates" }
    ]
};

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#eab308', '#06b6d4'];

export default function AttentionVisualizer({ externalStep, visualData }: Props) {
    const [hoverNode, setHoverNode] = useState<number | null>(null);

    const data = visualData && visualData.nodes?.length > 0 ? visualData : FALLBACK_DATA;
    const nodes = data.nodes;
    const links = data.links || [];

    // Get links for hovered node
    const activeLinks = hoverNode !== null
        ? links.filter(l => l.source === hoverNode || l.target === hoverNode)
        : [];

    return (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <Activity size={20} /> Architecture Flow
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Hover components to see data flow
                    </p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '2rem', fontSize: '0.7rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {nodes.length} Components
                </div>
            </div>

            <div style={{
                minHeight: '220px',
                position: 'relative',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '1rem',
                padding: '2rem 1.5rem',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Connection Lines */}
                <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                    {links.map((link, i) => {
                        const isActive = hoverNode !== null && (link.source === hoverNode || link.target === hoverNode);
                        const sourceX = ((link.source + 0.5) / nodes.length) * 100;
                        const targetX = ((link.target + 0.5) / nodes.length) * 100;

                        return (
                            <motion.line
                                key={i}
                                x1={`${sourceX}%`} y1="50%"
                                x2={`${targetX}%`} y2="50%"
                                stroke={isActive ? COLORS[link.source % COLORS.length] : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isActive ? 3 : 1}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isActive ? 1 : 0.3 }}
                                style={{ strokeDasharray: isActive ? 'none' : '4 4' }}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    {nodes.map((node, i) => {
                        const isActive = hoverNode === i;
                        const isConnected = activeLinks.some(l => l.source === i || l.target === i);

                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <motion.div
                                    onMouseEnter={() => setHoverNode(i)}
                                    onMouseLeave={() => setHoverNode(null)}
                                    animate={{
                                        scale: isActive ? 1.15 : (isConnected ? 1.05 : 1),
                                        backgroundColor: isActive ? COLORS[i % COLORS.length] : (isConnected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'),
                                        borderColor: isActive ? 'white' : (isConnected ? COLORS[hoverNode! % COLORS.length] : 'rgba(255,255,255,0.1)')
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        border: '2px solid',
                                        cursor: 'pointer',
                                        color: isActive ? 'white' : (isConnected ? '#fff' : 'var(--text-dim)'),
                                        textAlign: 'center',
                                        padding: '8px',
                                        boxShadow: isActive ? `0 8px 25px ${COLORS[i % COLORS.length]}50` : 'none'
                                    }}
                                >
                                    {node}
                                </motion.div>

                                {/* Connection Label */}
                                {isActive && activeLinks.filter(l => l.source === i).map((link, j) => (
                                    <motion.div
                                        key={j}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            position: 'absolute',
                                            top: '-30px',
                                            background: COLORS[i % COLORS.length],
                                            color: 'white',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.6rem',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        → {nodes[link.target]}: {link.label}
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Flow Direction Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.7rem'
                }}>
                    <Zap size={12} /> Data Flow <ArrowRight size={12} />
                </div>
            </div>
        </div>
    );
}
