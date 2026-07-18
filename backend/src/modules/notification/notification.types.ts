//file: backend/src/modules/notification/notification.types.ts
export type NotificationType =
  | "APPROVED"
  | "REJECTED"
  | "INSPECTION"
  | "EXPIRY_ALERT"
  | "CRITICAL_ISSUE"
  | "NEW_APPLICATION"
  | "CERT_SIGNED"
  | "FORMAL_REQUEST_SUBMITTED"
  | "FORMAL_REQUEST_APPROVED"
  | "FORMAL_REQUEST_REJECTED"
  | "TRANSFER_REQUEST_INITIATED_SOURCE"
  | "TRANSFER_REQUEST_INITIATED_DESTINATION"
  | "TRANSFER_REQUEST_REJECTED"
  | "ADDRESS_CHANGE_SUBMITTED"
  | "ADDRESS_CHANGE_APPROVED"
  | "ADDRESS_CHANGE_REQUESTED"
  | "CRIMINAL_REPORT_SUBMITTED";

export interface NotificationContext {
  organizationName?: string; // English name
  organizationNameAm?: string; // Amharic name
  currentOrganizationName?: string;
  currentOrganizationNameAm?: string;
  destinationOrganizationName?: string;
  destinationOrganizationNameAm?: string;
  employeeName?: string;
  faydaId?: string;
  transferReason?: string;
  requestReason?: string;
  certificateSerial?: string;
  inspectionDate?: string;
  daysRemaining?: number;
  customDetailsEn?: string;
  customDetailsAm?: string;
}

export const getBilingualTemplate = (
  type: NotificationType,
  ctx: NotificationContext,
): {
  titleEn: string;
  titleAm: string;
  msgEn: string;
  msgAm: string;
} => {
  switch (type) {
    case "APPROVED":
      return {
        titleEn: "🎉 License Application Successfully Approved",
        titleAm: "🎉 የፈቃድ ማመልከቻ በተሳካ ሁኔታ ጸድቋል",
        msgEn: `Congratulations! Your private security operational license application for "${ctx.organizationName}" has been officially approved.\n\n📋 Certificate Details:\n• Issued Date: Today\n• Certificate Serial: ${ctx.certificateSerial || "Pending"}\n• Validity: 1 Years\n• Status: Active\n\nNext Steps:\n1. Download your license certificate from the portal\n2. Display the certificate at your office premises\n3. Provide a copy to all operational staff\n4. Comply with security protocols outlined in regulations\n\nSupport:\nFor questions regarding your license, contact us at efp.support@gov.et or call +251-11-XXXXXX during business hours (8:00 AM - 5:00 PM ET).\n\nThank you for maintaining professional security standards!`,
        msgAm: `ደስ ይበሉ! ለኩባንያዎ "${ctx.organizationNameAm || ctx.organizationName}" የቀረበው የግል ጥበቃ ሥራ ፈቃድ ማመልከቻ በይፋ ጸድቋል።\n\n📋 የፈቃድ ዝርዝር:\n• የስሪት ቀን: ዛሬ\n• የሰርቲፍኬት ተከታታይ ቁጥር: ${ctx.certificateSerial || "በመጠበቅ ላይ"}\n• ትክክለኛነት ጊዜ: 1 ዓመት\n• ሁኔታ: ንቁ\n\nቀጣይ ደረጃዎች:\n1. የፈቃድዎን ሰርቲፍኬት ከ ወንጌል ዩኢ ድረ-ገጽ ያውርዱ\n2. ሰርቲፍኬቱን በቢሮዎ ቦታ ላይ አሳይ\n3. ወታደራዊ ሕገ-ወጥ ሠራዊትህ ሁሉ ለ ሰርቲፍኬት ሕትመት\n4. በ ደንቦች ውስጥ ለተጠቀሱት የጥበቃ ፕሮቶኮሎች ሁኔታ\n\nድጋፍ:\nስለ ፈቃድዎ ጠይቆች ላይ ፣ efp.support@gov.et ላይ ያሙሩ ወይም +251-11-XXXXXX ወደ ክፍሉ በስራ ሰዓታት (ꊂ:00 ማታ - 5:00 ሪ ዩ ተ) ውስጥ ይደውሉ።\n\nለ ሙያዊ ጥበቃ ደረጃዎች ለመጠበቅ እናመሰግናለን!`,
      };
    case "REJECTED":
      return {
        titleEn: "⚠️ Application Under Review - Resubmission Required",
        titleAm: "⚠️ ማመልከቻ በ ግምገማ ላይ - ደጋግመው ማቅረብ ያስፈልጋል",
        msgEn: `Your application for "${ctx.organizationName}" has been reviewed and requires corrective action before approval.\n\n❌ Rejection Reason:\n${ctx.customDetailsEn || "See detailed feedback in the portal"}\n\n📋 Required Actions:\n1. Review the detailed feedback in your account portal\n2. Address all identified issues (typically within 15-30 days)\n3. Resubmit corrected documents with explanation\n4. Your application will be re-reviewed within 7 business days\n\n⏰ Important Timeline:\n• Action Deadline: 30 days from notification date\n• Re-review Period: 7 business days after resubmission\n• Contact Support if deadline adjustment needed\n\n📞 Need Help?\nOur compliance team is available to clarify requirements:\n• Email: compliance@efp.gov.et\n• Phone: +251-11-XXXXXX\n• Hours: Monday-Friday, 8:00 AM - 5:00 PM ET\n\nDo not hesitate to contact us for guidance.`,
        msgAm: `ለ "${ctx.organizationNameAm || ctx.organizationName}" ያቀረቡት ማመልከቻ ተገምግሟል እና ከ ፍቃድ በፊት እርማታዊ ተግባር ስሌት ይፈልጋል።\n\n❌ የውድቅ ምክንያት:\n${ctx.customDetailsAm || "በ ወንጌል ዩኢ ውስጥ ዝርዝር ሪ ከላይ ይመልከቱ"}\n\n📋 ያስፈልጋቸው ተግባራት:\n1. በ ሥራዎ ወንጌል ውስጥ ዝርዝር ግምገማ ይመልከቱ\n2. ሁሉንም ተለይቶ የተወሰኑ ተግባራት ያስተካክሉ (በ 15-30 ቀናት ውስጥ)\n3. ተስተካክሎ ወረቀቶች ልብ ወለድ ጋር ደጋግሙ ያቅርቡ\n4. ማመልከቻዎ ከ ደጋግም ግምገማ ውስጥ ከ 7 ሥራ ቀና ውስጥ ይገመገም\n\n⏰ ወሳኝ ጊዜ:\n• ተግባር የሚያበቃበት ቀን: ከ ማስጠንቀቂያ ቀን ጀምሮ 30 ቀናት\n• ደጋግም የ ግምገማ ክፍለ ጊዜ: ከ ደጋግም ማስገቢያ ከ 7 ሥራ ቀናት ውስጥ\n• ከ ጊዜ ማስተካከያ ውሳኔ ከሆነ ድጋፍ ያነጋግሩ\n\n📞 እርዳታ ያስፈልገውዎ?\nየ ሕግ ሙያ ቡድን ሁኔታ ግልጽ ለማድረግ ይገኛል:\n• ኢሜይል: compliance@efp.gov.et\n• ስልክ: +251-11-XXXXXX\n• ሰዓታት: ሰኞ-ዓርብ, ꊂ:00 ማታ - 5:00 ሪ ዩ ተ\n\nለ መመሪያ ድጋፍ ማያመልከት አትደነግጡ።`,
      };
    case "INSPECTION":
      return {
        titleEn: "📅 Physical Inspection Scheduled - Prepare Your Facility",
        titleAm: "📅 የአካል ምርመራ ተቀጥሯል - ተቋሙን ዝግጁ ያድርጉ",
        msgEn: `An official regulatory inspection has been scheduled for your organization, "${ctx.organizationName}".\n\n📍 Inspection Details:\n• Date: ${ctx.inspectionDate}\n• Type: Regulatory Compliance & Security Review\n• Duration: 3-4 hours (estimated)\n• Location: Your registered office premises\n\n✅ Preparation Checklist:\n1. Ensure all staff are present and briefed on inspection purpose\n2. Prepare compliance documentation (licenses, certifications, training records)\n3. Verify security systems operational (alarms, CCTV, access controls)\n4. Review incident logs from the past 12 months\n5. Prepare facility for walk-through inspection\n\n⏰ Timeline:\n• Preparation Period: From today until inspection date\n• Inspector Arrival: ${ctx.inspectionDate} at scheduled time\n• Results Notification: Within 5 business days\n\n📞 Important Contact:\nIf you need to reschedule (emergency only):\n• Contact: inspections@efp.gov.et\n• Phone: +251-11-XXXXXX ext. 3\n• Notice: Minimum 48 hours in advance\n\n✨ Remember: This inspection ensures public safety and maintains professional standards. Cooperation is greatly appreciated.`,
        msgAm: `ለ ድርጅትዎ "${ctx.organizationNameAm || ctx.organizationName}" ይፋዊ ደንብ ምርመራ ተቀጥሮለታል።\n\n📍 የ ምርመራ ዝርዝር:\n• ቀን: ${ctx.inspectionDate}\n• ዓይነት: ደንብ ተገዢነት እና ጥበቃ ክለሳ\n• ቆይታ: 3-4 ሰዓታት (ግምት)\n• ቦታ: የ ተመዘገበ ቢሮ ዋና ፈተና\n\n✅ ዝግጅት ዝርዝር:\n1. ሁሉም ሰራተኞች ይገኙ እና በ ምርመራ ዓላማ መመሪያ ቅንብር\n2. ሕግ ሙያ ወረቀቶች ዝግጅት (ፈቃዶች, ሰርቲፍኬቶች, ስልጠና ዝርዝር)\n3. ጥበቃ ስርዓቶች ንቁ (ማንቂያ, CCTV, ምለስ ቁጥጥር)\n4. ከ ባለፈው 12 ወር ውስጥ የ ቢሮ ዝርዝር ግምገማ\n5. ተቋሙ ለ ዞር ምርመራ ዝግጁ\n\n⏰ ጊዜ:\n• ዝግጅት ክፍለ ጊዜ: ዛሬ ከ ምርመራ ቀን ጀምሮ\n• ምርመራ ሥራ ገንቢ ገበታ: ${ctx.inspectionDate} በ ቀን ጊዜ\n• ውጤቶች ማሳወቂያ: ክሪያ 5 ሥራ ቀናት ውስጥ\n\n📞 ወሳኝ ግንኙነት:\nቀን ሰቀዳ ሪ ሰብስ ወጥክ (ወሳኝ ብቻ):\n• ምረቃ: inspections@efp.gov.et\n• ስልክ: +251-11-XXXXXX ext. 3\n• ማሳወቂያ: ዝግባ ስቅር 48 ሰዓታት በ ግዜ\n\n✨ አስታዉሱ: ይህ ምርመራ ህዝብ ኃላፊነት እና ሙያዊ ደረጃ ተገልግል። ተባበር በጣም ይመስከራል።`,
      };
    case "EXPIRY_ALERT":
      return {
        titleEn: `⏰ License Expiration Alert: ${ctx.daysRemaining} Days Remaining`,
        titleAm: `⏰ የ ፈቃድ ማብቂያ ማስጠንቀቂያ: ${ctx.daysRemaining} ቀናት ቀርተዋል`,
        msgEn: `Your security license is set to expire soon. Immediate action is required to maintain continuous operational authorization.\n\n📋 Current License Status:\n• Certificate Serial: ${ctx.certificateSerial}\n• Expiration Date: ${ctx.daysRemaining} days from today\n• Renewal Deadline: ${(ctx.daysRemaining ?? 7) - 7} days (recommended)\n• Current Status: ACTIVE (expires in ${ctx.daysRemaining} days)\n\n🔄 Renewal Process - Follow These Steps:\n1. Log into your account portal at efp-pso.gov.et\n2. Navigate to "License Management" → "Request Renewal"\n3. Complete renewal form (takes ~10 minutes)\n4. Upload updated compliance documentation:\n   - Recent background checks for all personnel\n   - Updated security training certificates\n   - Current facility inspection reports\n5. Submit and pay renewal fee (check portal for amount)\n6. Renewal decision within 3 business days\n\n⏰ Critical Deadlines:\n• Recommended Renewal: Start TODAY (leaves 7 days buffer)\n• Latest Renewal Submission: ${ctx.daysRemaining} days\n• Grace Period: No grace period - operations must cease if expired\n\n💳 Payment Information:\n• Renewal Fee: Payable online via portal\n• Methods Accepted: Bank transfer, mobile payment, card\n• Receipt: Issued immediately upon payment\n\n⚠️ WARNING:\nOperating with an expired license results in:\n• Immediate suspension of operations\n• Substantial fines (up to 50,000 ETB)\n• Potential legal action\n\n📞 Renewal Support:\nIf you encounter issues:\n• Email: renewal@efp.gov.et\n• Phone: +251-11-XXXXXX ext. 2\n• Hours: Daily 7:00 AM - 6:00 PM ET (including weekends)\n\n🚀 Act Now: Renew your license today to avoid disruption to your operations!`,
        msgAm: `የ ጥበቃ ፈቃድዎ በቶሎ ያብቃል። ያለ ውቅፊት ኦፕሬሽን ኃላፊነት ለመጠበቅ ወሳኝ ተግባር ያስፈልጋል።\n\n📋 የ ሕጋዊ ፈቃድ ሁኔታ:\n• የ ሰርቲፍኬት ተከታታይ ቁጥር: ${ctx.certificateSerial}\n• የ ማብቂያ ቀን: ከ ዛሬ ጀምሮ ${ctx.daysRemaining} ቀናት\n• የ ታዪ ሪኒዩ ዘዴ: ${(ctx.daysRemaining ?? 7) - 7} ቀናት (ዋቅ)\n• የ ዚህ ቆመት: ንቁ (ከ ${ctx.daysRemaining} ቀናት ውስጥ ያብቃል)\n\n🔄 ታዪ ሪኒዩ ሂደት - እነዚህ ደረጃዎች ተከተሉ:\n1. ወደ efp-pso.gov.et ወደ ሥራ ወታደራዊ ገቡ\n2. "ፈቃድ ምናሌ" ወደ ተጐምር → "ታዪ ሪኒዩ ጠይቆ ተቀርቅሩ"\n3. ታዪ ሪኒዩ ቅጽ ሙሉ ያድርጉ (~10 ደቂቃ)\n4. ሕጋዊ ወረቀቶች ባስቀመጥ:\n   - ለ ሁሉም ሰራተኞች ከ ሳህ አሚሳ ተሳትፋ\n   - ሕጋዊ ስልጠና ሰርቲፍኬቶች ሙሉ ከ አሪ\n   - የ ቢሮ ምርመራ ሪፖርት ሰዓት\n5. ጠይቅ ፊልህ ታዪ ሪኒዩ ክፍያ ጠይቆ (በ ወንጌል ዩኢ ክሊክ)\n6. ታዪ ሪኒዩ ነ ሆነበት 3 ሥራ ቀናት ውስጥ\n\n⏰ ወሳኝ ጊዜ:\n• ዋቅ ታዪ ሪኒዩ: ዛሬ ጀምር (7 ቀናት ቅጥያ ይቅር ማለት)\n• ሥልጠና ታዪ ሪኒዩ ገቢ: ${ctx.daysRemaining} ቀናት\n• ጉ ወቅት: ጉ ወቅት ለ ስበስብ - ወታደራዊ ሥራ ማብቂያ ከ ፈቃድ\n\n💳 ክፍያ መረጃ:\n• ታዪ ሪኒዩ ክፍያ: በ ወንጌል ዩኢ ኦን ላይን ለ ክፍያ\n• ዓይነት ተቀብሉ: ባንክ ክፍያ, የ ሞቢል ክፍያ, ካርድ\n• ተመልሟ: ወዲ ኦን ላይን ክፍያ\n\n⚠️ ማስጠንቀቂያ:\nበ ፈቃድ ያበቃ ሥራ ውስጥ ውጤቱ:\n• ትክክል ሪድ ኦፕሬሽን ዘግየ\n• ፍተሻ ብዙ ሪ (50,000 ታሪ ወደ ከ ላይ)\n• ლიፍ ወሳኝ እርምጃ\n\n📞 ታዪ ሪኒዩ ድጋፍ:\nተግባራት ወጋ ተገጣጠምክ:\n• ኢሜይል: renewal@efp.gov.et\n• ስልክ: +251-11-XXXXXX ext. 2\n• ሰዓታት: ዎክ 7:00 ማታ - 6:00 ሪ ዩ ተ (ሳምንት ቀናትም)\n\n🚀 ዛሬ ተግባር: ተቋሙ ሥራ ማብቂያ ለመውጣት ፈቃድዎን ዛሬ ያድሱ!`,
      };
    case "CRITICAL_ISSUE":
      return {
        titleEn: "🚨 URGENT: Critical Security Compliance Violation Detected",
        titleAm: "🚨 አስቸኳይ: ወሳኝ ጥበቃ ሕግ ተገዢነት ጉድለት ታይቷል",
        msgEn: `⚠️ ALERT ⚠️\nA critical security compliance violation has been detected at your facility. Immediate corrective action is required.\n\n🔴 Issue Severity: CRITICAL\n📋 Violation Details:\n${ctx.customDetailsEn || "See detailed report in your account"}\n\n⏰ Investigation & Compliance Timeline:\n• Violation Detected: Today\n• Initial Investigation Period: 48 hours\n• Compliance Deadline: 7 days from notification\n• Follow-up Inspection: Within 7-10 days\n\n🔧 Required Corrective Actions:\n1. IMMEDIATELY: Cease any non-compliant operations\n2. WITHIN 24 HOURS: Notify management and relevant staff\n3. WITHIN 48 HOURS: Conduct internal assessment and document findings\n4. WITHIN 5 DAYS: Submit detailed corrective action plan\n   - What was the violation?\n   - Root cause analysis\n   - Specific corrective measures implemented\n   - Timeline for full compliance\n   - Staff training/reorientation completed\n5. WITHIN 7 DAYS: Full compliance achieved and documented\n\n📝 Required Documentation to Submit:\n• Internal investigation report\n• Staff training certificates (reorientation)\n• Equipment inspection/maintenance records\n• Corrective action implementation photos/evidence\n• Management sign-off on compliance\n\n📞 URGENT SUPPORT (24/7):\n• Critical Issues Hotline: +251-11-XXXXXX ext. 5\n• Emergency Email: critical-compliance@efp.gov.et\n• Response Time: Within 1 hour\n\n⚖️ Consequences of Non-Compliance:\n• IMMEDIATE: Operational suspension\n• FINANCIAL: Fines ranging from 25,000 to 100,000 ETB\n• LEGAL: Potential criminal charges for management\n• REGULATORY: License revocation and industry blacklisting\n\n✅ Path to Resolution:\n1. Contact us immediately if unclear on any requirement\n2. Act decisively on corrective measures\n3. Document all compliance efforts thoroughly\n4. Submit evidence within deadline\n5. Demonstrate sustained compliance during follow-up inspection\n\n🎯 Your commitment to security excellence is critical to public safety. We are here to support you through this resolution process.`,
        msgAm: `⚠️ ማስጠንቀቂያ ⚠️\nወሳኝ ጥበቃ ሕግ ተገዢነት ጉድለት በ ተቋሙ ይገኛል። ወሳኝ እርማታዊ ተግባር ያስፈልጋል።\n\n🔴 ተግባር ስውር ደረጃ: ወሳኝ\n📋 የ ተግባር ጉድለት ዝርዝር:\n${ctx.customDetailsAm || "በ ሥራ ውስጥ ዝርዝር ሪፖርት ይመልከቱ"}\n\n⏰ የ ምርመራ እና ሕግ ተገዢነት ጊዜ:\n• ተግባር ጉድለት ታይቷል: ዛሬ\n• የ መጀመሪያ ምርመራ ክፍለ ጊዜ: 48 ሰዓታት\n• የ ሕግ ተገዢነት ሲገብር: ከ ማስጠንቀቂያ ጀምሮ 7 ቀናት\n• ቀጣይ ምርመራ: 7-10 ቀናት ውስጥ\n\n🔧 ያስፈልጋቸው እርማታዊ ተግባራት:\n1. ወቅታዊ: ሕግ ያልሆነ ውጤት ኦፕሬሽን ተወንጠጡ\n2. ከ 24 ሰዓታት ውስጥ: ሥራ ሰራተኞች ብቃት ናቸዋ ማሳወቂያ\n3. ከ 48 ሰዓታት ውስጥ: ውስጣዊ ግምገማ እና መታወቂያ\n4. ከ 5 ቀናት ውስጥ: ዝርዝር እርማታዊ ተግባር ዕቅድ ጠይቅ\n   - ምንድ ነውስ ጉድለት?\n   - ሥር ምክንያት ትንተና\n   - ተወሰነ እርማታዊ ተግባራት ተግባር ሞንጌ\n   - ሕግ ተገዢነት ሙሉ ጊዜ\n   - ሥራ ሰራተኞች ስልጠና ሙሉ\n5. ከ 7 ቀናት ውስጥ: ሙሉ ሕግ ተገዢነት ተገልግል አቅጣጫ\n\n📝 ለ ጠይቅ ያስፈልግ ወረቀቶች:\n• ውስጣዊ ምርመራ ሪፖርት\n• ሥራ ሰራተኞች ስልጠና ሰርቲፍኬቶች (አሪ ስልጠና)\n• ሃርድ ወሪ ምርመራ/ጠገና ዝርዝር\n• እርማታዊ ተግባር ተግባር ሞንጌ/ሞንጌ\n• ሥራ ሰራተኞች ሙሙ ሕግ ተገዢነት\n\n📞 አስቸኳይ ድጋፍ (24/7):\n• ወሳኝ ተግባራት ሞጋገዝ: +251-11-XXXXXX ext. 5\n• ወሳኝ ኢሜይል: critical-compliance@efp.gov.et\n• ምላሽ ጊዜ: ውስጥ ከ 1 ሰዓት ውስጥ\n\n⚖️ ሕግ ተገዢነት አለ ውጤት:\n• ወዲ: ኦፕሬሽን ዘግየ\n• ሪ-ገንዳ: ክፍያ 25,000 ወደ 100,000 ታሪ ከ ብዙ\n• ወሳኝ: ሊፍ ወሳኝ ሕግ እርምጃ\n• ሕግ: ፈቃድ ውድቅ ማድረግ እና ሙያ ሊ ወሰነ\n\n✅ ዓላማ አሪ ሁኔታ:\n1. ወሳኝ እርማታዊ ፍቅር ግልጽ የለ ከሆነ ወደ ኡስ ገቡ\n2. የ ወሳኝ ተግባራት ረኝተ\n3. ሕግ ተገዢነት ሙሉ ሙሉ\n4. ሞንጌ ውስጥ ጊዜ ጠይቅ\n5. ቀጣይ ምርመራ ወቅት ዘላቂ ሕግ ተገዢነት ዋቅ\n\n🎯 ለ ጥበቃ ፍቅር ሙሙ ህዝብ ኃላፊነት ወሳኝ ነው። ኛ ትንግንግ ይህ አሪ ሂደት ውስጥ ድጋፍ ለ ማድረግ የ ዋቅ።`,
      };
    case "NEW_APPLICATION":
      return {
        titleEn: "📋 New Application Submitted for Review",
        titleAm: "📋 አዲስ ማመልከቻ ለ ግምገማ ቀርቧል",
        msgEn: `A new application has been submitted and requires your review.\n\n📋 Application Details:\n• Organization: ${ctx.organizationName || "Not specified"}\n• Application Type: ${ctx.customDetailsEn || "New Application"}\n• Submitted: Today\n\n📝 Next Steps:\n1. Review the application details in the portal\n2. Verify all submitted documents\n3. Conduct initial assessment\n4. Schedule inspection if required\n\nPlease log in to the admin portal to review this application.`,
        msgAm: `አዲስ ማመልከቻ ቀርቧል እና ለ ግምገማ ይፈልጋል።\n\n📋 የ ማመልከቻ ዝርዝር:\n• ድርጅት: ${ctx.organizationNameAm || ctx.organizationName || "አልተገለጸም"}\n• የ ማመልከቻ ዓይነት: ${ctx.customDetailsAm || "አዲስ ማመልከቻ"}\n• ቀርቧል: ዛሬ\n\n📝 ቀጣይ ደረጃዎች:\n1. የ ማመልከቻ ዝርዝር በ ወንጌል ዩኢ ውስጥ ይመልከቱ\n2. ሁሉንም የ ቀረቡ ሰነዶች ያረጋግጡ\n3. የ መጀመሪያ ግምገማ ያካሂዱ\n4. ከ ተፈለገ ምርመራ ይቀጥሩ\n\nእባክዎ ይህን ማመልከቻ ለ ማመልከቻ ወደ አስተዳደር ወንጌል ዩኢ ይግቡ እና ይመልከቱ።`,
      };
    case "CERT_SIGNED":
      return {
        titleEn: "🔖 Certificate Signed — Stamping Required",
        titleAm: "🔖 ሰርቲፍኬት ጸደቀ — ማቀዝቀዣ ይፈልጋል",
        msgEn: `A certificate for "${ctx.organizationName || "(unknown)"}" (Serial: ${ctx.certificateSerial || "—"}) has been signed by an administrative official and awaits stamping by the Licensing Authority.

      Action required:
      • Review the signed certificate
      • Apply official stamp if documents are correct
      • Confirm stamping in the portal

      Certificate: ${ctx.certificateSerial || "(unknown)"}
      Organization: ${ctx.organizationName || "(unknown)"}`,
        msgAm: `ለ "${ctx.organizationNameAm || ctx.organizationName || "(ያልታወቀ)"}" የተሰጠ ሰርቲፍኬት (ቁጥር: ${ctx.certificateSerial || "—"}) በ አዋጅ ሠራተኛ ጸድቋል እና ለ ማቀዝቀዣ በ ፈቃድ ፈቃድ ወደ ሊሲንስ ባለሥልጣን ይገኛል።

      እርምጃ ያስፈልጋል:
      • የተሰጠውን ሰርቲፍኬት ይገምግሙ
      • ሰረዘ ወይም የማቀዝቀዣ ማስፈረድ ከሆነ ይቀርቡ
      • በ ፖርታል ውስጥ የማቀዝቀዣ ማረጋገጫ ያድርጉ

      ሰርቲፍኬት: ${ctx.certificateSerial || "(ያልታወቀ)"}
      ድርጅት: ${ctx.organizationNameAm || ctx.organizationName || "(ያልታወቀ)"}`,
      };
    case "FORMAL_REQUEST_SUBMITTED":
      return {
        titleEn: `📋 New Formal Request - ${ctx.organizationName || "Applicant"} (${ctx.organizationNameAm || "ID"})`,
        titleAm: `📋 አዲስ ጥያቄ - ${ctx.organizationName || "ተመልካች"} (${ctx.organizationNameAm || "ID"})`,
        msgEn: `A formal request letter has been submitted and needs your review.\n\n👤 Applicant:\n${ctx.organizationName || "N/A"}\n\n🆔 Fayida ID:\n${ctx.organizationNameAm || "N/A"}\n\n⏱️ Submitted:\n${new Date().toLocaleString("en-US")}\n\n✅ Action:\nReview and approve/reject in the admin dashboard.\n\n🕐 Timeline: 5-7 business days`,
        msgAm: `የፈቃድ ደብዳቤ ጥያቄ ቀርቦ ለመገምገም ያስፈልግ ነው።\n\n👤 ተመልካች:\n${ctx.organizationName || "N/A"}\n\n🆔 ፋይዳ ቁጥር:\n${ctx.organizationNameAm || "N/A"}\n\n⏱️ ቀርበበት ጊዜ:\n${new Date().toLocaleString("am-ET")}\n\n✅ ተግባር:\nበ አስተዳደር ዳሽቦርድ ውስጥ ይገምግሙ እና ጸድቆ/ውድቅ ያድርጉ።\n\n🕐 ጊዜ: 5-7 ሥራ ቀናት`,
      };
    case "FORMAL_REQUEST_APPROVED":
      return {
        titleEn: "✅ Your Formal Request Approved!",
        titleAm: "✅ የእርስዎ ፈቃድ ደብዳቤ ጥያቄ ጸድቋል!",
        msgEn: `Dear ${ctx.organizationName || "Applicant"},\n\nYour formal request letter has been APPROVED by the Federal Police Administration.\n\n📋 Details:\n• Fayida ID: ${ctx.organizationNameAm || "N/A"}\n• Status: APPROVED ✓\n• Date: ${new Date().toLocaleString("en-US")}\n\n✅ Next Step:\nYou can now proceed with your full license application.\n\nThank you!`,
        msgAm: `ውድ ${ctx.organizationName || "ተመልካች"},\n\nየእርስዎ መደበኛ ፈቃድ ደብዳቤ ጥያቄ በፌዴራል ፖሊስ አስተዳደር ጸድቋል።\n\n📋 ዝርዝር:\n• ፋይዳ ቁጥር: ${ctx.organizationNameAm || "N/A"}\n• ሁኔታ: ጸድቋል ✓\n• ቀን: ${new Date().toLocaleString("am-ET")}\n\n✅ ቀጣይ ደረጃ:\nአሁን ወደ ሙሉ የፈቃድ ማመልከቻ መቀጠል ይችላሉ።\n\nእናመሰግናለን!`,
      };
    case "FORMAL_REQUEST_REJECTED":
      return {
        titleEn: "❌ Your Formal Request Needs Correction",
        titleAm: "❌ የእርስዎ ፈቃድ ደብዳቤ ጥያቄ እርማት ያስፈልጋል",
        msgEn: `Dear ${ctx.organizationName || "Applicant"},\n\nYour formal request letter has been REJECTED and needs corrections.\n\n📋 Details:\n• Fayida ID: ${ctx.organizationNameAm || "N/A"}\n• Status: REJECTED ❌\n• Date: ${new Date().toLocaleString("en-US")}\n\n💬 Admin Feedback:\n${ctx.customDetailsEn || "Please review the requirements and resubmit."}\n\n✅ Action Required:\nMake the necessary corrections and resubmit your formal letter.\n\nSupport: formal-requests@efp.gov.et`,
        msgAm: `ውድ ${ctx.organizationName || "ተመልካች"},\n\nየእርስዎ መደበኛ ፈቃድ ደብዳቤ ጥያቄ ውድቅ ተደርጓል እና እርማት ያስፈልጋል።\n\n📋 ዝርዝር:\n• ፋይዳ ቁጥር: ${ctx.organizationNameAm || "N/A"}\n• ሁኔታ: ውድቅ ❌\n• ቀን: ${new Date().toLocaleString("am-ET")}\n\n💬 የአስተዳደር ግብረመልስ:\n${ctx.customDetailsAm || "እባክዎ መስፈርቶቹን ይገምግሙ እና ደጋግሙ ያቅርቡ።"}\n\n✅ ያስፈልጋቸው ተግባር:\nያስፈላጊ እርማቶች ያድርጉ እና መደበኛ ደብዳቤውን ደጋግሙ ያቅርቡ።\n\nድጋፍ: formal-requests@efp.gov.et`,
      };

    case "ADDRESS_CHANGE_SUBMITTED":
      return {
        titleEn: "📍 New Address Change Request Submitted",
        titleAm: "📍 አዲስ የአድራሻ መለወጥ ጥያቄ ተሰጥቷል",
        msgEn: `A new address change request has been submitted and requires administrative review. Please open the admin dashboard to review and approve the change.`,
        msgAm: `አዲስ የአድራሻ መለወጥ ጥያቄ ተሰጥቷል እና ለአስተዳደር ግምገማ ይጠቀማል።`,
      };
    case "ADDRESS_CHANGE_APPROVED":
      return {
        titleEn: "✅ Address Change Approved",
        titleAm: "✅ የአድራሻ መለወጥ ተፈቅዷል",
        msgEn: `Your organization's address change request has been approved by the administration. The new address is now active in the system.`,
        msgAm: `የድርጅትዎ የአድራሻ መለወጥ ጥያቄ በአስተዳደር ተፈቅዷል። አዲሱ አድራሻ በ ስርዓቱ ውስጥ አሁን ነው።`,
      };
    case "ADDRESS_CHANGE_REQUESTED":
      return {
        titleEn: "📍 Address Change Request Received - Review Required",
        titleAm: "📍 የአድራሻ መለወጥ ጥያቄ ተቀብሎ ታል - ግምገማ ያስፈልጋል",
        msgEn: `📋 New Address Change Request\n\nOrganization: ${ctx.organizationName || "N/A"}\nReason: ${ctx.requestReason || "No reason provided"}\n\n✅ Action:\nPlease review and approve/reject this request in the admin dashboard.\n\n⏱️ Timeline: Review within 5 business days.`,
        msgAm: `📋 አዲስ የአድራሻ መለወጥ ጥያቄ\n\nድርጅት: ${ctx.organizationNameAm || ctx.organizationName || "N/A"}\nምክንያት: ${ctx.requestReason || "ምንም ምክንያት አልተሰጠም"}\n\n✅ ተግባር:\nእባክዎ በአስተዳደር ዳሽቦርድ ውስጥ ይህን ጥያቄ ይገምግሙ እና ይፈቅዱ ወይም ውድቁ ያድርጉ።\n\n⏱️ ጊዜ: ከ 5 ሥራ ቀናት ውስጥ ይገምግሙ።`,
      };
    case "CRIMINAL_REPORT_SUBMITTED":
      return {
        titleEn: "🚨 New Criminal Report Submitted",
        titleAm: "🚨 አዲስ የወንጀል ሪፖርት ቀርቧል",
        msgEn: `A new criminal report has been submitted and requires administrative review.\n\n📋 Report Details:\n• Record Number: ${ctx.customDetailsEn || "N/A"}\n• Organization: ${ctx.organizationName || "N/A"}\n• Submitted By: ${ctx.customDetailsAm || "HR Manager"}\n\n✅ Action:\nPlease review the report Submitted`,
        msgAm: `አዲስ የወንጀል ሪፖርት ቀርቧል እና ለአስተዳደር ግምገማ ይፈልጋል።\n\n📋 የሪፖርት ዝርዝር:\n• የመዝገብ ቁጥር: ${ctx.customDetailsEn || "N/A"}\n• ተቋም: ${ctx.organizationNameAm || ctx.organizationName || "N/A"}\n• የቀረበው: ${ctx.customDetailsAm || "HR ማኔጀር"}\n\n✅ ተግባር:\nእባክዎ ሪፖርቱን ይገምግሙ።`,
      };
  }

  // Fallback: ensure a template is always returned for unknown/added notification types
  return {
    titleEn: "Notification",
    titleAm: "ማሳወቂያ",
    msgEn: ctx.customDetailsEn || "You have a new notification.",
    msgAm: ctx.customDetailsAm || "አዲስ ማሳወቂያ አለዎት።",
  };
};
