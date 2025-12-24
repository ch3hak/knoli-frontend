import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={`px-3 py-2 border rounded ${props.className ?? ""}`}
    />
  );
}
