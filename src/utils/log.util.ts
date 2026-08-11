import * as fs from 'fs';
import * as path from 'path';
import correlator from 'express-correlation-id';

export class Logger {
    private _shouldWriteToFile = false;
    private _path = path.resolve(__dirname, '../logs');

    set pathToWrite(p: string) {
        this._path = p;
    }
    set shouldWriteToFile(flag: boolean) {
        this._shouldWriteToFile = flag;
    }

    private getFileName(): string {
        const date = new Date();
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.log`;
    }

    private ensureLogDir() {
        if (!fs.existsSync(this._path)) fs.mkdirSync(this._path, { recursive: true });
    }

    log(message: string | object, reqId?: string) {
        const msg = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        const prefix = `[PID:${process.pid}][ReqID:${reqId ?? correlator.getId() ?? 'N/A'}] `;
        const formatted = `${new Date().toISOString()} ${prefix}${msg}\n`;

        if (this._shouldWriteToFile) {
            this.ensureLogDir();
            fs.appendFile(path.join(this._path, this.getFileName()), formatted, (err) => {
                if (err) console.error('Failed to write log:', err);
            });
        } else {
            console.log(formatted);
        }
    }

    info(message: string | object, reqId?: string) {
        this.log(`[INFO] ${message}`, reqId);
    }
    error(message: string | object, reqId?: string) {
        this.log(`[ERROR] ${message}`, reqId);
    }
    warn(message: string | object, reqId?: string) {
        this.log(`[WARN] ${message}`, reqId);
    }
}

export const logger = new Logger();
