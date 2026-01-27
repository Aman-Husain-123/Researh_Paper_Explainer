'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle, XCircle, Zap } from 'lucide-react';

interface ProblemData {
    text: string;
    oldWay: string;
    limitation: string;
    desiredWay: string;
}

interface Props {
    data?: ProblemData | string;
}

export default function ProblemVisualizer({ data }: Props) {
    const [showSolution, setShowSolution] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    // Handle both old string format and new object format
    const problemData: ProblemData = typeof data === 'object' && data !== null
        ? data
        : {
            text: typeof data === 'string' ? data : 'Loading...',
            oldWay: 'Old Approach',
            limitation: 'Bottleneck',
            desiredWay: 'New Approach'
        };

    useEffect(() => {
        const interval = setInterval(() => {
            setShowSolution(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ marginTop: '1.5rem' }}>
            {/* Animated Comparison */}
            <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    minHeight: '120px'
                }}>
                    {/* Old Way */}
                    <motion.div
                        animate={{
                            opacity: showSolution ? 0.4 : 1,
                            scale: showSolution ? 0.9 : 1
                        }}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            background: showSolution ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '1rem',
                            border: `2px solid ${showSolution ? 'rgba(239, 68, 68, 0.2)' : '#ef4444'}`,
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        <XCircle size={24} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>
                            {problemData.oldWay}
                        </div>
                        <motion.div
                            animate={{ opacity: showSolution ? 0 : 1 }}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                background: '#ef4444',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '1rem',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {problemData.limitation}
                        </motion.div>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                        animate={{ x: showSolution ? 10 : 0 }}
                        style={{ color: 'var(--text-dim)' }}
                    >
                        <ArrowRight size={32} />
                    </motion.div>

                    {/* Desired Way */}
                    <motion.div
                        animate={{
                            opacity: showSolution ? 1 : 0.4,
                            scale: showSolution ? 1 : 0.9
                        }}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            background: showSolution ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                            borderRadius: '1rem',
                            border: `2px solid ${showSolution ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`,
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        <CheckCircle size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>
                            {problemData.desiredWay}
                        </div>
                        <motion.div
                            animate={{ opacity: showSolution ? 1 : 0 }}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                background: '#10b981',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '1rem',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}
                        >
                            NEEDED
                        </motion.div>
                    </motion.div>
                </div>

                {/* Toggle Button */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                        onClick={() => setShowSolution(!showSolution)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            padding: '0.5rem 1.5rem',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Zap size={12} /> {showSolution ? 'Show Problem' : 'Show Goal'}
                    </button>
                </div>
            </div>
        </div>
    );
}
