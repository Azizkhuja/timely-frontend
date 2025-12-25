"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  status: 'draft' | 'active';
}

import { useRouter } from 'next/navigation';

export default function ScenariosDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('timely_scenarios');
    if (saved) {
      setScenarios(JSON.parse(saved));
    }
  }, []);

  const createScenario = () => {
    const freshId = Date.now().toString();
    const newScenario: Scenario = {
      id: freshId,
      name: `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    const updated = [newScenario, ...scenarios];
    setScenarios(updated);
    localStorage.setItem('timely_scenarios', JSON.stringify(updated));

    // Close modal and navigate
    setIsModalOpen(false);
    router.push(`/scenarios/${freshId}`);
  };

  const deleteScenario = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this scenario?")) {
      const updated = scenarios.filter(s => s.id !== id);
      setScenarios(updated);
      localStorage.setItem('timely_scenarios', JSON.stringify(updated));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Scenarios</h1>
          <p>Manage your automated push notification workflows</p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
          <span className={styles.plus}>+</span> Create New Scenario
        </button>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Scenario</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Ready to build a new automated campaign? This will create a fresh scenario for your marketing team.</p>
              <div className={styles.createBox} onClick={createScenario}>
                <div className={styles.boxIcon}>✨</div>
                <div className={styles.boxText}>
                  <strong>+ Create New Scenario</strong>
                  <span>Start from scratch with a blank canvas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Scenarios</span>
          <span className={styles.statValue}>{scenarios.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Campaigns</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Last 24h Pushes</span>
          <span className={styles.statValue}>1,248</span>
        </div>
      </div>

      <div className={styles.content}>
        {scenarios.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📂</div>
            <h3>No scenarios yet</h3>
            <p>Start by creating your first automated notification scenario.</p>
            <button className={styles.secondaryBtn} onClick={() => setIsModalOpen(true)}>
              Create your first scenario
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {scenarios.map(scenario => (
              <Link href={`/scenarios/${scenario.id}`} key={scenario.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.statusDot} data-status={scenario.status} />
                    <span className={styles.statusText}>{scenario.status.toUpperCase()}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => deleteScenario(e, scenario.id)}
                    title="Delete Scenario"
                  >
                    🗑️
                  </button>
                </div>
                <h3 className={styles.scenarioName}>{scenario.name}</h3>
                <div className={styles.cardFooter}>
                  <span className={styles.date}>Created {new Date(scenario.createdAt).toLocaleDateString()}</span>
                  <span className={styles.viewBtn}>Edit Scenario</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
