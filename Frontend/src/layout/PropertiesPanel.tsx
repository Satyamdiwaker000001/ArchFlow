import { useEffect, useState } from 'react'
import type { Diagram, DiagramNode, DiagramEdge, TextElement, DiagramElementStyle, EdgeLineStyle, ArrowType, EdgeRouting, DiagramGroup, GroupStyle, GroupBorderStyle } from '@/types/diagram'
import type { Selection } from '@/hooks/useEditorState'

// ── Default style values (matching ArchFlow design tokens) ─────────────────────

const D_FILL = '#FFFFFF'
const D_STROKE = '#CBD5E1'
const D_TEXT = '#0F172A'
const D_FONT_SIZE = 13
const D_EDGE_STROKE = '#64748B'

interface PanelProps {
    diagram: Diagram
    selection: Selection | null
    multiSelectionCount: number
    onUpdateNode: (id: string, label: string, style: DiagramElementStyle) => void
    onUpdateText: (id: string, content: string, style: DiagramElementStyle) => void
    onUpdateEdge: (id: string, label: string, style: DiagramElementStyle) => void
    onUpdateGroup: (id: string, title: string, style: GroupStyle) => void
    onUpdateDiagramSettings: (defaultEdgeRouting: EdgeRouting) => void
}

export default function PropertiesPanel({
    diagram,
    selection,
    multiSelectionCount,
    onUpdateNode,
    onUpdateText,
    onUpdateEdge,
    onUpdateGroup,
    onUpdateDiagramSettings
}: PanelProps) {
    const node = selection?.type === 'node'
        ? diagram.nodes.find(n => n.id === selection.id) ?? null
        : null
    const text = selection?.type === 'text'
        ? diagram.texts.find(t => t.id === selection.id) ?? null
        : null
    const edge = selection?.type === 'edge'
        ? diagram.edges.find(e => e.id === selection.id) ?? null
        : null
    const group = selection?.type === 'group'
        ? diagram.groups.find(g => g.id === selection.id) ?? null
        : null

    return (
        <aside className="w-64 flex flex-col bg-surface-secondary border-l border-surface-border shrink-0 select-none overflow-hidden">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
                    Inspector
                </span>
                {selection && (
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded uppercase">
                        {selection.type}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {multiSelectionCount > 1 && (
                    <div className="p-4 space-y-3">
                        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-brand-800 text-[12px] font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                            {multiSelectionCount} elements selected
                        </div>
                        <p className="text-[11px] text-content-secondary leading-relaxed">
                            Drag to move elements together, or press <kbd className="px-1 py-0.5 bg-surface-subtle border border-surface-border rounded font-mono text-[10px]">Delete</kbd> to remove.
                        </p>
                    </div>
                )}
                {multiSelectionCount <= 1 && selection === null && (
                    <DiagramSettingsPanel
                        diagram={diagram}
                        defaultEdgeRouting={diagram.defaultEdgeRouting}
                        onUpdateDiagramSettings={onUpdateDiagramSettings}
                    />
                )}
                {node && (
                    <NodeEditor key={node.id} node={node} onUpdate={onUpdateNode} />
                )}
                {text && (
                    <TextEditor key={text.id} text={text} onUpdate={onUpdateText} />
                )}
                {edge && (
                    <EdgeEditor key={edge.id} edge={edge} onUpdate={onUpdateEdge} />
                )}
                {group && (
                    <GroupEditor key={group.id} group={group} onUpdate={onUpdateGroup} />
                )}
            </div>
        </aside>
    )
}

// ── Node editor ───────────────────────────────────────────────────────────────

function NodeEditor({
    node,
    onUpdate,
}: {
    node: DiagramNode
    onUpdate: (id: string, label: string, style: DiagramElementStyle) => void
}) {
    const [label, setLabel] = useState(node.label)
    const [fill, setFill] = useState(node.style?.fillColor ?? D_FILL)
    const [stroke, setStroke] = useState(node.style?.strokeColor ?? D_STROKE)
    const [textColor, setTextColor] = useState(node.style?.textColor ?? D_TEXT)
    const [fontSize, setFontSize] = useState(node.style?.fontSize ?? D_FONT_SIZE)

    // Sync if selection changes to a different node
    useEffect(() => {
        setLabel(node.label)
        setFill(node.style?.fillColor ?? D_FILL)
        setStroke(node.style?.strokeColor ?? D_STROKE)
        setTextColor(node.style?.textColor ?? D_TEXT)
        setFontSize(node.style?.fontSize ?? D_FONT_SIZE)
    }, [node.id])

    function commit(overrides?: Partial<{ label: string; fill: string; stroke: string; textColor: string; fontSize: number }>) {
        const l = overrides?.label ?? label
        const f = overrides?.fill ?? fill
        const s = overrides?.stroke ?? stroke
        const tc = overrides?.textColor ?? textColor
        const fs = overrides?.fontSize ?? fontSize
        onUpdate(node.id, l, { fillColor: f, strokeColor: s, textColor: tc, fontSize: fs })
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Section label="Label">
                <PanelInput
                    value={label}
                    onChange={v => { setLabel(v); commit({ label: v }) }}
                    placeholder="Component name"
                />
            </Section>

            <Section label="Surface Styling">
                <ColorField
                    label="Fill Color"
                    value={fill}
                    onChange={v => { setFill(v); commit({ fill: v }) }}
                    presets={['#FFFFFF', '#F8FAFC', '#EFF6FF', '#EEF2FF', '#ECFDF5', '#FFFBEB', '#FFF1F2']}
                />
                <ColorField
                    label="Border Color"
                    value={stroke}
                    onChange={v => { setStroke(v); commit({ stroke: v }) }}
                    presets={['#CBD5E1', '#94A3B8', '#64748B', '#2563EB', '#4F46E5', '#059669', '#DC2626']}
                />
                <ColorField
                    label="Text Color"
                    value={textColor}
                    onChange={v => { setTextColor(v); commit({ textColor: v }) }}
                    presets={['#0F172A', '#334155', '#64748B', '#2563EB', '#16A34A', '#D97706', '#DC2626']}
                />
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-surface-border/50">
                    <span className="text-[11px] text-content-secondary">Font size</span>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min={10}
                            max={28}
                            value={fontSize}
                            onChange={e => {
                                const v = Math.max(10, Math.min(28, Number(e.target.value)))
                                setFontSize(v)
                                commit({ fontSize: v })
                            }}
                            className="w-14 bg-surface-subtle border border-surface-border rounded px-2 py-1 text-[12px] text-content-primary text-right focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-[10px] text-content-muted">px</span>
                    </div>
                </div>
            </Section>

            <Section label="Geometry">
                <InfoRow label="Position" value={`X: ${Math.round(node.x)} · Y: ${Math.round(node.y)}`} />
                <InfoRow label="Dimensions" value={`${node.width} × ${node.height} px`} />
            </Section>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-content-muted font-mono truncate max-w-[140px]">{node.id}</span>
                <span className="text-[10px] text-content-muted">Node</span>
            </div>
        </div>
    )
}

// ── Text editor ───────────────────────────────────────────────────────────────

function TextEditor({
    text,
    onUpdate,
}: {
    text: TextElement
    onUpdate: (id: string, content: string, style: DiagramElementStyle) => void
}) {
    const [content, setContent] = useState(text.content)
    const [textColor, setTextColor] = useState(text.style?.textColor ?? D_TEXT)
    const [fontSize, setFontSize] = useState(text.style?.fontSize ?? D_FONT_SIZE)

    useEffect(() => {
        setContent(text.content)
        setTextColor(text.style?.textColor ?? D_TEXT)
        setFontSize(text.style?.fontSize ?? D_FONT_SIZE)
    }, [text.id])

    function commit(overrides?: Partial<{ content: string; textColor: string; fontSize: number }>) {
        const c = overrides?.content ?? content
        const tc = overrides?.textColor ?? textColor
        const fs = overrides?.fontSize ?? fontSize
        onUpdate(text.id, c, { textColor: tc, fontSize: fs })
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Section label="Text Content">
                <textarea
                    value={content}
                    rows={3}
                    onChange={e => { setContent(e.target.value); commit({ content: e.target.value }) }}
                    className="w-full bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-[12px] text-content-primary focus:outline-none focus:border-brand-500 focus:bg-surface-secondary select-text resize-none"
                    placeholder="Documentation or note..."
                />
            </Section>

            <Section label="Typography">
                <ColorField
                    label="Text Color"
                    value={textColor}
                    onChange={v => { setTextColor(v); commit({ textColor: v }) }}
                    presets={['#0F172A', '#334155', '#64748B', '#2563EB', '#16A34A', '#D97706', '#DC2626']}
                />
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-content-secondary">Font size</span>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min={8}
                            max={64}
                            value={fontSize}
                            onChange={e => {
                                const v = Math.max(8, Math.min(64, Number(e.target.value)))
                                setFontSize(v)
                                commit({ fontSize: v })
                            }}
                            className="w-14 bg-surface-subtle border border-surface-border rounded px-2 py-1 text-[12px] text-content-primary text-right focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-[10px] text-content-muted">px</span>
                    </div>
                </div>
            </Section>

            <Section label="Position">
                <InfoRow label="Coordinates" value={`X: ${Math.round(text.x)} · Y: ${Math.round(text.y)}`} />
            </Section>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-content-muted font-mono truncate max-w-[140px]">{text.id}</span>
                <span className="text-[10px] text-content-muted">Annotation</span>
            </div>
        </div>
    )
}

// ── Edge editor ───────────────────────────────────────────────────────────────

function EdgeEditor({
    edge,
    onUpdate,
}: {
    edge: DiagramEdge
    onUpdate: (id: string, label: string, style: DiagramElementStyle) => void
}) {
    const [label, setLabel] = useState(edge.label ?? '')
    const [strokeColor, setStrokeColor] = useState(edge.style?.strokeColor ?? D_EDGE_STROKE)
    const [strokeWidth, setStrokeWidth] = useState(edge.style?.strokeWidth ?? 1.5)
    const [lineStyle, setLineStyle] = useState<EdgeLineStyle>(edge.style?.lineStyle ?? 'solid')
    const [arrowType, setArrowType] = useState<ArrowType>(edge.style?.arrowType ?? 'arrow')
    const [routing, setRouting] = useState<EdgeRouting>(edge.style?.routing ?? 'straight')

    useEffect(() => {
        setLabel(edge.label ?? '')
        setStrokeColor(edge.style?.strokeColor ?? D_EDGE_STROKE)
        setStrokeWidth(edge.style?.strokeWidth ?? 1.5)
        setLineStyle(edge.style?.lineStyle ?? 'solid')
        setArrowType(edge.style?.arrowType ?? 'arrow')
        setRouting(edge.style?.routing ?? 'straight')
    }, [edge.id])

    function commit(overrides?: Partial<{
        label: string
        strokeColor: string
        strokeWidth: number
        lineStyle: EdgeLineStyle
        arrowType: ArrowType
        routing: EdgeRouting
    }>) {
        const l = overrides?.label ?? label
        const sc = overrides?.strokeColor ?? strokeColor
        const sw = overrides?.strokeWidth ?? strokeWidth
        const ls = overrides?.lineStyle ?? lineStyle
        const at = overrides?.arrowType ?? arrowType
        const rt = overrides?.routing ?? routing
        onUpdate(edge.id, l, { strokeColor: sc, strokeWidth: sw, lineStyle: ls, arrowType: at, routing: rt })
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Section label="Connection Label">
                <PanelInput
                    value={label}
                    onChange={v => { setLabel(v); commit({ label: v }) }}
                    placeholder="e.g. REST / gRPC / SQL"
                />
            </Section>

            <Section label="Route & Appearance">
                <SelectField
                    label="Routing Mode"
                    value={routing}
                    options={[
                        { value: 'straight', label: 'Straight' },
                        { value: 'curved', label: 'Curved Bezier' },
                        { value: 'orthogonal', label: 'Orthogonal 90°' },
                    ]}
                    onChange={v => { const val = v as EdgeRouting; setRouting(val); commit({ routing: val }) }}
                />
                <SelectField
                    label="Line Pattern"
                    value={lineStyle}
                    options={[
                        { value: 'solid', label: 'Solid Line' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' },
                    ]}
                    onChange={v => { const val = v as EdgeLineStyle; setLineStyle(val); commit({ lineStyle: val }) }}
                />
                <SelectField
                    label="Arrowhead"
                    value={arrowType}
                    options={[
                        { value: 'arrow', label: 'Filled Arrow' },
                        { value: 'open-arrow', label: 'Open Line Arrow' },
                        { value: 'double', label: 'Bidirectional' },
                        { value: 'diamond', label: 'Diamond' },
                        { value: 'none', label: 'None (Plain)' },
                    ]}
                    onChange={v => { const val = v as ArrowType; setArrowType(val); commit({ arrowType: val }) }}
                />
                <ColorField
                    label="Line Color"
                    value={strokeColor}
                    onChange={v => { setStrokeColor(v); commit({ strokeColor: v }) }}
                    presets={['#64748B', '#2563EB', '#4F46E5', '#059669', '#D97706', '#DC2626', '#0F172A']}
                />
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-content-secondary">Stroke width</span>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min={1}
                            max={6}
                            step={0.5}
                            value={strokeWidth}
                            onChange={e => {
                                const v = Math.max(1, Math.min(6, Number(e.target.value)))
                                setStrokeWidth(v)
                                commit({ strokeWidth: v })
                            }}
                            className="w-14 bg-surface-subtle border border-surface-border rounded px-2 py-1 text-[12px] text-content-primary text-right focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-[10px] text-content-muted">px</span>
                    </div>
                </div>
            </Section>

            {edge.waypoints && edge.waypoints.length > 0 && (
                <Section label="Waypoints">
                    <p className="text-[11px] text-content-muted">
                        {edge.waypoints.length} custom waypoints active.
                    </p>
                </Section>
            )}

            <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-content-muted font-mono truncate max-w-[140px]">{edge.id}</span>
                <span className="text-[10px] text-content-muted">Edge</span>
            </div>
        </div>
    )
}

// ── Group editor ──────────────────────────────────────────────────────────────

const D_GROUP_FILL = '#2563EB'
const D_GROUP_FILL_OPACITY = 0.04
const D_GROUP_STROKE = '#94A3B8'
const D_GROUP_STROKE_WIDTH = 1.5
const D_GROUP_BORDER_STYLE: GroupBorderStyle = 'dashed'
const D_GROUP_RADIUS = 8
const D_GROUP_TITLE_COLOR = '#334155'
const D_GROUP_TITLE_FONT_SIZE = 11

function GroupEditor({
    group,
    onUpdate,
}: {
    group: DiagramGroup
    onUpdate: (id: string, title: string, style: GroupStyle) => void
}) {
    const [title, setTitle] = useState(group.title ?? '')
    const [fillColor, setFillColor] = useState(group.style?.fillColor ?? D_GROUP_FILL)
    const [fillOpacity, setFillOpacity] = useState(group.style?.fillOpacity ?? D_GROUP_FILL_OPACITY)
    const [strokeColor, setStrokeColor] = useState(group.style?.strokeColor ?? D_GROUP_STROKE)
    const [strokeWidth, setStrokeWidth] = useState(group.style?.strokeWidth ?? D_GROUP_STROKE_WIDTH)
    const [borderStyle, setBorderStyle] = useState<GroupBorderStyle>(group.style?.strokeBorderStyle ?? D_GROUP_BORDER_STYLE)
    const [borderRadius, setBorderRadius] = useState(group.style?.borderRadius ?? D_GROUP_RADIUS)
    const [titleColor, setTitleColor] = useState(group.style?.titleColor ?? D_GROUP_TITLE_COLOR)
    const [titleFontSize, setTitleFontSize] = useState(group.style?.titleFontSize ?? D_GROUP_TITLE_FONT_SIZE)

    useEffect(() => {
        setTitle(group.title ?? '')
        setFillColor(group.style?.fillColor ?? D_GROUP_FILL)
        setFillOpacity(group.style?.fillOpacity ?? D_GROUP_FILL_OPACITY)
        setStrokeColor(group.style?.strokeColor ?? D_GROUP_STROKE)
        setStrokeWidth(group.style?.strokeWidth ?? D_GROUP_STROKE_WIDTH)
        setBorderStyle(group.style?.strokeBorderStyle ?? D_GROUP_BORDER_STYLE)
        setBorderRadius(group.style?.borderRadius ?? D_GROUP_RADIUS)
        setTitleColor(group.style?.titleColor ?? D_GROUP_TITLE_COLOR)
        setTitleFontSize(group.style?.titleFontSize ?? D_GROUP_TITLE_FONT_SIZE)
    }, [group.id])

    function commit(overrides?: Partial<{
        title: string; fillColor: string; fillOpacity: number
        strokeColor: string; strokeWidth: number; borderStyle: GroupBorderStyle
        borderRadius: number; titleColor: string; titleFontSize: number
    }>) {
        const t = overrides?.title ?? title
        const fc = overrides?.fillColor ?? fillColor
        const fo = overrides?.fillOpacity ?? fillOpacity
        const sc = overrides?.strokeColor ?? strokeColor
        const sw = overrides?.strokeWidth ?? strokeWidth
        const bs = overrides?.borderStyle ?? borderStyle
        const br = overrides?.borderRadius ?? borderRadius
        const tc = overrides?.titleColor ?? titleColor
        const tfs = overrides?.titleFontSize ?? titleFontSize
        onUpdate(group.id, t, {
            fillColor: fc, fillOpacity: fo,
            strokeColor: sc, strokeWidth: sw, strokeBorderStyle: bs,
            borderRadius: br, titleColor: tc, titleFontSize: tfs,
        })
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Section label="Container Title">
                <PanelInput
                    value={title}
                    onChange={v => { setTitle(v); commit({ title: v }) }}
                    placeholder="e.g. VPC / Cluster / Region"
                />
            </Section>

            <Section label="Fill & Tint">
                <ColorField
                    label="Fill Color"
                    value={fillColor}
                    onChange={v => { setFillColor(v); commit({ fillColor: v }) }}
                    presets={['#2563EB', '#4F46E5', '#059669', '#D97706', '#64748B', '#0F172A']}
                />
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-content-secondary">Opacity</span>
                    <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.02}
                        value={fillOpacity}
                        onChange={e => {
                            const v = Math.max(0, Math.min(1, Number(e.target.value)))
                            setFillOpacity(v)
                            commit({ fillOpacity: v })
                        }}
                        className="w-16 bg-surface-subtle border border-surface-border rounded px-2 py-1 text-[12px] text-content-primary text-right focus:outline-none focus:border-brand-500"
                    />
                </div>
            </Section>

            <Section label="Border">
                <ColorField
                    label="Border Color"
                    value={strokeColor}
                    onChange={v => { setStrokeColor(v); commit({ strokeColor: v }) }}
                    presets={['#CBD5E1', '#94A3B8', '#2563EB', '#4F46E5', '#059669', '#64748B']}
                />
                <SelectField
                    label="Border Pattern"
                    value={borderStyle}
                    options={[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' },
                    ]}
                    onChange={v => { const val = v as GroupBorderStyle; setBorderStyle(val); commit({ borderStyle: val }) }}
                />
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-content-secondary">Corner Radius</span>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min={0}
                            max={32}
                            step={1}
                            value={borderRadius}
                            onChange={e => {
                                const v = Number(e.target.value)
                                setBorderRadius(v)
                                commit({ borderRadius: v })
                            }}
                            className="w-14 bg-surface-subtle border border-surface-border rounded px-2 py-1 text-[12px] text-content-primary text-right focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-[10px] text-content-muted">px</span>
                    </div>
                </div>
            </Section>

            <Section label="Title Styling">
                <ColorField
                    label="Title Color"
                    value={titleColor}
                    onChange={v => { setTitleColor(v); commit({ titleColor: v }) }}
                    presets={['#0F172A', '#334155', '#64748B', '#2563EB', '#4F46E5', '#059669']}
                />
            </Section>

            <Section label="Geometry">
                <InfoRow label="Position" value={`X: ${Math.round(group.x)} · Y: ${Math.round(group.y)}`} />
                <InfoRow label="Size" value={`${Math.round(group.width)} × ${Math.round(group.height)} px`} />
            </Section>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-content-muted font-mono truncate max-w-[140px]">{group.id}</span>
                <span className="text-[10px] text-content-muted">Group</span>
            </div>
        </div>
    )
}

// ── Diagram settings panel (when nothing selected) ────────────────────────────

function DiagramSettingsPanel({
    diagram,
    defaultEdgeRouting,
    onUpdateDiagramSettings,
}: {
    diagram: Diagram
    defaultEdgeRouting: EdgeRouting
    onUpdateDiagramSettings: (defaultEdgeRouting: EdgeRouting) => void
}) {
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-lg space-y-1">
                <p className="text-[12px] font-semibold text-brand-900">
                    Workspace Overview
                </p>
                <p className="text-[11px] text-brand-700 leading-normal">
                    Select any canvas component to customize its properties and layout.
                </p>
            </div>

            <Section label="Global Connection Settings">
                <SelectField
                    label="Default Route"
                    value={defaultEdgeRouting}
                    options={[
                        { value: 'straight', label: 'Straight Lines' },
                        { value: 'curved', label: 'Curved Curves' },
                        { value: 'orthogonal', label: 'Orthogonal 90°' },
                    ]}
                    onChange={v => onUpdateDiagramSettings(v as EdgeRouting)}
                />
            </Section>

            <Section label="Statistics">
                <InfoRow label="Total Nodes" value={String(diagram.nodes.length)} />
                <InfoRow label="Connections" value={String(diagram.edges.length)} />
                <InfoRow label="Groups / Boxes" value={String(diagram.groups.length)} />
                <InfoRow label="Text Elements" value={String(diagram.texts.length)} />
            </Section>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded-lg space-y-2 mt-2">
                <p className="text-[11px] font-semibold text-content-primary">
                    Quick Canvas Tips
                </p>
                <ul className="text-[11px] text-content-secondary space-y-1 list-disc list-inside">
                    <li>Hold Space to pan anywhere</li>
                    <li>Alt + drag handles to place bends</li>
                    <li>Click background to deselect</li>
                </ul>
            </div>
        </div>
    )
}

// ── Form Components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</span>
            <div className="flex flex-col gap-2">{children}</div>
        </div>
    )
}

function PanelInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-surface-subtle border border-surface-border rounded-md px-2.5 py-1.5 text-[12px] text-content-primary focus:outline-none focus:border-brand-500 focus:bg-surface-secondary select-text transition-colors"
        />
    )
}

function ColorField({
    label,
    value,
    onChange,
    presets,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    presets?: string[]
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-content-secondary">{label}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-content-muted font-mono uppercase">{value}</span>
                    <label className="relative cursor-pointer">
                        <div
                            className="w-5 h-5 rounded border border-surface-border shadow-2xs shrink-0 transition-transform active:scale-95"
                            style={{ backgroundColor: value }}
                        />
                        <input
                            type="color"
                            value={value.startsWith('#') && value.length === 7 ? value : '#2563EB'}
                            onChange={e => onChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                    </label>
                </div>
            </div>
            {presets && (
                <div className="flex items-center gap-1 pt-0.5">
                    {presets.map(c => (
                        <button
                            key={c}
                            onClick={() => onChange(c)}
                            title={c}
                            className={`w-4 h-4 rounded-full border transition-all ${value.toLowerCase() === c.toLowerCase() ? 'border-brand-600 scale-110 shadow-xs' : 'border-surface-border hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: string
    options: { value: string; label: string }[]
    onChange: (v: string) => void
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] text-content-secondary">{label}</span>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="bg-surface-subtle border border-surface-border text-content-primary rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-brand-500 focus:bg-surface-secondary cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-[11px]">
            <span className="text-content-secondary">{label}</span>
            <span className="text-content-primary font-medium">{value}</span>
        </div>
    )
}
