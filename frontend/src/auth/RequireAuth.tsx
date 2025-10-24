import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../api/client";

type Props = { children: ReactNode };

export default function RequireAuth({ children }: Props) {
  const navigate = useNavigate();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      try {
        await me();
        setOk(true);
      } catch {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  if (ok === null) return null; // simple guard; could show a spinner
  return <>{children}</>;
}
