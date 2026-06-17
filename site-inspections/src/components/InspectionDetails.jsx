export default function InspectionDetails({ inspection, setInspection }) {
  function updateField(field, value) {
    setInspection({
      ...inspection,
      [field]: value,
    });
  }

  return (
    <section className="card">
      <h2>Inspection Details</h2>

      <div className="grid">
        <input
          type="text"
          placeholder="Site Name"
          value={inspection.siteName}
          onChange={(e) => updateField("siteName", e.target.value)}
        />

        <input
          type="text"
          placeholder="Developer"
          value={inspection.developer}
          onChange={(e) => updateField("developer", e.target.value)}
        />

        <input
          type="text"
          placeholder="Area / Phase"
          value={inspection.area}
          onChange={(e) => updateField("area", e.target.value)}
        />

        <select
          value={inspection.sectionType}
          onChange={(e) => updateField("sectionType", e.target.value)}
        >
          <option>Section 38</option>
          <option>Section 278</option>
          <option>Section 38 / 278</option>
        </select>

        <input
          type="date"
          value={inspection.inspectionDate}
          onChange={(e) => updateField("inspectionDate", e.target.value)}
        />

        <input
          type="text"
          placeholder="Inspector 1"
          value={inspection.inspectorOne}
          onChange={(e) => updateField("inspectorOne", e.target.value)}
        />

        <input
          type="text"
          placeholder="Inspector 2"
          value={inspection.inspectorTwo}
          onChange={(e) => updateField("inspectorTwo", e.target.value)}
        />
      </div>
    </section>
  );
}