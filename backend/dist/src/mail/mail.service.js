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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    getTransporter() {
        try {
            require('dotenv').config({ override: true });
        }
        catch (e) {
        }
        const rawUser = process.env.MAIL_USER?.trim() || '';
        const rawPass = (process.env.MAIL_PASS || '').replace(/\s+/g, '');
        const isPlaceholder = !rawUser ||
            !rawPass ||
            rawUser.includes('tu_correo@gmail.com') ||
            rawPass.includes('tu_contraseña_de_aplicacion');
        if (isPlaceholder) {
            return { transporter: null, senderEmail: '' };
        }
        if (process.env.MAIL_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT) || 587,
                secure: process.env.MAIL_SECURE === 'true',
                auth: {
                    user: rawUser,
                    pass: rawPass,
                },
            });
            return { transporter, senderEmail: rawUser };
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: rawUser,
                pass: rawPass,
            },
        });
        return { transporter, senderEmail: rawUser };
    }
    async sendPasswordResetEmail(to, code) {
        const { transporter, senderEmail } = this.getTransporter();
        if (!transporter) {
            this.logger.warn(`[MailService] AVISO: Credenciales MAIL_USER o MAIL_PASS no configuradas en .env.`);
            this.logger.warn(`[MailService] 👉 CÓDIGO DE RECUPERACIÓN PARA [${to}]: ${code} (Expira en 15 min)`);
            return {
                success: false,
                message: 'Credenciales de correo no configuradas en el servidor.',
            };
        }
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - Oziris</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #06090c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #06090c; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #0f151c; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
                
                <!-- Cabecera / Marca -->
                <tr>
                  <td align="center" style="padding: 36px 32px 24px 32px; background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 21, 28, 0) 100%);">
                    <div style="display: inline-block; letter-spacing: 6px; font-size: 28px; font-weight: 900; color: #ffffff; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      O<span style="color: #10b981;">Z</span>IRIS
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin-top: 6px; font-weight: 600;">
                      Plataforma de Audio & Producción
                    </div>
                  </td>
                </tr>

                <!-- Contenido Principal -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <!-- Badge de Seguridad -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; text-transform: uppercase;">
                        Seguridad de la Cuenta
                      </span>
                    </div>

                    <!-- Título -->
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center; letter-spacing: -0.02em;">
                      Recuperación de Contraseña
                    </h1>
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Has solicitado restablecer la contraseña de acceso a tu cuenta en <strong style="color: #ffffff;">OZIRIS</strong>. Ingresa el siguiente código de verificación de 6 dígitos en la aplicación:
                    </p>

                    <!-- Caja del Código -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%); border: 1.5px solid #10b981; border-radius: 16px; padding: 22px 12px;">
                          <div style="font-family: 'SF Mono', Consolas, Menlo, Monaco, 'Courier New', monospace; font-size: 42px; font-weight: 800; letter-spacing: 14px; color: #10b981; display: inline-block; padding-left: 14px; text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
                            ${code}
                          </div>
                          <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">
                            Código de Verificación de un Solo Uso
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiración -->
                    <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; text-align: center;">
                      <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">
                        ⏱️ Este código expirará en <strong style="color: #34d399;">15 minutos</strong>.
                      </p>
                    </div>

                    <!-- Mensaje preventivo -->
                    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                      Si tú no solicitaste este cambio, puedes ignorar este mensaje con total seguridad. Tu contraseña actual no será modificada y tu cuenta permanece segura.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); background-color: #0b0f14;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 6px 0; font-weight: 500;">
                      OZIRIS Music Platform • Sonido de Estudio Profesional
                    </p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">
                      © ${new Date().getFullYear()} Oziris. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
        try {
            const info = await transporter.sendMail({
                from: `"Oziris Music" <${senderEmail}>`,
                to,
                subject: `Tu código de recuperación es ${code} - Oziris`,
                text: `Tu código de recuperación de contraseña para Oziris es: ${code}. Válido por 15 minutos.`,
                html: htmlContent,
            });
            this.logger.log(`[MailService] Correo enviado exitosamente a: ${to} (Message ID: ${info.messageId})`);
            return { success: true, message: 'Correo enviado exitosamente.' };
        }
        catch (error) {
            this.logger.error(`[MailService] Error enviando correo a ${to}:`, error?.message || error);
            return { success: false, message: error?.message || 'Error al enviar correo.' };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map