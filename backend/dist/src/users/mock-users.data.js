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
exports.INITIAL_USERS = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const defaultUserHash = bcrypt.hashSync('Oziris123!', 10);
const defaultAdminHash = bcrypt.hashSync('AdminOziris123!', 10);
exports.INITIAL_USERS = [
    {
        id: 'user-test-1',
        name: 'Usuario Prueba 1',
        lastName: 'Pérez',
        artistName: 'Producer One',
        location: 'Medellín, Colombia',
        avatarUrl: null,
        email: 'usuario1@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Productor apasionado por el Trap y Reggaeton.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-test-2',
        name: 'Usuario Prueba 2',
        lastName: 'Gómez',
        artistName: 'BeatMaker X',
        location: 'Bogotá, Colombia',
        avatarUrl: null,
        email: 'usuario2@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Creador de sonidos urbanos.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-test-3',
        name: 'Usuario Prueba 3',
        lastName: 'Rodríguez',
        artistName: 'Oziris Producer',
        location: 'Miami, USA',
        avatarUrl: null,
        email: 'usuario3@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Usuario de prueba 3 en la plataforma.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-admin-1',
        name: 'Administrador Oziris',
        lastName: 'Admin',
        artistName: 'Oziris Master',
        location: 'Central Office',
        avatarUrl: null,
        email: 'admin@oziris.test',
        password: defaultAdminHash,
        role: 'ADMIN',
        isActive: true,
        bio: 'Administrador principal de OZIRIS platform.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
//# sourceMappingURL=mock-users.data.js.map