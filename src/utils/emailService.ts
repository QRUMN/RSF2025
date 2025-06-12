import { supabase } from '../lib/supabase';
import { Invoice } from '../types/invoice';

/**
 * Sends an invoice email to a client
 * @param invoiceId The ID of the invoice to send
 * @param recipientEmail The email address of the recipient
 * @returns Promise resolving to success status
 */
export const sendInvoiceEmail = async (
  invoiceId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the invoice details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
    }

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // In a production app, you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate sending an email by updating the invoice status
    
    // Call Supabase Edge Function for email sending (if implemented)
    // This would be the actual email sending implementation in production
    try {
      // Example of calling a Supabase Edge Function (would need to be created)
      // const { data, error } = await supabase.functions.invoke('send-invoice-email', {
      //   body: { invoiceId, recipientEmail, invoiceData: invoice }
      // });
      
      // For now, just log the attempt and update the invoice status
      console.log(`Email would be sent to ${recipientEmail} for invoice ${invoiceId}`);
      
      // Update the invoice status to 'sent'
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
      
      if (updateError) {
        throw new Error(`Failed to update invoice status: ${updateError.message}`);
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Error sending email:', err);
      return { success: false, error: err.message };
    }
  } catch (err: any) {
    console.error('Error in sendInvoiceEmail:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a deposit invoice email for a new appointment
 * @param invoiceId The ID of the deposit invoice
 * @param appointmentId The ID of the related appointment
 * @param recipientEmail The email address of the recipient
 * @returns Promise resolving to success status
 */
export const sendDepositInvoiceEmail = async (
  invoiceId: string,
  appointmentId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get appointment details to include in the email
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (appointmentError) {
      console.warn('Could not fetch appointment details:', appointmentError);
      // Continue anyway, as we can still send the invoice
    }
    
    // Send the invoice email
    const result = await sendInvoiceEmail(invoiceId, recipientEmail);
    
    if (result.success) {
      // Update the appointment to mark that the deposit invoice was sent
      await supabase
        .from('appointments')
        .update({ 
          deposit_invoice_sent: true,
          deposit_invoice_sent_at: new Date().toISOString()
        })
        .eq('id', appointmentId);
    }
    
    return result;
  } catch (err: any) {
    console.error('Error sending deposit invoice email:', err);
    return { success: false, error: err.message };
  }
};
