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