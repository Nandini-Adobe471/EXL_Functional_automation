const fs = require('fs');
const path = require('path');

function injectSampleData() {
  try {
    console.log('Starting sample data injection...');
    
    // Read the sample data
    const sampleDataPath = path.join(__dirname, '../../reports/sample-test-data.json');
    if (!fs.existsSync(sampleDataPath)) {
      console.error(`Sample data file not found at: ${sampleDataPath}`);
      return;
    }
    
    const sampleDataContent = fs.readFileSync(sampleDataPath, 'utf8');
    let sampleData;
    
    try {
      sampleData = JSON.parse(sampleDataContent);
      console.log(`Successfully parsed sample data with ${sampleData.features.length} features`);
    } catch (parseError) {
      console.error('Error parsing sample data:', parseError.message);
      return;
    }
    
    // Read the HTML report
    const reportPath = path.join(__dirname, '../../reports/custom-report.html');
    if (!fs.existsSync(reportPath)) {
      console.error(`HTML report not found at: ${reportPath}`);
      return;
    }
    
    let htmlContent = fs.readFileSync(reportPath, 'utf8');
    
    // Replace the empty testResults object with sample data
    const emptyDataPattern = /const\s+testResults\s*=\s*{\s*features\s*:\s*\[\s*\]\s*};/;
    const sampleDataJson = JSON.stringify(sampleData, null, 4);
    
    if (emptyDataPattern.test(htmlContent)) {
      console.log('Found empty testResults pattern in HTML report');
      htmlContent = htmlContent.replace(emptyDataPattern, `const testResults = ${sampleDataJson};`);
      
      // Write the updated HTML report
      fs.writeFileSync(reportPath, htmlContent);
      console.log(`Successfully injected sample data into HTML report at: ${reportPath}`);
    } else {
      console.error('Could not find empty testResults pattern in HTML report');
    }
  } catch (error) {
    console.error('Error injecting sample data:', error);
  }
}

// Execute the function
injectSampleData();
