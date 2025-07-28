import Writer from "../utils/Writer.js";
import { getConfig } from "../index.js";
const buffers = {
    protocolVersion: function () {
        const writer = new Writer(5);
        writer.writeUint8(254);
        writer.writeUint32(23);
        return writer.buffer;
    },
    protocolKey: function () {
        const writer = new Writer(5);
        writer.writeUint8(255);
        writer.writeUint32(31122);
        return writer.buffer;
    },
    activateMassBoost: function () {
        // Deleted
    },
    collectFreeCoins: function () {
        // Deleted
    },
    buyMassBoost: function () {
        // Deleted
    },
    openPotion: function (slot) {
        // Deleted
    },
    brewPotion: function (slot) {
        // Deleted
    },
    FBToken: function (token, isFacebook) {
        // Deleted
    },
    spawn: function () {
        const randomIndex = Math.floor(Math.random() * getConfig.botName.length);
        const randomName = getConfig.botName[randomIndex];
        const writer = new Writer(3 * randomName.length);
        writer.writeUint8(0);
        writer.writeString(randomName);
        return writer.buffer;
    },
    split: function () {
        return Buffer.from([17]);
    },
    eject: function () {
        return Buffer.from([21]);
    },
    moveTo: function (x, y, key) {
        const writer = new Writer(13);
        writer.writeUint8(16);
        writer.writeInt32(x);
        writer.writeInt32(y);
        writer.writeUint32(key);
        return writer.buffer;
    },
    sendInfo: function (string) {
        const writer = new Writer(3 * string.length);
        writer.writeUint8(0);
        writer.writeString(string);
        return writer.buffer;
    },
};
export default buffers;
