"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export type NodeType = 'now' | 'mobile_push' | 'condition';

export interface Node {
    id: string;
    type: NodeType;
    title: string;
    config: any;
    position: { x: number; y: number };
}

export interface Scenario {
    id: string;
    name: string;
    createdAt: string;
    status: 'draft' | 'active';
}

interface ScenarioContextType {
    scenario: Scenario | null;
    nodes: Node[];
    apiKey: string;
    isStarting: boolean;
    executionStatus: { type: string; msg: string };
    addNode: (type: NodeType) => void;
    deleteNode: (nodeId: string) => void;
    updateNodeConfig: (nodeId: string, newConfig: any) => void;
    updateNodePosition: (nodeId: string, x: number, y: number) => void;
    updateScenarioName: (newName: string) => void;
    handleApiKeyChange: (val: string) => void;
    handleStart: () => Promise<void>;
    setExecutionStatus: (status: { type: string; msg: string }) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
    const { id } = useParams();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [apiKey, setApiKey] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    const [executionStatus, setExecutionStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        const saved = localStorage.getItem('timely_scenarios');
        if (saved) {
            const all: Scenario[] = JSON.parse(saved);
            const found = all.find(s => s.id === id);
            if (found) setScenario(found);
        }
        const savedNodes = localStorage.getItem(`nodes_${id}`);
        if (savedNodes) {
            const parsedNodes: Node[] = JSON.parse(savedNodes);
            // Migration: Ensure all legacy nodes have a position
            const migratedNodes = parsedNodes.map(n => ({
                ...n,
                position: n.position || { x: 100, y: 100 }
            }));
            setNodes(migratedNodes);
        }

        const savedKey = localStorage.getItem('timely_backend_api_key');
        if (savedKey) setApiKey(savedKey);
    }, [id]);

    useEffect(() => {
        if (nodes.length > 0) {
            localStorage.setItem(`nodes_${id}`, JSON.stringify(nodes));
        }
    }, [nodes, id]);

    useEffect(() => {
        if (executionStatus.msg) {
            const timer = setTimeout(() => {
                setExecutionStatus({ type: '', msg: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [executionStatus]);

    const addNode = (type: NodeType) => {
        let title = "";
        let config = {};
        if (type === 'now') {
            title = "Trigger Now";
        } else if (type === 'mobile_push') {
            title = "Mobile Push Notification";
            config = { title: "Hello!", body: "Message from Timely" };
        } else if (type === 'condition') {
            title = "Condition (FCM Tokens)";
            config = { tokens: "" };
        }

        // Calculate staggered position to avoid perfect stacking
        const offset = nodes.length * 30;
        const newNode: Node = {
            id: Date.now().toString(),
            type,
            title,
            config,
            position: {
                x: 100 + (offset % 300),
                y: 100 + (offset % 300)
            }
        };
        setNodes([...nodes, newNode]);
    };

    const updateNodePosition = (nodeId: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position: { x, y } } : n));
    };

    const deleteNode = (nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
    };

    const updateNodeConfig = (nodeId: string, newConfig: any) => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, config: newConfig } : n));
    };

    const updateScenarioName = (newName: string) => {
        if (!scenario) return;
        const updated = { ...scenario, name: newName };
        setScenario(updated);
        const saved = localStorage.getItem('timely_scenarios');
        if (saved) {
            const all: Scenario[] = JSON.parse(saved);
            const updatedAll = all.map(s => s.id === id ? updated : s);
            localStorage.setItem('timely_scenarios', JSON.stringify(updatedAll));
        }
    };

    const handleApiKeyChange = (val: string) => {
        setApiKey(val);
        localStorage.setItem('timely_backend_api_key', val);
    };

    const handleStart = async () => {
        const dynamicBackendUrl = localStorage.getItem('timely_backend_url') || "";
        const dynamicApiKey = localStorage.getItem('timely_backend_api_key') || "";

        if (!dynamicBackendUrl || !dynamicApiKey) {
            setExecutionStatus({ type: 'error', msg: 'Missing configuration. Set Backend URL and API Key in Settings.' });
            return;
        }

        const conditionNode = nodes.find(n => n.type === 'condition');
        const pushNode = nodes.find(n => n.type === 'mobile_push');

        if (!conditionNode || !pushNode) {
            setExecutionStatus({ type: 'error', msg: 'Flow incomplete. Need Condition & Mobile Push nodes.' });
            return;
        }

        const tokens = conditionNode.config.tokens.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
        if (tokens.length === 0) {
            setExecutionStatus({ type: 'error', msg: 'No tokens found in Condition node' });
            return;
        }

        setIsStarting(true);
        setExecutionStatus({ type: 'success', msg: `Triggering ${tokens.length} devices...` });

        try {
            let successCount = 0;
            let errorMessage = "";

            for (const token of tokens) {
                const res = await fetch(`${dynamicBackendUrl}/send-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': dynamicApiKey
                    },
                    body: JSON.stringify({
                        token,
                        title: pushNode.config.title,
                        body: pushNode.config.body
                    })
                });

                if (res.ok) {
                    successCount++;
                } else if (res.status === 401 || res.status === 403) {
                    errorMessage = "Invalid API Key. Please check your Global Settings.";
                    break;
                } else {
                    errorMessage = `Server error: ${res.statusText}`;
                }
            }

            if (successCount > 0) {
                setExecutionStatus({
                    type: 'success',
                    msg: `Successfully sent ${successCount}/${tokens.length} notifications!`
                });

                if (scenario?.status === 'draft') {
                    const updated = { ...scenario, status: 'active' as const };
                    setScenario(updated);
                    const saved = localStorage.getItem('timely_scenarios');
                    if (saved) {
                        const all: any[] = JSON.parse(saved);
                        const updatedAll = all.map(s => s.id === scenario.id ? updated : s);
                        localStorage.setItem('timely_scenarios', JSON.stringify(updatedAll));
                    }
                }
            } else {
                setExecutionStatus({
                    type: 'error',
                    msg: errorMessage || "Failed to send notifications. Check backend logs."
                });
            }
        } catch (err) {
            setExecutionStatus({ type: 'error', msg: 'Network error: Backend might be offline or URL is wrong.' });
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <ScenarioContext.Provider value={{
            scenario, nodes, apiKey, isStarting, executionStatus,
            addNode, deleteNode, updateNodeConfig, updateNodePosition, updateScenarioName,
            handleApiKeyChange, handleStart, setExecutionStatus
        }}>
            {children}
        </ScenarioContext.Provider>
    );
}

export function useScenario() {
    const context = useContext(ScenarioContext);
    if (!context) throw new Error("useScenario must be used within a ScenarioProvider");
    return context;
}
