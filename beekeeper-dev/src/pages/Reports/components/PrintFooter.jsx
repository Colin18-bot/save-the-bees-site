import React from "react";

export default function PrintFooter({ generatedAt }) {
  return (
    <footer className="hidden print:flex mt-10 border-t border-gray-300 pt-3 text-[10px] text-gray-600 items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">
          HiveTag
        </p>
        <p>
          Professional Hive Health Report
        </p>
      </div>

      <div className="text-center">
        <p>
          Generated {generatedAt}
        </p>
      </div>

      <div className="text-right">
        <p className="font-medium">
          Confidential
        </p>
        <p>
          For beekeeper use
        </p>
      </div>
    </footer>
  );
}