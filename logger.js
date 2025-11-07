// logger.js - Advanced Persistent Console Logger with Firebase Metrics

class GameLogger {
    constructor() {
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.firebaseMetrics = {
            initStartTime: null,
            initEndTime: null,
            connectionStartTime: null,
            connectionSuccessTime: null,
            connectionFailureTime: null,
            failureReason: null,
            lastActivity: null,
            activityLog: []
        };

        // Restore logs from previous page if they exist
        this.restoreLogs();

        // Log initial startup
        this.log('SYSTEM', 'Logger initialized', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
        }, 'info');

        // Intercept console methods to capture all logs
        this.interceptConsole();

        // Monitor for unhandled errors
        this.setupErrorHandlers();
    }

    generateSessionId() {
        return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    log(category, message, data = {}, level = 'debug') {
        const logEntry = {
            timestamp: Date.now(),
            relativeTime: Date.now() - this.startTime,
            category,
            message,
            data,
            level,
            pageUrl: window.location.pathname,
            sessionId: this.sessionId
        };

        this.logs.push(logEntry);

        // Update Firebase metrics if relevant
        if (category === 'FIREBASE') {
            this.firebaseMetrics.lastActivity = logEntry;
            this.firebaseMetrics.activityLog.push(logEntry);
        }

        // Console output with styling
        this.outputToConsole(logEntry);

        // Persist to sessionStorage
        this.persistLogs();
    }

    outputToConsole(entry) {
        const { category, message, data, level, relativeTime } = entry;
        const timestamp = `+${relativeTime}ms`;
        const prefix = `[${category}] ${message}`;

        const levelColors = {
            debug: '%cDEBUG',
            info: '%cINFO',
            warn: '%cWARN',
            error: '%cERROR',
            success: '%cSUCCESS'
        };

        const levelStyles = {
            debug: 'color: #8be9fd; font-weight: bold;',
            info: 'color: #50fa7b; font-weight: bold;',
            warn: 'color: #f1fa8c; font-weight: bold;',
            error: 'color: #ff5555; font-weight: bold;',
            success: 'color: #50fa7b; font-weight: bold; background: #282a36; padding: 2px 4px;'
        };

        if (Object.keys(data).length > 0) {
            console.log(
                `${levelColors[level]} %c${timestamp} %c${prefix}`,
                levelStyles[level],
                'color: #999; font-size: 0.9em;',
                'color: #f8f8f2;',
                data
            );
        } else {
            console.log(
                `${levelColors[level]} %c${timestamp} %c${prefix}`,
                levelStyles[level],
                'color: #999; font-size: 0.9em;',
                'color: #f8f8f2;'
            );
        }
    }

    persistLogs() {
        try {
            sessionStorage.setItem('TTT_LOGS', JSON.stringify(this.logs));
        } catch (e) {
            console.error('Failed to persist logs:', e);
        }
    }

    restoreLogs() {
        try {
            const stored = sessionStorage.getItem('TTT_LOGS');
            if (stored) {
                this.logs = JSON.parse(stored);
                console.log(`%cRestored ${this.logs.length} logs from previous session`, 'color: #50fa7b; font-weight: bold;');
            }
        } catch (e) {
            console.error('Failed to restore logs:', e);
        }
    }

    logFirebaseInit(config) {
        this.firebaseMetrics.initStartTime = Date.now();
        this.log('FIREBASE', 'Initializing Firebase', {
            projectId: config.projectId,
            authDomain: config.authDomain,
            apiKeyPresent: !!config.apiKey
        }, 'info');
    }

    logFirebaseInitComplete(success, error = null) {
        this.firebaseMetrics.initEndTime = Date.now();
        const duration = this.firebaseMetrics.initEndTime - this.firebaseMetrics.initStartTime;

        if (success) {
            this.log('FIREBASE', 'Firebase initialization complete', {
                duration: `${duration}ms`,
                success: true
            }, 'success');
        } else {
            this.log('FIREBASE', 'Firebase initialization failed', {
                duration: `${duration}ms`,
                error: error?.message || 'Unknown error',
                errorCode: error?.code || 'N/A'
            }, 'error');
        }
    }

    logFirebaseConnection(roomCode) {
        this.firebaseMetrics.connectionStartTime = Date.now();
        this.log('FIREBASE', 'Attempting to connect to room', {
            roomCode,
            connectionStartTime: this.firebaseMetrics.connectionStartTime
        }, 'info');
    }

    logFirebaseConnectionSuccess(roomData) {
        this.firebaseMetrics.connectionSuccessTime = Date.now();
        const duration = this.firebaseMetrics.connectionSuccessTime - this.firebaseMetrics.connectionStartTime;

        this.log('FIREBASE', 'Firebase connection established', {
            duration: `${duration}ms`,
            roomDataKeys: Object.keys(roomData || {}),
            gameActive: roomData?.winner === undefined,
            playersConnected: roomData?.hostJoined && roomData?.guestJoined
        }, 'success');
    }

    logFirebaseConnectionFailure(error, lastKnownState = null) {
        this.firebaseMetrics.connectionFailureTime = Date.now();
        const duration = this.firebaseMetrics.connectionFailureTime - this.firebaseMetrics.connectionStartTime;

        this.firebaseMetrics.failureReason = {
            error: error?.message || 'Unknown error',
            code: error?.code || 'N/A',
            duration,
            timestamp: new Date().toISOString(),
            lastKnownState
        };

        this.log('FIREBASE', 'Firebase connection failed', {
            duration: `${duration}ms`,
            errorMessage: error?.message || 'Unknown error',
            errorCode: error?.code || 'N/A',
            lastKnownState,
            timestamp: new Date().toISOString()
        }, 'error');
    }

    logGameState(state) {
        this.log('GAME_STATE', 'Current game state', {
            board: state.board || 'N/A',
            turn: state.turn || 'N/A',
            winner: state.winner || 'ongoing',
            isMyTurn: state.isMyTurn,
            mySymbol: state.mySymbol,
            opponentSymbol: state.opponentSymbol,
            gameActive: state.gameActive,
            isHost: state.isHost
        }, 'debug');
    }

    logMove(moveDetails) {
        this.log('GAME_MOVE', 'Move registered', {
            cellIndex: moveDetails.cellIndex,
            player: moveDetails.player,
            symbol: moveDetails.symbol,
            boardState: moveDetails.boardState,
            timestamp: new Date().toISOString()
        }, 'info');
    }

    logNetworkActivity(activity) {
        this.log('NETWORK', activity.type, {
            operation: activity.operation || 'N/A',
            status: activity.status || 'pending',
            duration: activity.duration || 'N/A',
            roomCode: activity.roomCode || 'N/A',
            dataSize: activity.dataSize || 'N/A'
        }, activity.status === 'error' ? 'error' : 'debug');
    }

    logUIInteraction(interaction) {
        this.log('UI', interaction.action, {
            element: interaction.element,
            eventType: interaction.eventType,
            additionalInfo: interaction.info || {}
        }, 'debug');
    }

    logSessionData(sessionKey, value) {
        this.log('SESSION', `Session data updated: ${sessionKey}`, {
            key: sessionKey,
            value: value,
            timestamp: new Date().toISOString()
        }, 'debug');
    }

    logPageTransition(from, to, sessionData) {
        this.log('PAGE_TRANSITION', `Navigating from ${from} to ${to}`, {
            fromPage: from,
            toPage: to,
            sessionDataKeys: Object.keys(sessionData),
            timestamp: new Date().toISOString()
        }, 'info');
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        // Only intercept non-logger console calls
        console.log = (...args) => {
            originalLog(...args);
            if (args[0]?.includes?.('[')) {
                this.log('CONSOLE', String(args[0]).substring(0, 100), { args }, 'debug');
            }
        };

        console.error = (...args) => {
            originalError(...args);
            this.log('CONSOLE_ERROR', String(args[0]).substring(0, 100), {
                errorMessage: args[0],
                stack: args[1]?.stack || 'N/A'
            }, 'error');
        };

        console.warn = (...args) => {
            originalWarn(...args);
            this.log('CONSOLE_WARN', String(args[0]).substring(0, 100), { args }, 'warn');
        };
    }

    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.log('RUNTIME_ERROR', 'Uncaught error detected', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack || 'N/A'
            }, 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.log('PROMISE_REJECTION', 'Unhandled promise rejection', {
                reason: event.reason?.message || String(event.reason),
                promise: event.promise,
                stack: event.reason?.stack || 'N/A'
            }, 'error');
        });

        window.addEventListener('beforeunload', () => {
            this.log('PAGE_UNLOAD', 'Page is being unloaded', {
                totalLogs: this.logs.length,
                sessionDuration: Date.now() - this.startTime
            }, 'info');
            this.persistLogs();
        });
    }

    // Display all logs in console
    displayAllLogs() {
        console.group('%cTic Tac Toe - Complete Log History', 'color: #50fa7b; font-size: 1.2em; font-weight: bold;');
        console.log(`Session ID: ${this.sessionId}`);
        console.log(`Total Logs: ${this.logs.length}`);
        console.log(`Session Duration: ${Date.now() - this.startTime}ms`);
        console.table(this.logs);
        console.groupEnd();
    }

    displayFirebaseMetrics() {
        console.group('%cFirebase Connection Metrics', 'color: #8be9fd; font-size: 1.2em; font-weight: bold;');
        console.log('Init Duration:', this.firebaseMetrics.initEndTime - this.firebaseMetrics.initStartTime, 'ms');
        console.log('Connection Duration:', this.firebaseMetrics.connectionSuccessTime ?
            this.firebaseMetrics.connectionSuccessTime - this.firebaseMetrics.connectionStartTime : 'Failed', 'ms');
        console.log('Failure Reason:', this.firebaseMetrics.failureReason);
        console.log('Activity Log:', this.firebaseMetrics.activityLog);
        console.groupEnd();
    }

    exportLogs() {
        const exportData = {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            totalLogs: this.logs.length,
            firebaseMetrics: this.firebaseMetrics,
            logs: this.logs,
            exportedAt: new Date().toISOString()
        };

        console.log('%cExporting logs as JSON:', 'color: #f1fa8c; font-weight: bold;');
        console.log(JSON.stringify(exportData, null, 2));

        return exportData;
    }
}

// Create global logger instance
window.gameLogger = new GameLogger();

// Convenience methods in console
window.showLogs = () => window.gameLogger.displayAllLogs();
window.firebaseMetrics = () => window.gameLogger.displayFirebaseMetrics();
window.exportLogs = () => window.gameLogger.exportLogs();

console.log('%cLogger ready! Use showLogs(), firebaseMetrics(), or exportLogs() in console', 'color: #50fa7b; font-weight: bold;');
