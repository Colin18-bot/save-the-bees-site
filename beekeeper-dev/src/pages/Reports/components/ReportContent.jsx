import React from "react";
import ExecutiveSummary from "./ExecutiveSummary";
import ColonyInsights from "./ColonyInsights";
import InspectionTimeline from "./InspectionTimeline";
import DetailedRecords from "./DetailedRecords";
import PhotoTimeline from "./PhotoTimeline";
import TasksLogbook from "./TasksLogbook";
import QueenRecordsReport from "./QueenRecordsReport";

const ScreenSection = ({ activeTab, id, children }) =>
  activeTab === id ? <div className="print:hidden">{children}</div> : null;

export default function ReportContent(props) {
  const {
    activeTab,
    isPremium,
    includeInspections,
    includeTodos,
    includeLogbook,
    includeQueens,
  } = props;

  return (
    <div className="mt-6 space-y-6">
      {isPremium && (
        <ScreenSection activeTab={activeTab} id="summary">
          <ExecutiveSummary {...props} />
        </ScreenSection>
      )}

      {isPremium && includeInspections && (
        <>
          <ScreenSection activeTab={activeTab} id="insights">
            <ColonyInsights {...props} />
          </ScreenSection>

          <ScreenSection activeTab={activeTab} id="timeline">
            <InspectionTimeline {...props} apiaryName={props.apiaryName} />
          </ScreenSection>

          <ScreenSection activeTab={activeTab} id="details">
            <DetailedRecords {...props} />
          </ScreenSection>

          <ScreenSection activeTab={activeTab} id="photos">
            <PhotoTimeline {...props} />
          </ScreenSection>
        </>
      )}

      {isPremium && (includeTodos || includeLogbook) && (
        <ScreenSection activeTab={activeTab} id="tasks">
          <TasksLogbook {...props} />
        </ScreenSection>
      )}

      {includeQueens && (
        <ScreenSection activeTab={activeTab} id="queens">
          <QueenRecordsReport {...props} />
        </ScreenSection>
      )}

      <div className="hidden print:block">
        {isPremium && (
          <div className="print-page">
            <ExecutiveSummary {...props} />
          </div>
        )}

        {isPremium && includeInspections && (
          <>
            <div className="print-page">
              <ColonyInsights {...props} />
            </div>
            <div className="print-page">
              <InspectionTimeline {...props} apiaryName={props.apiaryName} />
            </div>
            <div className="print-page">
              <DetailedRecords {...props} />
            </div>
            <div className="print-page">
              <PhotoTimeline {...props} />
            </div>
          </>
        )}

        {isPremium && (includeTodos || includeLogbook) && (
          <div className="print-page">
            <TasksLogbook {...props} />
          </div>
        )}

        {includeQueens && (
          <div className="print-page">
            <QueenRecordsReport {...props} />
          </div>
        )}
      </div>
    </div>
  );
}
