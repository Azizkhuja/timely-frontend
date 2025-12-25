"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScenario, Node } from './ScenarioContext';
import styles from './page.module.css';
import { FaRegCirclePlay } from "react-icons/fa6";
import { MdOutlineSendToMobile } from "react-icons/md";
import { PiPlugsConnected } from "react-icons/pi";

export default function ScenarioEditorPage() {
    const {
        nodes, deleteNode, updateNodeConfig, updateNodePosition,
        executionStatus, setExecutionStatus
    } = useScenario();

    const [activeModal, setActiveModal] = useState<{ nodeId: string, type: 'now' | 'mobile_push' | 'condition' } | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Canvas Panning & Constraints
    const canvasRef = useRef<HTMLDivElement>(null);
    const nodesListRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        // Only pan if clicking the background (not a node or button)
        if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains(styles.nodesList)) return;

        setIsPanning(true);
        if (canvasRef.current) {
            setPanStart({
                x: e.pageX,
                y: e.pageY,
                scrollLeft: canvasRef.current.scrollLeft,
                scrollTop: canvasRef.current.scrollTop
            });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isPanning || !canvasRef.current) return;
        e.preventDefault();

        const walkX = (e.pageX - panStart.x) * 1.5; // Scroll speed multiplier
        const walkY = (e.pageY - panStart.y) * 1.5;

        canvasRef.current.scrollLeft = panStart.scrollLeft - walkX;
        canvasRef.current.scrollTop = panStart.scrollTop - walkY;
    };

    const stopPanning = () => setIsPanning(false);

    // Keyboard listener for deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                // Ensure we're not inside an input/textarea
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

                deleteNode(selectedNodeId);
                setSelectedNodeId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, deleteNode]);

    return (
        <>
            {/* Canvas Area */}
            <div className={styles.canvasContainer} onClick={() => setSelectedNodeId(null)}>
                <div
                    className={styles.canvas}
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={stopPanning}
                    onMouseLeave={stopPanning}
                    style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                >
                    {nodes.length === 0 ? (
                        <div className={styles.onboarding}>
                            <div className={styles.onboardingCard}>
                                <h3>Get Started with Scenarios</h3>
                                <p>Drag components from the left panel to build your flow.</p>
                                <ul className={styles.tutorial}>
                                    <li>1. Drag a <strong>Trigger</strong> to start.</li>
                                    <li>2. Add <strong>Condition</strong> to target users.</li>
                                    <li>3. Add <strong>Mobile Push</strong> to send your message.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.nodesList} ref={nodesListRef}>
                            {nodes.map((node: Node) => {
                                const isRhombus = node.type === 'condition';
                                const nodeClass = isRhombus ? styles.nodeRhombus : styles.nodeCube;
                                const colorClass = node.type === 'mobile_push' ? styles.bgOrange : node.type === 'condition' ? styles.bgPurple : '';
                                const isSelected = selectedNodeId === node.id;

                                return (
                                    <motion.div
                                        key={node.id}
                                        drag
                                        dragMomentum={false}
                                        dragConstraints={{ left: 50, top: 50, right: 1870, bottom: 1870 }}
                                        dragElastic={0}
                                        whileDrag={{ zIndex: 1000, scale: 1.1 }}
                                        onDragEnd={(event, info) => {
                                            const currentPos = node.position || { x: 100, y: 100 };
                                            const newX = currentPos.x + info.offset.x;
                                            const newY = currentPos.y + info.offset.y;
                                            updateNodePosition(node.id, newX, newY);
                                        }}
                                        initial={{
                                            x: (node.position?.x ?? 100),
                                            y: (node.position?.y ?? 100)
                                        }}
                                        className={`${styles.node} ${nodeClass} ${colorClass} ${isSelected ? styles.selected : ''}`}
                                        onDoubleClick={() => setActiveModal({ nodeId: node.id, type: node.type })}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNodeId(node.id);
                                        }}
                                        style={{ left: 0, top: 0 }}
                                    >
                                        <div className={styles.nodeVisual} />

                                        <div className={styles.nodeContent}>
                                            <div className={styles.customIcon}>
                                                {node.type === 'now' && <FaRegCirclePlay />}
                                                {node.type === 'mobile_push' && <MdOutlineSendToMobile />}
                                                {node.type === 'condition' && <PiPlugsConnected />}
                                            </div>
                                            <span className={styles.nodeTitleMini}>
                                                {node.type === 'now' ? 'START' : node.type === 'mobile_push' ? 'PUSH' : 'TARGET'}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {executionStatus.msg && (
                    <div className={`${styles.statusOverlay} ${styles[executionStatus.type]}`}>
                        <div className={styles.statusContent}>
                            {executionStatus.msg}
                        </div>
                        <button className={styles.statusClose} onClick={() => setExecutionStatus({ type: '', msg: '' })}>×</button>
                    </div>
                )}
            </div>

            {/* Configuration Modals */}
            {activeModal && (
                <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Configure {activeModal.type.replace('_', ' ').toUpperCase()}</h2>
                            <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            {activeModal.type === 'condition' ? (
                                <div className={styles.configForm}>
                                    <label>Target FCM Tokens (comma or newline separated)</label>
                                    <textarea
                                        className={styles.configTextarea}
                                        value={nodes.find(n => n.id === activeModal.nodeId)?.config.tokens || ""}
                                        onChange={(e) => updateNodeConfig(activeModal.nodeId, { tokens: e.target.value })}
                                        placeholder="paste_your_token_here..."
                                    />
                                    <p className={styles.helperText}>These tokens will receive the notification when the scenario starts.</p>
                                </div>
                            ) : activeModal.type === 'mobile_push' ? (
                                <div className={styles.configForm}>
                                    <label>Notification Title</label>
                                    <input
                                        className={styles.configInput}
                                        value={nodes.find(n => n.id === activeModal.nodeId)?.config.title || ""}
                                        onChange={(e) => updateNodeConfig(activeModal.nodeId, { ...nodes.find(n => n.id === activeModal.nodeId)?.config, title: e.target.value })}
                                    />
                                    <label>Message Body</label>
                                    <textarea
                                        className={styles.configTextarea}
                                        value={nodes.find(n => n.id === activeModal.nodeId)?.config.body || ""}
                                        onChange={(e) => updateNodeConfig(activeModal.nodeId, { ...nodes.find(n => n.id === activeModal.nodeId)?.config, body: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className={styles.configForm}>
                                    <p>This node triggers the campaign immediately upon clicking "Start".</p>
                                </div>
                            )}
                            <div className={styles.modalFooter}>
                                <button className={styles.doneBtn} onClick={() => setActiveModal(null)}>Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
