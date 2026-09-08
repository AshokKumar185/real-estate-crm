"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../components/AuthProvider";
import { PageHeader } from "../../../../components/PageHeader";
import { PageError, PageLoading } from "../../../../components/PageStates";
import {
  createNote,
  getLead,
  getNotes,
  getUsers,
  updateLead,
} from "../../../../lib/api";
import {
  getPhoneValidationMessage,
  PHONE_MAX_LENGTH,
} from "../../../../lib/validation";
import type { Lead, Note, User } from "../../../../lib/types";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    stage: "new",
    followUpDate: "",
    assignedToId: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (token && user?.role === "admin") {
      getUsers(token)
        .then((users) =>
          setSalesUsers(users.filter((item) => item.role === "sales")),
        )
        .catch(() => setSalesUsers([]));
    }
  }, [token, user]);
  useEffect(() => {
    if (token)
      Promise.all([getLead(token, id), getNotes(token, id)])
        .then(([nextLead, nextNotes]) => {
          setLead(nextLead);
          setNotes(nextNotes);
          setForm({
            name: nextLead.name,
            phone: nextLead.phone,
            email: nextLead.email ?? "",
            stage: nextLead.stage,
            followUpDate: nextLead.followUpDate?.slice(0, 10) ?? "",
            assignedToId: nextLead.assignedToId ?? "",
          });
        })
        .catch((reason: Error) => setError(reason.message));
  }, [token, id]);
  const addNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !noteText.trim()) return;
    setNoteSaving(true);
    try {
      const note = await createNote(token, id, {
        content: noteText.trim(),
        followUpDate: noteDate || null,
      });
      setNotes([note, ...notes]);
      setNoteText("");
      setNoteDate("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add note");
    } finally {
      setNoteSaving(false);
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const phoneError = getPhoneValidationMessage(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setSaving(true);
    try {
      await updateLead(token, id, {
        ...form,
        email: form.email || null,
        followUpDate: form.followUpDate || null,
      });
      router.push("/leads");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to update lead",
      );
    } finally {
      setSaving(false);
    }
  };
  if (error)
    return (
      <>
        <PageHeader eyebrow="PIPELINE" title="Lead details" />
        <PageError message={error} />
      </>
    );
  if (!lead) return <PageLoading label="Loading lead..." />;
  return (
    <>
      <PageHeader eyebrow="PIPELINE · LEAD DETAIL" title={lead.name} />
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
            />
          </label>
          <label>
            Stage
            <select
              value={form.stage}
              onChange={(event) =>
                setForm({ ...form, stage: event.target.value })
              }
            >
              {[
                "new",
                "contacted",
                "site_visit",
                "interested",
                "negotiation",
                "booked",
                "lost",
              ].map((item) => (
                <option value={item} key={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
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
          <button
            className="text-button"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button className="primary-button form-submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
      <section className="notes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h2>
              Notes & follow-ups{" "}
              <span className="count-chip">{notes.length}</span>
            </h2>
          </div>
        </div>
        <form className="note-composer" onSubmit={addNote}>
          <textarea
            required
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Add a call note, site visit update, or next step..."
          />
          <div className="note-actions">
            <input
              type="date"
              value={noteDate}
              onChange={(event) => setNoteDate(event.target.value)}
              aria-label="Note follow-up date"
            />
            <button
              className="primary-button form-submit"
              disabled={noteSaving}
            >
              {noteSaving ? "Adding..." : "Add note"}
            </button>
          </div>
        </form>
        <div className="notes-list">
          {notes.map((note) => (
            <article className="note-item" key={note.id}>
              <div className="note-marker" />
              <div>
                <p>{note.content}</p>
                <small>
                  {new Date(note.createdAt).toLocaleDateString()}{" "}
                  {note.followUpDate
                    ? `· Follow up ${new Date(note.followUpDate).toLocaleDateString()}`
                    : ""}
                </small>
              </div>
            </article>
          ))}
          {!notes.length && (
            <div className="empty-state">
              No notes yet. Add the first interaction.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
