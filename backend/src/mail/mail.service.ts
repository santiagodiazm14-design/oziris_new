import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    this.logger.log('Gmail Mail service initialized');
  }

  async sendPasswordResetEmail(to: string, code: string) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #c084fc; margin-bottom: 8px;">Oziris</h1>
        <h2 style="color: #fff; font-size: 22px;">Restablecer Contraseña</h2>
        <p style="color: #a1a1aa;">Has solicitado restablecer tu contraseña. Ingresa el siguiente código en la aplicación:</p>
        <div style="background: #1a1a2e; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #c084fc;">${code}</span>
        </div>
        <p style="color: #71717a; font-size: 14px;">Este código expirará en <strong style="color: #fff;">15 minutos</strong>.</p>
        <p style="color: #71717a; font-size: 14px;">Si no solicitaste esto, puedes ignorar este correo.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"Oziris App" <' + process.env.MAIL_USER + '>',
        to,
        subject: 'Tu código de recuperación - Oziris',
        text: 'Tu código de recuperación es: ' + code,
        html: htmlContent,
      });

      this.logger.log('Email enviado a: ' + to + ' | ID: ' + info.messageId);
    } catch (error) {
      this.logger.error('Error al enviar el correo', error);
    }
  }
}
