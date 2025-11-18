// src/components/RequireSubscription.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const RequireSubscription = ({ allowed, children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", user.id) // ✅ fixed to match your DB schema
        .single();

      if (error || !allowed.includes(profile.subscription_level)) {
        const redirectReason = allowed.includes("standard")
          ? "standard"
          : "premium";
        navigate(`/pricing?restricted=${redirectReason}`);
        return;
      }

      setLoading(false);
    };

    checkSubscription();
  }, [allowed, navigate]);

  if (loading) return <div className="text-center mt-8">Checking access...</div>;

  return children;
};

export default RequireSubscription;
