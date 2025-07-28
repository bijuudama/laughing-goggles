import { WebSocketServer } from 'ws';
import config from './config/config.js';
import logger from './config/logger.js';
import Helper from "./utils/Helper.js";
import Client from './core/Client.js';
const server = Helper.createServer();
server.listen(config.serverSettings.port, () => {
    logger.init();
    logger.info(`Server started on port ${config.serverSettings.port}.`);
    Helper.setupProxies();
});
const wss = new WebSocketServer({ server: server });
wss.on('connection', (ws) => {
    logger.info(`Client Connected`);
    const client = new Client(ws);
    const handleDisconnect = () => {
        if (client.startedBots && !client.stoppingBots) {
            process.exit();
        }
        logger.error("Client Disconnected!");
    };
    ws.on('message', (buffer) => {
        client.handleMessage(buffer);
    });
    ws.on('close', handleDisconnect);
    ws.on('error', handleDisconnect);
});
export { Helper as getHelper, config as getConfig, logger as getLogger };
