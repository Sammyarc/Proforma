import ResultPage from "../components/workspace/ResultPage";
export default function Success() {
  return (
    <ResultPage
      title="Thank you for your payment."
      description="You’ve reached the payment confirmation page. Keep your payment provider’s receipt for your records."
      to="/"
      action="Back to Proforma"
    />
  );
}
