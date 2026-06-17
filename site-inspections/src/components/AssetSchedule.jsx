import { useState } from "react";
import FaultSelector from "./FaultSelector";
import { assetFaults } from "../data/assetFaults";

export default function AssetSchedule({ snags, setSnags }) {
  const [assetType, setAssetType] = useState("Lighting Column");
  const [street, setStreet] = useState("");
  const [reference, setReference] = useState("");
  const [selectedFaults, setSelectedFaults] = useState([]);
  const [customFault, setCustomFault] = useState("");
  const [customCategory, setCustomCategory] = useState("Electrical");
  const [photo, setPhoto] = useState("");

  function toggleFault(fault) {
    if (selectedFaults.includes(fault)) {
      setSelectedFaults(selectedFaults.filter((item) => item !== fault));
    } else {
      setSelectedFaults([...selectedFaults, fault]);
    }
  }

  function addCustomFault() {
    const fault = customFault.trim();
    if (!fault) return;

    const labelledFault = `${customCategory}: ${fault}`;

    if (!selectedFaults.includes(labelledFault)) {
      setSelectedFaults([...selectedFaults, labelledFault]);
    }

    setCustomFault("");
  }

  function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function addSnag() {
    if (!reference.trim() && !street.trim()) {
      alert("Please enter at least a reference or street/location.");
      return;
    }

    if (selectedFaults.length === 0) {
      alert("Please add at least one fault.");
      return;
    }

    const newSnag = {
      id: Date.now(),
      assetType,
      street,
      reference,
      faults: selectedFaults,
      photo,
    };

    setSnags([...snags, newSnag]);

    setAssetType("Lighting Column");
    setStreet("");
    setReference("");
    setSelectedFaults([]);
    setCustomFault("");
    setCustomCategory("Electrical");
    setPhoto("");
  }

  function deleteSnag(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this snag?"
  );

  if (!confirmed) return;

  setSnags(snags.filter((snag) => snag.id !== id));
}

  return (
    <section className="card">
      <h2>Asset Defect Schedule</h2>

      <div className="grid">
        <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
          <option>Lighting Column</option>
          <option>Bollard</option>
          <option>Illuminated Sign</option>
          <option>Feeder Pillar</option>
          <option>Bus Shelter</option>
          <option>Other</option>
        </select>

        <input
          type="text"
          placeholder="Street / Road Name"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />

        <input
          type="text"
          placeholder="Reference / Column Number / Location"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <FaultSelector
        groups={assetFaults}
        selectedFaults={selectedFaults}
        onToggleFault={toggleFault}
      />

      <div className="custom-row">
        <select
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
        >
          {assetFaults.map((group) => (
            <option key={group.category}>{group.category}</option>
          ))}
        </select>

        <textarea
          rows="3"
          placeholder="Add other asset fault..."
          value={customFault}
          onChange={(e) => setCustomFault(e.target.value)}
        />

        <button type="button" onClick={addCustomFault}>
          Add Other Fault To {customCategory}
        </button>
      </div>

      <div className="photo-row">
        <label>Optional photo</label>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>

      {photo && <img src={photo} alt="Selected snag" className="photo-preview" />}

      <button type="button" className="add-btn" onClick={addSnag}>
        Add To Schedule
      </button>

      <h3>Current Schedule</h3>

      {snags.length === 0 ? (
        <p className="muted">No asset defects added yet.</p>
      ) : (
        <table className="snag-table">
          <thead>
            <tr>
              <th>Street</th>
              <th>Asset / Reference</th>
              <th>Defects</th>
              <th>Photo</th>
              <th className="screen-only">Action</th>
            </tr>
          </thead>

          <tbody>
            {snags.map((snag) => (
              <tr key={snag.id}>
                <td>{snag.street}</td>

                <td>
                  {snag.assetType}
                  {snag.reference && (
                    <>
                      <br />
                      <strong>{snag.reference}</strong>
                    </>
                  )}
                </td>

                <td>
                  <ul>
                    {snag.faults.map((fault) => (
                      <li key={fault}>{fault}</li>
                    ))}
                  </ul>
                </td>

                <td>
                  {snag.photo ? (
                    <img src={snag.photo} alt="Snag" className="table-photo" />
                  ) : (
                    <span className="muted">No photo</span>
                  )}
                </td>

                <td className="screen-only">
                  <button type="button" onClick={() => deleteSnag(snag.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}