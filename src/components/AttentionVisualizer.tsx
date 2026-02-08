'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, ArrowRight, Circle, Sparkles } from 'lucide-react';

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
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const data = visualData && visualData.nodes?.length > 0 ? visualData : FALLBACK_DATA;
    const nodes = data.nodes;
    const links = data.links || [];

    // Get links for hovered node
    const activeLinks = hoverNode !== null
        ? links.filter(l => l.source === hoverNode || l.target === hoverNode)
        : links; // Default show all flow if none hovered, or maybe specialized logic based on externalStep

    return (
        <div className="glass-card" style={{
            padding: '2rem',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.05))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <Activity size={20} /> Architecture Flow
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Hover components to see data flow • <span style={{ color: '#10b981' }}>Live Simulation</span>
                    </p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '2rem', fontSize: '0.7rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {nodes.length} Components
                </div>
            </div>

            <div style={{
                minHeight: '260px',
                position: 'relative',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '1.5rem',
                padding: '3rem 1.5rem',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
            }}>
                {/* Background Grid */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.5
                }} />

                {/* Connection Lines & Particles */}
                <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
                    {links.map((link, i) => {
                        const isHovered = hoverNode !== null && (link.source === hoverNode || link.target === hoverNode);
                        const isRelevant = hoverNode === null || isHovered;

                        const sourceX = ((link.source + 0.5) / nodes.length) * 100;
                        const targetX = ((link.target + 0.5) / nodes.length) * 100;
                        const color = COLORS[link.source % COLORS.length];

                        return (
                            <React.Fragment key={i}>
                                {/* Base Line */}
                                <motion.line
                                    x1={`${sourceX}%`} y1="50%"
                                    x2={`${targetX}%`} y2="50%"
                                    stroke={isRelevant ? color : 'rgba(255,255,255,0.05)'}
                                    strokeWidth={isHovered ? 3 : 1.5}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isRelevant ? (isHovered ? 1 : 0.4) : 0.1 }}
                                    style={{ transition: 'all 0.3s' }}
                                />

                                {/* Moving Particle */}
                                {isRelevant && isLoaded && (
                                    <motion.circle
                                        r={4}
                                        fill={color}
                                        initial={{ cx: `${sourceX}%`, cy: "50%" }}
                                        animate={{
                                            cx: [`${sourceX}%`, `${targetX}%`],
                                            opacity: [0, 1, 1, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            delay: i * 0.5 // Stagger flows
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </svg>

                {/* Nodes */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative', zIndex: 10, height: '100%' }}>
                    {nodes.map((node, i) => {
                        const isActive = hoverNode === i;
                        const isConnected = hoverNode !== null && activeLinks.some(l => l.source === i || l.target === i);
                        const isDimmed = hoverNode !== null && !isActive && !isConnected;

                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                                {/* Connection Label (Above Node) */}
                                <AnimatePresence>
                                    {isActive && activeLinks.filter(l => l.source === i).map((link, j) => (
                                        <motion.div
                                            key={j}
                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: -45, scale: 1 }}
                                            exit={{ opacity: 0, y: 0, scale: 0.8 }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                background: COLORS[i % COLORS.length],
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 'bold',
                                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                                zIndex: 20
                                            }}
                                        >
                                            <span style={{ opacity: 0.8 }}>Output:</span> {link.label}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <motion.div
                                    onMouseEnter={() => setHoverNode(i)}
                                    onMouseLeave={() => setHoverNode(null)}
                                    whileHover={{ scale: 1.2, rotate: [0, -2, 2, 0] }}
                                    animate={{
                                        scale: isActive ? 1.2 : (isConnected ? 1.1 : 1),
                                        backgroundColor: isActive ? COLORS[i % COLORS.length] : (isConnected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'),
                                        borderColor: isActive ? 'white' : (isConnected ? COLORS[i % COLORS.length] : 'rgba(255,255,255,0.1)'),
                                        opacity: isDimmed ? 0.3 : 1
                                    }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        width: '85px',
                                        height: '85px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid',
                                        cursor: 'pointer',
                                        color: isActive ? 'white' : (isConnected ? '#fff' : 'var(--text-dim)'),
                                        textAlign: 'center',
                                        padding: '10px',
                                        boxShadow: isActive
                                            ? `0 0 40px ${COLORS[i % COLORS.length]}80`
                                            : (isConnected ? `0 0 20px ${COLORS[i % COLORS.length]}30` : 'none'),
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {isActive ? <Zap size={24} className="animate-pulse" /> : <Circle size={18} />}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: '1.2' }}>{node}</span>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Flow Direction Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Sparkles size={14} color="#eab308" />
                    <span>Live Tensor Flow detected</span>
                </div>
            </div>
        </div>
    );
}
