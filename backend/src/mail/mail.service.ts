import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getTransporter(): { transporter: nodemailer.Transporter | null; senderEmail: string } {
    // Reload dotenv dynamically so changes to .env take effect immediately without needing server restart
    try {
      require('dotenv').config({ override: true });
    } catch (e) {
      // Ignore in production
    }

    const rawUser = process.env.MAIL_USER?.trim() || '';
    // Strip all whitespace from the app password because Google generates 16-char passwords with spaces (e.g. "abcd efgh ijkl mnop")
    const rawPass = (process.env.MAIL_PASS || '').replace(/\s+/g, '');

    const isPlaceholder =
      !rawUser ||
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

  async sendPasswordResetEmail(to: string, code: string): Promise<{ success: boolean; message: string }> {
    const { transporter, senderEmail } = this.getTransporter();

    if (!transporter) {
      this.logger.warn(
        `[MailService] AVISO: Credenciales MAIL_USER o MAIL_PASS no configuradas en .env.`,
      );
      this.logger.warn(
        `[MailService] 👉 CÓDIGO DE RECUPERACIÓN PARA [${to}]: ${code} (Expira en 15 min)`,
      );
      return {
        success: false,
        message: 'Credenciales de correo no configuradas en el servidor.',
      };
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0c; color: #ffffff; padding: 40px 32px; border-radius: 20px; border: 1px solid #27272a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #a855f7; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; margin: 0;">OZIRIS</h1>
          <p style="color: #71717a; font-size: 13px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em;">Plataforma de Producción Musical</p>
        </div>
        
        <div style="background: #121218; border: 1px solid #27272a; border-radius: 16px; padding: 28px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Restablecer tu contraseña</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Has solicitado restablecer la contraseña de tu cuenta en OZIRIS. Usa el siguiente código de verificación de 6 dígitos:
          </p>
          
          <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15)); border: 1.5px solid #a855f7; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #c084fc; font-family: monospace; display: inline-block; padding-left: 12px;">${code}</span>
          </div>

          <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 0;">
            ⏱️ Este código expirará en <strong style="color: #e4e4e7;">15 minutos</strong>.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #1f1f23; padding-top: 20px;">
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará.
          </p>
          <p style="color: #52525b; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Oziris Music. Todos los derechos reservados.
          </p>
        </div>
      </div>
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
    } catch (error: any) {
      this.logger.error(`[MailService] Error enviando correo a ${to}:`, error?.message || error);
      return { success: false, message: error?.message || 'Error al enviar correo.' };
    }
  }
}

