import React from 'react';
import type { TextElement } from '@/types/diagram';

interface TextElementRendererProps {
    element: TextElement;
    isSelected: boolean;
    onSelect: () => void;
}

const DEFAULT_COLOR = '#0F172A';
const DEFAULT_FONT_SIZE = 14;
const SEL_STROKE = '#2563EB';
const PAD = 4;

const TextElementRenderer: React.FC<TextElementRendererProps> = ({ element, isSelected, onSelect }) => {
    const { x, y, content, style } = element;
    const color = style?.textColor ?? DEFAULT_COLOR;
    const fontSize = style?.fontSize ?? DEFAULT_FONT_SIZE;

    // Approximate bounding box for selection indicator
    const approxWidth = Math.max(20, content.length * fontSize * 0.6);
    const approxHeight = fontSize * 1.4;

    return (
        <g onClick={onSelect} style={{ cursor: 'pointer' }}>
            {isSelected && (
                <rect
                    x={x - PAD}
                    y={y - approxHeight - PAD}
                    width={approxWidth + PAD * 2}
                    height={approxHeight + PAD * 2}
                    fill="none"
                    stroke={SEL_STROKE}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    rx={4}
                    pointerEvents="none"
                />
            )}
            <text
                x={x}
                y={y}
                fill={color}
                fontSize={fontSize}
                fontWeight={500}
                style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif' }}
            >
                {content}
            </text>
        </g>
    );
};

export default TextElementRenderer;

