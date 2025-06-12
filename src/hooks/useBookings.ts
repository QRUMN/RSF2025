import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { sendBookingEmail, sendBookingSMS } from "../utils/notifications";

export interface Booking {
  id: string;
  service_type: string;
  client: string;
  staff: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  notes: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) setError(error.message);
    setBookings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (booking: Omit<Booking, "id">) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();
    if (error) setError(error.message);
    if (data) setBookings((prev) => [data, ...prev]);

    // --- Notification logic ---
    if (data && booking.client) {
      // Fetch client contact info
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('email, phone, first_name, last_name')
        .eq('id', booking.client)
        .single();
      if (clientProfile) {
        // Prepare notification content
        const clientName = [clientProfile.first_name, clientProfile.last_name].filter(Boolean).join(' ');
        const service = booking.service_type;
        const date = booking.date;
        const startTime = booking.start_time;
        const emailSubject = `Your ${service} Appointment Confirmation`;
        const emailHtml = `<p>Hi ${clientName},</p><p>Your ${service} appointment is confirmed for ${date} at ${startTime}.</p>`;
        const smsBody = `Hi ${clientName}, your ${service} appointment is confirmed for ${date} at ${startTime}.`;
        // TODO: Integrate real providers below
        if (clientProfile.email) await sendBookingEmail({ to: clientProfile.email, subject: emailSubject, html: emailHtml });
        if (clientProfile.phone) await sendBookingSMS({ to: clientProfile.phone, body: smsBody });
      }
    }
    // --- End notification logic ---

    setLoading(false);
    return { data, error };

  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) setError(error.message);
    if (data) setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
    setLoading(false);
    return { data, error };
  };

  const deleteBooking = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);
    if (error) setError(error.message);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setLoading(false);
    return { error };
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
