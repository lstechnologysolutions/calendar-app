import nodemailer from 'nodemailer';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { SentMessageInfo } from 'nodemailer';
import { activateLocale } from '@/i18n';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    icalEvent?: {
        filename: string;
        content: string;
    };
}

export class EmailService {
    private transporter: nodemailer.Transporter;
    private static instance: EmailService;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: parseInt(process.env.NODEMAILER_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
            // Add connection timeout
            connectionTimeout: 10000, // 10 seconds
            // Add TLS options
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            },
            requireTLS: true,
        })
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    public async sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: `"${process.env.NODEMAILER_FROM || 'LSTS Calendar App'}" <${process.env.NODEMAILER_FROM || 'hi@lststech.solutions'}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                icalEvent: options.icalEvent ? {
                    filename: options.icalEvent.filename,
                    content: options.icalEvent.content,
                    method: 'REQUEST',
                } : undefined,
            };

            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    public async sendCalendarEventConfirmation(
        to: string,
        eventDetails: {
            title: string;
            startTime: string;
            endTime: string;
            timeZone: string;
            description?: string;
            location?: string;
            organizer?: { name: string; email: string };
        },
        locale: string = 'en'
    ): Promise<SentMessageInfo> {
        // Activate the requested locale for this request
        await activateLocale(locale);

        const startDate = new Date(eventDetails.startTime);
        const endDate = new Date(eventDetails.endTime);

        // Format dates for display
        const formattedDate = startDate.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const formattedTime = startDate.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });

        // Create iCalendar event
        const icalEvent = this.createICalEvent({
            start: eventDetails.startTime,
            end: eventDetails.endTime,
            summary: eventDetails.title,
            description: eventDetails.description || '',
            location: eventDetails.location || '',
            organizer: eventDetails.organizer,
            timezone: eventDetails.timeZone,
        });

        // Render email template
        const emailHtml = this.renderConfirmationEmail({
            title: eventDetails.title,
            date: formattedDate,
            time: formattedTime,
            description: eventDetails.description,
            location: eventDetails.location,
            organizerName: eventDetails.organizer?.name,
            icalEvent: icalEvent.toString(),
        }, locale);

        // Send email with translated subject using Lingui
        return this.sendEmail({
            to,
            subject: i18n._(t`Your Event: ${eventDetails.title}`),
            html: emailHtml,
            icalEvent: {
                filename: 'event.ics',
                content: icalEvent.toString(),
            },
        });
    }

    private createICalEvent(event: {
        start: string;
        end: string;
        summary: string;
        description: string;
        location: string;
        organizer?: { name: string; email: string };
        timezone: string;
    }): string {
        // Simple iCalendar format (RFC 5545)
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Calendar App//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            `DTSTART;TZID=${event.timezone}:${this.formatDateForICal(event.start)}`,
            `DTEND;TZID=${event.timezone}:${this.formatDateForICal(event.end)}`,
            `DTSTAMP:${this.formatDateForICal(new Date().toISOString())}`,
            `UID:${Date.now()}@calendar-app`,
            `DESCRIPTION:${this.escapeICalText(event.description || '')}`,
            `LOCATION:${this.escapeICalText(event.location || '')}`,
            `SUMMARY:${this.escapeICalText(event.summary)}`,
            event.organizer ? `ORGANIZER;CN="${this.escapeICalText(event.organizer.name)}":mailto:${event.organizer.email}` : '',
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT',
            'END:VCALENDAR',
        ].filter(Boolean).join('\r\n');
    }

    private formatDateForICal(dateString: string): string {
        const date = new Date(dateString);
        return [
            date.getUTCFullYear(),
            String(date.getUTCMonth() + 1).padStart(2, '0'),
            String(date.getUTCDate()).padStart(2, '0'),
            'T',
            String(date.getUTCHours()).padStart(2, '0'),
            String(date.getUTCMinutes()).padStart(2, '0'),
            String(date.getUTCSeconds()).padStart(2, '0'),
            'Z'
        ].join('');
    }

    private escapeICalText(text: string): string {
        return text
            .replace(/\\([\\,;])/g, '$1')
            .replace(/([\\,;])/g, '\\$1')
            .replace(/\n/g, '\\n');
    }

    private renderConfirmationEmail(
        event: {
            title: string;
            date: string;
            time: string;
            description?: string;
            location?: string;
            organizerName?: string;
            icalEvent: string;
        },
        locale: string
    ): string {
        // Common translations using Lingui's t macro directly
        const translations = {
            title: 'Event Confirmation',
            thankYou: 'Thank you for scheduling with us! Your event has been confirmed.',
            date: 'Date',
            time: 'Time',
            location: 'Location',
            description: 'Description',
            organizer: 'Organizer',
            addToCalendar: 'Add to Calendar',
            questions: 'If you have any questions or need to make changes, please contact us.',
            footer: 'This is an automated message, please do not reply to this email.'
        };

        // Get translations for the current locale
        const translated = {
            title: i18n._(t`${translations.title}`),
            thankYou: i18n._(t`${translations.thankYou}`),
            date: i18n._(t`${translations.date}`),
            time: i18n._(t`${translations.time}`),
            location: i18n._(t`${translations.location}`),
            description: i18n._(t`${translations.description}`),
            organizer: i18n._(t`${translations.organizer}`),
            addToCalendar: i18n._(t`${translations.addToCalendar}`),
            questions: i18n._(t`${translations.questions}`),
            footer: i18n._(t`${translations.footer}`)
        };

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${translated.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 20px 0; }
          .event-details { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 0;
            background: #4285f4;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${translated.title}</h1>
          </div>
          <div class="content">
            <p>${translated.thankYou}</p>
            
            <div class="event-details">
              <h2>${event.title}</h2>
              <p><strong>${translated.date}:</strong> ${event.date}</p>
              <p><strong>${translated.time}:</strong> ${event.time}</p>
              ${event.location ? `<p><strong>${translated.location}:</strong> ${event.location}</p>` : ''}
              ${event.description ? `<p><strong>${translated.description}:</strong> ${event.description}</p>` : ''}
              ${event.organizerName ? `<p><strong>${translated.organizer}:</strong> ${event.organizerName}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="data:text/calendar;charset=utf8,${encodeURIComponent(event.icalEvent)}" class="button" download="event.ics">
                ${translated.addToCalendar}
              </a>
            </div>

            <p>${translated.questions}</p>
          </div>
          <div class="footer">
            <p>${translated.footer}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
