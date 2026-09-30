import React from 'react';
import type { DiagramNode } from '@/types/diagram';
import NodeLabel from './NodeLabel';

interface QueueNodeProps {
    node: DiagramNode;
    isSelected: boolean;
    onSelect: () => void;
}

const FILL = '#FFFFFF';
const FILL_BACK = '#F1F5F9';
const STROKE = '#CBD5E1';
const STROKE_WIDTH = 1.5;
const SEL_STROKE = '#2563EB';
const SEL_PAD = 4;

// Horizontal cylinder (queue)
const QueueNode: React.FC<QueueNodeProps> = ({ node, isSelected, onSelect }) => {
    const { x, y, width, height, label, style } = node;
    const fill = style?.fillColor ?? FILL;
    const stroke = style?.strokeColor ?? STROKE;
    const strokeWidth = style?.strokeWidth ?? STROKE_WIDTH;
    const rx = Math.max(6, width * 0.12);
    const cy = y + height / 2;

    return (
        <g onClick={onSelect} style={{ cursor: 'pointer' }}>
            {/* Body rect */}
            <rect
                x={x + rx}
                y={y}
                width={width - rx * 2}
                height={height}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Right ellipse (front face) */}
            <ellipse
                cx={x + width - rx}
                cy={cy}
                rx={rx}
                ry={height / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Left ellipse (back face) */}
            <ellipse
                cx={x + rx}
                cy={cy}
                rx={rx}
                ry={height / 2}
                fill={style?.fillColor ? fill : FILL_BACK}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            <NodeLabel
                x={x + rx}
                y={y}
                width={width - rx * 2}
                height={height}
                label={label}
                textColor={style?.textColor}
                fontSize={style?.fontSize}
            />
            {isSelected && (
                <rect
                    x={x - SEL_PAD}
                    y={y - SEL_PAD}
                    width={width + SEL_PAD * 2}
                    height={height + SEL_PAD * 2}
                    fill="none"
                    stroke={SEL_STROKE}
                    strokeWidth={1.5}
                    rx={4}
                    pointerEvents="none"
                />
            )}
        </g>
    );
};

export default QueueNode;

