'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, RefreshCw, ChevronRight, Shuffle } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionPool {
    easy: Question[];
    medium: Question[];
    hard: Question[];
}

interface Props {
    paperText: string;
    initialQuestions?: Question[];
}

// Utility function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate unique ID for questions
function generateUniqueId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function QuizMode({ paperText, initialQuestions = [] }: Props) {
    // Separate question pools for each difficulty level
    const [questionPool, setQuestionPool] = useState<QuestionPool>({
        easy: [],
        medium: [],
        hard: []
    });

    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ correct: boolean, diff: string }[]>([]);

    // Track which questions have been shown to ensure uniqueness
    const shownQuestionIds = useRef<Set<string>>(new Set());
    // Track ongoing fetch to prevent duplicates
    const fetchInProgress = useRef<{ [key: string]: boolean }>({
        easy: false,
        medium: false,
        hard: false
    });

    const fetchQuestions = useCallback(async (diff: 'easy' | 'medium' | 'hard', forceNew: boolean = false) => {
        // Prevent duplicate fetches
        if (fetchInProgress.current[diff]) return;

        fetchInProgress.current[diff] = true;
        setLoading(true);

        try {
            // Add randomness seed to ensure different questions each time
            const randomSeed = Math.random().toString(36).substr(2, 9);

            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paperText,
                    difficulty: diff,
                    count: 5, // Fetch 5 questions per batch
                    randomSeed // Add randomness
                })
            });

            const data = await res.json();

            if (data.questions && Array.isArray(data.questions)) {
                // Process and tag questions with difficulty and unique IDs
                const processedQuestions: Question[] = data.questions.map((q: any) => ({
                    ...q,
                    id: generateUniqueId(),
                    difficulty: diff
                }));

                // Shuffle the questions for randomness
                const shuffledQuestions = shuffleArray(processedQuestions);

                // Filter out any questions that might be duplicates (based on text)
                const existingTexts = new Set(questionPool[diff].map(q => q.text.toLowerCase().trim()));
                const newUniqueQuestions = shuffledQuestions.filter(
                    q => !existingTexts.has(q.text.toLowerCase().trim())
                );

                if (forceNew) {
                    // Replace existing pool with new questions
                    setQuestionPool(prev => ({
                        ...prev,
                        [diff]: shuffleArray(newUniqueQuestions)
                    }));
                    setCurrentQuestions(shuffleArray(newUniqueQuestions));
                    setCurrentQIndex(0);
                    shownQuestionIds.current.clear();
                } else {
                    // Append to existing pool
                    setQuestionPool(prev => ({
                        ...prev,
                        [diff]: [...prev[diff], ...newUniqueQuestions]
                    }));
                }
            }
        } catch (e) {
            console.error('Failed to fetch questions:', e);
        } finally {
            setLoading(false);
            fetchInProgress.current[diff] = false;
        }
    }, [paperText, questionPool]);

    // Initial fetch when component mounts
    useEffect(() => {
        if (paperText && questionPool[difficulty].length === 0) {
            fetchQuestions(difficulty, true);
        }
    }, [paperText]);

    // Handle difficulty tab change - fetch new questions for that difficulty
    const handleDifficultyChange = useCallback(async (newDiff: 'easy' | 'medium' | 'hard') => {
        if (newDiff === difficulty) return;

        setDifficulty(newDiff);
        setSelectedOption(null);
        setIsAnswered(false);
        setCurrentQIndex(0);
        shownQuestionIds.current.clear();

        // Always fetch fresh questions when switching tabs
        await fetchQuestions(newDiff, true);
    }, [difficulty, fetchQuestions]);

    // Get a unique question that hasn't been shown yet
    const getNextQuestion = useCallback((): Question | null => {
        const pool = questionPool[difficulty];
        const unshownQuestions = pool.filter(q => !shownQuestionIds.current.has(q.id));

        if (unshownQuestions.length === 0) {
            return null;
        }

        // Randomly select from unshown questions
        const randomIndex = Math.floor(Math.random() * unshownQuestions.length);
        return unshownQuestions[randomIndex];
    }, [questionPool, difficulty]);

    // Update current questions when pool changes
    useEffect(() => {
        if (questionPool[difficulty].length > 0 && currentQuestions.length === 0) {
            const shuffled = shuffleArray(questionPool[difficulty]);
            setCurrentQuestions(shuffled);
        }
    }, [questionPool, difficulty, currentQuestions.length]);

    const handleAnswer = (index: number) => {
        if (isAnswered || !currentQuestions[currentQIndex]) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const currentQ = currentQuestions[currentQIndex];
        const isCorrect = index === currentQ.correctIndex;
        if (isCorrect) setScore(s => s + 1);
        setTotalAnswered(t => t + 1);
        setHistory(prev => [...prev, { correct: isCorrect, diff: difficulty }]);

        // Mark this question as shown
        shownQuestionIds.current.add(currentQ.id);
    };

    const handleNext = async () => {
        setIsAnswered(false);
        setSelectedOption(null);

        const nextIndex = currentQIndex + 1;

        // Check if we need more questions
        if (nextIndex >= currentQuestions.length) {
            // Fetch more questions
            await fetchQuestions(difficulty, false);

            // After fetching, update current questions with new pool
            const newPool = questionPool[difficulty];
            const unshownQuestions = newPool.filter(q => !shownQuestionIds.current.has(q.id));

            if (unshownQuestions.length > 0) {
                setCurrentQuestions(shuffleArray(unshownQuestions));
                setCurrentQIndex(0);
            }
        } else {
            setCurrentQIndex(nextIndex);
        }
    };

    const handleRefresh = async () => {
        // Force fetch new questions for current difficulty
        shownQuestionIds.current.clear();
        await fetchQuestions(difficulty, true);
    };

    const currentQuestion = currentQuestions[currentQIndex];
    const improvement = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

    // Calculate per-difficulty stats
    const difficultyStats = {
        easy: history.filter(h => h.diff === 'easy'),
        medium: history.filter(h => h.diff === 'medium'),
        hard: history.filter(h => h.diff === 'hard')
    };

    if (loading && !currentQuestion) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <RefreshCw size={24} color="#6366f1" />
            </div>
            <p style={{ color: '#94a3b8' }}>Generating unique {difficulty} questions...</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                Creating personalized quiz based on paper content
            </p>
        </div>
    );

    if (!currentQuestion && !loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No questions available</p>
            <button
                onClick={handleRefresh}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <RefreshCw size={16} /> Generate Questions
            </button>
        </div>
    );

    return (
        <div style={{ marginTop: '2rem' }}>
            {/* HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {(['easy', 'medium', 'hard'] as const).map(d => {
                        const stats = difficultyStats[d];
                        const correct = stats.filter(s => s.correct).length;
                        const total = stats.length;

                        return (
                            <button
                                key={d}
                                onClick={() => handleDifficultyChange(d)}
                                disabled={loading}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: difficulty === d ? `2px solid ${d === 'easy' ? '#10b981' : d === 'medium' ? '#f59e0b' : '#ef4444'}` : '1px solid rgba(255,255,255,0.1)',
                                    background: difficulty === d ? `${d === 'easy' ? 'rgba(16, 185, 129, 0.2)' : d === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` : 'transparent',
                                    color: difficulty === d ? '#fff' : 'var(--text-dim)',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: '70px'
                                }}
                            >
                                <span>{d}</span>
                                {total > 0 && (
                                    <span style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>
                                        {correct}/{total}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Refresh/Shuffle button */}
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Get new random questions"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: 'var(--text-dim)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Shuffle size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>MASTERY</div>
                        <div style={{ color: improvement > 70 ? '#10b981' : improvement > 40 ? '#eab308' : '#ef4444', fontWeight: 'bold' }}>{improvement}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>SCORE</div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{score} / {totalAnswered}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>QUESTION</div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{currentQIndex + 1}</div>
                    </div>
                </div>
            </div>

            {/* Difficulty Indicator */}
            <div style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--text-dim)'
            }}>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: difficulty === 'easy' ? 'rgba(16, 185, 129, 0.2)' : difficulty === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: difficulty === 'easy' ? '#10b981' : difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                }}>
                    {difficulty}
                </span>
                <span>Question</span>
                {loading && <RefreshCw size={14} className="animate-spin" style={{ marginLeft: '0.5rem' }} />}
            </div>

            {/* Question Card */}
            {currentQuestion && (
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.6', color: '#f1f5f9' }}>
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
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </span>
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
                                    <Brain size={20} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                        <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Explanation: </span>
                                        {currentQuestion.explanation}
                                    </div>
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: loading ? 'rgba(99, 102, 241, 0.5)' : 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" /> Generating more questions...
                                        </>
                                    ) : (
                                        <>
                                            Next Challenge <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
