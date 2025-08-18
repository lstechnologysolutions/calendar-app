import { Service } from "@/types/Service.types";

// Parse service prices from environment variable
const parseServicePrices = (): Record<string, number> => {
    try {
        const pricesJson = process.env.EXPO_PUBLIC_SERVICE_PRICES || '{}';
        return JSON.parse(pricesJson);
    } catch (error) {
        console.error('Error parsing service prices:', error);
        return {};
    }
};

const servicePrices = parseServicePrices();

// Helper to get price for a service
const getServicePrice = (id: string): number | null => {
    return servicePrices[id] !== undefined ? servicePrices[id] : null;
};

export const SERVICES: Service[] = [
    {
        id: '1',
        name: 'Initial Consultation',
        description: 'A free 15-minute consultation to discuss your needs',
        duration: '15 min',
        price: getServicePrice('1'),
        type: 'free',
    },
    {
        id: '2',
        name: 'Standard Appointment',
        description: 'Regular 30-minute appointment session',
        duration: '30 min',
        price: getServicePrice('2') || 1, // Default to 1 if not set
        type: 'paid',
    },
    {
        id: '3',
        name: 'Extended Session',
        description: 'In-depth 60-minute appointment session',
        duration: '60 min',
        price: getServicePrice('3') || 90, // Default to 90 if not set
        type: 'paid',
    },
    {
        id: '4',
        name: 'Quick Follow-up',
        description: 'Brief follow-up session for existing clients',
        duration: '15 min',
        price: getServicePrice('1'),
        type: 'free',
    },
];

export const DEFAULT_SERVICE: Service = SERVICES.find(service => service.id === "1")!;

export const getServiceById = (id: string): Service | undefined => {
    return SERVICES.find(service => service.id === id);
};

export const getPaidServices = (): Service[] => {
    return SERVICES.filter(service => service.type === 'paid');
};

export const getFreeServices = (): Service[] => {
    return SERVICES.filter(service => service.type === 'free');
};
