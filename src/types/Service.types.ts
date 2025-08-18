export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number | null;
  type: "free" | "paid";
};

export type ServiceFilter = "all" | Service["type"];

export interface ServiceSelectionProps {
  onSelectService?: (service: Service) => void;
  services?: Service[];
}
