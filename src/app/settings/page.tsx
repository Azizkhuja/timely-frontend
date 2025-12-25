"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
    const [backendUrl, setBackendUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        // Load only on mount
        const savedUrl = localStorage.getItem('timely_backend_url') || "https://timely-backend-hg2f.onrender.com";
        const savedKey = localStorage.getItem('timely_backend_api_key') || "";
        setBackendUrl(savedUrl);
        setApiKey(savedKey);
    }, []);

    const handleSave = () => {
        // Strict Save: Only persist when this button is clicked
        localStorage.setItem('timely_backend_url', backendUrl);
        localStorage.setItem('timely_backend_api_key', apiKey);

        setStatus({ type: 'success', msg: 'Configuration saved successfully! New settings are active.' });

        // Clear status after 3 seconds
        setTimeout(() => setStatus(null), 3000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Global Settings</h1>
                <p className={styles.subtitle}>Manage your backend connection and security credentials.</p>
            </header>

            {status && (
                <div className={`${styles.status} ${styles.success}`}>
                    ✅ {status.msg}
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.sectionTitle}>Backend Configuration</div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Backend URL</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={backendUrl}
                        onChange={(e) => setBackendUrl(e.target.value)}
                        placeholder="https://your-timely-backend.com"
                    />
                    <p className={styles.hint}>
                        The active endpoint for your Timely instance. All push notifications will be sent through this URL.
                    </p>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Master API Key</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk_live_..."
                    />
                    <p className={styles.hint}>
                        Your private `x-api-key` used for authenticating requests. Keep this secret.
                    </p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
