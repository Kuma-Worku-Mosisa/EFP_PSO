import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest } from "../lib/api";

type UserOption = { id: number | string; label: string };

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

export default function AssignInspectionModal({
  isOpen,
  applicationId,
  onClose,
  onAssigned,
}: {
  isOpen: boolean;
  applicationId?: number | string | null;
  onClose: () => void;
  onAssigned?: () => void;
}) {
  const [reviewers, setReviewers] = useState<UserOption[]>([]);
  const [leadId, setLeadId] = useState<string | number | null>(null);
  const [committeeIds, setCommitteeIds] = useState<Array<string | number>>([]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const load = async () => {
      setFetching(true);
      try {
        // prefer role filter, fallback to generic users list
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
  }, [isOpen]);

  const toggleCommittee = (id: string | number) => {
    if (leadId !== null && String(id) === String(leadId)) {
      return;
    }
    setCommitteeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!applicationId || !leadId) return;
    setLoading(true);
    try {
      await apiRequest("/inspections", {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          leadInspectorId: leadId,
          scheduledDate: scheduledAt || null,
          committeeMemberIds: committeeIds.length ? committeeIds : undefined,
        }),
      });

      onClose();
      onAssigned && onAssigned();
    } catch (err: any) {
      console.error("Assign inspection failed", err);
      // let parent show toast via onAssigned callback
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <h3 className="text-lg font-black mb-2">Assign Field Review</h3>
            <p className="text-sm text-gray-500 mb-4">
              Assign a lead inspector, optional committee members and schedule a
              field inspection.
            </p>

            <div className="space-y-3 mb-4">
              <label
                htmlFor="assign-lead-inspector"
                className="block text-xs font-bold"
              >
                Lead Inspector
              </label>
              <select
                id="assign-lead-inspector"
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
                        checked={committeeIds.includes(r.id)}
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
                htmlFor="assign-scheduled-date"
                className="block text-xs font-bold"
              >
                Scheduled Date
              </label>
              <input
                id="assign-scheduled-date"
                type="datetime-local"
                title="Scheduled inspection date and time"
                aria-label="Scheduled inspection date and time"
                placeholder="Select inspection date and time"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="px-4 py-2 rounded border">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !leadId}
                className="px-4 py-2 rounded bg-primary text-white font-bold"
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
