import nodemailer from 'nodemailer';
import { config } from 'dotenv';

const startConfig = config();


class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Account activation on ' + process.env.API_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>To activate your account follow the link:</h1>
                        <a href='${link}'>${link}</a>
                    </div>
                `,
        });
    }

    async sendAConfirmationCode(to, code) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Confirmation code',
            text: '',
            html:
                `
                    <div>
                        <h1>Your password recovery confirmation code:</h1>
                        <div>${code}</div>
                    </div>
                `,
        });
    }
}

export const mailService = new MailService();