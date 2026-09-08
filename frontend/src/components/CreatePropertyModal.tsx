"use client";

import { FormEvent, useState } from "react";
import { createBuilding, createProject, createUnit } from "../lib/api";
import type { Project } from "../lib/types";
import { useAuth } from "./AuthProvider";
import { Modal } from "./Modal";

type Mode = "project" | "building" | "unit";

export function CreatePropertyModal({
  projects,
  onClose,
  onCreated,
}: {
  projects: Project[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const [mode, setMode] = useState<Mode>("project");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [buildingId, setBuildingId] = useState(
    projects[0]?.buildings[0]?.id ?? "",
  );
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    totalFloors: "",
    unitNumber: "",
    type: "2 BHK",
    price: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedProject = projects.find((project) => project.id === projectId);
  const buildings = selectedProject?.buildings ?? [];
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      if (mode === "project")
        await createProject(token, {
          name: form.name,
          location: form.location,
          description: form.description || null,
        });
      if (mode === "building")
        await createBuilding(token, {
          projectId,
          name: form.name,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
        });
      if (mode === "unit")
        await createUnit(token, {
          buildingId,
          unitNumber: form.unitNumber,
          type: form.type,
          price: Number(form.price),
          status: "available",
        });
      onCreated();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save property",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      eyebrow="INVENTORY · QUICK ADD"
      title="Add property"
      onClose={onClose}
    >
      <div className="segmented-control">
        {(["project", "building", "unit"] as Mode[]).map((item) => (
          <button
            className={mode === item ? "selected" : ""}
            key={item}
            type="button"
            onClick={() => setMode(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          {mode === "project" && (
            <>
              <label>
                Project name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Verdant Heights"
                />
              </label>
              <label>
                Location
                <input
                  required
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  placeholder="Whitefield, Bengaluru"
                />
              </label>
              <label className="form-wide">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
            </>
          )}
          {mode === "building" && (
            <>
              <label>
                Project
                <select
                  required
                  value={projectId}
                  onChange={(event) => {
                    const nextProjectId = event.target.value;
                    const nextProject = projects.find(
                      (project) => project.id === nextProjectId,
                    );
                    setProjectId(nextProjectId);
                    setBuildingId(nextProject?.buildings[0]?.id ?? "");
                  }}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option value={project.id} key={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Building name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Tower B"
                />
              </label>
              <label>
                Total floors
                <input
                  type="number"
                  min="1"
                  value={form.totalFloors}
                  onChange={(event) =>
                    setForm({ ...form, totalFloors: event.target.value })
                  }
                />
              </label>
            </>
          )}
          {mode === "unit" && (
            <>
              <label>
                Building
                <select
                  required
                  value={buildingId}
                  onChange={(event) => setBuildingId(event.target.value)}
                >
                  <option value="">Select a building</option>
                  {projects.flatMap((project) =>
                    project.buildings.map((building) => (
                      <option value={building.id} key={building.id}>
                        {project.name} · {building.name}
                      </option>
                    )),
                  )}
                </select>
              </label>
              <label>
                Unit number
                <input
                  required
                  value={form.unitNumber}
                  onChange={(event) =>
                    setForm({ ...form, unitNumber: event.target.value })
                  }
                  placeholder="B-1204"
                />
              </label>
              <label>
                Unit type
                <input
                  required
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                />
              </label>
              <label>
                Price
                <input
                  required
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
              </label>
            </>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button form-submit" disabled={saving}>
            {saving ? "Saving..." : `Create ${mode}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
