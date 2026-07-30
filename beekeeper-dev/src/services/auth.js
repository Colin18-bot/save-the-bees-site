// src/services/auth.js
import { supabase } from "./supabase.js"; // added .js extension

// Sign in user
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    if (error.message?.toLowerCase().includes("email not confirmed")) {
      throw new Error(
        "Your email address hasn't been confirmed yet. Please check your inbox and your Junk/Spam folder, click the confirmation link we sent you, then return here to sign in."
      );
    }

    throw error;
  }
  return data; // { user, session }
}

// Register new user
export async function registerUser(email, password) {
  // IMPORTANT: do NOT signOut here.
  // Let the caller (Register.jsx) decide when to sign out,
  // so it can read the session and upsert the profile first.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data; // { user, session } (session present if Confirm Email = OFF)
}

// Resend account confirmation email
export async function resendConfirmationEmail(email) {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) throw error;
  return data;
}

// Send password reset email
export async function resetPassword(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}
