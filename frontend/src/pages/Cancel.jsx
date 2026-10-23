import ResultPage from "../components/workspace/ResultPage";
export default function Cancel() {
  return (
    <ResultPage
      tone="help"
      title="Payment not completed"
      description="The payment flow wasn’t completed. You can return to the payment link in your invoice email to try again."
      to="/"
      action="Back to Proforma"
    />
  );
}
