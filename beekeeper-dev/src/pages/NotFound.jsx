import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 relative">
      {/* Close Button */}
      <a
        href="https://www.beezknees.co.uk/"
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
        aria-label="Close and return to main site"
      >
        &times;
      </a>

      <h1 className="text-4xl font-bold text-green-700">404 - Page Not Found</h1>
      <p className="text-gray-700">
        Sorry, the page you are looking for does not exist.
      </p>
      <a
        href="/login"
        className="text-blue-600 hover:underline"
      >
        Return to Login Page
      </a>
    </div>
  );
};

export default NotFound;
