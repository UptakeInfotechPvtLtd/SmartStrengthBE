import { BadRequestException, getEnv } from '../utils';
import type { WhatsAppBookingTemplateData, WhatsAppContactCheckResponse } from '../config';
import { messages } from '../lang/api-messages';

export class WhatsAppContactService {
    /**
     * Verify that an Indian mobile number is registered on WhatsApp.
     *
     * The application accepts the number in +91XXXXXXXXXX format, but the WP
     * endpoint expects only the ten-digit national number.
     */
    async ensureNumberExists(phoneNumber: string): Promise<void> {
        const mobileNumber = this.toNationalNumber(phoneNumber);
        const result = await this.checkContact(mobileNumber);

        if (!result.exists) {
            throw new BadRequestException(messages.whatsAppNumberUnavailable);
        }
    }

    async sendBookingConfirmation(
        phoneNumber: string,
        vars: WhatsAppBookingTemplateData,
        imageBase64: string,
    ): Promise<void> {
        const mobileNumber = `91${this.toNationalNumber(phoneNumber)}`;
        const contact = await this.checkContact(mobileNumber);

        if (!contact.exists || !contact.whatsappId) {
            throw new BadRequestException(messages.whatsAppBookingNumberUnavailable);
        }

        const baseUrl = getEnv('WP_BASE_URL')?.trim().replace(/\/+$/, '');
        const sessionId = getEnv('WP_SESSION_ID')?.trim();
        const apiKey = getEnv('WP_API_KEY')?.trim();
        const templateId = getEnv('WP_BOOKING_TEMPLATE_ID')?.trim();

        if (!baseUrl || !sessionId || !apiKey || !templateId) {
            throw new BadRequestException(messages.whatsAppBookingNotConfigured);
        }

        const response = await this.request(
            `${baseUrl}/sessions/${encodeURIComponent(sessionId)}/messages/send-template`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    chatId: contact.whatsappId,
                    templateId,
                    templateName: 'booking-confirmation',
                    vars,
                    imageBase64: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                    mimetype: 'image/png',
                    imageFilename: `booking-${vars.bookingId}-qr.png`,
                }),
            },
        );

        if (!response.ok) {
            throw new BadRequestException(messages.whatsAppTemplateApiFailed(response.status));
        }
    }

    private async checkContact(mobileNumber: string): Promise<WhatsAppContactCheckResponse> {
        const baseUrl = getEnv('WP_BASE_URL')?.trim().replace(/\/+$/, '');
        const sessionId = getEnv('WP_SESSION_ID')?.trim();
        const apiKey = getEnv('WP_API_KEY')?.trim();

        if (!baseUrl || !sessionId || !apiKey) {
            throw new BadRequestException(messages.whatsAppVerificationNotConfigured);
        }

        let response: Response;
        try {
            response = await this.request(
                `${baseUrl}/sessions/${encodeURIComponent(sessionId)}` +
                    `/contacts/check/${mobileNumber}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'x-api-key': apiKey,
                    },
                },
            );
        } catch {
            throw new BadRequestException(
                messages.whatsAppVerificationUnavailable,
            );
        }

        if (response.status === 401 || response.status === 403) {
            throw new BadRequestException(messages.whatsAppAuthenticationFailed);
        }

        if (!response.ok) {
            throw new BadRequestException(
                messages.whatsAppVerificationUnavailable,
            );
        }

        let result: WhatsAppContactCheckResponse;
        try {
            result = (await response.json()) as WhatsAppContactCheckResponse;
        } catch {
            throw new BadRequestException(
                messages.whatsAppInvalidResponse,
            );
        }

        if (typeof result.exists !== 'boolean') {
            throw new BadRequestException(
                messages.whatsAppInvalidResponse,
            );
        }

        return result;
    }

    private request(url: string, options: RequestInit): Promise<Response> {
        return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10_000),
        });
    }

    private toNationalNumber(phoneNumber: string): string {
        const compactNumber = phoneNumber.trim().replace(/[\s()-]/g, '');
        const mobileNumber = compactNumber.startsWith('+91')
            ? compactNumber.slice(3)
            : compactNumber;

        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            throw new BadRequestException(
                messages.indianMobileNumberInvalid,
            );
        }

        return mobileNumber;
    }
}
