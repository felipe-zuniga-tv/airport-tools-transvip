import { Coins, CreditCard, ReceiptText } from "lucide-react";
import { IBookingInfoOutput } from "@/lib/chat/types";
import { paymentMethods } from "@/lib/config/transvip-general";

export default function PaymentAvatar({ result } : { result : IBookingInfoOutput }) {
    const checkPaymentMethods = Object.values(paymentMethods).includes(result.payment.method_name || '')

    if (!checkPaymentMethods) return null
    
    return (
        <div className="payment-method-name hidden xs:block">
            { result.payment.method_name === paymentMethods.CARD && <CreditCard className="size-4" /> }
            { result.payment.method_name === paymentMethods.CREDIT_CARD && <CreditCard className="size-4" /> }
            { result.payment.method_name === paymentMethods.CREDIT_CARD_MP && <CreditCard className="size-4" /> }
            { result.payment.method_name === paymentMethods.CARD_TOTEM && <CreditCard className="size-4" /> }
            { result.payment.method_name === paymentMethods.CASH && <Coins className="size-4" /> }
            { result.payment.method_name === paymentMethods.FACTURA && <ReceiptText className="size-4" /> }
        </div>
    )
}