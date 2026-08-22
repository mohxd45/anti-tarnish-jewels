export function getShiprocketEligibility(orderData: any): { eligible: boolean; reason: string } {
  if (!orderData) return { eligible: false, reason: 'No order data.' };
  
  if (orderData.status === 'Cancelled' || orderData.orderStatus === 'Cancelled' || orderData.paymentStatus === 'Failed') {
    return { eligible: false, reason: 'Order is cancelled or failed.' };
  }

  const isPrepaid = orderData.paymentMethod !== 'Cash on Delivery' && 
                    orderData.paymentMethod !== 'cod_with_advance' && 
                    !orderData.paymentMethod?.toLowerCase().includes('cod');

  if (isPrepaid) {
    if (orderData.paymentStatus === 'Paid') {
      return { eligible: true, reason: 'Prepaid order verified.' };
    }
    return { eligible: false, reason: 'Awaiting payment verification.' };
  }

  const isCodWithAdvance = orderData.paymentMethod === 'cod_with_advance' || orderData.advanceRequired;
  
  if (isCodWithAdvance) {
    if (orderData.codAdvanceStatus === 'paid' || orderData.paymentStatus === 'advance_paid') {
      if (orderData.amountPaid && orderData.amountPaid >= (orderData.advanceAmount || 100)) {
        return { eligible: true, reason: 'COD advance verified.' };
      }
    }
    return { eligible: false, reason: 'Awaiting ₹100 advance payment.' };
  }

  // legacy COD without advance
  if (orderData.status !== 'Pending' && orderData.orderStatus !== 'Pending') {
    return { eligible: true, reason: 'COD order manually approved.' };
  }

  return { eligible: false, reason: 'Awaiting manual approval (Order is still Pending).' };
}
