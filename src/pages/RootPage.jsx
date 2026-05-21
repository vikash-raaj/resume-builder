import { useSearchParams } from "react-router-dom";
import LandingPage from "./LandingPage";
import ResetPasswordPage from "./ResetPasswordPage";

export default function RootPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "resetPassword") return <ResetPasswordPage />;
  return <LandingPage />;
}
