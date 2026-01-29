import ScanAnalyzer from "@/components/ScanAnalyzer";

export default function XRayPage() {
  return (
    <ScanAnalyzer
      scanType="xray"
      title="X-Ray Analysis"
      description="Real-time X-Ray analysis powered by computer vision to detect fractures, pneumonia, tuberculosis, and bone abnormalities within seconds"
      iconName="Zap"
    />
  );
}