import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
    diagramName: string
    onRenameDiagram?: (name: string) => void
    isDark: boolean
    onToggleTheme: () => void
    onNew: () => void
    onSave: () => void
    onLoad: () => void
    onExportSvg: () => void
    onExportSvgTransparent: () => void
    onExportJson: () => void
    onImportJson: () => void
}

export default function Header({
    diagramName,
    onRenameDiagram,
    isDark,
    onToggleTheme,
    onNew,
    onSave,
    onLoad,
    onExportSvg,
    onExportSvgTransparent,
    onExportJson,
    onImportJson,
}: HeaderProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameInput, setNameInput] = useState(diagramName)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const exportMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setNameInput(diagramName)
    }, [diagramName])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
                setShowExportMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleFinishRename() {
        setIsEditingName(false)
        if (onRenameDiagram && nameInput.trim()) {
            onRenameDiagram(nameInput.trim())
        } else {
            setNameInput(diagramName)
        }
    }

    return (
        <header className="flex items-center justify-between px-4 h-13 border-b border-surface-border bg-surface-secondary shrink-0 select-none z-20">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-panel text-white">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="2" y="2" width="4.5" height="4" rx="1" fill="white" />
                            <rect x="9.5" y="2" width="4.5" height="4" rx="1" fill="white" fillOpacity="0.75" />
                            <rect x="5.75" y="10" width="4.5" height="4" rx="1" fill="white" />
                            <path d="M4.25 6V8A1.5 1.5 0 0 0 5.75 9.5H8M11.75 6V8A1.5 1.5 0 0 1 10.25 9.5H8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-[14px] font-bold tracking-tight text-content-primary">
                        ArchFlow
                    </span>
                </div>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 px-2 py-0.5 rounded-full tracking-wide">
                    WORKSPACE
                </span>
            </div>

            {/* Diagram title */}
            <div className="flex items-center">
                {isEditingName ? (
                    <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleFinishRename()
                            if (e.key === 'Escape') {
                                setNameInput(diagramName)
                                setIsEditingName(false)
                            }
                        }}
                        autoFocus
                        className="px-2.5 py-1 text-[13px] font-medium text-content-primary bg-surface-subtle border border-brand-500 rounded-md focus:outline-none select-text text-center w-52"
                    />
                ) : (
                    <button
                        onClick={() => onRenameDiagram && setIsEditingName(true)}
                        title="Click to rename diagram"
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium text-content-primary hover:bg-surface-subtle transition-colors"
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-content-muted group-hover:text-brand-600 transition-colors">
                            <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M4 4.5H9M4 6.5H9M4 8.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span>{diagramName}</span>
                        {onRenameDiagram && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-content-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                <path d="M7.5 1.5L9.5 3.5L3 10H1V8L7.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
                <HeaderButton
                    label="New"
                    icon={
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M6.5 2.5V10.5M2.5 6.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    }
                    onClick={onNew}
                    title="New diagram"
                />
                <HeaderButton
                    label="Import"
                    icon={
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2.5 8.5V10.5H10.5V8.5M6.5 2.5V8M4 5L6.5 2.5L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                    onClick={onImportJson}
                    title="Import JSON diagram file"
                />

                <div className="w-px h-5 bg-surface-border mx-1" />

                {/* Export dropdown menu */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2.5 8.5V10.5H10.5V8.5M6.5 2.5V8M4 5.5L6.5 8L9 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Export</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${showExportMenu ? 'rotate-180' : ''}`}>
                            <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface-secondary border border-surface-border rounded-lg shadow-modal py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <button
                                onClick={() => { onExportSvg(); setShowExportMenu(false) }}
                                className="w-full px-3 py-1.5 text-left text-[12px] text-content-primary hover:bg-surface-subtle flex items-center justify-between"
                            >
                                <span className="font-medium">SVG Image</span>
                                <span className="text-[10px] text-content-muted">Vector with bg</span>
                            </button>
                            <button
                                onClick={() => { onExportSvgTransparent(); setShowExportMenu(false) }}
                                className="w-full px-3 py-1.5 text-left text-[12px] text-content-primary hover:bg-surface-subtle flex items-center justify-between"
                            >
                                <span className="font-medium">SVG (Transparent)</span>
                                <span className="text-[10px] text-content-muted">Transparent</span>
                            </button>
                            <div className="my-1 border-t border-surface-border" />
                            <button
                                onClick={() => { onExportJson(); setShowExportMenu(false) }}
                                className="w-full px-3 py-1.5 text-left text-[12px] text-content-primary hover:bg-surface-subtle flex items-center justify-between"
                            >
                                <span className="font-medium">JSON File</span>
                                <span className="text-[10px] text-content-muted">ArchFlow schema</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-surface-border mx-1" />

                <HeaderButton
                    label="Load"
                    icon={
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M10.5 4.5L6.5 1.5L2.5 4.5V10.5A1 1 0 0 0 3.5 11.5H9.5A1 1 0 0 0 10.5 10.5V4.5Z" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M5 11.5V7.5H8V11.5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    }
                    onClick={onLoad}
                    title="Load saved diagram"
                />

                <button
                    onClick={onSave}
                    title="Save diagram locally (Ctrl+S)"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[12px] font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-panel transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2.5A1 1 0 0 1 3 1.5H9.5L11.5 3.5V10.5A1 1 0 0 1 10.5 11.5H3A1 1 0 0 1 2 10.5V2.5Z" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M4 1.5V4.5H8.5V1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M4 11.5V7.5H9V11.5" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                    <span>Save</span>
                </button>

                <div className="w-px h-5 bg-surface-border mx-1" />

                {/* Dark / Light Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    className="p-1.5 rounded-md text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                    {isDark ? (
                        /* Sun Icon */
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-amber-400">
                            <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    ) : (
                        /* Moon Icon */
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-content-secondary">
                            <path d="M14 9.5A6.5 6.5 0 1 1 6.5 2C6.5 5.59 9.41 8.5 13 8.5C13.34 8.5 13.68 8.47 14 8.42V9.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    )
}

function HeaderButton({
    label,
    icon,
    onClick,
    title,
}: {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    title?: string
}) {
    return (
        <button
            title={title}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={onClick}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{label}</span>
        </button>
    )
}

