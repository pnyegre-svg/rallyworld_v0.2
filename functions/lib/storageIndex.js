"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDeleted = exports.fileIndexed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin_1 = require("./admin");
// Helper: base64url doc id from full path
function encodePath(p) {
    return Buffer.from(p).toString('base64url');
}
// Extract eventId and first-level folder from: events/{eventId}/docs/{folder}/{file...}
function parsePath(p) {
    if (!p)
        return null;
    const m = p.match(/^events\/([^/]+)\/docs\/(.+)$/);
    if (!m)
        return null;
    const eventId = m[1];
    const rest = m[2];
    const folder = rest.split('/')[0] || 'root';
    const name = p.split('/').pop() || '';
    return { eventId, folder, name, fullPath: p };
}
exports.fileIndexed = functions.storage.object().onFinalize(async (obj) => {
    const meta = parsePath(obj.name || '');
    if (!meta)
        return;
    const { eventId, folder, name, fullPath } = meta;
    const timeCreated = obj.timeCreated ? new Date(obj.timeCreated) : new Date();
    const doc = {
        eventId,
        path: fullPath,
        folder, // "maps" | "bulletins" | "regulations" | ...
        name,
        size: obj.size ? Number(obj.size) : 0,
        contentType: obj.contentType || 'application/octet-stream',
        timeCreated, // Firestore Timestamp (from Admin) when stored
        updatedAt: admin_1.FieldValue.serverTimestamp(),
    };
    await admin_1.db.collection('events').doc(eventId)
        .collection('files').doc(encodePath(fullPath))
        .set(doc, { merge: true });
});
exports.fileDeleted = functions.storage.object().onDelete(async (obj) => {
    const meta = parsePath(obj.name || '');
    if (!meta)
        return;
    const { eventId, fullPath } = meta;
    await admin_1.db.collection('events').doc(eventId)
        .collection('files').doc(encodePath(fullPath))
        .delete().catch(() => { });
});
