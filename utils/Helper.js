import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { fileURLToPath } from 'url';
import { getConfig, getLogger } from "../index.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
export default class Helper {
    static proxies = [];
    static createServer() {
        if (getConfig.serverSettings.useSSL) {
            return https.createServer({
                key: fs.readFileSync('/etc/letsencrypt/live/svr.nelbots.ovh/privkey.pem'),
                cert: fs.readFileSync('/etc/letsencrypt/live/svr.nelbots.ovh/fullchain.pem'),
            });
        }
        else {
            return http.createServer();
        }
    }
    static async setupProxies() {
        if (getConfig.proxySettings.scrape) {
            await this.scrapeProxies();
        }
        else {
            this.loadProxiesFromFile();
        }
    }
    static async scrapeProxies() {
        const timeout = getConfig.proxySettings.timeout;
        const protocol = getConfig.proxySettings.protocol;
        try {
            const response = await fetch(`https://api.proxyscrape.com/v2/?request=displayproxies&protocol=${protocol}&timeout=${timeout}&country=all&ssl=all&anonymity=all`);
            if (!response.ok)
                return;
            const data = await response.text();
            this.proxies = data.split('\n').filter(proxy => proxy.trim() !== '');
            getLogger.info(`Scraped ${this.proxies.length} proxies.`);
        }
        catch (error) {
            getLogger.error(`Error scraping proxies: ${error.message}`);
            this.loadProxiesFromFile();
        }
    }
    static loadProxiesFromFile() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, '../proxies.txt');
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            this.proxies = data.split('\n').filter(proxy => proxy.trim() !== '');
            getLogger.info(`Loaded ${this.proxies.length} proxies from proxies.txt.`);
        }
        catch (error) {
            getLogger.error(`Error reading proxies from file: ${error.message}`);
        }
    }
    static getProxy() {
        if (!getConfig.proxySettings.enableProxy)
            return undefined;
        if (!this.proxies) {
            this.setupProxies();
        }
        const protocol = getConfig.proxySettings.protocol;
        const proxy = this.proxies.shift();
        this.proxies.push(proxy);
        switch (protocol) {
            case 'http':
            case 'https': return new HttpsProxyAgent(`${protocol}://${proxy}`);
            case 'socks4':
            case 'socks5': return new SocksProxyAgent(`${protocol}://${proxy}`);
            default: return new HttpsProxyAgent(`${protocol}://${proxy}`);
        }
    }
    static generateHeaders(server) {
        const langs = [
            ['en-US', 'en'],
            ['en-GB', 'en'],
            ['fr-FR', 'fr'],
            ['de-DE', 'de'],
        ];
        const host = new URL(server).host;
        const lang = langs[Math.floor(Math.random() * langs.length)];
        const weight = Math.max(0.1, Math.random() * 0.9).toFixed(1);
        return {
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': `${lang[0]},${lang[1]};q=${weight}`,
            'Pragma': 'no-cache',
            'Connection': 'Upgrade',
            'Cache-Control': 'no-cache',
            'Host': host,
            'Origin': 'https://agar.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
        };
    }
    static wn4l(wn4l) {
        const validNames = [atob('RXZvQm90cw==')];
        if (!validNames.every(name => wn4l.includes(name))) {
            getLogger.error("Please do not change EvoBots in the botName array!");
            process.exit(1);
        }
    }
    static encodeVLQ(length) {
        const result = [];
        while (length > 127) {
            result.push((length & 127) | 128);
            length >>>= 7;
        }
        result.push(length);
        return result;
    }
    static getRealSize(size) {
        return size * size / 100;
    }
    static calculateDistance(botX, botY, targetX, targetY) {
        return Math.hypot(targetX - botX, targetY - botY);
    }
    static rotateKey(key) {
        key = Math.imul(key, 1540483477) >> 0;
        key = (Math.imul(key >>> 24 ^ key, 1540483477) >> 0) ^ 114296087;
        key = Math.imul(key >>> 13 ^ key, 1540483477) >> 0;
        return key >>> 15 ^ key;
    }
    static xorBuffer(buffer, key) {
        for (let i = 0; i < buffer.byteLength; i++)
            buffer.writeUInt8(buffer.readUInt8(i) ^ key >>> (i % 4 * 8) & 255, i);
        return buffer;
    }
    static uncompressMessage(input, output) {
        for (let i = 0, j = 0; i < input.length;) {
            const byte = input[i++];
            let literalsLength = byte >> 4;
            if (literalsLength > 0) {
                let length = literalsLength + 240;
                while (length === 255) {
                    length = input[i++];
                    literalsLength += length;
                }
                ;
                const end = i + literalsLength;
                while (i < end)
                    output[j++] = input[i++];
                if (i === input.length)
                    return output;
            }
            ;
            const offset = input[i++] | (input[i++] << 8);
            if (offset === 0 || offset > j)
                return -(i - 2);
            let matchLength = byte & 15;
            let length = matchLength + 240;
            while (length === 255) {
                length = input[i++];
                matchLength += length;
            }
            ;
            let pos = j - offset;
            const end = j + matchLength + 4;
            while (j < end)
                output[j++] = output[pos++];
        }
        return output;
    }
    static murmur2(str, seed) {
        let l = str.length, h = seed ^ l, i = 0, k;
        while (l >= 4) {
            k =
                (str.charCodeAt(i) & 0xff) |
                    ((str.charCodeAt(++i) & 0xff) << 8) |
                    ((str.charCodeAt(++i) & 0xff) << 16) |
                    ((str.charCodeAt(++i) & 0xff) << 24);
            k =
                (k & 0xffff) * 0x5bd1e995 +
                    ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
            k ^= k >>> 24;
            k =
                (k & 0xffff) * 0x5bd1e995 +
                    ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
            h =
                ((h & 0xffff) * 0x5bd1e995 +
                    ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
                    k;
            l -= 4;
            ++i;
        }
        switch (l) {
            case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
            case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
            case 1:
                h ^= str.charCodeAt(i) & 0xff;
                h =
                    (h & 0xffff) * 0x5bd1e995 +
                        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
        }
        h ^= h >>> 13;
        h =
            (h & 0xffff) * 0x5bd1e995 +
                ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
        h ^= h >>> 15;
        return h >>> 0;
    }
}
