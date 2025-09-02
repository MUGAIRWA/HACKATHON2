import { supabase } from './supabase';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export interface PaymentData {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  reference: string;
  callback_url: string;
  metadata: {
    meal_request_id: string;
    donor_id: string;
    student_name: string;
  };
}

export const initializePayment = async (paymentData: PaymentData) => {
  try {
    // Create payment record in database first
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        donor_id: paymentData.metadata.donor_id,
        meal_request_id: paymentData.metadata.meal_request_id,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        status: 'pending',
        payment_reference: paymentData.reference
      })
      .select()
      .single();

    if (donationError) throw donationError;

    // Initialize Paystack payment
    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: paymentData.email,
      amount: paymentData.amount, // Amount in kobo
      currency: 'NGN',
      ref: paymentData.reference,
      callback: async (response: any) => {
        // Handle successful payment
        await handlePaymentSuccess(response, donation.id);
      },
      onClose: () => {
        // Handle payment cancellation
        console.log('Payment cancelled');
      }
    });

    handler.openIframe();
    return { success: true, donation };

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    throw error;
  }
};

export const handlePaymentSuccess = async (response: any, donationId: string) => {
  try {
    // Verify payment with your backend (you'll need to create this)
    const verificationResponse = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: response.reference,
        donation_id: donationId
      })
    });

    if (verificationResponse.ok) {
      // Update donation status to completed
      const { error } = await supabase
        .from('donations')
        .update({ 
          status: 'completed',
          payment_reference: response.reference
        })
        .eq('id', donationId);

      if (error) throw error;

      // Update meal request status to funded
      const { data: donation } = await supabase
        .from('donations')
        .select('meal_request_id, donor_id')
        .eq('id', donationId)
        .single();

      if (donation) {
        await supabase
          .from('meal_requests')
          .update({ 
            status: 'funded',
            funded_by: donation.donor_id,
            funded_at: new Date().toISOString()
          })
          .eq('id', donation.meal_request_id);
      }

      // Show success message
      alert('Payment successful! Thank you for helping this student.');
      window.location.reload(); // Refresh to show updated status
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    alert('Payment verification failed. Please contact support.');
  }
};

export const generatePaymentReference = () => {
  return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
