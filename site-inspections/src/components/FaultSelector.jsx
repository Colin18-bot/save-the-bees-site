export default function FaultSelector({ groups, selectedFaults, onToggleFault }) {
  return (
    <div className="fault-selector">
      {groups.map((group) => (
        <div className="fault-group" key={group.category}>
          <h4>{group.category}</h4>

          <div className="fault-buttons">
            {group.faults.map((fault) => (
              <button
                key={fault}
                type="button"
                className={
                  selectedFaults.includes(fault)
                    ? "fault-chip selected"
                    : "fault-chip"
                }
                onClick={() => onToggleFault(fault)}
              >
                {fault}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}