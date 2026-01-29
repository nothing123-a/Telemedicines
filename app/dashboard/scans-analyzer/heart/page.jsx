import ScanAnalyzer from "@/components/ScanAnalyzer";

export default function HeartPage() {
  return (
    <ScanAnalyzer
      scanType="heart"
      title="Heart Scan"
      description="Cardiac imaging AI analysis for detecting heart enlargement, wall motion abnormalities, and signs of heart failure"
      iconName="Heart"
    />
  );
}