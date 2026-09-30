import React from 'react';
import type { DiagramNode } from '@/types/diagram';

interface ClientNodeProps {
    node: DiagramNode;
    isSelected: boolean;
    onSelect: () => void;
}

const FILL = '#FFFFFF';
const STROKE = '#CBD5E1';
const STAND_STROKE = '#64748B';
const STROKE_WIDTH = 1.5;
const SEL_STROKE = '#2563EB';
const SEL_PAD = 4;

// Monitor + label inside screen
const ClientNode: React.FC<ClientNodeProps> = ({ node, isSelected, onSelect }) => {
    const { x, y, width, height, label, style } = node;
    const fill = style?.fillColor ?? FILL;
    const stroke = style?.strokeColor ?? STROKE;
    const strokeWidth = style?.strokeWidth ?? STROKE_WIDTH;
    const textColor = style?.textColor ?? '#0F172A';
    const fontSize = style?.fontSize ?? 13;

    // Screen occupies top 72% of height
    const screenH = height * 0.72;
    const standH = height * 0.18;
    const baseW = width * 0.5;
    const cx = x + width / 2;

    return (
        <g onClick={onSelect} style={{ cursor: 'pointer' }}>
            {/* Screen */}
            <rect
                x={x}
                y={y}
                width={width}
                height={screenH}
                rx={4}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Stand */}
            <line
                x1={cx}
                y1={y + screenH}
                x2={cx}
                y2={y + screenH + standH}
                stroke={STAND_STROKE}
                strokeWidth={strokeWidth}
            />
            {/* Base */}
            <line
                x1={cx - baseW / 2}
                y1={y + screenH + standH}
                x2={cx + baseW / 2}
                y2={y + screenH + standH}
                stroke={STAND_STROKE}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Label inside screen */}
            <text
                x={cx}
                y={y + screenH / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={500}
                fill={textColor}
                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
            >
                {label}
            </text>
            {isSelected && (
                <rect
                    x={x - SEL_PAD}
                    y={y - SEL_PAD}
                    width={width + SEL_PAD * 2}
                    height={height + SEL_PAD * 2}
                    fill="none"
                    stroke={SEL_STROKE}
                    strokeWidth={1.5}
                    rx={6}
                    pointerEvents="none"
                />
            )}
        </g>
    );
};

export default ClientNode;

