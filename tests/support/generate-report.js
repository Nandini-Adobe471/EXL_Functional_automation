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
      console.log('JSON report file exists but is empty. Using sample test data...');
      
      // Try to use sample test data if available
      const sampleDataPath = path.join(__dirname, '../../reports/sample-test-data.json');
      if (fs.existsSync(sampleDataPath)) {
        console.log('Found sample test data. Using it for the report...');
        const sampleDataContent = fs.readFileSync(sampleDataPath, 'utf8');
        
        try {
          const sampleData = JSON.parse(sampleDataContent);
          
          // Read the HTML template
          const templatePath = path.join(__dirname, './report-template.html');
          let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
          
          // Replace the placeholder in the template with sample data
          htmlTemplate = htmlTemplate.replace(
            'const testResults = {\n            features: []\n        };',
            `const testResults = ${JSON.stringify(sampleData, null, 4)};`
          );
          
          // Write the HTML report with sample data
          const customReportPath = path.join(__dirname, '../../reports/custom-report.html');
          fs.writeFileSync(customReportPath, htmlTemplate);
          
          console.log(`Custom HTML report with sample data generated at: ${customReportPath}`);
          return;
        } catch (sampleDataError) {
          console.error('Error parsing sample test data:', sampleDataError.message);
        }
      }
      
      // If sample data is not available or cannot be parsed, create an empty report
      console.log('Creating an empty report...');
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
            
            // For step status chart
            let passedSteps = 0;
            let failedSteps = 0;
            let skippedSteps = 0;
            let pendingSteps = 0;
            
            // For feature chart
            const featureData = {};
            
            data.features.forEach(feature => {
                const featureElement = document.createElement('div');
                featureElement.className = 'feature';
                
                const featureHeader = document.createElement('div');
                featureHeader.className = 'feature-header';
                featureHeader.innerHTML = \`<h2 class="feature-name">\${feature.name}</h2>\`;
                
                featureElement.appendChild(featureHeader);
                
                // Initialize feature data for charts
                if (!featureData[feature.name]) {
                    featureData[feature.name] = {
                        total: 0,
                        passed: 0,
                        failed: 0,
                        skipped: 0
                    };
                }
                
                feature.scenarios.forEach(scenario => {
                    totalCount++;
                    featureData[feature.name].total++;
                    
                    if (scenario.status === 'passed') {
                        passedCount++;
                        featureData[feature.name].passed++;
                    }
                    else if (scenario.status === 'failed') {
                        failedCount++;
                        featureData[feature.name].failed++;
                    }
                    else {
                        skippedCount++;
                        featureData[feature.name].skipped++;
                    }
                    
                    const scenarioElement = document.createElement('div');
                    scenarioElement.className = \`scenario scenario-\${scenario.status}\`;
                    
                    let scenarioContent = \`<h3 class="scenario-name">\${scenario.name}</h3>\`;
                    scenarioContent += '<ul class="steps">';
                    
                    scenario.steps.forEach(step => {
                        scenarioContent += \`<li class="step step-\${step.status}">\${step.keyword} \${step.text}</li>\`;
                        
                        // Count steps by status for chart
                        if (step.status === 'passed') passedSteps++;
                        else if (step.status === 'failed') failedSteps++;
                        else if (step.status === 'skipped') skippedSteps++;
                        else if (step.status === 'pending') pendingSteps++;
                        
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
            
            // Render charts
            renderResultsChart(passedCount, failedCount, skippedCount);
            renderFeatureChart(featureData);
            renderStepsChart(passedSteps, failedSteps, skippedSteps, pendingSteps);
            renderScenariosPerFeatureChart(featureData);
        }
        
        function renderResultsChart(passed, failed, skipped) {
            const ctx = document.getElementById('results-chart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Passed', 'Failed', 'Skipped'],
                    datasets: [{
                        data: [passed, failed, skipped],
                        backgroundColor: ['#4CAF50', '#f44336', '#2196F3'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
        
        function renderFeatureChart(featureData) {
            const featureNames = Object.keys(featureData);
            const passedData = featureNames.map(name => featureData[name].passed);
            const failedData = featureNames.map(name => featureData[name].failed);
            const skippedData = featureNames.map(name => featureData[name].skipped);
            
            const ctx = document.getElementById('feature-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: featureNames,
                    datasets: [
                        {
                            label: 'Passed',
                            data: passedData,
                            backgroundColor: '#4CAF50',
                            borderWidth: 1
                        },
                        {
                            label: 'Failed',
                            data: failedData,
                            backgroundColor: '#f44336',
                            borderWidth: 1
                        },
                        {
                            label: 'Skipped',
                            data: skippedData,
                            backgroundColor: '#2196F3',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function renderStepsChart(passed, failed, skipped, pending) {
            const ctx = document.getElementById('steps-chart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Passed', 'Failed', 'Skipped', 'Pending'],
                    datasets: [{
                        data: [passed, failed, skipped, pending],
                        backgroundColor: ['#4CAF50', '#f44336', '#2196F3', '#FFC107'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
        
        function renderScenariosPerFeatureChart(featureData) {
            const featureNames = Object.keys(featureData);
            const scenarioCounts = featureNames.map(name => featureData[name].total);
            
            const ctx = document.getElementById('scenarios-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: featureNames,
                    datasets: [{
                        label: 'Number of Scenarios',
                        data: scenarioCounts,
                        backgroundColor: '#9C27B0',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
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

  // Count total test cases for verification
  let totalTestCases = 0;
  jsonReport.forEach(feature => {
    if (feature && feature.elements && Array.isArray(feature.elements)) {
      feature.elements.forEach(element => {
        if (element && element.type === 'scenario') {
          totalTestCases++;
        }
      });
    }
  });
  
  console.log(`Total test cases found in JSON report: ${totalTestCases}`);
  
  // Check if this matches the count in custom-report.txt
  try {
    const customReportPath = require('path').join(__dirname, '../../reports/custom-report.txt');
    if (require('fs').existsSync(customReportPath)) {
      const customReportContent = require('fs').readFileSync(customReportPath, 'utf8');
      const unknownStatusCount = (customReportContent.match(/Test status unknown/g) || []).length;
      console.log(`Unknown status count in custom-report.txt: ${unknownStatusCount}`);
      
      if (totalTestCases !== unknownStatusCount) {
        console.log(`WARNING: Count mismatch between JSON report (${totalTestCases}) and custom-report.txt (${unknownStatusCount})`);
      }
    }
  } catch (error) {
    console.error('Error checking custom-report.txt:', error.message);
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
