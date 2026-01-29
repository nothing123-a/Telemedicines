import ScanAnalyzer from "@/components/ScanAnalyzer";

export default function MRIPage() {
  return (
    <ScanAnalyzer
      scanType="mri"
      title="MRI Brain Scan"
      description="Advanced AI-powered MRI analysis using deep learning algorithms to detect brain tumors, lesions, hemorrhages, and structural abnormalities with 95% accuracy"
      iconName="Brain"
    />
  );
}