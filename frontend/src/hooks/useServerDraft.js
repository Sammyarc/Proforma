import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../components/workspace/shared";

export default function useServerDraft(draft, setDraft) {
  const [params, setParams] = useSearchParams();
  const [id] = useState(
    () =>
      params.get("draft") ||
      Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
  );
  const requested = useRef(Boolean(params.get("draft")));
  const revision = useRef(0),
    latest = useRef(draft),
    queue = useRef(Promise.resolve()),
    conflict = useRef(false);
  latest.current = draft;
  const [ready, setReady] = useState(!requested.current);
  const [locked, setLocked] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [status, setStatus] = useState("Not saved yet");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let active = true;
    if (!requested.current) return;
    api
      .get(`/api/drafts/${id}`)
      .then(({ data }) => {
        if (!active) return;
        revision.current = data.draft.revision;
        setDraft(data.draft.data);
        setLocked(data.draft.lifecycle !== "draft");
        setDelivery(data.delivery);
        setReady(true);
        setSaved(true);
        setStatus("Saved to workspace");
      })
      .catch(() => {
        if (active) {
          conflict.current = true;
          setError("Could not load this saved invoice. Reload to try again.");
        }
      });
    return () => {
      active = false;
    };
  }, [id, setDraft]);
  const save = () => {
    if (!ready || locked || conflict.current)
      return Promise.reject(new Error("Reload this invoice before saving."));
    const snapshot = latest.current;
    const work = queue.current
      .catch(() => {})
      .then(async () => {
        if (conflict.current)
          throw new Error("Reload to resolve the draft conflict.");
        setStatus("Saving…");
        try {
          const { data } = await api.put(`/api/drafts/${id}`, {
            revision: revision.current,
            data: snapshot,
          });
          revision.current = data.draft.revision;
          const unchanged =
            JSON.stringify(snapshot) === JSON.stringify(latest.current);
          setSaved(unchanged);
          setStatus(unchanged ? "Saved to workspace" : "Unsaved changes");
          setError("");
          setParams(
            (previous) => {
              const next = new URLSearchParams(previous);
              next.set("draft", id);
              return next;
            },
            { replace: true },
          );
          return data.draft.revision;
        } catch (failure) {
          if (failure.response?.status === 409) conflict.current = true;
          const message =
            failure.response?.data?.error ||
            "Could not save. Your edits are still on this screen; retry before leaving.";
          setError(message);
          setSaved(false);
          setStatus("Not saved");
          throw failure;
        }
      });
    queue.current = work;
    return work;
  };
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!ready || locked || paused || conflict.current) return;
    setSaved(false);
    const timer = setTimeout(() => {
      saveRef.current().catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft, ready, locked, paused]);
  useEffect(() => {
    const warn = (event) => {
      if (!saved && ready && !locked) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved, ready, locked]);
  const refreshDelivery = async () => {
    const { data } = await api.get(`/api/drafts/${id}`);
    setLocked(data.draft.lifecycle !== "draft");
    setDelivery(data.delivery);
    return data.delivery;
  };
  return {
    id,
    ready,
    locked,
    setLocked,
    delivery,
    setDelivery,
    save,
    saved,
    status,
    error,
    refreshDelivery,
    setPaused,
  };
}
