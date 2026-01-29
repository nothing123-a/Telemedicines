"use client";

import { useState } from "react";
import { Download, FileText, Globe } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportDownload({ result, reportText }) {
  const [generating, setGenerating] = useState(false);

  const extractChartData = (summary) => {
    const values = [];
    const lines = summary.split('\n');
    
    lines.forEach(line => {
      // Match patterns like "Hemoglobin: 12.5 g/dL" or "WBC: 8000 cells/μL"
      const matches = line.match(/(\w+(?:\s+\w+)*):\s*(\d+\.?\d*)\s*([\w\/μ]*)/g);
      if (matches) {
        matches.forEach(match => {
          const parts = match.split(':');
          if (parts.length === 2) {
            const param = parts[0].trim();
            const valueUnit = parts[1].trim();
            const valueMatch = valueUnit.match(/(\d+\.?\d*)\s*([\w\/μ]*)/);
            if (valueMatch && param.length > 2) {
              values.push({
                parameter: param,
                value: parseFloat(valueMatch[1]),
                unit: valueMatch[2] || '',
                status: 'normal'
              });
            }
          }
        });
      }
    });
    
    return values.length > 0 ? values : [];
  };

  const generateChart = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const chartData = data.slice(0, 6);
    
    return `
      <div style="margin: 20px 0; text-align: center;">
        <h3>Medical Parameters Chart</h3>
        <div style="width: 100%; height: 400px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <svg width="100%" height="300" viewBox="0 0 600 300">
            ${chartData.map((item, index) => {
              const barHeight = Math.min(item.value * 2, 200);
              const x = 50 + index * 80;
              const y = 250 - barHeight;
              return `
                <rect x="${x}" y="${y}" width="60" height="${barHeight}" fill="#3b82f6" opacity="0.7"/>
                <text x="${x + 30}" y="${y - 10}" text-anchor="middle" font-size="12" fill="#1e40af">${item.value}</text>
                <text x="${x + 30}" y="280" text-anchor="middle" font-size="10" fill="#64748b">${item.parameter.substring(0, 8)}</text>
              `;
            }).join('')}
          </svg>
        </div>
      </div>
    `;
  };

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.text("Health Report Analysis", margin, yPosition);
      yPosition += 20;

      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // Extract values for table
      const chartData = extractChartData(result.summary);
      
      // Values Table
      if (chartData.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Medical Parameters:", margin, yPosition);
        yPosition += 15;
        
        // Table headers
        pdf.setFontSize(10);
        pdf.text("Parameter", margin, yPosition);
        pdf.text("Value", margin + 60, yPosition);
        pdf.text("Unit", margin + 100, yPosition);
        pdf.text("Status", margin + 130, yPosition);
        yPosition += 10;
        
        // Table rows
        chartData.forEach(item => {
          pdf.text(item.parameter, margin, yPosition);
          pdf.text(item.value.toString(), margin + 60, yPosition);
          pdf.text(item.unit, margin + 100, yPosition);
          pdf.text(item.status, margin + 130, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Summary
      pdf.setFontSize(14);
      pdf.text("Analysis Summary:", margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      const cleanSummary = result.summary.replace(/\*\*/g, '').replace(/CHART_DATA:.*$/s, '');
      const summaryLines = pdf.splitTextToSize(cleanSummary, pageWidth - 2 * margin);
      pdf.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 4 + 15;

      // Recommendations
      if (result.recommendations) {
        pdf.setFontSize(14);
        pdf.text("Recommendations:", margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const cleanRecs = result.recommendations.replace(/\*\*/g, '');
        const recLines = pdf.splitTextToSize(cleanRecs, pageWidth - 2 * margin);
        pdf.text(recLines, margin, yPosition);
        yPosition += recLines.length * 4 + 15;
      }
      
      // Next Steps
      pdf.setFontSize(14);
      pdf.text("What to do now:", margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      const nextSteps = [
        "1. Share this report with your healthcare provider",
        "2. Follow the recommendations provided above",
        "3. Schedule follow-up tests if suggested",
        "4. Monitor your health parameters regularly",
        "5. Maintain a healthy lifestyle and diet"
      ];
      
      nextSteps.forEach(step => {
        pdf.text(step, margin, yPosition);
        yPosition += 6;
      });

      pdf.save("health-report-analysis.pdf");
    } catch (error) {
      alert("PDF generation failed: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadHTML = async () => {
    setGenerating(true);
    try {
      const chartData = extractChartData(result.summary);
      const chartHTML = generateChart(chartData);
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Health Report Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 30px 0; }
        .section h2 { color: #1e40af; border-left: 4px solid #3b82f6; padding-left: 15px; }
        .articles { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .article-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
        .chart-container { margin: 20px 0; text-align: center; }
        pre { background: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Health Report Analysis</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Medical Analysis Summary</h2>
        <pre>${result.summary.replace(/\*\*/g, '').replace(/CHART_DATA:.*$/s, '')}</pre>
    </div>

    ${chartHTML}

    <div class="section">
        <h2>Health Recommendations</h2>
        <pre>${result.recommendations ? result.recommendations.replace(/\*\*/g, '') : 'No specific recommendations provided.'}</pre>
    </div>

    <div class="section articles">
        <h2>Related Medical Articles</h2>
        ${result.articles && result.articles.length > 0 ? 
          result.articles.map(article => `
            <div class="article-item">
                <h4>${article.title}</h4>
                <p>${article.snippet}</p>
                <a href="${article.url}" target="_blank">Read More →</a>
            </div>
          `).join('') : 
          '<p>No related articles found.</p>'
        }
    </div>

    <div class="section">
        <h2>Original Report Text</h2>
        <pre style="font-size: 12px; color: #64748b;">${reportText.substring(0, 1000)}${reportText.length > 1000 ? '...' : ''}</pre>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
        <p>Generated by Clarity Care 3.0 - AI Healthcare Platform</p>
    </footer>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-report-analysis.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("HTML generation failed: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!result) return null;

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={downloadPDF}
        disabled={generating}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        <FileText className="w-4 h-4" />
        {generating ? 'Generating...' : 'Download PDF'}
      </button>
      
      <button
        onClick={downloadHTML}
        disabled={generating}
        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        <Globe className="w-4 h-4" />
        {generating ? 'Generating...' : 'Download HTML'}
      </button>
    </div>
  );
}