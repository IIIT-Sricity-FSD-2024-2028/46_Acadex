"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}
function getTodayLogFile() {
    const today = new Date().toISOString().slice(0, 10);
    return path.join(LOGS_DIR, `${today}.log`);
}
function writeToFile(line) {
    try {
        fs.appendFileSync(getTodayLogFile(), line + '\n');
    }
    catch (_) {
    }
}
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        const start = Date.now();
        const { method, originalUrl, ip } = req;
        res.on('finish', () => {
            const ms = Date.now() - start;
            const status = res.statusCode;
            const ts = new Date().toISOString();
            const line = `[${ts}] ${method} ${originalUrl} ${status} ${ms}ms - IP: ${ip}`;
            console.log(`[Logger] ${line}`);
            writeToFile(line);
        });
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
//# sourceMappingURL=logger.middleware.js.map