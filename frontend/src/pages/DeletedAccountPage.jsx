import ResultPage from "../components/workspace/ResultPage";
export default function DeletedAccountPage() {
  return (
    <ResultPage
      tone="restore"
      title="Account deletion scheduled"
      description="Your account has been scheduled for deletion in 30 days. You can restore it by signing in again during that time."
      to="/signup"
      action="Sign in to restore"
    />
  );
}
