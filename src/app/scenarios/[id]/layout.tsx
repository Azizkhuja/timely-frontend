"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScenarioProvider, useScenario } from './ScenarioContext';
import styles from './page.module.css';
import { FaRegCirclePlay } from "react-icons/fa6";
import { MdOutlineSendToMobile } from "react-icons/md";
import { PiPlugsConnected } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";

function ScenarioLayoutInner({ children }: { children: React.ReactNode }) {
    const {
        scenario, isStarting, handleStart, updateScenarioName, addNode,
        apiKey, handleApiKeyChange, executionStatus
    } = useScenario();
    const router = useRouter();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    if (!scenario) return <div className={styles.loading}>Loading Scenario...</div>;

    return (
        <div className={styles.container}>
            {/* Header stays locked at the top */}
            <header className={styles.header}>
                <div className={styles.back} onClick={() => router.push('/')}>
                    ← Back
                </div>
                <div className={styles.titleArea}>
                    <input
                        className={styles.nameInput}
                        value={scenario.name}
                        onChange={(e) => updateScenarioName(e.target.value)}
                    />
                    <span className={styles.badge}>{scenario.status.toUpperCase()}</span>
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.settingsBtn}
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <IoSettingsOutline size={20} />
                        <span>Settings</span>
                    </button>
                    <button
                        className={`${styles.startBtn} ${isStarting ? styles.spinning : ''}`}
                        onClick={handleStart}
                        disabled={isStarting || !apiKey}
                        title={!apiKey ? "Configure API Key in Settings to enable" : "Start Scenario"}
                    >
                        {isStarting ? '...' : '▶ Start'}
                    </button>
                </div>
            </header>

            <div className={styles.workspace}>
                {/* 
                   Sidebars stay locked and separate from the canvas. 
                   They are siblings to the children (page.tsx) 
                */}
                <aside className={styles.nodePanel}>
                    <div className={styles.panelSection}>
                        <h3 className={styles.sectionHeader}>Triggers</h3>
                        <div className={styles.componentScrollArea}>
                            <div className={styles.draggableItem} onClick={() => addNode('now')}>
                                <div className={styles.compIcon}><FaRegCirclePlay /></div>
                                <div className={styles.compText}>
                                    <strong>Now</strong>
                                    <span>Immediate launch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.panelSection}>
                        <h3 className={styles.sectionHeader}>Actions</h3>
                        <div className={styles.componentScrollArea}>
                            <div className={styles.draggableItem} onClick={() => addNode('mobile_push')}>
                                <span className={styles.compIcon}><MdOutlineSendToMobile /></span>
                                <div className={styles.compText}>
                                    <strong>Mobile Push</strong>
                                    <span>App notification</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.panelSection}>
                        <h3 className={styles.sectionHeader}>Operators</h3>
                        <div className={styles.componentScrollArea}>
                            <div className={styles.draggableItem} onClick={() => addNode('condition')}>
                                <span className={styles.compIcon}><PiPlugsConnected /></span>
                                <div className={styles.compText}>
                                    <strong>Condition</strong>
                                    <span>FCM filtering</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {children}
            </div>

            {/* Global Settings Modal */}
            {isSettingsOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Global Settings</h2>
                            <button className={styles.closeBtn} onClick={() => setIsSettingsOpen(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.settingGroup}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Backend API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => handleApiKeyChange(e.target.value)}
                                    placeholder="Render secret key..."
                                    className={styles.apiKeyInput}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                                <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    This key is used to authenticate with the Timely backend for sending notifications.
                                </p>
                            </div>

                            <hr className={styles.divider} />

                            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '12px' }}>Execution Log</h4>
                            <div className={styles.log}>
                                <div className={styles.logItem}>Ready to start</div>
                                {executionStatus.msg && (
                                    <div className={`${styles.logItem} ${styles[executionStatus.type]}`}>
                                        {executionStatus.msg}
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.doneBtn} onClick={() => setIsSettingsOpen(false)}>Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ScenarioLayout({ children }: { children: React.ReactNode }) {
    return (
        <ScenarioProvider>
            <ScenarioLayoutInner>
                {children}
            </ScenarioLayoutInner>
        </ScenarioProvider>
    );
}
