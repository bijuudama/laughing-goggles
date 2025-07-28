export default class Reader {
    buffer;
    byteOffset;
    constructor(buffer) {
        this.buffer = buffer;
        this.byteOffset = 0;
    }
    readInt8() {
        return this.buffer.readInt8(this.byteOffset++);
    }
    readInt16() {
        const value = this.buffer.readInt16LE(this.byteOffset);
        this.byteOffset += 2;
        return value;
    }
    readInt32() {
        const value = this.buffer.readInt32LE(this.byteOffset);
        this.byteOffset += 4;
        return value;
    }
    readUint8() {
        return this.buffer.readUint8(this.byteOffset++);
    }
    readUint16() {
        const value = this.buffer.readUInt16LE(this.byteOffset);
        this.byteOffset += 2;
        return value;
    }
    readUint32() {
        const value = this.buffer.readUInt32LE(this.byteOffset);
        this.byteOffset += 4;
        return value;
    }
    readDouble() {
        const value = this.buffer.readDoubleLE(this.byteOffset);
        this.byteOffset += 8;
        return value;
    }
    readString() {
        let string = '';
        while (true) {
            const charCode = this.readUint8();
            if (charCode === 0)
                break;
            string += String.fromCharCode(charCode);
        }
        return string;
    }
    readUTF8String() {
        let bytes = [];
        let byte;
        while ((byte = this.readUint8()) !== 0) {
            bytes.push(byte);
        }
        return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    }
    skipBytes(byte) {
        this.byteOffset += byte;
    }
}
