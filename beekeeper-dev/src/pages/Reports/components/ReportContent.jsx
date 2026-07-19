import React from "react";
import ExecutiveSummary from "./ExecutiveSummary";
import ColonyInsights from "./ColonyInsights";
import InspectionTimeline from "./InspectionTimeline";
import DetailedRecords from "./DetailedRecords";
import PhotoTimeline from "./PhotoTimeline";
import TasksLogbook from "./TasksLogbook";

export default function ReportContent(props) {
  const { activeTab } = props;

  return (
    <div className="mt-6 space-y-6">

  {activeTab === "summary" && (
    <div className="print-page">
      <ExecutiveSummary {...props} />
    </div>
  )}

  {activeTab === "insights" && (
    <div className="print-page">
      <ColonyInsights {...props} />
    </div>
  )}

 {activeTab === "timeline" && (
    <div className="print-page">
      <InspectionTimeline
        {...props}
        apiaryName={props.apiaryName}
      />
    </div>
  )}

  {activeTab === "details" && (
    <div className="print-page">
      <DetailedRecords {...props} />
    </div>
  )}

  {activeTab === "photos" && (
    <div className="print-page">
      <PhotoTimeline {...props} />
    </div>
  )}

  {activeTab === "tasks" && (
    <div className="print-page">
      <TasksLogbook {...props} />
    </div>
  )}

</div>
  );
}
