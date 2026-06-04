// file: frontend/src/components/payment/LicensePaymentAction.tsx
"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentButtonProps {
  licenseId: number;
  amount: string;
  title: string;
}

export default function LicensePaymentAction({
  licenseId,
  amount,
  title,
}: PaymentButtonProps) {
  const [processing, setProcessing] = useState(false);

  const handleCheckoutRedirect = async () => {
    try {
      setProcessing(true);

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, amount, title }),
      });
      const data = await response.json();

      if (data?.success && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(
          "Could not process transaction initiation parameters with Telebirr.",
        );
      }
    } catch (err) {
      console.error("Redirection failure:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckoutRedirect}
      disabled={processing}
      className="w-full bg-[#003265] text-white hover:bg-[#003265]/90 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
    >
      {processing ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
      ) : (
        <CreditCard className="w-4 h-4 text-[#FFD700]" />
      )}
      <span>Pay {amount} ETB via telebirr</span>
    </button>
  );
}
