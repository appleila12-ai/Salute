const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PaymentStatus {
  status: string;
  paymentStatus: string;
}

export async function createCheckout(originUrl: string): Promise<CheckoutSession> {
  const res = await fetch(`${BACKEND_URL}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originUrl }),
  });
  if (!res.ok) throw new Error(`checkout ${res.status}`);
  return (await res.json()) as CheckoutSession;
}

export async function getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
  const res = await fetch(`${BACKEND_URL}/api/payments/status/${sessionId}`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return (await res.json()) as PaymentStatus;
}
