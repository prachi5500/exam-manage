import { useEffect, useRef, useCallback } from 'react';

// Hook to detect cheating activities
export const useCheatingDetection = (examAttemptId, enabled = true) => {
    const cheatingLogRef = useRef([]);

    // Detect tab/window switching
    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportActivity('window-blur', 'warning');
            }
        };

        const handleFocus = () => {
            reportActivity('tab-switch', 'warning');
        };

        window.addEventListener('blur', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('blur', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled]);

    // Detect fullscreen exit
    useEffect(() => {
        if (!enabled) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                reportActivity('fullscreen-exit', 'critical');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [enabled]);

    // Disable right-click
    useEffect(() => {
        if (!enabled) return;

        const handleContextMenu = (e) => {
            e.preventDefault();
            reportActivity('right-click-attempt', 'warning');
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [enabled]);

    // Disable copy-paste
    useEffect(() => {
        if (!enabled) return;

        const handleCopy = (e) => {
            e.preventDefault();
            reportActivity('copy-paste-attempt', 'warning');
        };

        const handlePaste = (e) => {
            e.preventDefault();
            reportActivity('copy-paste-attempt', 'warning');
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
        };
    }, [enabled]);

    // Disable keyboard shortcuts
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Block common cheating shortcuts
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'a')) {
                e.preventDefault();
                reportActivity('suspicious-pattern', 'warning');
            }
            // Block F12 (Developer tools)
            if (e.key === 'F12') {
                e.preventDefault();
                reportActivity('developer-tools-attempt', 'critical');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled]);

    const reportActivity = useCallback(async (activityType, severity) => {
        try {
            cheatingLogRef.current.push({
                type: activityType,
                severity,
                timestamp: Date.now()
            });

            if (examAttemptId) {
                await fetch('http://localhost:5000/api/cheating-detection/report-activity', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        examAttemptId,
                        activityType,
                        severity
                    })
                });
            }
        } catch (error) {
            console.error('Failed to report cheating activity:', error);
        }
    }, [examAttemptId]);

    return {
        getCheatingLog: () => cheatingLogRef.current,
        clearCheatingLog: () => { cheatingLogRef.current = []; }
    };
};
