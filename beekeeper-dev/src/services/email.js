// src/services/email.js

import { supabase } from "./supabase.js";

export async function sendWelcomeEmail() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error("No authenticated session is available.");
  }

  const { data, error } = await supabase.functions.invoke(
    "send-welcome-email",
    {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (data?.success === false) {
    throw new Error(data.error || "Welcome email could not be sent.");
  }

  return data;
}