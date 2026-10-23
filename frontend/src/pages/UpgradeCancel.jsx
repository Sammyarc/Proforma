import ResultPage from "../components/workspace/ResultPage";
export default function UpgradeCancel() {
  return (
    <ResultPage
      tone="help"
      title="Upgrade not completed"
      description="Your upgrade wasn’t completed. Review the Pro plan and try again whenever you’re ready."
      to="/pricing"
      action="Back to plans"
    />
  );
}
