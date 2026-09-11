import React from "react";
import QueenRecordsBase from "./QueenRecordsBase.jsx";
import QueenUnionPanel from "./QueenUnionPanel.jsx";
import QueenSwarmPanel from "./QueenSwarmPanel.jsx";

export default function QueenRecords() {
  return (
    <>
      <QueenUnionPanel />
      <QueenSwarmPanel />
      <QueenRecordsBase />
    </>
  );
}
