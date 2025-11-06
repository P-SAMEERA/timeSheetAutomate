import React from "react";

export default function Button({
  label,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}) {
  const baseStyle =
    "px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none appearance-none border-none select-none flex items-center justify-center";

  const variants = {
    primary:
      "bg-yellow-700 hover:bg-yellow-500 text-black shadow-md hover:shadow-yellow-400/50 hover:cursor-pointer",
    secondary:
      "bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-gray-500/50 hover:cursor-pointer",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-red-500/50 hover:cursor-pointer",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || ""} ${className}`}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage: "none",
        boxShadow: "none",
      }}
      {...rest}
    >
      {label}
    </button>
  );
}
