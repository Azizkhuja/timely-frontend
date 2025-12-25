"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>T</div>
                <span className={styles.logoText}>Timely</span>
            </div>

            <nav className={styles.nav}>
                <div className={styles.section}>
                    <div className={`${styles.item} ${styles.active}`}>
                        <span className={styles.icon}>🎯</span>
                        <span className={styles.label}>Engage</span>
                    </div>
                    <div className={styles.subMenu}>
                        <Link href="/" className={styles.subItem}>
                            <span className={styles.subLabel}>Campaigns</span>
                        </Link>
                        <div className={styles.subItem}>
                            <span className={styles.subLabel}>Experiments</span>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.item}>
                        <span className={styles.icon}>📊</span>
                        <span className={styles.label}>Analysis</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <Link href="/settings" className={styles.item}>
                        <span className={styles.icon}>⚙️</span>
                        <span className={styles.label}>Settings</span>
                    </Link>
                </div>
            </nav>

            <div className={styles.footer}>
                <div className={styles.user}>
                    <div className={styles.avatar}>A</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>Azizkhuja</span>
                        <span className={styles.userRole}>Marketing Admin</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
