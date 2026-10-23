import { Link } from "react-router-dom";
import { ArrowRight, Check, CircleHelp, Undo2 } from "lucide-react";
import "../../workspace.css";
export default function ResultPage({
  title,
  description,
  action = "Back to workspace",
  to = "/dashboard",
  tone = "success",
  children,
}) {
  const Icon =
    tone === "success" ? Check : tone === "restore" ? Undo2 : CircleHelp;
  return (
    <main className="ws-result-page">
      <Link to="/" className="ws-result-brand">
        proforma<span>.</span>
      </Link>
      <section className="ws-result-card">
        <span className={"ws-result-icon " + tone}>
          <Icon size={30} strokeWidth={1.5} />
        </span>
        <span className="ws-eyebrow">ONE LESS THING ON YOUR MIND</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        <Link className="ws-button ws-primary" to={to}>
          {action}
          <ArrowRight size={16} />
        </Link>
      </section>
      <span className="ws-result-footer">Made for the work you love.</span>
    </main>
  );
}
