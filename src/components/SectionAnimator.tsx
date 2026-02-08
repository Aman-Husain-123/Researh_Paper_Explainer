'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, ArrowRight, XCircle, Lightbulb, Brain,
    CheckCircle, Zap, Target, AlertTriangle, TrendingUp,
    Layers, GitBranch, HelpCircle
} from 'lucide-react';

interface HistoryEra {
    year: string;
    method: string;
    limitation?: string;
    benefit?: string;
}

interface FailureBreakdown {
    component: string;
    issue: string;
    consequence: string;
}

interface InsightData {
    before: string;
    after: string;
    "key concept": string;
}

interface Props {
    type: 'history' | 'failure' | 'insight' | 'concepts' | 'generalization' | 'validation' | 'mentalModels' | 'activeLearning';
    data?: any; // Dynamic data from API
}

export default function SectionAnimator({ type, data }: Props) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => (prev + 1) % 4); // Generalized cycle
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // PARSE DATA SECURELY
    const historyData = data?.eras || [
        { year: 'Past', method: 'Old Way', limitation: 'Limited' },
        { year: 'Recent', method: 'Better Way', limitation: 'Still Slow' },
        { year: 'Now', method: 'This Paper', benefit: 'Fixed' }
    ];

    const failureData = data?.breakdown || {
        component: "System Component",
        issue: "Critical Flaw",
        consequence: "System Failure"
    };

    const insightData = data?.before ? data : {
        before: "Old Assumption",
        after: "New Reality",
        "key concept": "The Insight"
    };

    const conceptList = data?.list || ["Core Idea 1", "Core Idea 2", "Core Idea 3"];
    const fieldList = data?.fields || ["Field A", "Field B", "Field C"];
    const metricList = data?.metrics || [{ name: "Accuracy", value: "High", context: "vs SOTA" }];
    const analogyList = data?.analogies || [{ name: "Analogy", explanation: "Explanation" }];
    const quizData = data?.quiz || [{ question: "Awaiting generation...", options: ["Wait", "Reload"], answer: 0 }];

    // RENDERERS
    const renderHistory = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {historyData.map((era: HistoryEra, i: number) => (
                    <React.Fragment key={i}>
                        <motion.div
                            layout
                            animate={{ opacity: step >= i ? 1 : 0.3, scale: step === i ? 1.05 : 1 }}
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                background: step === i ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                                padding: '1rem 0.8rem',
                                borderRadius: '1rem',
                                border: step === i ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid transparent',
                                boxShadow: step === i ? '0 4px 20px rgba(168, 85, 247, 0.2)' : 'none'
                            }}
                        >
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{era.year}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: step === i ? '#a855f7' : '#fff' }}>{era.method}</div>
                            {step === i && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: era.benefit ? '#10b981' : '#ef4444' }}
                                >
                                    {era.benefit ? <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} /> : <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />}
                                    {era.benefit || era.limitation}
                                </motion.div>
                            )}
                        </motion.div>
                        {i < historyData.length - 1 && (
                            <motion.div animate={{ opacity: step > i ? 1 : 0.2 }}>
                                <ArrowRight size={20} color="#a855f7" />
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const renderFailure = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '2rem', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <motion.div style={{ textAlign: 'center' }}>
                <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)' }}>
                    {failureData.component}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Component</div>
            </motion.div>

            <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                style={{ textAlign: 'center', color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={36} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{failureData.issue}</div>
            </motion.div>

            <ArrowRight size={24} color="var(--text-dim)" />

            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ textAlign: 'center' }}
            >
                <div style={{ padding: '1rem', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem', marginBottom: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                    {failureData.consequence}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Result</div>
            </motion.div>
        </div>
    );

    const renderInsight = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', opacity: 0.5, transform: 'scale(0.9)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>BEFORE</div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', textDecoration: 'line-through' }}>
                    {insightData.before}
                </div>
            </div>

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 0px rgba(234, 179, 8, 0)', '0 0 50px rgba(234, 179, 8, 0.4)', '0 0 0px rgba(234, 179, 8, 0)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                    padding: '2rem',
                    borderRadius: '50%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: '140px', height: '140px', textAlign: 'center',
                    zIndex: 10
                }}
            >
                <Lightbulb size={32} color="white" fill="white" />
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem', lineHeight: '1.2' }}>
                    {insightData["key concept"]}
                </div>
            </motion.div>

            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>AFTER</div>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                    {insightData.after}
                </div>
            </div>
        </div>
    );

    const renderConcepts = () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            {conceptList.map((concept: string, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        cursor: 'default',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ padding: '0.4rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '0.5rem' }}>
                        <Brain size={16} color="#c4b5fd" />
                    </div>
                    {concept}
                </motion.div>
            ))}
        </div>
    );

    const renderGeneralization = () => (
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {fieldList.map((field: string, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: '#f97316' }}
                    style={{
                        padding: '1.5rem',
                        background: 'rgba(249, 115, 22, 0.03)',
                        border: '1px solid rgba(249, 115, 22, 0.1)',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        color: '#f97316',
                        cursor: 'default'
                    }}
                >
                    <Layers size={28} style={{ margin: '0 auto 0.75rem auto', opacity: 0.8 }} />
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{field}</div>
                </motion.div>
            ))}
        </div>
    );

    const renderValidation = () => (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metricList.map((m: any, i: number) => (
                <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}
                >
                    <CheckCircle size={24} color="#10b981" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{m.name}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{m.value}</div>
                    </div>
                    <div style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '1rem', fontSize: '0.7rem', color: '#10b981' }}>
                        {m.context}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderMentalModels = () => (
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
            {analogyList.map((a: any, i: number) => (
                <motion.div
                    key={i}
                    whileHover={{ x: 5 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '1rem', borderLeft: '4px solid #06b6d4' }}
                >
                    <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '0.5rem' }}>
                        <Zap size={24} color="#06b6d4" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#06b6d4', marginBottom: '0.5rem', fontSize: '1rem' }}>{a.name}</div>
                        <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.6' }}>{a.explanation}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderActiveLearning = () => {
        const [selected, setSelected] = useState<number | null>(null);
        const q = quizData[0]; // Just showing first question for demo

        return (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <HelpCircle size={20} color="#6366f1" />
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>Quick Check</span>
                </div>
                <div style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>{q.question}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {q.options.map((opt: string, i: number) => (
                        <button
                            key={i}
                            onClick={() => setSelected(i)}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: selected === i
                                    ? (i === q.answer ? '2px solid #10b981' : '2px solid #ef4444')
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: selected === i
                                    ? (i === q.answer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                                    : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            {opt}
                            {selected === i && i === q.answer && <CheckCircle size={18} color="#10b981" style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)' }} />}
                            {selected === i && i !== q.answer && <XCircle size={18} color="#ef4444" style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)' }} />}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (type === 'history') return renderHistory();
    if (type === 'failure') return renderFailure();
    if (type === 'insight') return renderInsight();
    if (type === 'concepts') return renderConcepts();
    if (type === 'generalization') return renderGeneralization();
    if (type === 'validation') return renderValidation();
    if (type === 'mentalModels') return renderMentalModels();
    if (type === 'activeLearning') return renderActiveLearning();

    return null;
}
