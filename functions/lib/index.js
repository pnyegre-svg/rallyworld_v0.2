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
exports.processScheduledAnnouncements = exports.midnightRebuild = exports.scheduledRefresh = exports.delayStage = exports.cancelStage = exports.completeStage = exports.startStage = exports.deleteStage = exports.updateStage = exports.createStage = exports.fileDeleted = exports.fileIndexed = exports.recomputeDashboard = exports.deleteEvent = exports.deleteAnnouncement = exports.pinAnnouncement = exports.publishAnnouncement = exports.updateAnnouncement = exports.createAnnouncement = exports.markEntryPaid = exports.approveEntry = exports.eventChanged = exports.announcementChanged = exports.stageChanged = exports.entryChanged = void 0;
const functions = __importStar(require("firebase-functions"));
const triggers_1 = require("./triggers");
Object.defineProperty(exports, "processScheduledAnnouncements", { enumerable: true, get: function () { return triggers_1.processScheduledAnnouncements; } });
const callables_1 = require("./callables");
Object.defineProperty(exports, "approveEntry", { enumerable: true, get: function () { return callables_1.approveEntry; } });
Object.defineProperty(exports, "markEntryPaid", { enumerable: true, get: function () { return callables_1.markEntryPaid; } });
Object.defineProperty(exports, "createAnnouncement", { enumerable: true, get: function () { return callables_1.createAnnouncement; } });
Object.defineProperty(exports, "updateAnnouncement", { enumerable: true, get: function () { return callables_1.updateAnnouncement; } });
Object.defineProperty(exports, "publishAnnouncement", { enumerable: true, get: function () { return callables_1.publishAnnouncement; } });
Object.defineProperty(exports, "pinAnnouncement", { enumerable: true, get: function () { return callables_1.pinAnnouncement; } });
Object.defineProperty(exports, "deleteAnnouncement", { enumerable: true, get: function () { return callables_1.deleteAnnouncement; } });
Object.defineProperty(exports, "deleteEvent", { enumerable: true, get: function () { return callables_1.deleteEvent; } });
Object.defineProperty(exports, "recomputeDashboard", { enumerable: true, get: function () { return callables_1.recomputeDashboard; } });
const storageIndex_1 = require("./storageIndex");
Object.defineProperty(exports, "fileIndexed", { enumerable: true, get: function () { return storageIndex_1.fileIndexed; } });
Object.defineProperty(exports, "fileDeleted", { enumerable: true, get: function () { return storageIndex_1.fileDeleted; } });
const stages_1 = require("./stages");
Object.defineProperty(exports, "createStage", { enumerable: true, get: function () { return stages_1.createStage; } });
Object.defineProperty(exports, "updateStage", { enumerable: true, get: function () { return stages_1.updateStage; } });
Object.defineProperty(exports, "deleteStage", { enumerable: true, get: function () { return stages_1.deleteStage; } });
Object.defineProperty(exports, "startStage", { enumerable: true, get: function () { return stages_1.startStage; } });
Object.defineProperty(exports, "completeStage", { enumerable: true, get: function () { return stages_1.completeStage; } });
Object.defineProperty(exports, "cancelStage", { enumerable: true, get: function () { return stages_1.cancelStage; } });
Object.defineProperty(exports, "delayStage", { enumerable: true, get: function () { return stages_1.delayStage; } });
exports.entryChanged = functions.firestore
    .document('events/{eventId}/entries/{entryId}')
    .onWrite(triggers_1.onEntryWrite);
exports.stageChanged = functions.firestore
    .document('events/{eventId}/stages/{stageId}')
    .onWrite(triggers_1.onStageWrite);
exports.announcementChanged = functions.firestore
    .document('events/{eventId}/announcements/{annId}')
    .onWrite(triggers_1.onAnnouncementWrite);
exports.eventChanged = functions.firestore
    .document('events/{eventId}')
    .onWrite(triggers_1.onEventWrite);
exports.scheduledRefresh = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(triggers_1.refreshAllForToday);
exports.midnightRebuild = functions.pubsub
    .schedule('0 3 * * *')
    .timeZone('Etc/UTC')
    .onRun(triggers_1.refreshAllForToday);
