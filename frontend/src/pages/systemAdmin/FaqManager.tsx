import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const FaqManager: React.FC = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {isAm ? "FAQ አስተዳደር" : "FAQ Management"}
      </h2>
      <p className="text-sm text-gray-500">
        {isAm
          ? "FAQ እባክዎን እዚህ ይማሩ እና ይከታተሉ"
          : "Placeholder admin UI for managing frequently asked questions."}
      </p>
      {/* TODO: implement CRUD UI for FAQ entries */}
    </div>
  );
};

export default FaqManager;
