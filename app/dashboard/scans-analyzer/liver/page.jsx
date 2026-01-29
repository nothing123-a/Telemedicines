import ScanAnalyzer from "@/components/ScanAnalyzer";

export default function LiverPage() {
  return (
    <ScanAnalyzer
      scanType="liver"
      title="Liver Scan"
      description="Hepatic imaging analysis using AI to detect fatty liver disease, cirrhosis, liver tumors, and hepatic abnormalities"
      iconName="Activity"
    />
  );
}