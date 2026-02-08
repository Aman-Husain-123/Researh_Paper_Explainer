'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Settings,
  Activity,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  Upload,
  Search,
  X,
  Send,
  Loader2,
  FileText,
  HelpCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  MousePointer2,
  Lock,
  ChevronRight,
  Plus,
  BookOpen
} from 'lucide-react';
import Mermaid from '@/components/Mermaid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import AttentionVisualizer from '@/components/AttentionVisualizer';
import ProblemVisualizer from '@/components/ProblemVisualizer';
import SectionAnimator from '@/components/SectionAnimator';
import QuizMode from '@/components/QuizMode';

const SECTIONS = [
  { id: 'problem', label: 'The Core Problem', icon: HelpCircle, color: '#6366f1' },
  { id: 'history', label: 'Problem History', icon: FileText, color: '#a855f7' },
  { id: 'failure', label: 'Why it Failed', icon: Activity, color: '#ec4899' },
  { id: 'insight', label: 'The Insight', icon: Lightbulb, color: '#eab308' },
  { id: 'concepts', label: 'Key Concepts', icon: Brain, color: '#8b5cf6' },
  { id: 'system', label: 'The Solution', icon: Settings, color: '#3b82f6' },
  { id: 'deepDive', label: 'Deep Dive', icon: BookOpen, color: '#f43f5e' },
  { id: 'generalization', label: 'Generalization', icon: ExternalLink, color: '#f97316' },
  { id: 'validation', label: 'Proof', icon: CheckCircle, color: '#10b981' },
  { id: 'mentalModels', label: 'Mental Models', icon: Zap, color: '#06b6d4' },
  { id: 'activeLearning', label: 'Learning Tasks', icon: GraduationCap, color: '#6366f1' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('problem');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Research Mentor. Upload a paper, and I'll rebuild your understanding from the ground up." }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paperData, setPaperData] = useState<any>(null); // Start with null
  const [fullText, setFullText] = useState('');
  const [deepDiveData, setDeepDiveData] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [animationStep, setAnimationStep] = useState<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [useVanilla, setUseVanilla] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const analyzePaper = async (text: string) => {
    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperText: text }),
      });
      const data = await response.json();
      if (!data.error) {
        setPaperData(data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMsg = currentMessage; // Capture before clearing
    const newMessages = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMessages);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          paperContext: JSON.stringify(paperData),
          fullText: fullText,
          useVanilla
        }),
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        richContent: data.richContent
      }]);

      // TRIGGER DEEP DIVE ONLY IF VISUAL CONTENT IS PRESENT
      if (data.richContent && data.richContent.hasVisual) {
        setDeepDiveData({
          question: userMsg,
          answer: data.text,
          ...data.richContent
        });
        setActiveTab('deepDive');
        setIsChatOpen(false); // Close chat to focus on the deep dive
      }

    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderRichContent = (richContent: any) => {
    if (!richContent) return null;

    return (
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Math Intuition Block */}
        {richContent.hasMath && richContent.math && (
          <div className="glass-card" style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderLeft: '4px solid #8b5cf6',
            padding: '1rem'
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: '#a78bfa' }}>
              <Brain size={16} /> {richContent.math.title || "Mathematical Intuition"}
            </h4>
            <div style={{
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              color: '#e2e8f0',
              fontSize: '0.9rem'
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {richContent.math.equation}
              </ReactMarkdown>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic', margin: 0 }}>
              {richContent.math.explanation}
            </p>
          </div>
        )}

        {/* Visualizer Block */}
        {richContent.hasVisual && richContent.visualData && (
          <div style={{ marginTop: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '0.9rem' }}>
              <Activity size={16} /> Visual Flow
            </h4>
            <AttentionVisualizer visualData={richContent.visualData} />
          </div>
        )}

        {/* Animation Steps / Timeline */}
        {richContent.animationSteps && richContent.animationSteps.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Step-by-Step Logic</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {richContent.animationSteps.map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <div style={{ minWidth: '1.5rem', height: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    {i + 1}
                  </div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.error || !data.text) {
        // If PDF parsing fails, use the file name as a hint to analyze
        console.warn('PDF parsing failed, using fallback text');
        const fallbackRaw = `Research paper titled: ${file.name}. Please generate a sample analysis structure for a typical research paper.`;
        setFullText(fallbackRaw);
        await analyzePaper(fallbackRaw);
      } else {
        setFullText(data.text);
        await analyzePaper(data.text);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      // Fallback: still try to analyze with minimal context
      await analyzePaper(`Research paper titled: ${file.name}. Please generate a sample analysis structure.`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderSectionContent = () => {
    // Handling Deep Dive Section (Special Case)
    if (activeTab === 'deepDive') {
      if (!deepDiveData) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-dim)', textAlign: 'center' }}>
            <BookOpen size={48} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
            <h3>No Deep Dive Active</h3>
            <p>Ask a "Why" or "How" question in the chat to trigger a deep visual explanation here.</p>
          </div>
        );
      }

      return (
        <section>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f43f5e', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <Activity size={16} /> Reasoning Engine Triggered
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {deepDiveData.question}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left Column: Explanation & Math */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  <Brain size={20} /> Concept Breakdown
                </h3>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e2e8f0' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{deepDiveData.answer}</ReactMarkdown>
                </div>
              </div>

              {deepDiveData.hasMath && deepDiveData.math && (
                <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '1rem' }}>
                    <Zap size={20} /> {deepDiveData.math.title || "Mathematical Intuition"}
                  </h3>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {deepDiveData.math.equation}
                    </ReactMarkdown>
                  </div>
                  <div style={{ color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.6', fontSize: '1rem' }}>
                    " {deepDiveData.math.explanation} "
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visualizer & Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {deepDiveData.hasVisual && deepDiveData.visualData && (
                <div style={{ position: 'sticky', top: '2rem' }}>
                  <AttentionVisualizer externalStep={animationStep} visualData={deepDiveData.visualData} />

                  {deepDiveData.animationSteps && (
                    <div className="glass-card" style={{ marginTop: '2rem', borderTop: '2px solid #10b981' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Activity size={20} color="#10b981" /> Logic Flow
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {deepDiveData.animationSteps.map((step: string, i: number) => (
                          <motion.button
                            key={i}
                            whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
                            onClick={() => setAnimationStep(i)}
                            style={{
                              display: 'flex', gap: '1rem', alignItems: 'center',
                              padding: '1rem',
                              background: animationStep === i ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                              borderRadius: '0.75rem',
                              border: 'none',
                              borderLeft: animationStep === i ? '4px solid #10b981' : '4px solid transparent',
                              textAlign: 'left', cursor: 'pointer', width: '100%', color: 'inherit',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{
                              minWidth: '24px', height: '24px', borderRadius: '50%',
                              background: animationStep === i ? '#10b981' : 'rgba(255,255,255,0.1)',
                              color: animationStep === i ? 'black' : 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 'bold'
                            }}>{i + 1}</div>
                            <span style={{ fontSize: '0.9rem', color: animationStep === i ? '#fff' : '#cbd5e1' }}>{step}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )
    }

    if (!paperData) return null;
    const content = paperData[activeTab];
    const section = SECTIONS.find(s => s.id === activeTab);
    const Icon = section?.icon || FileText;

    if (activeTab === 'system') {
      return (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={28} color="#3b82f6" /> The Solution
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-card" style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} /> High-Level Architecture
                  </h3>
                  {isClient && <Mermaid chart={content.mermaid} />}
                </div>
                <div className="glass-card" style={{ fontSize: '1rem', lineHeight: '1.7', color: '#e2e8f0' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{content.summary}</ReactMarkdown>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <AttentionVisualizer externalStep={animationStep} visualData={content.visualData} />

                <div className="glass-card" style={{ borderTop: '2px solid #10b981' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="#10b981" /> Animation Timeline (Interactive)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {content.animationTimeline.split('\n').filter(Boolean).map((line: string, i: number) => (
                      <motion.button
                        key={i}
                        whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
                        onClick={() => setAnimationStep(i)}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: animationStep === i ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                          borderRadius: '0.75rem',
                          border: 'none',
                          borderLeft: animationStep === i ? '4px solid #10b981' : '4px solid transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          width: '100%',
                          color: 'inherit',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: animationStep === i ? '#10b981' : 'rgba(255,255,255,0.1)',
                          color: animationStep === i ? 'black' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>{i + 1}</div>
                        <span style={{ fontSize: '0.9rem', color: animationStep === i ? '#fff' : '#cbd5e1' }}>{line.replace(/^\d+\.\s*\*\*(.*?)\*\*/, '$1')}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ borderTop: '2px solid var(--accent)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={20} color="var(--accent)" /> Visual Specification
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '1rem' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{content.visualSpec}</ReactMarkdown>
                </div>
              </div>
              <div className="glass-card" style={{ borderTop: '2px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  <Zap size={20} /> Interaction Key
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {content.interactionIdea}
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Special handling for problem section with animation
    if (activeTab === 'problem') {
      const problemText = typeof content === 'object' && content?.text ? content.text : content;
      return (
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Icon size={28} color={section?.color} /> {section?.label}
          </h2>
          <div className="glass-card" style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            color: '#e2e8f0',
            background: 'rgba(255,255,255,0.02)',
            padding: '2rem'
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{problemText}</ReactMarkdown>
            <ProblemVisualizer data={content} />
          </div>
        </section>
      );
    }

    // Special handling for active learning (Quiz Mode)
    if (activeTab === 'activeLearning') {
      return (
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Icon size={28} color={section?.color} /> {section?.label}
          </h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
            Test your intuition. The system will adapt questions to your difficulty level endlessly until you feel ready.
          </p>
          <QuizMode paperText={paperData.concepts?.text || ''} />
        </section>
      );
    }

    // Special handling for concepts to show mathematical intuition
    if (activeTab === 'concepts') {
      const conceptsText = typeof content === 'object' && content?.text ? content.text : content;
      return (
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Icon size={28} color={section?.color} /> {section?.label}
          </h2>

          {/* Main Text & List Animation */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{conceptsText}</ReactMarkdown>
            <SectionAnimator type="concepts" data={content} />
          </div>

          {/* Mathematical Intuition Card */}
          {content?.math_intuition && (
            <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '1rem' }}>
                <Brain size={20} />
                {content.math_intuition.title || "Mathematical Intuition"}
              </h3>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                {content.math_intuition.equation}
              </div>

              <div style={{ color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.6' }}>
                " {content.math_intuition.explanation} "
              </div>
            </div>
          )}
        </section>
      );
    }

    return (
      <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Icon size={28} color={section?.color} /> {section?.label}
        </h2>
        <div className="glass-card" style={{
          fontSize: '1.2rem',
          lineHeight: '1.8',
          color: '#e2e8f0',
          background: 'rgba(255,255,255,0.02)',
          padding: '2rem'
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {typeof content === 'object' && content?.text ? content.text : content}
          </ReactMarkdown>
          <SectionAnimator type={activeTab as any} data={content} />
        </div>
      </section>
    );
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {!paperData ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem'
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '800px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              padding: '5rem 3rem',
              borderRadius: '2.5rem',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Glow */}
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ marginBottom: '2rem', display: 'inline-block' }}
              >
                <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Brain size={64} color="#6366f1" />
                </div>
              </motion.div>

              <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
                InsightScholar <span style={{ color: 'var(--primary)' }}>Mentor</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                Don't just read research. <span style={{ color: '#fff' }}>Own the knowledge.</span> Upload any paper and let our Reasoning Core rebuild your mental model through first principles.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="application/pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '1.25rem 3rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)'
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                  {isUploading ? 'DECONSTRUCTING PAPER...' : 'START LEARNING (PDF)'}
                </button>
              </div>

              <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> 10-Step Logic</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain size={16} /> Reasoning Core</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} /> Live Stage</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', width: '100%' }}
          >
            {/* Sidebar */}
            <aside className="sidebar" style={{
              width: '320px',
              borderRight: '1px solid var(--card-border)',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              background: 'rgba(5, 7, 10, 0.9)',
              backdropFilter: 'blur(20px)',
              position: 'sticky',
              top: 0,
              height: '100vh'
            }}>
              <div className="logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <Zap size={20} color="#6366f1" />
                </div>
                InsightScholar
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem', paddingLeft: '0.75rem' }}>MENTORSHIP FLOW</div>
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`nav-link ${activeTab === section.id ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        border: 'none',
                        background: activeTab === section.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: activeTab === section.id ? 'var(--foreground)' : 'var(--text-dim)',
                        padding: '0.85rem 1rem',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s ease',
                        borderLeft: activeTab === section.id ? `3px solid ${section.color}` : '3px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon size={18} color={activeTab === section.id ? section.color : 'currentColor'} />
                        <span style={{ fontSize: '0.9rem', fontWeight: activeTab === section.id ? '600' : '400' }}>{section.label}</span>
                      </div>
                      {activeTab === section.id && <ChevronRight size={14} />}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => setPaperData(null)}
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <Plus size={16} /> Analyze New Paper
              </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem 4.5rem', overflowY: 'auto', background: '#0a0a0f' }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    <Activity size={14} /> Living System Active
                  </div>
                  <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>{fileName || "Project Analysis"}</h1>
                </div>
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>REASONING DEPTH</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>LEVEL 4 (MAX)</div>
                </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSectionContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat UI Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="chat-window glass-card"
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '2rem',
              width: '600px',
              height: '700px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: '#6366f1', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Brain size={20} />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Research Mentor</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                  <span style={{ opacity: useVanilla ? 0.5 : 1, fontWeight: useVanilla ? 'normal' : 'bold' }}>GPT</span>
                  <div
                    onClick={() => setUseVanilla(!useVanilla)}
                    style={{
                      width: '32px',
                      height: '18px',
                      background: useVanilla ? '#10b981' : '#cbd5e1',
                      borderRadius: '9px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: useVanilla ? '16px' : '2px',
                      width: '14px',
                      height: '14px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }} />
                  </div>
                  <span style={{ opacity: useVanilla ? 1 : 0.5, fontWeight: useVanilla ? 'bold' : 'normal' }}>Vanilla</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {chatMessages.map((msg: any, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  padding: '1rem 1.25rem',
                  borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                  maxWidth: '90%',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                  {msg.role === 'assistant' && msg.richContent && renderRichContent(msg.richContent)}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '0.75rem',
                    padding: '0.8rem 1.25rem',
                    color: 'white'
                  }}
                />
                <button onClick={handleSendMessage} className="btn-primary" style={{ padding: '0.8rem 1.25rem' }} disabled={isProcessing}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '2.5rem',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          background: 'var(--primary)',
          border: 'none',
          boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 1001
        }}
      >
        {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>

      <style jsx global>{`
        .dashboard-container {
          background-color: #05070a;
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.05) 0px, transparent 50%);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
