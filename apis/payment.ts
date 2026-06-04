import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/payment`);

export interface QPayUrl {
  name:        string;
  description: string;
  logo:        string;
  link:        string;
}

export interface InvoiceResponse {
  invoiceId:  string;
  qrImage:    string;   // raw base64 — prefix with data:image/png;base64,
  qrText:     string;
  paymentUrl: string;
  urls:       QPayUrl[];
  amount:     number;
}

export interface PaymentStatus {
  paid:   boolean;
  amount: number;
}

/** Create a subscription invoice */
export const createSubscriptionInvoice = (plan: "basic" | "standard" | "pro"): Promise<InvoiceResponse> =>
  http.post("/invoice", { feature: plan });

/** Poll payment status */
export const checkPayment = (invoiceId: string): Promise<PaymentStatus> =>
  http.get(`/check/${encodeURIComponent(invoiceId)}`);

export interface UpgradePrice {
  amount:       number;   // discounted price to pay
  discount:     number;   // amount deducted (remaining plan value)
  fullPrice:    number;   // original plan price
  remainingDays: number;
  isUpgrade:    boolean;
}

/** Get pro-rated upgrade price for a plan */
export const getUpgradePrice = (plan: "basic" | "pro"): Promise<UpgradePrice> =>
  http.get(`/upgrade-price`, { plan });
