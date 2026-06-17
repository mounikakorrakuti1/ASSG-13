import { useState } from "react";
import {
  updateApplicationStatus,
  addApplicationNote,
  updateApplicationNote,
  deleteApplicationNote,
  scheduleInterview,
  updateInterview,
  cancelInterview,
} from "../services/api";
import ConfirmModal from "./ConfirmModal";

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Hired",
];

const STATUS_COLORS = {
  Applied: "badge-fulltime",
  "Under Review": "badge-parttime",
  Shortlisted: "badge-contract",
  "Interview Scheduled": "badge-contract",
  Rejected: "badge-fulltime",
  Hired: "badge-fulltime",
};

const ApplicantRow = ({ app, onUpdated, setToast }) => {
  const [expanded, setExpanded] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [deletingNote, setDeletingNote] = useState(null);

  // Interview
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: app.interview?.date ? app.interview.date.slice(0, 10) : "",
    time: app.interview?.time || "",
    mode: app.interview?.mode || "Online",
    meetingLink: app.interview?.meetingLink || "",
    remarks: app.interview?.remarks || "",
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // ── Status change ──────────────────────────────────────────────────────
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === app.status) return;
    setStatusLoading(true);
    try {
      await updateApplicationStatus(app._id, newStatus);
      setToast({ message: `Status updated to "${newStatus}" ✅`, type: "success" });
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to update status", type: "error" });
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Notes ──────────────────────────────────────────────────────────────
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      await addApplicationNote(app._id, newNote.trim());
      setNewNote("");
      setToast({ message: "Note added ✅", type: "success" });
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to add note", type: "error" });
    } finally {
      setNoteLoading(false);
    }
  };

  const startEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteText(note.text);
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNoteText.trim()) return;
    setNoteLoading(true);
    try {
      await updateApplicationNote(app._id, editingNoteId, editingNoteText.trim());
      setEditingNoteId(null);
      setEditingNoteText("");
      setToast({ message: "Note updated ✅", type: "success" });
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to update note", type: "error" });
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNoteConfirm = async () => {
    setNoteLoading(true);
    try {
      await deleteApplicationNote(app._id, deletingNote._id);
      setDeletingNote(null);
      setToast({ message: "Note deleted 🗑️", type: "success" });
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete note", type: "error" });
    } finally {
      setNoteLoading(false);
    }
  };

  // ── Interview ──────────────────────────────────────────────────────────
  const handleInterviewChange = (e) => {
    setInterviewForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    setInterviewLoading(true);
    try {
      if (app.interview) {
        await updateInterview(app._id, interviewForm);
        setToast({ message: "Interview updated ✅", type: "success" });
      } else {
        await scheduleInterview(app._id, interviewForm);
        setToast({ message: "Interview scheduled ✅", type: "success" });
      }
      setShowInterviewForm(false);
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to save interview", type: "error" });
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleCancelInterview = async () => {
    setCancelLoading(true);
    try {
      await cancelInterview(app._id);
      setToast({ message: "Interview cancelled", type: "success" });
      setShowCancelConfirm(false);
      onUpdated();
    } catch (err) {
      setToast({ message: err.message || "Failed to cancel interview", type: "error" });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      {showCancelConfirm && (
        <ConfirmModal
          message={`Cancel the scheduled interview for ${app.fullName}? Status may revert to "Shortlisted".`}
          onConfirm={handleCancelInterview}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
      {deletingNote && (
        <ConfirmModal
          message="Delete this note? This cannot be undone."
          onConfirm={handleDeleteNoteConfirm}
          onCancel={() => setDeletingNote(null)}
        />
      )}

      <tr>
        <td>{app.fullName}</td>
        <td>
          <a href={`mailto:${app.email}`} className="email-link">{app.email}</a>
        </td>
        <td>{app.phone}</td>
        <td>
          {app.resumePath ? (
  <a
    href={`http://localhost:5000${app.resumePath}`}
    target="_blank"
    rel="noreferrer"
    className="btn btn-outline btn-sm"
  >
    View Resume
  </a>
) : (
  "No Resume"
)}
        </td>
        <td>
          <select
            className="form-input"
            value={app.status}
            onChange={handleStatusChange}
            disabled={statusLoading}
            style={{ minWidth: "150px" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </td>
        <td>
          {new Date(app.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </td>
        <td>
          <button className="btn btn-outline btn-sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide Details" : "Manage"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="applicant-detail-row">
          <td colSpan={7}>
            <div className="applicant-detail-panel">
              <span className={`job-type-badge ${STATUS_COLORS[app.status] || "badge-fulltime"}`}>
                Current Status: {app.status}
              </span>

              {/* ── Notes ─────────────────────────────────────────────── */}
              <div className="detail-section" style={{ marginTop: "16px" }}>
                <h3 className="section-heading" style={{ fontSize: "1rem" }}>📝 Recruiter Notes</h3>

                {(!app.notes || app.notes.length === 0) ? (
                  <p className="text-muted" style={{ margin: "8px 0" }}>No notes yet.</p>
                ) : (
                  <ul className="activity-list">
                    {app.notes.map((note) => (
                      <li key={note._id} className="activity-item">
                        <div className="activity-info" style={{ width: "100%" }}>
                          {editingNoteId === note._id ? (
                            <form onSubmit={handleUpdateNote} className="profile-form" style={{ gap: "8px" }}>
                              <textarea
                                className="form-input form-textarea"
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                rows={2}
                                maxLength={1000}
                              />
                              <div className="profile-form-actions">
                                <button type="submit" className="btn btn-primary btn-sm" disabled={noteLoading}>
                                  💾 Save
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => setEditingNoteId(null)}
                                  disabled={noteLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p className="activity-message">{note.text}</p>
                              <span className="activity-time">
                                {new Date(note.updatedAt || note.createdAt).toLocaleString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                  hour: "numeric", minute: "2-digit",
                                })}
                              </span>
                              <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => startEditNote(note)}
                                  disabled={noteLoading}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setDeletingNote(note)}
                                  disabled={noteLoading}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleAddNote} className="profile-form" style={{ marginTop: "12px", gap: "8px" }}>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Add a note about this candidate…"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    maxLength={1000}
                  />
                  <div className="profile-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={noteLoading || !newNote.trim()}>
                      {noteLoading ? "Saving…" : "➕ Add Note"}
                    </button>
                  </div>
                </form>
              </div>

              {/* ── Interview ─────────────────────────────────────────── */}
              <div className="detail-section" style={{ marginTop: "16px" }}>
                <h3 className="section-heading" style={{ fontSize: "1rem" }}>🗓️ Interview</h3>

                {app.interview && !showInterviewForm && (
                  <div className="empty-state small">
                    <p>
                      <strong>Date:</strong> {new Date(app.interview.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })} &nbsp;·&nbsp;
                      <strong>Time:</strong> {app.interview.time} &nbsp;·&nbsp;
                      <strong>Mode:</strong> {app.interview.mode}
                    </p>
                    {app.interview.meetingLink && (
                      <p><strong>Link:</strong> <a href={app.interview.meetingLink} target="_blank" rel="noreferrer">{app.interview.meetingLink}</a></p>
                    )}
                    {app.interview.remarks && <p><strong>Remarks:</strong> {app.interview.remarks}</p>}
                    <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowInterviewForm(true)}>
                        ✏️ Update Interview
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={cancelLoading}
                      >
                        ✕ Cancel Interview
                      </button>
                    </div>
                  </div>
                )}

                {!app.interview && !showInterviewForm && (
                  <div className="empty-state small">
                    <p>No interview scheduled yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowInterviewForm(true)}>
                      📅 Schedule Interview
                    </button>
                  </div>
                )}

                {showInterviewForm && (
                  <form onSubmit={handleInterviewSubmit} className="profile-form" style={{ gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        className="form-input"
                        type="date"
                        name="date"
                        value={interviewForm.date}
                        onChange={handleInterviewChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input
                        className="form-input"
                        type="text"
                        name="time"
                        placeholder="e.g. 10:00 AM"
                        value={interviewForm.time}
                        onChange={handleInterviewChange}
                        required
                        maxLength={20}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mode</label>
                      <select
                        className="form-input"
                        name="mode"
                        value={interviewForm.mode}
                        onChange={handleInterviewChange}
                        required
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meeting Link (optional)</label>
                      <input
                        className="form-input"
                        type="text"
                        name="meetingLink"
                        placeholder="https://meet.example.com/..."
                        value={interviewForm.meetingLink}
                        onChange={handleInterviewChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Remarks (optional)</label>
                      <textarea
                        className="form-input form-textarea"
                        name="remarks"
                        value={interviewForm.remarks}
                        onChange={handleInterviewChange}
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn btn-primary" disabled={interviewLoading}>
                        {interviewLoading ? "Saving…" : app.interview ? "💾 Save Changes" : "📅 Schedule Interview"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowInterviewForm(false)}
                        disabled={interviewLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ApplicantRow;