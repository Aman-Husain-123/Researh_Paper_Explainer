'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, RefreshCw, Trophy, ChevronRight, Award } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface Props {
    paperText: string;
    initialQuestions?: Question[];
}

export default function QuizMode({ paperText, initialQuestions = [] }: Props) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ correct: boolean, diff: string }[]>([]);

    const fetchQuestions = async (diff: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperText, difficulty: diff, count: 3 })
            });
            const data = await res.json();
            if (data.questions) {
                setQuestions(prev => [...prev, ...data.questions]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch if empty
    useEffect(() => {
        if (questions.length === 0 && paperText) {
            fetchQuestions(difficulty);
        }
    }, [paperText]);

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === questions[currentQIndex].correctIndex;
        if (isCorrect) setScore(s => s + 1);
        setTotalAnswered(t => t + 1);
        setHistory(prev => [...prev, { correct: isCorrect, diff: difficulty }]);
    };

    const handleNext = async () => {
        setIsAnswered(false);
        setSelectedOption(null);

        // Check if we need more questions
        if (currentQIndex + 1 >= questions.length) {
            await fetchQuestions(difficulty);
        }
        setCurrentQIndex(prev => prev + 1);
    };

    const currentQuestion = questions[currentQIndex];
    const improvement = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

    if (!currentQuestion) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}><RefreshCw size={24} color="#6366f1" /></div>
            <p>Generating your specialized exam...</p>
        </div>
    );

    return (
        <div style={{ marginTop: '2rem' }}>
            {/* HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['easy', 'medium', 'hard'].map(d => (
                        <button
                            key={d}
                            onClick={() => { setDifficulty(d as any); }}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '0.5rem',
                                border: difficulty === d ? `1px solid #6366f1` : '1px solid transparent',
                                background: difficulty === d ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: difficulty === d ? '#fff' : 'var(--text-dim)',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>MASTERY</div>
                        <div style={{ color: improvement > 70 ? '#10b981' : '#eab308', fontWeight: 'bold' }}>{improvement}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>STREAK</div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{score} / {totalAnswered}</div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentQIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    {currentQuestion.text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentQuestion.options.map((opt, i) => {
                        let bg = 'rgba(255,255,255,0.05)';
                        let border = 'transparent';

                        if (isAnswered) {
                            if (i === currentQuestion.correctIndex) {
                                bg = 'rgba(16, 185, 129, 0.15)';
                                border = '#10b981';
                            } else if (i === selectedOption) {
                                bg = 'rgba(239, 68, 68, 0.15)';
                                border = '#ef4444';
                            }
                        } else if (selectedOption === i) {
                            bg = 'rgba(255,255,255,0.1)';
                        }

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: isAnswered ? 1 : 1.01 }}
                                whileTap={{ scale: isAnswered ? 1 : 0.99 }}
                                onClick={() => handleAnswer(i)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '0.75rem',
                                    background: bg,
                                    border: `1px solid ${border}`,
                                    textAlign: 'left',
                                    color: 'white',
                                    cursor: isAnswered ? 'default' : 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                {opt}
                                {isAnswered && i === currentQuestion.correctIndex && <CheckCircle size={18} color="#10b981" />}
                                {isAnswered && i === selectedOption && i !== currentQuestion.correctIndex && <XCircle size={18} color="#ef4444" />}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Feedback Section */}
                <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Brain size={20} color="#8b5cf6" />
                                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                    <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Intuition: </span>
                                    {currentQuestion.explanation}
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Generative AI Thinking...' : 'Next Challenge'} <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
