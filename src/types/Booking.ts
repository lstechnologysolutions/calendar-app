import { Service } from "./Service";

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  notes: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
};

export type BookingStatus = "success" | "error";

export type BookingSubmitPayload = BookingFormData & {
  status: BookingStatus;
};

// Selected date/time used when submitting a booking
export type SelectedDateTime = {
  date: string; // e.g. YYYY-MM-DD
  time: string; // e.g. 10:00 AM
};

export type BookingFormProps = {
  selectedService: Service | null;
  selectedDateTime?: SelectedDateTime;
  isBooking?: boolean;
  onSubmit?: (formData: BookingFormData) => Promise<{ status: 'success' | 'error'; error?: string }>;
  onBack?: () => void;
  onBookAnother?: () => void;
  onReturnHome?: () => void;
};  