'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Zap, Activity, Layers, GitMerge, Scale } from 'lucide-react';

interface ProblemData {
    text: string;
    oldWay: string;
    limitation: string;
    desiredWay: string;
    visualizationType?: 'bottleneck' | 'flow' | 'architecture' | 'tradeoff';
    visualizationData?: any;
}

interface Props {
    data?: ProblemData | string;
}

// --- SUB-VISUALIZERS ---

const BottleneckVisualizer = ({ data, showSolution }: { data: ProblemData, showSolution: boolean }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Old Way: The Funnel/Bottleneck */}
            <div style={{ opacity: showSolution ? 0.4 : 1, transition: 'opacity 0.5s' }}>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 'bold' }}>{data.oldWay}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '60px' }}>
                    {/* Input Flow */}
                    <div style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }}
                        />
                    </div>
                    {/* The Bottleneck */}
                    <div style={{ width: '40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={32} color="#ef4444" />
                    </div>
                    {/* Constrained Output */}
                    <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{ width: '20%', height: '100%', background: 'rgba(239,68,68,0.5)' }}
                        />
                    </div>
                </div>
                {!showSolution && <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.5rem', color: '#ef4444' }}>⚠️ {data.limitation}</div>}
            </div>

            {/* New Way: The Wide Pipe */}
            <div style={{ opacity: showSolution ? 1 : 0.4, transition: 'opacity 0.5s' }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem', fontWeight: 'bold' }}>{data.desiredWay}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '60px' }}>
                    {/* Input Flow */}
                    <div style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }}
                        />
                    </div>
                    {/* No Bottleneck */}
                    <div style={{ width: '40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={32} color="#10b981" />
                    </div>
                    {/* Full Output */}
                    <div style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.8), transparent)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FlowVisualizer = ({ data, showSolution }: { data: ProblemData, showSolution: boolean }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {/* Sequential vs Parallel/Optimized */}
            <div style={{ opacity: showSolution ? 0.3 : 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '0.5rem' }}>{data.oldWay}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: (i - 1) * 0.5 }}
                            style={{ width: '30px', height: '30px', border: '1px solid #ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {i}
                        </motion.div>
                    ))}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>Slow/Sequential</span>
                </div>
            </div>

            {/* Optimized Flow */}
            <div style={{ opacity: showSolution ? 1 : 0.3 }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem' }}>{data.desiredWay}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.1, 1], backgroundColor: ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.4)', 'rgba(16,185,129,0.1)'] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ width: '30px', height: '30px', border: '1px solid #10b981', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}
                        >
                            {i}
                        </motion.div>
                    ))}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>Parallel/Fast</span>
                </div>
            </div>
        </div>
    );
};

const ArchitectureVisualizer = ({ data, showSolution }: { data: ProblemData, showSolution: boolean }) => {
    return (
        <div style={{ height: '180px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <AnimatePresence mode='wait'>
                {!showSolution ? (
                    <motion.div
                        key="old"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '1rem', color: '#ef4444', fontSize: '0.9rem' }}>{data.oldWay}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', width: '120px', gap: '5px', justifyContent: 'center', margin: '0 auto' }}>
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} style={{ width: '30px', height: '30px', background: 'rgba(239,68,68,0.2)', borderRadius: '50%', border: '1px solid #ef4444' }} />
                            ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem' }}>Dense / Complex</div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="new"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '1rem', color: '#10b981', fontSize: '0.9rem' }}>{data.desiredWay}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '40px', height: '40px', border: '2px solid #10b981', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20} color="#10b981" /></div>
                            <div style={{ width: '2px', height: '20px', background: '#10b981' }}></div>
                            <div style={{ width: '40px', height: '40px', border: '2px solid #10b981', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20} color="#10b981" /></div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.5rem' }}>Structured / Efficient</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TradeoffVisualizer = ({ data, showSolution }: { data: ProblemData, showSolution: boolean }) => {
    return (
        <div style={{ position: 'relative', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center', opacity: showSolution ? 0.4 : 1 }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px' }}>
                    <motion.div animate={{ height: '80px' }} style={{ width: '20px', background: '#3b82f6', borderRadius: '4px 4px 0 0' }} title="Cost" />
                    <motion.div animate={{ height: '20px' }} style={{ width: '20px', background: '#ef4444', borderRadius: '4px 4px 0 0' }} title="Performance" />
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: '#ef4444' }}>Expansive & Slow</div>
            </div>

            <ArrowRight size={24} color="var(--text-dim)" />

            <div style={{ textAlign: 'center', opacity: showSolution ? 1 : 0.4 }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px' }}>
                    <motion.div animate={{ height: '20px' }} style={{ width: '20px', background: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
                    <motion.div animate={{ height: '80px' }} style={{ width: '20px', background: '#10b981', borderRadius: '4px 4px 0 0' }} />
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: '#10b981' }}>Cheap & Fast</div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function ProblemVisualizer({ data }: Props) {
    const [showSolution, setShowSolution] = useState(false);

    // Normalize input data
    const problemData: ProblemData = typeof data === 'object' && data !== null
        ? data
        : {
            text: typeof data === 'string' ? data : 'Loading...',
            oldWay: 'Old Approach',
            limitation: 'Bottleneck',
            desiredWay: 'New Approach',
            visualizationType: 'bottleneck' // Default
        };

    // Auto-toggle animation
    useEffect(() => {
        const interval = setInterval(() => {
            setShowSolution(prev => !prev);
        }, 4000); // Slower toggle for better comprehension
        return () => clearInterval(interval);
    }, []);

    const type = problemData.visualizationType || 'bottleneck';

    // Helper to get icon based on type
    const TypeIcon = () => {
        switch (type) {
            case 'flow': return <Activity size={16} />;
            case 'architecture': return <GitMerge size={16} />;
            case 'tradeoff': return <Scale size={16} />;
            default: return <Zap size={16} />;
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <TypeIcon /> Problem vs Solution
            </h3>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Decor */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Dynamic Visualizer Switch */}
                {type === 'bottleneck' && <BottleneckVisualizer data={problemData} showSolution={showSolution} />}
                {type === 'flow' && <FlowVisualizer data={problemData} showSolution={showSolution} />}
                {type === 'architecture' && <ArchitectureVisualizer data={problemData} showSolution={showSolution} />}
                {type === 'tradeoff' && <TradeoffVisualizer data={problemData} showSolution={showSolution} />}

                {/* Context Text Footer */}
                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '80%' }}>
                        {showSolution
                            ? <span style={{ color: '#10b981' }}>Solution: {problemData.desiredWay}</span>
                            : <span style={{ color: '#ef4444' }}>Problem: {problemData.limitation}</span>
                        }
                    </div>
                    <button
                        onClick={() => setShowSolution(!showSolution)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '2rem',
                            padding: '0.5rem 1rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        {showSolution ? 'See Problem' : 'See Solution'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
