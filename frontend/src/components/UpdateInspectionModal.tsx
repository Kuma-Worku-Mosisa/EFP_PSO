import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest } from "../lib/api";
import { ConfirmDialog } from "./ConfirmDialog";
import { AutoDismissToast } from "./AutoDismissToast";

type UserOption = { id: number | string; label: string };

const toDateTimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const isFieldReviewer = (user: any) => {
  const roles = user?.user_roles;
  if (!Array.isArray(roles)) return false;

  return roles.some((userRole) => {
    const roleName =
      userRole?.roles?.role_name ||
      userRole?.roles?.name ||
      userRole?.role_name;
    return (
      String(roleName || "")
        .trim()
        .toLowerCase() === "field_reviewer"
    );
  });
};

export default function UpdateInspectionModal({
  isOpen,
  inspectionId,
  initialLeadId,
  initialCommitteeIds,
  initialScheduledAt,
  onClose,
  onUpdated,
}: {
  isOpen: boolean;
  inspectionId: number | string | null | undefined;
  initialLeadId?: number | string | null;
  initialCommitteeIds?: Array<number | string>;
  initialScheduledAt?: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [reviewers, setReviewers] = useState<UserOption[]>([]);
  const [leadId, setLeadId] = useState<string | number | null>(
    initialLeadId ?? null,
  );
  const [committeeIds, setCommitteeIds] = useState<Array<string | number>>(
    initialCommitteeIds ? initialCommitteeIds.map(String) : [],
  );
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialScheduledAt ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLeadId(initialLeadId ?? null);
    setCommitteeIds(initialCommitteeIds ? initialCommitteeIds.map(String) : []);
    setScheduledAt(initialScheduledAt ?? "");

    let mounted = true;
    const load = async () => {
      setFetching(true);
      try {
        const res = await apiRequest("/users?role=field_reviewer");
        const data = res?.data || res || [];
        if (!mounted) return;
        setReviewers(
          (Array.isArray(data) ? data : [data])
            .filter(isFieldReviewer)
            .map((u: any) => ({
              id: u.id,
              label: u.user?.fullName || u.fullName || u.email || String(u.id),
            })),
        );
      } catch (err) {
        try {
          const res = await apiRequest("/users");
          const data = res?.data || res || [];
          if (!mounted) return;
          setReviewers(
            (Array.isArray(data) ? data : [data])
              .filter(isFieldReviewer)
              .map((u: any) => ({
                id: u.id,
                label:
                  u.user?.fullName || u.fullName || u.email || String(u.id),
              })),
          );
        } catch (inner) {
          console.warn("Failed to load reviewers", inner);
          setReviewers([]);
        }
      } finally {
        setFetching(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, initialLeadId, initialCommitteeIds, initialScheduledAt]);

  const toggleCommittee = (id: string | number) => {
    if (leadId !== null && String(id) === String(leadId)) {
      return;
    }
    setCommitteeIds((prev) =>
      prev.includes(String(id))
        ? prev.filter((x) => x !== String(id))
        : [...prev, String(id)],
    );
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [nowValue, setNowValue] = useState(() =>
    toDateTimeLocalValue(new Date()),
  );

  useEffect(() => {
    if (!isOpen) return;
    setNowValue(toDateTimeLocalValue(new Date()));
  }, [isOpen]);

  const isPastDate = Boolean(scheduledAt) && scheduledAt < nowValue;

  const performUpdate = async () => {
    if (!inspectionId) return;
    if (!scheduledAt || isPastDate) {
      setToastType("error");
      setToastMessage("Scheduled date must be current time or a future date.");
      setToastOpen(true);
      setConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/inspections/${inspectionId}`, {
        method: "PATCH",
        body: JSON.stringify({
          leadInspectorId: leadId ?? null,
          scheduledDate: scheduledAt || null,
          committeeMemberIds: committeeIds.length
            ? committeeIds.map((c) => Number(c))
            : undefined,
        }),
      });

      setToastType("success");
      setToastMessage("Inspection updated successfully.");
      setToastOpen(true);

      onUpdated && onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Update inspection failed", err);
      setToastType("error");
      setToastMessage(err?.message || "Failed to update inspection.");
      setToastOpen(true);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl z-50 w-full max-w-xl p-6"
            >
              <h3 className="text-lg font-black mb-2">Update Inspection</h3>
              <p className="text-sm text-gray-500 mb-4">
                Modify scheduled date, lead inspector or committee members.
              </p>

              <div className="space-y-3 mb-4">
                <label
                  htmlFor="update-lead-inspector"
                  className="block text-xs font-bold"
                >
                  Lead Inspector
                </label>
                <select
                  id="update-lead-inspector"
                  title="Select lead inspector"
                  aria-label="Lead inspector"
                  value={leadId ?? ""}
                  onChange={(e) => setLeadId(e.target.value || null)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select lead inspector</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-4">
                <label className="block text-xs font-bold">
                  Committee Members
                </label>
                <div className="max-h-40 overflow-auto border rounded p-2">
                  {fetching && (
                    <div className="text-sm text-gray-400">Loading...</div>
                  )}
                  {!fetching && reviewers.length === 0 && (
                    <div className="text-sm text-gray-400">
                      No reviewers found
                    </div>
                  )}
                  {!fetching &&
                    reviewers.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center space-x-2 text-sm ${String(leadId) === String(r.id) ? "opacity-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          title={`${r.label} committee member`}
                          aria-label={`${r.label} committee member`}
                          checked={committeeIds.includes(String(r.id))}
                          disabled={String(leadId) === String(r.id)}
                          onChange={() => toggleCommittee(r.id)}
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                </div>
                <p className="text-xs text-gray-400">
                  The lead inspector is excluded from the committee list.
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <label
                  htmlFor="update-scheduled-date"
                  className="block text-xs font-bold"
                >
                  Scheduled Date
                </label>
                <input
                  id="update-scheduled-date"
                  type="datetime-local"
                  min={nowValue}
                  title="Scheduled inspection date and time"
                  aria-label="Scheduled inspection date and time"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border rounded p-2"
                />
                {isPastDate && (
                  <p className="text-xs font-medium text-rose-600">
                    Scheduled date cannot be earlier than the current time.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={loading || !scheduledAt || isPastDate}
                  className="px-4 py-2 rounded bg-primary text-white font-bold"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performUpdate}
        title={"Confirm Update"}
        message={"Are you sure you want to update this inspection?"}
        type={"update"}
        isLoading={loading}
      />

      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
        durationMs={4000}
      />
    </>
  );
}
