import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
}
function Sheet({
  onClose,
  triggerRef,
  onNavigate,
}: Omit<Props, "open"> & { onNavigate: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const drag = useDragControls();
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = dialog.current!;
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    element.showModal();
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    element
      .querySelector<HTMLButtonElement>("[data-close]")
      ?.focus({ preventScroll: true });
    const media = window.matchMedia("(min-width: 901px)");
    const resize = () => {
      if (media.matches) closeRef.current();
    };
    media.addEventListener("change", resize);
    return () => {
      element.close();
      Object.assign(document.body.style, previous);
      window.scrollTo(0, scrollY);
      media.removeEventListener("change", resize);
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [triggerRef]);
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    onNavigate(id);
    onClose();
  };
  return (
    <motion.dialog
      ref={dialog}
      id="pf-mobile-menu"
      className="pf-sheet-dialog"
      aria-labelledby="pf-menu-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const items = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href]",
          ) || [],
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
    >
      <motion.div
        className="pf-sheet"
        initial={{ y: reduced ? 0 : "100%" }}
        animate={{ y: 0 }}
        exit={{ y: reduced ? 0 : "100%" }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 36, mass: 0.9 }
        }
        drag={reduced ? false : "y"}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y > 85 || info.velocity.y > 600) onClose();
        }}
      >
        <div
          className="pf-sheet-grab"
          onPointerDown={(event) => drag.start(event)}
          aria-hidden="true"
        >
          <span />
        </div>
        <div className="pf-sheet-heading">
          <div>
            <img src="/brand/proforma-mark.svg" width="36" height="36" alt="" />
            <span id="pf-menu-title">Explore Proforma</span>
          </div>
          <button data-close onClick={onClose} aria-label="Close menu">
            <X size={21} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[
            ["01", "Invoice features", "product"],
            ["02", "How it works", "workflow"],
            ["03", "Pricing", "pricing"],
            ["04", "Invoice FAQ", "faq"],
          ].map(([n, label, id]) => (
            <a key={id} href={`#${id}`} onClick={(event) => goTo(event, id)}>
              <span>{n}</span>
              {label}
              <ArrowUpRight size={23} />
            </a>
          ))}
        </nav>
        <div className="pf-sheet-actions">
          <Link to="/signup?mode=register" onClick={onClose}>
            Start for free <ArrowUpRight size={20} />
          </Link>
          <Link to="/signup" onClick={onClose}>
            Already have an account? <strong>Log in</strong>
          </Link>
        </div>
        <p>Create invoices. Track payments.</p>
      </motion.div>
    </motion.dialog>
  );
}
export default function MobileMenu({ open, ...props }: Props) {
  const pendingSection = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const afterExit = () => {
    const id = pendingSection.current;
    pendingSection.current = null;
    if (!id) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      history.replaceState(null, "", `#${id}`);
    });
  };
  return createPortal(
    <AnimatePresence onExitComplete={afterExit}>
      {open && (
        <Sheet
          key="mobile-menu"
          {...props}
          onNavigate={(id) => {
            pendingSection.current = id;
          }}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
