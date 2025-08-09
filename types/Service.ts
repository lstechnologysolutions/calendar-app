export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number | null;
  type: "free" | "paid";
};
