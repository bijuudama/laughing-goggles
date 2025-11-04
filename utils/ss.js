(function () {
    'use strict';

    console.log('[Early FullView] Starting...');

    let enabled = false;
    let spectators = [];
    let updateInterval = null;
    let borders = { left: -7071, right: 7071, top: -7071, bottom: 7071 };

    // Injects and maintains the FullView button
    function injectFullMapButton() {
        if (document.getElementById("early-fullview-button")) return;

        const canvasElem = document.querySelector('.canvas') || document.body;
        if (!canvasElem) {
            setTimeout(injectFullMapButton, 500);
            return;
        }

        const button = document.createElement("button");
        button.id = "early-fullview-button";
        button.textContent = enabled ? "Disable FullView" : "Enable FullView";
        button.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 99999;
            background: ${enabled ? '#F44336' : '#4CAF50'};
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;

        button.onclick = toggleFullView;
        canvasElem.insertAdjacentElement('afterend', button);
        console.log('[FullMap View] Button injected near canvas');
    }

    function updateButtonState() {
        const button = document.getElementById("early-fullview-button");
        if (button) {
            button.textContent = enabled ? 'Disable FullView' : 'Enable FullView';
            button.style.backgroundColor = enabled ? '#F44336' : '#4CAF50';
        }
    }

    function waitForDeltaCanvas() {
        const checkInterval = setInterval(() => {
            if (document.querySelector('.canvas') || document.body) {
                clearInterval(checkInterval);
                injectFullMapButton();
            }
        }, 500);
    }

    // Ensure the button is always restored if removed
    const safeguardObserver = new MutationObserver(() => {
        if (!document.getElementById("early-fullview-button")) {
            injectFullMapButton();
        }
    });
    safeguardObserver.observe(document.body, { childList: true, subtree: true });

    waitForDeltaCanvas();

    // ---- HOOKS AND FUNCTIONALITY BELOW (original content) ----

    const hookInterval = setInterval(() => {
        if (window.game && window.game.render && window.Connection && window.Connection.prototype) {
            clearInterval(hookInterval);
            console.log('[Early FullView] Game detected, hooking functions');
            hookGameFunctions();

            for (let i = 0; i < 16; i++) {
                spectators.push({
                    id: i,
                    connected: false,
                    connecting: false,
                    connection: null,
                    cells: {},
                    position: { x: 0, y: 0 },
                    keepAliveInterval: null
                });
            }

            if (window.commands && Array.isArray(window.commands)) {
                window.commands.push({
                    name: "fullview",
                    description: "Toggle full map visibility",
                    callback: () => toggleFullView()
                });
                console.log('[Early FullView] Command added');
            }
        }
    }, 1000);

    function hookGameFunctions() {
        const originalRender = window.game.render;
        window.game.render = function () {
            try {
                originalRender.apply(this, arguments);
                if (enabled) renderFullView();
            } catch (e) {
                console.error('[Early FullView] Render error:', e);
            }
        };

        const originalHandleMapInfo = window.Connection.prototype.handleMapInfo;
        window.Connection.prototype.handleMapInfo = function (data) {
            try {
                originalHandleMapInfo.call(this, data);
                if (data && data.width && data.height) {
                    borders = {
                        left: data.left,
                        right: data.right,
                        top: data.top,
                        bottom: data.bottom
                    };
                    if (enabled) positionSpectators();
                }
            } catch (e) {
                console.error('[Early FullView] Map info error:', e);
            }
        };
    }

    function toggleFullView() {
        if (enabled) {
            disableFullView();
        } else {
            enableFullView();
        }
        updateButtonState();
    }

    function enableFullView() {
        if (enabled) return;
        enabled = true;
        updateButtonState();

        spectators.forEach((spectator, index) => {
            setTimeout(() => connectSpectator(spectator), index * 150);
        });
        updateInterval = setInterval(positionSpectators, 2000);
    }

    function disableFullView() {
        if (!enabled) return;
        enabled = false;
        updateButtonState();

        spectators.forEach(spectator => {
            if (spectator.keepAliveInterval) clearInterval(spectator.keepAliveInterval);
            if (spectator.connection) spectator.connection.close();
            spectator.connected = false;
            spectator.connecting = false;
            spectator.cells = {};
        });

        if (updateInterval) clearInterval(updateInterval);
    }

    function connectSpectator(spectator) {
        if (spectator.connected || spectator.connecting) return;
        spectator.connecting = true;

        if (!window.core?.connect?.ws?.url) {
            console.log('[Early FullView] No WebSocket URL yet. Retrying...');
            setTimeout(() => { spectator.connecting = false; connectSpectator(spectator); }, 1000);
            return;
        }

        const wsUrl = window.core.connect.ws.url;
        spectator.connection = new WebSocket(wsUrl);
        spectator.connection.binaryType = 'arraybuffer';

        spectator.connection.onopen = () => {
            spectator.connected = true;
            spectator.connecting = false;
            spectator.connection.send(new Uint8Array([1]).buffer);

            spectator.keepAliveInterval = setInterval(() => {
                if (spectator.connected) {
                    spectator.connection.send(new Uint8Array([0]).buffer);
                    if (spectator.position.x && spectator.position.y) {
                        sendPositionPacket(spectator, spectator.position.x, spectator.position.y);
                    }
                }
            }, 10000);
        };

        spectator.connection.onclose = () => {
            spectator.connected = false;
            spectator.connecting = false;
            clearInterval(spectator.keepAliveInterval);
            if (enabled) setTimeout(() => connectSpectator(spectator), 2000);
        };

        spectator.connection.onmessage = (msg) => {
            if (msg.data instanceof ArrayBuffer) handleMessage(spectator, msg.data);
        };
    }

    function handleMessage(spectator, data) {
        const view = new DataView(data);
        const opcode = view.getUint8(0);
        if (opcode === 64) spectator.cells = {};
    }

    function sendPositionPacket(spectator, x, y) {
        const buf = new ArrayBuffer(13);
        const view = new DataView(buf);
        view.setUint8(0, 16);
        view.setInt32(1, x, true);
        view.setInt32(5, y, true);
        view.setUint32(9, 0, true);
        spectator.connection.send(buf);
    }

    function positionSpectators() {
        const gridSize = 4;
        const mapWidth = borders.right - borders.left;
        const mapHeight = borders.bottom - borders.top;
        const cellWidth = mapWidth / gridSize;
        const cellHeight = mapHeight / gridSize;

        spectators.forEach((spectator, i) => {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = borders.left + (col + 0.5) * cellWidth;
            const y = borders.top + (row + 0.5) * cellHeight;
            spectator.position = { x, y };
            if (spectator.connected) sendPositionPacket(spectator, x, y);
        });
    }

    function renderFullView() {
        const ctx = window.game?.ctx;
        if (!ctx) return;

        ctx.save();
        ctx.translate(window.game.camera.viewportW / 2, window.game.camera.viewportH / 2);
        ctx.scale(window.game.camera.scale, window.game.camera.scale);
        ctx.translate(-window.game.camera.x, -window.game.camera.y);
        ctx.globalAlpha = 0.5;

        spectators.forEach(spectator => {
            if (!spectator.connected) return;
            for (const id in spectator.cells) {
                const cell = spectator.cells[id];
                ctx.beginPath();
                ctx.arc(cell.x, cell.y, cell.radius, 0, 2 * Math.PI);
                ctx.fillStyle = cell.color || '#ccc';
                ctx.fill();
            }
        });

        ctx.restore();
    }

    // Ensure render hook stays active
    const ensureHooksInterval = setInterval(() => {
        if (window.game && window.game.render && !window.game.render.__hooked) {
            console.log('[Early FullView] Re-applying hooks...');
            hookGameFunctions();
            window.game.render.__hooked = true;
        }
    }, 5000);
})();
