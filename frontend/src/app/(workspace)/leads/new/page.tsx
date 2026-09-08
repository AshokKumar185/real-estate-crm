"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../components/AuthProvider";
import { PageHeader } from "../../../../components/PageHeader";
import { createLead } from "../../../../lib/api";
import {
  getPhoneValidationMessage,
  PHONE_MAX_LENGTH,
} from "../../../../lib/validation";

export default function NewLeadPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    followUpDate: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
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
      });
      router.push("/leads");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create lead",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader eyebrow="PIPELINE · NEW LEAD" title="Add a lead" />
      <form className="form-panel" onSubmit={submit}>
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
        </div>
        {error && <p className="form-error mt-2">{error}</p>}
        <div className="form-actions">
          <button
            className="text-button"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button className="primary-button form-submit" disabled={saving}>
            {saving ? "Saving..." : "Create lead"}
          </button>
        </div>
      </form>
    </>
  );
}
