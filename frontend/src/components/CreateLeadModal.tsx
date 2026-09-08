"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLead, getUsers } from "../lib/api";
import { getPhoneValidationMessage, PHONE_MAX_LENGTH } from "../lib/validation";
import type { User } from "../lib/types";
import { useAuth } from "./AuthProvider";
import { Modal } from "./Modal";

export function CreateLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    followUpDate: "",
    assignedToId: "",
  });
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (token && user?.role === "admin")
      getUsers(token)
        .then((users) =>
          setSalesUsers(users.filter((item) => item.role === "sales")),
        )
        .catch(() => setSalesUsers([]));
  }, [token, user]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const phoneError = getPhoneValidationMessage(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createLead(token, {
        ...form,
        email: form.email || null,
        followUpDate: form.followUpDate || null,
        assignedToId: form.assignedToId || null,
      });
      onCreated();
      onClose();
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create lead",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal eyebrow="PIPELINE · QUICK ADD" title="Add a lead" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="e.g. Neha Sharma"
            />
          </label>
          <label>
            Phone number
            <input
              required
              maxLength={PHONE_MAX_LENGTH}
              pattern="\+?[0-9][0-9\s().-]*"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              placeholder="+91 98765 43210"
              title="Use 7 to 15 digits, with optional +, spaces, parentheses, dots, or hyphens."
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="name@example.com"
            />
          </label>
          <label>
            Follow-up date
            <input
              type="date"
              value={form.followUpDate}
              onChange={(event) =>
                setForm({ ...form, followUpDate: event.target.value })
              }
            />
          </label>
          {user?.role === "admin" && (
            <label>
              Assign to
              <select
                value={form.assignedToId}
                onChange={(event) =>
                  setForm({ ...form, assignedToId: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {salesUsers.map((salesUser) => (
                  <option value={salesUser.id} key={salesUser.id}>
                    {salesUser.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {error && <p className="form-error mt-2">{error}</p>}
        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button form-submit" disabled={saving}>
            {saving ? "Saving..." : "Create lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
