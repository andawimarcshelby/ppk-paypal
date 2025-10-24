import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({ label, error, ...rest }: Props) {
  return (
    <label className="block mb-3">
      <div className="label">{label}</div>
      <input className="input" {...rest} />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </label>
  );
}
