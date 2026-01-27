'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
});

export default function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState('');

    useEffect(() => {
        const render = async () => {
            if (chart) {
                try {
                    // Generate a unique ID for the mermaid diagram
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    setSvg('<p style="color: #ef4444;">Diagram rendering failed. Check syntax.</p>');
                }
            }
        };
        render();
    }, [chart]);

    return (
        <div
            className="mermaid-container"
            style={{
                width: '100%',
                overflow: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '2rem',
                borderRadius: '1rem',
                display: 'flex',
                justifyContent: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: svg || '<p>Loading diagram...</p>' }}
        />
    );
}
