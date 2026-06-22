import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const NewsManager: React.FC = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {isAm ? "ዜና እና ማስታወቂያዎች" : "News & Announcements Management"}
      </h2>
      <p className="text-sm text-gray-500">
        {isAm
          ? "የዜና እና ማስታወቂያ ማስተካከያ ገጽ (ቦታ ለእቅድ እና እባክዎን ይሙሉ)"
          : "Placeholder admin UI for managing news and announcements."}
      </p>
      {/* TODO: implement CRUD UI or embed admin editor here */}
    </div>
  );
};

export default NewsManager;
