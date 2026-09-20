import React from "react";
import { useParams } from "react-router-dom";
import NewFeeding from "./NewFeeding";

export default function EditFeeding() {
  const { id } = useParams();
  return <NewFeeding editingId={id} />;
}
