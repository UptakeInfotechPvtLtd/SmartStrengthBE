import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getEnv } from './env.utils';
import { ISendEmailParams } from '../config';
import { messages } from '../lang/api-messages';
import { BadRequestException } from './error';
import { logger } from './log.util';

dotenv.config();

export class EmailService {
    /**
     * Create Nodemailer transporter
     */
    static createTransporter() {
        return nodemailer.createTransport({
            service: getEnv('EMAIL_SERVICE') || 'gmail',
            auth: {
                user: getEnv('EMAIL_USER'),
                pass: getEnv('EMAIL_PASS'),
            },
        });
    }

    /**
     * Prepare HTML template with dynamic variables
     */
    static prepareHtml(templateFile: string, variables: Record<string, any> = {}): string {
        const templatePath = path.join(__dirname, templateFile);
        let htmlContent = fs.readFileSync(templatePath, 'utf-8');

        for (const key in variables) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            htmlContent = htmlContent.replace(regex, variables[key]);
        }

        return htmlContent;
    }

    /**
     * Send email
     */
    static async sendEmail({
        to,
        subject,
        text = '',
        html = '',
        attachments = [],
    }: ISendEmailParams) {
        if (!['1', 'true'].includes(getEnv('IS_EMAIL_SEND').toLowerCase())) {
            logger.info(`[Email] skipped because IS_EMAIL_SEND is disabled. To: ${to}`);
            return { success: true, message: messages.emailSendingDisabled };
        }

        const transporter = this.createTransporter();

        const mailOptions = {
            from: `"${getEnv('EMAIL_NAME')}" <${getEnv('EMAIL_USER')}>`,
            to,
            subject,
            text,
            html,
            attachments,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            logger.info(`[Email] sent to ${to}: ${info.response}`);
            return { success: true, message: messages.emailSent(to) };
        } catch (error: any) {
            logger.error(`[Email] send failed to ${to}: ${error?.message}`);
            throw new BadRequestException(messages.emailSendFailed(error.message));
        }
    }
}
