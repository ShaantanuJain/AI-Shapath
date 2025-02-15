"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatLogSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true }, // Unique session ID
    messages: [
        {
            role: { type: String, required: true }, // 'user' or 'bot'
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});
exports.ChatLog = mongoose_1.default.model("ChatLog", chatLogSchema);
