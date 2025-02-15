"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChatLog_1 = require("../models/ChatLog");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// Start a new chat session
router.post("/start", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const sessionId = (0, uuid_1.v4)(); // Generate a new session ID
        res.status(201).json({ sessionId });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to start a new session" });
    }
}));
// Save a chat log for a session
router.post("/save", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, sessionId, messages } = req.body;
        const chatLog = new ChatLog_1.ChatLog({ userId, sessionId, messages });
        yield chatLog.save();
        res.status(201).json(chatLog);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save chat log" });
    }
}));
// Get chat logs for a user
router.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatLogs = yield ChatLog_1.ChatLog.find({ userId: req.params.userId });
        res.json(chatLogs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve chat logs" });
    }
}));
// Get chat logs for a specific session
router.get("/:userId/:sessionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, sessionId } = req.params;
        const chatLogs = yield ChatLog_1.ChatLog.find({ userId, sessionId });
        res.json(chatLogs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve session chat logs" });
    }
}));
exports.default = router;
