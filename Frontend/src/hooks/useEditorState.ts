import { useState } from 'react'
import type { Diagram, SelectableElementType } from '@/types/diagram'
import { loadDiagram } from '@/utils/persistence'

// ── Selection ─────────────────────────────────────────────────────────────────

export interface Selection {
    id: string
    type: SelectableElementType
}

// ── State shape exposed by the hook ──────────────────────────────────────────

export interface EditorState {
    diagram: Diagram
    selection: Selection | null
    setDiagram: React.Dispatch<React.SetStateAction<Diagram>>
    setSelection: React.Dispatch<React.SetStateAction<Selection | null>>
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createBlankDiagram(): Diagram {
    const now = new Date().toISOString()
    const gatewayId = crypto.randomUUID()
    const serviceId = crypto.randomUUID()
    const dbId = crypto.randomUUID()

    return {
        id: crypto.randomUUID(),
        name: 'System Architecture',
        nodes: [
            {
                id: gatewayId,
                type: 'rectangle',
                x: 100,
                y: 140,
                width: 150,
                height: 60,
                label: 'API Gateway',
            },
            {
                id: serviceId,
                type: 'rounded-rectangle',
                x: 320,
                y: 140,
                width: 160,
                height: 60,
                label: 'Core Service',
            },
            {
                id: dbId,
                type: 'database',
                x: 550,
                y: 110,
                width: 110,
                height: 120,
                label: 'Primary DB',
            },
        ],
        edges: [
            {
                id: crypto.randomUUID(),
                sourceId: gatewayId,
                targetId: serviceId,
                label: 'REST / HTTPS',
            },
            {
                id: crypto.randomUUID(),
                sourceId: serviceId,
                targetId: dbId,
                label: 'TCP / SQL',
            },
        ],
        texts: [
            {
                id: crypto.randomUUID(),
                x: 100,
                y: 80,
                content: 'System Architecture Overview',
                style: {
                    fontSize: 16,
                    textColor: '#0F172A',
                },
            },
        ],
        groups: [
            {
                id: crypto.randomUUID(),
                x: 80,
                y: 50,
                width: 600,
                height: 200,
                title: 'Backend VPC',
                style: {
                    fillColor: '#2563EB',
                    fillOpacity: 0.03,
                    strokeColor: '#CBD5E1',
                    strokeWidth: 1.5,
                    strokeBorderStyle: 'dashed',
                    borderRadius: 8,
                    titleColor: '#64748B',
                    titleFontSize: 11,
                },
            },
        ],
        viewport: { zoom: 1, offsetX: 0, offsetY: 0 },
        defaultEdgeRouting: 'straight',
        createdAt: now,
        updatedAt: now,
    }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEditorState(): EditorState {
    const [diagram, setDiagram] = useState<Diagram>(() => loadDiagram() ?? createBlankDiagram())
    const [selection, setSelection] = useState<Selection | null>(null)

    return { diagram, selection, setDiagram, setSelection }
}
