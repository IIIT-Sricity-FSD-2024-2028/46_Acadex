"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}
function writeErrorToFile(line) {
    try {
        const filePath = path.join(LOGS_DIR, 'errors.log');
        fs.appendFileSync(filePath, line + '\n');
    }
    catch (_) { }
}
let ErrorHandlerMiddleware = class ErrorHandlerMiddleware {
    use(req, res, next) {
        try {
            next();
        }
        catch (err) {
            const ts = new Date().toISOString();
            const msg = err?.message || 'Unknown error';
            const line = `[${ts}] ERROR ${req.method} ${req.originalUrl} - ${msg}`;
            console.error(`[ErrorHandler] ${line}`);
            writeErrorToFile(line);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    statusCode: 500,
                    message: 'Internal server error',
                    timestamp: ts,
                    path: req.originalUrl,
                });
            }
        }
    }
};
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware = __decorate([
    (0, common_1.Injectable)()
], ErrorHandlerMiddleware);
//# sourceMappingURL=error-handler.middleware.js.map