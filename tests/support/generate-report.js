const fs = require('fs');
const path = require('path');

// Function to generate HTML report from JSON report
function generateReport() {
  try {
    // Check if reports directory exists, if not create it
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log(`Created reports directory at: ${reportsDir}`);
    }
    
    // Read the JSON report
    const jsonReportPath = path.join(__dirname, '../../reports/cucumber-report.json');
    
    // Check if JSON report exists
    if (!fs.existsSync(jsonReportPath)) {
      console.log(`JSON report not found at: ${jsonReportPath}`);
      console.log('Creating an empty report template...');
      
      // Create an empty report
      const emptyReport = { features: [] };
      
      // Read the HTML template
      const templatePath = path.join(__dirname, './report-template.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      
      // Replace the placeholder in the template with empty data
      htmlTemplate = htmlTemplate.replace(
        'const testResults = {\n            features: []\n        };',
        `const testResults = ${JSON.stringify(emptyReport, null, 4)};`
      );
      
      // Write the empty HTML report
      const customReportPath = path.join(__dirname, '../../reports/custom-report.html');
      fs.writeFileSync(customReportPath, htmlTemplate);
      
      console.log(`Empty custom HTML report generated at: ${customReportPath}`);
      console.log('Run tests first to generate a complete report.');
      return;
    }
    
    // Read the JSON file content
    const jsonContent = fs.readFileSync(jsonReportPath, 'utf8');
    
    // Check if the content is empty or invalid
    if (!jsonContent || jsonContent.trim() === '') {
      console.log('JSON report file exists but is empty. Creating an empty report...');
      const emptyReport = { features: [] };
      
      // Read the HTML template
      const templatePath = path.join(__dirname, './report-template.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      
      // Replace the placeholder in the template with empty data
      htmlTemplate = htmlTemplate.replace(
        'const testResults = {\n            features: []\n        };',
        `const testResults = ${JSON.stringify(emptyReport, null, 4)};`
      );
      
      // Write the empty HTML report
      const customReportPath = path.join(__dirname, '../../reports/custom-report.html');
      fs.writeFileSync(customReportPath, htmlTemplate);
      
      console.log(`Empty custom HTML report generated at: ${customReportPath}`);
      console.log('Run tests first to generate a complete report.');
      return;
    }
    
    // Try to parse the JSON content
    let jsonReport;
    try {
      jsonReport = JSON.parse(jsonContent);
      
      // Check if jsonReport is an array (expected format)
      if (!Array.isArray(jsonReport)) {
        console.log('JSON report is not in the expected format (array). Creating an empty report...');
        jsonReport = [];
      }
    } catch (parseError) {
      console.error('Error parsing JSON report:', parseError.message);
      console.log('Creating an empty report due to JSON parsing error...');
      jsonReport = [];
    }
    
    // Read the HTML template
    const templatePath = path.join(__dirname, './report-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Process the JSON data
    console.log(`Processing JSON report with ${jsonReport.length} features`);
    const processedData = processJsonReport(jsonReport);
    console.log(`Processed data has ${processedData.features.length} features`);
    
    // Debug: Log the first feature if available
    if (processedData.features.length > 0) {
      console.log(`First feature name: ${processedData.features[0].name}`);
      console.log(`First feature has ${processedData.features[0].scenarios.length} scenarios`);
    }
    
    // Replace the placeholder in the template with the actual data
    const dataJson = JSON.stringify(processedData, null, 4);
    console.log(`Data JSON length: ${dataJson.length} characters`);
    
    // Find the exact pattern to replace
    const pattern = /const\s+testResults\s*=\s*{\s*features\s*:\s*\[\s*\]\s*};/;
    if (pattern.test(htmlTemplate)) {
      console.log('Found testResults pattern in template');
      htmlTemplate = htmlTemplate.replace(pattern, `const testResults = ${dataJson};`);
    } else {
      console.log('WARNING: Could not find testResults pattern in template');
      console.log('Trying alternative replacement method...');
      
      // Try to find the script section and replace it entirely
      const scriptPattern = /<script>[\s\S]*?<\/script>/;
      if (scriptPattern.test(htmlTemplate)) {
        console.log('Found script tag in template');
        const newScript = `<script>
        document.getElementById('report-date').textContent = new Date().toLocaleString();
        
        const testResults = ${dataJson};
        
        function renderReport(data) {
            const featuresContainer = document.getElementById('features-container');
            let passedCount = 0;
            let failedCount = 0;
            let skippedCount = 0;
            let totalCount = 0;
            
            data.features.forEach(feature => {
                const featureElement = document.createElement('div');
                featureElement.className = 'feature';
                
                const featureHeader = document.createElement('div');
                featureHeader.className = 'feature-header';
                featureHeader.innerHTML = \`<h2 class="feature-name">\${feature.name}</h2>\`;
                
                featureElement.appendChild(featureHeader);
                
                feature.scenarios.forEach(scenario => {
                    totalCount++;
                    
                    if (scenario.status === 'passed') passedCount++;
                    else if (scenario.status === 'failed') failedCount++;
                    else skippedCount++;
                    
                    const scenarioElement = document.createElement('div');
                    scenarioElement.className = \`scenario scenario-\${scenario.status}\`;
                    
                    let scenarioContent = \`<h3 class="scenario-name">\${scenario.name}</h3>\`;
                    scenarioContent += '<ul class="steps">';
                    
                    scenario.steps.forEach(step => {
                        scenarioContent += \`<li class="step step-\${step.status}">\${step.keyword} \${step.text}</li>\`;
                        
                        if (step.status === 'failed' && step.error_message) {
                            scenarioContent += \`<div class="error-message">\${step.error_message}</div>\`;
                        }
                        
                        // Screenshots are disabled as per user request
                    });
                    
                    scenarioContent += '</ul>';
                    scenarioElement.innerHTML = scenarioContent;
                    featureElement.appendChild(scenarioElement);
                });
                
                featuresContainer.appendChild(featureElement);
            });
            
            document.getElementById('passed-count').textContent = passedCount;
            document.getElementById('failed-count').textContent = failedCount;
            document.getElementById('skipped-count').textContent = skippedCount;
            document.getElementById('total-count').textContent = totalCount;
        }
        
        renderReport(testResults);
        </script>`;
        
        htmlTemplate = htmlTemplate.replace(scriptPattern, newScript);
      } else {
        console.log('ERROR: Could not find script tag in template');
      }
    }
    
    // Write the final HTML report
    const customReportPath = path.join(__dirname, '../../reports/custom-report.html');
    fs.writeFileSync(customReportPath, htmlTemplate);
    
    console.log(`Custom HTML report generated at: ${customReportPath}`);
  } catch (error) {
    console.error('Error generating custom report:', error);
    
    // Create a basic error report
    try {
      const errorReportPath = path.join(__dirname, '../../reports/error-report.html');
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cucumber Report Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { background-color: #ffebee; padding: 15px; border-left: 5px solid #f44336; }
            pre { background-color: #f5f5f5; padding: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Error Generating Cucumber Report</h1>
          <div class="error">
            <h2>Error Details:</h2>
            <pre>${error.stack || error.message}</pre>
          </div>
          <p>Please run the tests first to generate the JSON report, then try generating the HTML report again.</p>
        </body>
        </html>
      `;
      fs.writeFileSync(errorReportPath, errorHtml);
      console.log(`Error report generated at: ${errorReportPath}`);
    } catch (e) {
      console.error('Failed to create error report:', e);
    }
  }
}

// Process the JSON report into a format suitable for the HTML template
function processJsonReport(jsonReport) {
  const result = {
    features: []
  };
  
  // Handle empty or invalid jsonReport
  if (!jsonReport || !Array.isArray(jsonReport) || jsonReport.length === 0) {
    return result;
  }
  
  jsonReport.forEach(feature => {
    try {
      // Skip if feature is invalid
      if (!feature || typeof feature !== 'object') {
        console.log('Skipping invalid feature entry');
        return;
      }
      
      const processedFeature = {
        name: feature.name || 'Unnamed Feature',
        description: feature.description || '',
        scenarios: []
      };
      
      // Skip if elements array is missing
      if (!feature.elements || !Array.isArray(feature.elements)) {
        console.log(`Feature "${processedFeature.name}" has no elements`);
        result.features.push(processedFeature);
        return;
      }
      
      feature.elements.forEach(element => {
        try {
          // Skip if element is invalid
          if (!element || typeof element !== 'object') {
            console.log('Skipping invalid element entry');
            return;
          }
          
          if (element.type === 'scenario') {
            const scenario = {
              name: element.name || 'Unnamed Scenario',
              status: getScenarioStatus(element),
              steps: []
            };
            
            // Skip if steps array is missing
            if (!element.steps || !Array.isArray(element.steps)) {
              console.log(`Scenario "${scenario.name}" has no steps`);
              processedFeature.scenarios.push(scenario);
              return;
            }
            
            // Filter out Before and After steps (hidden hooks)
            const visibleSteps = element.steps.filter(step => !step.hidden);
            
            visibleSteps.forEach(step => {
              try {
                // Skip if step is invalid
                if (!step || typeof step !== 'object') {
                  console.log('Skipping invalid step entry');
                  return;
                }
                
                const processedStep = {
                  keyword: (step.keyword || 'Step').trim(),
                  text: step.name || 'Unnamed Step',
                  status: step.result ? step.result.status : 'skipped'
                };
                
                if (step.result && step.result.status === 'failed') {
                  processedStep.error_message = step.result.error_message || 'Unknown error';
                }
                
                // Screenshots are disabled as per user request
                
                scenario.steps.push(processedStep);
              } catch (stepError) {
                console.error('Error processing step:', stepError.message);
              }
            });
            
            processedFeature.scenarios.push(scenario);
          }
        } catch (elementError) {
          console.error('Error processing element:', elementError.message);
        }
      });
      
      result.features.push(processedFeature);
    } catch (featureError) {
      console.error('Error processing feature:', featureError.message);
    }
  });
  
  return result;
}

// Determine the overall status of a scenario
function getScenarioStatus(scenario) {
  if (!scenario.steps || scenario.steps.length === 0) {
    return 'skipped';
  }
  
  const hasFailedSteps = scenario.steps.some(step => 
    step.result && step.result.status === 'failed'
  );
  
  if (hasFailedSteps) {
    return 'failed';
  }
  
  const allPassed = scenario.steps.every(step => 
    step.result && step.result.status === 'passed'
  );
  
  return allPassed ? 'passed' : 'skipped';
}

// Execute the report generation
generateReport();

module.exports = { generateReport };
