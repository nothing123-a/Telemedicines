import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Comprehensive PDF text extraction
    let extractedText = '';
    const pdfString = buffer.toString('latin1');
    
    // Method 1: Extract all text patterns
    const patterns = [
      /\(([^)]*)\)/g,  // Text in parentheses
      /\[([^\]]*)\]/g, // Text in brackets
      /<([^>]*)>/g,    // Text in angle brackets
      /BT\s+([\s\S]*?)\s+ET/g, // Between BT and ET
      /Tj\s*\(([^)]*)\)/g, // Tj operators
      /TJ\s*\[([^\]]*)\]/g, // TJ operators
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(pdfString)) !== null) {
        let text = match[1];
        if (text && text.length > 0) {
          // Clean and decode text
          text = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\([0-7]{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
            .replace(/\\./g, '')
            .trim();
          
          if (text && /[a-zA-Z0-9]/.test(text)) {
            extractedText += text + ' ';
          }
        }
      }
    });
    
    // Method 2: Extract from all readable content
    if (extractedText.length < 100) {
      const allText = pdfString
        .replace(/[\x00-\x1F\x7F-\xFF]/g, ' ') // Remove non-printable
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(word => {
          return word.length > 1 && 
                 /[a-zA-Z]/.test(word) && 
                 !word.match(/^[\W_]+$/) &&
                 word.length < 50; // Avoid garbage
        })
        .join(' ');
      
      if (allText.length > extractedText.length) {
        extractedText = allText;
      }
    }
    
    // Method 3: Hex decode if needed
    if (extractedText.length < 50) {
      const hexMatches = pdfString.match(/<([0-9A-Fa-f\s]+)>/g);
      if (hexMatches) {
        hexMatches.forEach(hex => {
          const cleanHex = hex.replace(/[<>\s]/g, '');
          if (cleanHex.length % 2 === 0) {
            try {
              const decoded = cleanHex.match(/.{2}/g)
                .map(byte => String.fromCharCode(parseInt(byte, 16)))
                .join('');
              if (/[a-zA-Z]/.test(decoded)) {
                extractedText += decoded + ' ';
              }
            } catch (e) {}
          }
        });
      }
    }
    
    // Clean and structure the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2') // Space between numbers and letters
      .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
      .trim();
    
    // Keep all meaningful content (don't limit words)
    const finalText = extractedText;

    if (!finalText || finalText.length < 10) {
      // Last resort: extract any readable characters
      const lastResort = buffer.toString('utf8')
        .replace(/[^\x20-\x7E\n\r]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (lastResort.length > 10) {
        return NextResponse.json({
          success: true,
          text: lastResort,
          wordCount: lastResort.split(' ').length,
          message: "PDF text extracted (basic method)"
        });
      }
      
      return NextResponse.json({ 
        error: "Could not extract readable text from PDF. Please try a different PDF or copy-paste the text manually." 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      text: finalText,
      wordCount: finalText.split(' ').length,
      message: "PDF text extracted successfully"
    });

  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json({ 
      error: "Failed to parse PDF: " + error.message 
    }, { status: 500 });
  }
}