import { useState } from "react";
import FaultSelector from "./FaultSelector";
import { siteWideFaults } from "../data/siteWideFaults";

export default function SiteWideIssues({
  selectedSiteFaults,
  setSelectedSiteFaults,
}) {
  const [customFault, setCustomFault] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  function toggleFault(fault) {
    if (selectedSiteFaults.includes(fault)) {
      setSelectedSiteFaults(selectedSiteFaults.filter((item) => item !== fault));
    } else {
      setSelectedSiteFaults([...selectedSiteFaults, fault]);
    }
  }

  function addCustomFault() {
    const custom = customFault.trim();
    if (!custom) return;

    setSelectedSiteFaults([...selectedSiteFaults, custom]);
    setCustomFault("");
  }

  function deleteFault(index) {
    setSelectedSiteFaults(selectedSiteFaults.filter((_, i) => i !== index));
  }

  function startEdit(index, fault) {
    setEditingIndex(index);
    setEditingText(fault);
  }

  function saveEdit(index) {
    const updated = [...selectedSiteFaults];
    updated[index] = editingText;
    setSelectedSiteFaults(updated);
    setEditingIndex(null);
    setEditingText("");
  }

  return (
    <section className="card">
      <h2>Site-Wide Issues</h2>

      <FaultSelector
        groups={siteWideFaults}
        selectedFaults={selectedSiteFaults}
        onToggleFault={toggleFault}
      />

      <div className="custom-row">
        <textarea
          rows="3"
          placeholder="Add other site-wide issue..."
          value={customFault}
          onChange={(e) => setCustomFault(e.target.value)}
        />

        <button type="button" onClick={addCustomFault}>
          Add Other Issue
        </button>
      </div>

      <h3>Selected Site-Wide Issues</h3>

      {selectedSiteFaults.length === 0 ? (
        <p className="muted">No site-wide issues added yet.</p>
      ) : (
        <ul className="editable-list">
          {selectedSiteFaults.map((fault, index) => (
            <li key={index}>
              {editingIndex === index ? (
                <>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button type="button" onClick={() => saveEdit(index)}>
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span>{fault}</span>
                  <div className="mini-actions">
                    <button type="button" onClick={() => startEdit(index, fault)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteFault(index)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}