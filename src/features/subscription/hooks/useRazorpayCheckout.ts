import { useCallback } from "react";

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error?: Error;
}

export interface RazorpayOptions {
  key: string;
  amount?: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

type RazorpayInstance = {
  on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions & { handler: (response: RazorpaySuccessResponse) => void }) => RazorpayInstance;

export function useRazorpayCheckout() {
  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as Window & { Razorpay?: RazorpayConstructor }).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initializePayment = useCallback(
    async (
      options: RazorpayOptions,
      onSuccess: (response: RazorpaySuccessResponse) => void,
      onError: (error: Error | undefined) => void
    ) => {
      const isLoaded = await loadRazorpayScript();
      
      if (!isLoaded) {
        onError(new Error("Razorpay SDK failed to load. Are you offline?"));
        return;
      }

      const rzpOptions = {
        ...options,
        handler(response: RazorpaySuccessResponse) {
          onSuccess(response);
        },
        modal: {
          ...options.modal,
          ondismiss() {
            options.modal?.ondismiss?.();
            onError(new Error("Payment cancelled."));
          },
        },
      };

      const RazorpayCtor = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
      const rzp = new RazorpayCtor(rzpOptions);

      rzp.on("payment.failed", function (response: RazorpayFailureResponse) {
        onError(response.error);
      });

      rzp.open();
    },
    [loadRazorpayScript]
  );

  return { initializePayment };
}
