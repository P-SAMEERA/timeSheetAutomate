import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function BackButton({ label = "← Back to Dashboard" }) {
  const navigate = useNavigate();

  return (
    <Button
      label={label}
      onClick={() => navigate("/dashboard")}
      variant="secondary"
      className="w-fit"
    />
  );
}
