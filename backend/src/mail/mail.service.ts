import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow('SMTP_HOST'),
      port: Number(this.config.getOrThrow('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.config.getOrThrow('SMTP_USER'),
        pass: this.config.getOrThrow('SMTP_PASS'),
      },
    });
  }

  async sendTwoFactorCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: this.config.getOrThrow('SMTP_FROM'),
      to,
      subject: 'Votre code de connexion',
      html: `
        <p>Votre code de vérification est :</p>
        <h2 style="letter-spacing: 8px">${code}</h2>
        <p>Ce code expire dans 10 minutes.</p>
      `,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const appUrl = this.config.getOrThrow('APP_URL');
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.config.getOrThrow('SMTP_FROM'),
      to,
      subject: 'Vérifiez votre adresse email',
      html: `
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${link}">${link}</a>
        <p>Ce lien expire dans 24h.</p>
      `,
    });
  }
}
