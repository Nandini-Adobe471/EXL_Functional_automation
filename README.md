# EXL Automation Report

This project contains automated tests using Playwright and Cucumber.js, with enhanced HTML reporting including charts.

## Features

- Playwright for browser automation
- Cucumber.js for BDD testing
- Enhanced HTML reports with charts
- Sample test data for demonstration

## Available Scripts

### Running Tests

```bash
# Run tests
npm run test

# Run tests and generate report
npm run test:report
```

### Report Generation

```bash
# Generate report from test results
npm run report:generate

# View the report in browser
npm run report:view

# Generate and view report
npm run report:full

# Generate report with sample data (for demonstration)
npm run report:sample

# Update cucumber-report.html with the content from custom-report.html
npm run report:update-cucumber
```

## Report Features

The enhanced HTML report includes:

1. **Summary Statistics**: Shows passed, failed, skipped, and total test counts
2. **Interactive Charts**:
   - Test Results Overview (doughnut chart)
   - Feature Status (stacked bar chart)
   - Step Status Distribution (pie chart)
   - Scenarios Per Feature (bar chart)
3. **Detailed Test Results**: Complete breakdown of features, scenarios, and steps with status indicators

## Troubleshooting

If the report is empty or doesn't show any data:

1. Make sure tests have been run with `npm run test`
2. Check if the cucumber-report.json file is generated in the reports directory
3. If the JSON file is empty, you can use sample data with `npm run report:sample`
