import React, { useState, useEffect } from "react";
import {
  useUpdateNotification,
  useListNotificationSettings,
} from "@/common/api/api";

export const Notifications = () => {
  const [browserNotification, setBrowserNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const mutation = useUpdateNotification();

  const notificationSettings = useListNotificationSettings();

  useEffect(() => {
    if (notificationSettings.browser !== undefined) {
      setBrowserNotification(notificationSettings.browser);
      chrome.storage.local.set({
        browserNotification: notificationSettings.browser,
      });
    }
    if (notificationSettings.email_notification !== undefined) {
      setEmailNotification(notificationSettings.email_notification);
      chrome.storage.local.set({
        emailNotification: notificationSettings.email_notification,
      });
    }
  }, [notificationSettings.browser, notificationSettings.email_notification]);

  const handleToggle = (type: "browser" | "email") => {
    const newValue =
      type === "browser" ? !browserNotification : !emailNotification;

    if (type === "browser") {
      setBrowserNotification(newValue);
      chrome.storage.local.set({ browserNotification: newValue });
    } else {
      setEmailNotification(newValue);
      chrome.storage.local.set({ emailNotification: newValue });
    }

    mutation.mutate(
      { type, enabled: newValue },
      {
        onError: () => {
          if (type === "browser") {
            setBrowserNotification(!newValue);
            chrome.storage.local.set({ browserNotification: !newValue });
          } else {
            setEmailNotification(!newValue);
            chrome.storage.local.set({ emailNotification: !newValue });
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

        {/* Browser Notifications */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700">Browser Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={browserNotification}
              readOnly
            />
            <div
              onClick={() => handleToggle("browser")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                browserNotification ? "bg-[#f2cdcd]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  browserNotification ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Weekly Email Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={emailNotification}
              readOnly
            />
            <div
              onClick={() => handleToggle("email")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                emailNotification ? "bg-[#f2cdcd]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  emailNotification ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
