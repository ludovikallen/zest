// components/CodeBlock.tsx
'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    language: string;
    children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Check if document has .light class
        const isLightMode = document.documentElement.classList.contains('light');
        setTheme(isLightMode ? 'light' : 'dark');

        // Add a listener for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isLight = document.documentElement.classList.contains('light');
                    setTheme(isLight ? 'light' : 'dark');
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const style = theme === 'light' ? vs : vscDarkPlus;

    return (
        <SyntaxHighlighter language={language} style={style} className="code-box">
            {children}
        </SyntaxHighlighter>
    );
}