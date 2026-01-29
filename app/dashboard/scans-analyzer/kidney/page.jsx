import ScanAnalyzer from "@/components/ScanAnalyzer";

export default function KidneyPage() {
  return (
    <ScanAnalyzer
      scanType="kidney"
      title="Kidney Scan"
      description="Intelligent kidney scan analysis detecting cysts, stones, organ size variations, and structural abnormalities using medical AI"
      iconName="Droplets"
    />
  );
}