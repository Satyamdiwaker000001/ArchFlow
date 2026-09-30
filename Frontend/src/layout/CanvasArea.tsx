import { useEffect, useRef, useState } from 'react'
import type { Diagram, SelectableElementType, Viewport } from '@/types/diagram'
import type { Selection } from '@/hooks/useEditorState'
import SvgCanvas from '@/features/editor/SvgCanvas'
import type { MarqueeBox } from '@/features/editor/SvgCanvas'
import Minimap from '@/features/editor/Minimap'

// ── Grid configuration ────────────────────────────────────────────────────────
const SPACING = 24          // px between dots (canvas-space)
const PHASE = 12          // grid phase offset — first dot at (12, 12)
const DOT_R = 1           // dot radius in CSS px at zoom=1
const INFLUENCE = 180       // cursor influence radius in viewport px

// Light mode grid colors
const BG_LIGHT = '#F8FAFC'
const BASE_LIGHT = [203, 213, 225] as const  // #CBD5E1
const BRIGHT_LIGHT = [100, 116, 139] as const // #64748B

// Dark mode grid colors
const BG_DARK = '#0B0F19'
const BASE_DARK = [51, 65, 85] as const      // #334155
const BRIGHT_DARK = [148, 163, 184] as const // #94A3B8

/** Smooth cubic Hermite, clamped 0→1 */
function smoothstep(x: number): number {
    const t = Math.max(0, Math.min(1, x))
    return t * t * (3 - 2 * t)
}

export default function CanvasArea({
    diagram,
    selection,
    multiSelectionIds,
    isDark = false,
    onSelect,
    onMove,
    onResizeGroup,
    onToggleMultiSelect,
    onMarqueeComplete,
    onAddEdge,
}: {
    diagram: Diagram
    selection: Selection | null
    multiSelectionIds: string[]
    isDark?: boolean
    onSelect: (s: Selection | null) => void
    onMove: (id: string, type: SelectableElementType, dx: number, dy: number) => void
    onResizeGroup: (id: string, handle: string, dx: number, dy: number) => void
    onToggleMultiSelect: (id: string, type: SelectableElementType) => void
    onMarqueeComplete: (box: MarqueeBox) => void
    onAddEdge: (sourceId: string, targetId: string, waypoints?: { x: number; y: number }[]) => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Cursor position in viewport-space (no React state — direct ref mutation)
    const cursorRef = useRef<{ x: number; y: number } | null>(null)

    const [viewport, setViewport] = useState<Viewport>({ zoom: 1, offsetX: 0, offsetY: 0 })
    const viewRef = useRef<Viewport>(viewport)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    const rafRef = useRef<number | null>(null)
    // Keep viewRef in sync so event handlers always see the latest viewport
    useEffect(() => { viewRef.current = viewport }, [viewport])

    // Redraw whenever isDark changes
    useEffect(() => {
        scheduleRedraw()
    }, [isDark])

    // ── Draw ─────────────────────────────────────────────────────────────────

    function draw() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const w = canvas.width / dpr   // logical CSS-pixel width
        const h = canvas.height / dpr   // logical CSS-pixel height
        if (w <= 0 || h <= 0) return

        const { zoom, offsetX, offsetY } = viewRef.current
        const bg = isDark ? BG_DARK : BG_LIGHT
        const base = isDark ? BASE_DARK : BASE_LIGHT
        const bright = isDark ? BRIGHT_DARK : BRIGHT_LIGHT

        // Scale context so all coordinates are in logical CSS pixels
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // Below this zoom dots are sub-pixel noise — skip grid entirely
        if (zoom < 0.15) return

        // Thin the grid at low zoom to keep dot count bounded (~O(1) instead of O(1/zoom²)).
        const step = zoom < 0.3 ? 4 : zoom < 0.5 ? 2 : 1

        // Cursor in canvas-space (zoom/pan-corrected)
        let cx: number | null = null
        let cy: number | null = null
        if (cursorRef.current) {
            cx = (cursorRef.current.x - offsetX) / zoom
            cy = (cursorRef.current.y - offsetY) / zoom
        }

        // Keep visual influence size constant in viewport space
        const influenceCS = INFLUENCE / zoom

        // Fine-grid range, rounded to step multiples to keep subset alignment
        const colMinFine = Math.floor((-offsetX / zoom - PHASE) / SPACING) - 1
        const colMaxFine = Math.ceil((w / zoom - offsetX / zoom - PHASE) / SPACING) + 1
        const rowMinFine = Math.floor((-offsetY / zoom - PHASE) / SPACING) - 1
        const rowMaxFine = Math.ceil((h / zoom - offsetY / zoom - PHASE) / SPACING) + 1
        const colMin = Math.floor(colMinFine / step) * step
        const colMax = Math.ceil(colMaxFine / step) * step
        const rowMin = Math.floor(rowMinFine / step) * step
        const rowMax = Math.ceil(rowMaxFine / step) * step

        const dotRadius = Math.max(0.6, DOT_R * zoom)

        // ── Pass 1: all dots in base colour ──────
        ctx.beginPath()
        for (let row = rowMin; row <= rowMax; row += step) {
            for (let col = colMin; col <= colMax; col += step) {
                const dotX = PHASE + col * SPACING
                const dotY = PHASE + row * SPACING
                const sx = dotX * zoom + offsetX
                const sy = dotY * zoom + offsetY
                if (sx < -dotRadius || sx > w + dotRadius || sy < -dotRadius || sy > h + dotRadius) continue
                ctx.moveTo(sx + dotRadius, sy)
                ctx.arc(sx, sy, dotRadius, 0, Math.PI * 2)
            }
        }
        ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`
        ctx.fill()

        // ── Pass 2: overpaint dots inside the cursor halo ────
        if (cx !== null && cy !== null) {
            for (let row = rowMin; row <= rowMax; row += step) {
                for (let col = colMin; col <= colMax; col += step) {
                    const dotX = PHASE + col * SPACING
                    const dotY = PHASE + row * SPACING
                    const dist = Math.sqrt((dotX - cx) ** 2 + (dotY - cy) ** 2)
                    if (dist >= influenceCS) continue
                    const t = smoothstep(1 - dist / influenceCS)
                    if (t < 0.01) continue
                    const sx = dotX * zoom + offsetX
                    const sy = dotY * zoom + offsetY
                    if (sx < -dotRadius || sx > w + dotRadius || sy < -dotRadius || sy > h + dotRadius) continue
                    const r = Math.round(base[0] + (bright[0] - base[0]) * t)
                    const g = Math.round(base[1] + (bright[1] - base[1]) * t)
                    const b = Math.round(base[2] + (bright[2] - base[2]) * t)
                    ctx.beginPath()
                    ctx.arc(sx, sy, dotRadius, 0, Math.PI * 2)
                    ctx.fillStyle = `rgb(${r},${g},${b})`
                    ctx.fill()
                }
            }
        }
    }

    function scheduleRedraw() {
        if (rafRef.current !== null) return
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            draw()
        })
    }

    // ── Resize observer ───────────────────────────────────────────────────────

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const dpr = window.devicePixelRatio || 1

        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
            canvas.style.width = width + 'px'
            canvas.style.height = height + 'px'
            setContainerSize({ width, height })
            draw()
        })
        ro.observe(container)

        return () => {
            ro.disconnect()
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    // ── Wheel zoom ────────────────────────────────────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const rect = container.getBoundingClientRect()
            const { zoom, offsetX, offsetY } = viewRef.current
            const cx = e.clientX - rect.left
            const cy = e.clientY - rect.top
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+scroll or pinch-zoom → zoom around cursor
                const newZoom = Math.max(0.1, Math.min(5, zoom * (1 - e.deltaY * 0.01)))
                const canvasX = (cx - offsetX) / zoom
                const canvasY = (cy - offsetY) / zoom
                setViewport({ zoom: newZoom, offsetX: cx - canvasX * newZoom, offsetY: cy - canvasY * newZoom })
            } else {
                // Plain scroll → pan (handles both axes for trackpad)
                setViewport(v => ({ ...v, offsetX: v.offsetX - e.deltaX, offsetY: v.offsetY - e.deltaY }))
            }
        }
        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [])

    // ── Keyboard shortcuts ────────────────────────────────────────────────────

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                setViewport({ zoom: 1, offsetX: 0, offsetY: 0 })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // ── Pan + reset helpers ───────────────────────────────────────────────────

    function handlePan(dx: number, dy: number) {
        setViewport(v => ({ ...v, offsetX: v.offsetX + dx, offsetY: v.offsetY + dy }))
    }

    function handleResetViewport() {
        setViewport({ zoom: 1, offsetX: 0, offsetY: 0 })
    }

    function handleZoomIn() {
        const container = containerRef.current
        const rect = container ? container.getBoundingClientRect() : { width: 800, height: 600 }
        const cx = rect.width / 2
        const cy = rect.height / 2
        const { zoom, offsetX, offsetY } = viewRef.current
        const newZoom = Math.min(5, Math.round((zoom * 1.25) * 100) / 100)
        const canvasX = (cx - offsetX) / zoom
        const canvasY = (cy - offsetY) / zoom
        setViewport({ zoom: newZoom, offsetX: cx - canvasX * newZoom, offsetY: cy - canvasY * newZoom })
    }

    function handleZoomOut() {
        const container = containerRef.current
        const rect = container ? container.getBoundingClientRect() : { width: 800, height: 600 }
        const cx = rect.width / 2
        const cy = rect.height / 2
        const { zoom, offsetX, offsetY } = viewRef.current
        const newZoom = Math.max(0.1, Math.round((zoom / 1.25) * 100) / 100)
        const canvasX = (cx - offsetX) / zoom
        const canvasY = (cy - offsetY) / zoom
        setViewport({ zoom: newZoom, offsetX: cx - canvasX * newZoom, offsetY: cy - canvasY * newZoom })
    }

    function handleNavigate(offsetX: number, offsetY: number) {
        setViewport(v => ({ ...v, offsetX, offsetY }))
    }

    // ── Event handlers ────────────────────────────────────────────────────────

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        scheduleRedraw()
    }

    const handleMouseLeave = () => {
        cursorRef.current = null
        scheduleRedraw()
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex-1 overflow-hidden bg-surface-primary"
            style={{ cursor: 'default' }}
        >
            {/* Background canvas — dot grid with proximity highlight */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ display: 'block' }}
            />

            {/* SVG diagram layer */}
            <SvgCanvas
                diagram={diagram}
                selection={selection}
                multiSelectionIds={multiSelectionIds}
                onSelect={onSelect}
                onMove={onMove}
                onResizeGroup={onResizeGroup}
                onToggleMultiSelect={onToggleMultiSelect}
                onMarqueeComplete={onMarqueeComplete}
                viewRef={viewRef}
                viewport={viewport}
                onAddEdge={onAddEdge}
                onPan={handlePan}
            />

            {/* Minimap — bottom-right corner */}
            <Minimap
                diagram={diagram}
                viewport={viewport}
                containerSize={containerSize}
                onNavigate={handleNavigate}
                isDark={isDark}
            />

            {/* Floating Zoom & Viewport toolbar — bottom-left */}
            <div className="absolute bottom-4 left-5 select-none flex items-center bg-surface-secondary/95 backdrop-blur-sm border border-surface-border rounded-lg shadow-panel p-1 gap-1 text-content-primary">
                <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="w-7 h-7 flex items-center justify-center rounded text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
                <button
                    className="px-2 h-7 text-[11px] font-medium text-content-secondary hover:text-brand-600 hover:bg-surface-subtle rounded tabular-nums transition-colors"
                    onClick={handleResetViewport}
                    title="Click or Ctrl+0 to reset to 100%"
                >
                    {Math.round(viewport.zoom * 100)}%
                </button>
                <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="w-7 h-7 flex items-center justify-center rounded text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
                <div className="w-px h-4 bg-surface-border mx-0.5" />
                <button
                    onClick={handleResetViewport}
                    title="Center canvas"
                    className="px-2 h-7 text-[11px] text-content-secondary hover:text-content-primary hover:bg-surface-subtle rounded flex items-center gap-1 transition-colors"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                    </svg>
                    <span>Reset</span>
                </button>
            </div>

            {/* Diagram stats — bottom-right */}
            <div className="absolute bottom-4 right-52 select-none hidden md:flex items-center gap-2 bg-surface-secondary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-surface-border shadow-panel">
                <StatPill value={diagram.nodes.length} label="nodes" />
                <span className="text-surface-border">·</span>
                <StatPill value={diagram.edges.length} label="edges" />
                <span className="text-surface-border">·</span>
                <StatPill value={diagram.groups.length} label="groups" />
                <span className="text-surface-border">·</span>
                <StatPill value={diagram.texts.length} label="texts" />
            </div>

            {/* Empty state message — hidden when diagram has elements */}
            {diagram.nodes.length === 0 && diagram.texts.length === 0 && diagram.groups.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-4">
                    <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-surface-secondary/80 border border-surface-border shadow-floating text-center max-w-sm">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
                                <rect x="14" y="3" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
                                <rect x="8.5" y="15" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
                                <path d="M6.5 9V12A1.5 1.5 0 0 0 8 13.5H16A1.5 1.5 0 0 0 17.5 12V9" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 13.5V15" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[14px] font-semibold text-content-primary">
                                Architecture Canvas is Ready
                            </h3>
                            <p className="text-[12px] text-content-secondary leading-normal">
                                Choose components from the left sidebar or draw connections to design your system.
                            </p>
                        </div>
                        <div className="text-[11px] text-content-muted pt-2 border-t border-surface-border w-full flex items-center justify-center gap-2">
                            <span>Space + Drag to Pan</span>
                            <span>•</span>
                            <span>Alt + Click to add Waypoints</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatPill({ value, label }: { value: number; label: string }) {
    return (
        <span className="text-[11px] text-content-secondary tabular-nums">
            <span className="text-content-primary font-semibold">{value}</span>
            {' '}{label}
        </span>
    )
}

