import React, { useState } from 'react'
import type { NodeType } from '@/types/diagram'

interface SidebarProps {
    onAddNode: (type: NodeType, labelOverride?: string) => void
    onAddText: () => void
    onAddGroup: () => void
}

type SidebarItemDef = {
    icon: React.ReactNode
    label: string
    description?: string
    action: () => void
}

type SidebarSection = {
    title: string
    items: SidebarItemDef[]
}

function buildSections(
    onAddNode: SidebarProps['onAddNode'],
    onAddText: SidebarProps['onAddText'],
    onAddGroup: SidebarProps['onAddGroup']
): SidebarSection[] {
    return [
        {
            title: 'Basic Shapes',
            items: [
                {
                    icon: <RectIcon />,
                    label: 'Rectangle',
                    description: 'Generic entity or block',
                    action: () => onAddNode('rectangle')
                },
                {
                    icon: <RoundedRectIcon />,
                    label: 'Rounded Rectangle',
                    description: 'Process or module',
                    action: () => onAddNode('rounded-rectangle')
                },
                {
                    icon: <CircleIcon />,
                    label: 'Circle',
                    description: 'Event or start/end point',
                    action: () => onAddNode('circle')
                },
                {
                    icon: <DiamondIcon />,
                    label: 'Decision',
                    description: 'Conditional routing branch',
                    action: () => onAddNode('diamond')
                },
            ],
        },
        {
            title: 'Architecture Components',
            items: [
                {
                    icon: <GatewayIcon />,
                    label: 'API Gateway',
                    description: 'Entry point & proxy router',
                    action: () => onAddNode('rectangle', 'API Gateway')
                },
                {
                    icon: <ServiceIcon />,
                    label: 'Microservice',
                    description: 'Backend service node',
                    action: () => onAddNode('rounded-rectangle', 'Service')
                },
                {
                    icon: <DatabaseIcon />,
                    label: 'Database',
                    description: 'Persistent storage instance',
                    action: () => onAddNode('database')
                },
                {
                    icon: <QueueIcon />,
                    label: 'Message Queue',
                    description: 'Async broker or stream',
                    action: () => onAddNode('queue')
                },
                {
                    icon: <CacheIcon />,
                    label: 'In-Memory Cache',
                    description: 'Fast key-value cache layer',
                    action: () => onAddNode('cache')
                },
                {
                    icon: <ClientIcon />,
                    label: 'Client / Frontend',
                    description: 'Web, mobile or consumer',
                    action: () => onAddNode('client')
                },
            ],
        },
        {
            title: 'Containers & Labels',
            items: [
                {
                    icon: <GroupIcon />,
                    label: 'VPC / Group Box',
                    description: 'Boundary container box',
                    action: onAddGroup
                },
                {
                    icon: <TextIcon />,
                    label: 'Text Annotation',
                    description: 'Freeform text documentation',
                    action: onAddText
                },
            ],
        },
    ]
}

export default function Sidebar({ onAddNode, onAddText, onAddGroup }: SidebarProps) {
    const sections = buildSections(onAddNode, onAddText, onAddGroup)
    const [showShortcutsModal, setShowShortcutsModal] = useState(false)

    return (
        <aside className="w-60 flex flex-col bg-surface-secondary border-r border-surface-border overflow-hidden shrink-0 select-none">
            {/* Component palette header */}
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
                    Components
                </span>
                <span className="text-[10px] text-content-muted bg-surface-subtle px-1.5 py-0.5 rounded font-medium">
                    Click to add
                </span>
            </div>

            {/* Component list */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
                {sections.map(section => (
                    <div key={section.title} className="space-y-1">
                        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1.5">
                            {section.title}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map(item => (
                                <SidebarItem
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                    description={item.description}
                                    action={item.action}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick shortcuts / helper footer */}
            <div className="p-3 border-t border-surface-border bg-surface-primary">
                <button
                    onClick={() => setShowShortcutsModal(true)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium text-content-secondary hover:text-brand-600 hover:bg-surface-secondary border border-transparent hover:border-surface-border transition-colors"
                >
                    <div className="flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M3.5 5.5H4.5M6 5.5H7M8.5 5.5H9.5M4 8H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span>Shortcuts Guide</span>
                    </div>
                    <span className="text-[10px] text-content-muted">?</span>
                </button>
            </div>

            {/* Shortcuts Modal */}
            {showShortcutsModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-secondary border border-surface-border rounded-xl shadow-modal max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-surface-border pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[12px]">
                                    ⌘
                                </div>
                                <h3 className="text-[14px] font-bold text-content-primary">Keyboard & Interaction Shortcuts</h3>
                            </div>
                            <button
                                onClick={() => setShowShortcutsModal(false)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-content-muted hover:text-content-primary hover:bg-surface-subtle"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 text-[12px]">
                            <ShortcutRow keys={['Space', '+', 'Drag']} desc="Pan around the infinite canvas" />
                            <ShortcutRow keys={['Ctrl / ⌘', '+', 'Scroll']} desc="Zoom in / out around cursor" />
                            <ShortcutRow keys={['Ctrl / ⌘', '+', '0']} desc="Reset zoom to 100%" />
                            <ShortcutRow keys={['Drag on canvas']} desc="Marquee box selection" />
                            <ShortcutRow keys={['Ctrl / ⌘', '+', 'Click']} desc="Toggle multi-select elements" />
                            <ShortcutRow keys={['Node Handles']} desc="Click & connect to another node" />
                            <ShortcutRow keys={['Alt', '+', 'Handle']} desc="Multi-waypoint orthogonal route mode" />
                            <ShortcutRow keys={['Delete / Backspace']} desc="Remove selected elements" />
                            <ShortcutRow keys={['Ctrl / ⌘', '+', 'S']} desc="Save diagram to local workspace" />
                        </div>

                        <div className="pt-3 border-t border-surface-border flex justify-end">
                            <button
                                onClick={() => setShowShortcutsModal(false)}
                                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-[12px] hover:bg-brand-700 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}

function ShortcutRow({ keys, desc }: { keys: string[]; desc: string }) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-surface-border/50 last:border-0">
            <span className="text-content-secondary">{desc}</span>
            <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                    k === '+' ? (
                        <span key={i} className="text-content-muted text-[10px]">+</span>
                    ) : (
                        <kbd key={i} className="px-1.5 py-0.5 bg-surface-subtle border border-surface-border rounded text-[10px] font-mono font-medium text-content-primary shadow-2xs">
                            {k}
                        </kbd>
                    )
                ))}
            </div>
        </div>
    )
}

function SidebarItem({ icon, label, description, action }: SidebarItemDef) {
    return (
        <button
            onClick={action}
            title={description}
            className="group w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all duration-100 hover:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-md bg-surface-subtle text-content-secondary group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center shrink-0 transition-colors border border-surface-border/60 group-hover:border-brand-200">
                    {icon}
                </span>
                <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-medium text-content-primary group-hover:text-brand-700 truncate">
                        {label}
                    </span>
                    {description && (
                        <span className="text-[10px] text-content-muted truncate">
                            {description}
                        </span>
                    )}
                </div>
            </div>
            <span className="w-5 h-5 rounded flex items-center justify-center text-content-muted opacity-0 group-hover:opacity-100 text-[12px] transition-opacity shrink-0">
                +
            </span>
        </button>
    )
}

// ── Icons ────────────────────────────────────────────────────────────────────

function RectIcon() {
    return (
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <rect x="1" y="1" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
    )
}

function RoundedRectIcon() {
    return (
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <rect x="1" y="1" width="12" height="10" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
    )
}

function CircleIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
    )
}

function DiamondIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1L12 6.5L6.5 12L1 6.5L6.5 1Z" stroke="currentColor" strokeWidth="1.3" />
        </svg>
    )
}

function ServiceIcon() {
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <rect x="1" y="1.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1 4.5H13" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="3.5" cy="3" r="0.6" fill="currentColor" />
            <circle cx="5.5" cy="3" r="0.6" fill="currentColor" />
        </svg>
    )
}

function DatabaseIcon() {
    return (
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
            <ellipse cx="6.5" cy="3.5" rx="5.2" ry="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1.3 3.5v7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M11.7 3.5v7" stroke="currentColor" strokeWidth="1.3" />
            <ellipse cx="6.5" cy="10.5" rx="5.2" ry="2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
    )
}

function QueueIcon() {
    return (
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <rect x="1" y="1.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 3.5V8.5M7 3.5V8.5M9.5 3.5V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    )
}

function CacheIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7.5 3.5L5 7.5H9L6.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function ClientIcon() {
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <rect x="1" y="1" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 12H9.5M7 9.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    )
}

function GatewayIcon() {
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <path d="M1 6.5H3.5M10.5 6.5H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <rect x="3.5" y="2" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="7" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
    )
}

function TextIcon() {
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <path d="M2.5 3H11.5M7 3V10.5M5 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    )
}

function GroupIcon() {
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <rect x="1" y="1" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 2" />
        </svg>
    )
}

