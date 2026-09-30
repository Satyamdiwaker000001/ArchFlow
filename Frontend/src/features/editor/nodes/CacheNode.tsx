import React from 'react';
import type { DiagramNode } from '@/types/diagram';
import NodeLabel from './NodeLabel';

interface CacheNodeProps {
    node: DiagramNode;
    isSelected: boolean;
    onSelect: () => void;
}

const FILL = '#FFFFFF';
const FILL_CAP = '#F1F5F9';
const STROKE = '#CBD5E1';
const STROKE_WIDTH = 1.5;
const SEL_STROKE = '#2563EB';
const SEL_PAD = 4;
const ELLIPSE_RY_RATIO = 0.12;

// Database cylinder with a lightning bolt overlay
const CacheNode: React.FC<CacheNodeProps> = ({ node, isSelected, onSelect }) => {
    const { x, y, width, height, label, style } = node;
    const fill = style?.fillColor ?? FILL;
    const stroke = style?.strokeColor ?? STROKE;
    const strokeWidth = style?.strokeWidth ?? STROKE_WIDTH;
    const textColor = style?.textColor;
    const fontSize = style?.fontSize;
    const ry = Math.max(6, height * ELLIPSE_RY_RATIO);
    const cx = x + width / 2;
    const cy = y + ry + (height - ry * 2) / 2;

    // Lightning bolt (small, centered in body)
    const bw = Math.min(width * 0.25, 14);
    const bh = Math.min(height * 0.4, 20);
    const bx = cx;
    const by = cy;
    const bolt = `M ${bx + bw * 0.3},${by - bh / 2} L ${bx - bw * 0.2},${by} L ${bx + bw * 0.1},${by} L ${bx - bw * 0.3},${by + bh / 2} L ${bx + bw * 0.2},${by} L ${bx - bw * 0.1},${by} Z`;

    return (
        <g onClick={onSelect} style={{ cursor: 'pointer' }}>
            {/* Body */}
            <rect
                x={x}
                y={y + ry}
                width={width}
                height={height - ry * 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Bottom ellipse */}
            <ellipse
                cx={cx}
                cy={y + height - ry}
                rx={width / 2}
                ry={ry}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Top ellipse */}
            <ellipse
                cx={cx}
                cy={y + ry}
                rx={width / 2}
                ry={ry}
                fill={style?.fillColor ? fill : FILL_CAP}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
            {/* Lightning bolt indicator */}
            <path
                d={bolt}
                fill="#2563EB"
                fillOpacity={0.15}
                stroke="#2563EB"
                strokeWidth={0.8}
                style={{ pointerEvents: 'none' }}
            />
            <NodeLabel
                x={x}
                y={y + ry}
                width={width}
                height={height - ry * 2}
                label={label}
                textColor={textColor}
                fontSize={fontSize}
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

export default CacheNode;

