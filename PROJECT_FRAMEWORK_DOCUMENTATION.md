# EXL Automation Framework - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Framework Architecture](#framework-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Configuration Files](#configuration-files)
6. [Test Framework Components](#test-framework-components)
7. [Test Execution](#test-execution)
8. [Reporting](#reporting)
9. [Dependencies](#dependencies)
10. [Setup and Installation](#setup-and-installation)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Project Name:** EXL Functional Automation  
**Repository:** https://github.com/Nandini-Adobe471/EXL_Functional_automation.git  
**Framework Type:** Behavior-Driven Development (BDD) Test Automation  
**Primary Purpose:** Automated functional testing for Adobe Experience League platform  
**Latest Commit:** 57f3bf77cdcc53dbf9966c046d2cefa5847332be

This is a comprehensive test automation framework built using Playwright and Cucumber for testing the Adobe Experience League platform. The framework supports end-to-end testing with BDD approach, multiple reporting formats, screenshot capture capabilities, and enhanced HTML reports with interactive charts.

### Key Highlights
- Cross-browser testing support (Chromium, Firefox, WebKit)
- Mobile viewport testing capabilities
- Automated login management with hooks
- Screenshot capture on test failure
- Multiple report formats (HTML, JSON, Custom)
- Interactive charts and visualizations in reports
- Parallel test execution support

---

## Framework Architecture

### Architecture Pattern
The framework follows a **Hybrid Architecture** combining:
- **BDD (Behavior-Driven Development)** using Cucumber.js
- **Page Object Model (POM)** pattern for UI interactions
- **Playwright** for cross-browser automation
- **Data-Driven Testing** approach with example tables
- **Custom Reporting** with chart visualizations

### Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                Test Execution Layer                          │
│         (Cucumber Runner + Playwright)                       │
│  • Test discovery and orchestration                          │
│  • Parallel execution management                             │
│  • Report data collection                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Files Layer                         │
│            (Gherkin Scenarios - Business Logic)              │
│  • Readable test specifications                              │
│  • Scenario organization by features                         │
│  • Tag-based test filtering                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Step Definitions Layer                        │
│         (Implementation of Gherkin Steps)                    │
│  • Step implementations in JavaScript                        │
│  • Reusable step patterns                                    │
│  • Integration with page objects                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Common Functions & Utilities                    │
│  • Login management                                          │
│  • Browser launch utilities                                  │
│  • Test data management                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Hooks & Support Layer                         │
│  • Before/After hooks                                        │
│  • Screenshot capture                                        │
│  • Custom formatters                                         │
│  • Report generation                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser Automation Layer                        │
│           (Playwright Browser Drivers)                       │
│  • Chromium, Firefox, WebKit support                         │
│  • Mobile emulation                                          │
│  • Network interception                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Playwright** | ^1.53.2 | Cross-browser automation framework |
| **Cucumber** | ^11.3.0 | BDD framework for test scenarios |
| **JavaScript (CommonJS)** | ES6+ | Programming language |

### Testing & Reporting Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@cucumber/cucumber` | ^11.3.0 | Core BDD test runner |
| `@cucumber/pretty-formatter` | ^1.0.0 | Pretty console output |
| `@playwright/test` | ^1.53.2 | Playwright test utilities |
| `allure-commandline` | ^2.34.1 | Allure report generation |
| `allure-playwright` | ^3.3.0 | Playwright-Allure integration |
| `allure-cucumberjs` | ^3.3.0 | Cucumber-Allure integration |
| `allure-js-commons` | ^3.3.0 | Common Allure utilities |

### Utility Libraries

| Tool | Version | Purpose |
|------|---------|---------|
| `http-server` | ^14.1.1 | Local report server |
| `rimraf` | ^5.0.5 | Cross-platform file cleanup |
| `xlsx` | ^0.18.5 | Excel file handling |
| `@types/node` | ^24.0.7 | TypeScript Node.js types |

---

## Project Structure

```
EXLAutomationReportEnabled/
│
├── tests/                              # Test files directory
│   ├── features/                       # Cucumber feature files (Gherkin)
│   │   ├── Auth-course.feature        # Authenticated course tests
│   │   ├── browse.feature             # Browse functionality tests
│   │   ├── certification-carousel.feature
│   │   ├── certification-page.feature
│   │   ├── Course-End-to-End.feature
│   │   ├── footer-validation.feature
│   │   ├── mobile-search.feature
│   │   ├── navigation.feature
│   │   ├── perspective.feature
│   │   ├── php.feature
│   │   ├── search.feature
│   │   ├── sign-up-modal.feature
│   │   ├── slides.feature
│   │   ├── tutorials.feature
│   │   ├── unauth-courses.feature
│   │   ├── unauth-home-page.feature
│   │   ├── video-clips.feature
│   │   └── asset-doc-tabs-toc.feature
│   │
│   ├── steps/                          # Step definition files
│   │   ├── Auth-course.js
│   │   ├── browse.js
│   │   ├── certification-carousel.js
│   │   ├── certification-page.js
│   │   ├── common-mobile-steps.js
│   │   ├── Course-End-to-End.js
│   │   ├── footer-validation.js
│   │   ├── mobile-search.js
│   │   ├── navigation.js
│   │   ├── perspective.js
│   │   ├── php.js
│   │   ├── search.js
│   │   ├── sign-up-modal.js
│   │   ├── slides.js
│   │   ├── tutorials.js
│   │   ├── unauth-courses.js
│   │   ├── unauth-home-page.js
│   │   ├── video-clips.js
│   │   └── asset-doc-tabs-toc.js
│   │
│   ├── support/                        # Support/utility files
│   │   ├── hooks.js                   # Before/After hooks
│   │   ├── custom-formatter.js        # Custom test formatter
│   │   ├── generate-report.js         # Report generation script
│   │   ├── inject-sample-data.js      # Sample data injection
│   │   ├── update-cucumber-report.js  # Report update utility
│   │   └── report-template.html       # HTML report template
│   │
│   ├── commonFunctions/                # Reusable functions
│   │   ├── launchbrowser.js           # Browser launch utilities
│   │   ├── login.js                   # Login functionality
│   │   └── login_fixed.js             # Fixed login implementation
│   │
│   ├── data/                           # Test data files
│   │   └── search-picker-data.js      # Search picker test data
│   │
│   └── documentation/                  # Test documentation
│       └── home-page-validation-scenarios.md
│
├── reports/                            # Test execution reports
│   ├── cucumber-report.html           # Cucumber HTML report
│   ├── cucumber-report.json           # Cucumber JSON report
│   ├── custom-report.html             # Enhanced custom report
│   ├── custom-report.txt              # Text format report
│   ├── error-report.html              # Error-specific report
│   ├── sample-test-data.json          # Sample test data
│   └── Release reports/               # Release-specific reports
│
├── allure-report/                      # Allure report output
│   ├── data/                          # Report data files
│   ├── export/                        # Export functionality
│   ├── history/                       # Historical test data
│   ├── plugins/                       # Allure plugins
│   └── widgets/                       # Report widgets
│
├── screenshots/                        # Test execution screenshots
│   └── [170+ test screenshots]        # Captured during test runs
│
├── tests-examples/                     # Example test files
│
├── config.js                           # Main configuration file
├── playwright.config.js                # Playwright configuration
├── cucumber.json                       # Cucumber configuration
├── package.json                        # NPM dependencies & scripts
├── package-lock.json                  # Locked dependency versions
├── .gitignore                         # Git ignore patterns
└── README.md                          # Project documentation
```

### Directory Details

#### `/tests/features` - Feature Files
Contains BDD feature files written in Gherkin syntax covering:
- Authentication and authorization flows
- Browse and search functionality
- Course management and completion
- Navigation patterns
- Mobile responsiveness
- UI component validation
- Footer and header elements
- Certification workflows
- Tutorial and documentation access

#### `/tests/steps` - Step Definitions
JavaScript implementations of Gherkin steps:
- One-to-one mapping with feature files
- Reusable step patterns
- Playwright page interactions
- Assertions and validations

#### `/tests/support` - Support Files
Framework support utilities:
- **hooks.js**: Before/After hooks for login and cleanup
- **custom-formatter.js**: Custom output formatting
- **generate-report.js**: Enhanced report generation with charts
- **report-template.html**: HTML report structure

#### `/tests/commonFunctions` - Shared Utilities
Reusable functions across tests:
- **launchbrowser.js**: Browser initialization
- **login.js**: Authentication logic
- Session management

#### `/screenshots` Directory
- 170+ screenshots captured during test execution
- Named descriptively for easy identification
- Screenshots on failure for debugging
- Before/after state capture for critical operations

---

## Configuration Files

### 1. `config.js` - Application Configuration

**Purpose:** Central configuration for application URLs and credentials

```javascript
const ENV = {
   URL: 'https://experienceleague.adobe.com/en',
   EMAIL: 'Rel+28+Jan@adobetest.com',
   PASSWORD: '28Jan@release',
   // Staging environment (commented out)
   // URL: 'https://experienceleague-stage.adobe.com/en',
   // EMAIL: 'gsnair+US+Team+VISA+hello+1@adobetest.com',
   // PASSWORD: 'Bap@d0be',
   TIMEOUT_1: 1000
}
module.exports = ENV;
```

**Key Configurations:**
- `URL`: Base URL for the application under test
- `EMAIL`: Test user email
- `PASSWORD`: Test user password
- `TIMEOUT_1`: Custom timeout value (milliseconds)

**Environment Switching:**
- Production and staging configurations available
- Simply uncomment the desired environment
- Alternative credentials for different test scenarios

### 2. `playwright.config.js` - Playwright Configuration

**Purpose:** Playwright-specific test execution settings

```javascript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

**Key Settings:**
- **testDir**: Test file location (`./tests`)
- **fullyParallel**: Enable parallel execution
- **retries**: Retry failed tests (2 on CI, 0 locally)
- **workers**: Parallel workers (1 on CI, unlimited locally)
- **reporter**: HTML and list reporters
- **trace**: Capture traces on first retry
- **projects**: Multi-browser support (Chromium, Firefox, WebKit)

**Browser Configuration:**
- Desktop Chrome (Chromium)
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile emulation available (commented out)

### 3. `cucumber.json` - Cucumber Configuration

**Purpose:** Cucumber framework behavior and output settings

```json
{
    "default": {
        "formatOptions": {
            "snippetInterface": "async-await"
        },
        "format": [
            "progress",
            "json:reports/cucumber-report.json",
            "html:reports/cucumber-report.html",
            "@cucumber/pretty-formatter",
            "./tests/support/custom-formatter.js:reports/custom-report.txt"
        ],
        "paths": ["tests/features/*.feature"],
        "dryRun": false,
        "require": [
            "tests/steps/*.js",
            "tests/support/*.js"
        ],
        "parallel": 1,
        "tags": "not @skip"
    }
}
```

**Key Settings:**
- **formatOptions**: Use async-await syntax for snippets
- **format**: Multiple output formats (progress, JSON, HTML, pretty, custom)
- **paths**: Feature file location
- **require**: Step definitions and support files
- **parallel**: Parallel execution (1 worker)
- **tags**: Default tag filter (skip scenarios with @skip tag)

**Output Formats:**
1. Progress bar in console
2. JSON report for programmatic access
3. Standard HTML report
4. Pretty formatted console output
5. Custom text report

### 4. `package.json` - Project Configuration

**Purpose:** Project metadata, dependencies, and NPM scripts

**Key NPM Scripts:**

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `npm run ensure-reports-dir && cucumber-js` | Run all tests |
| `test:report` | Run tests + generate report + serve | Execute tests and view report |
| `clean:reports` | `rimraf reports && mkdir reports` | Clean report directory |
| `clean:screenshots` | Remove screenshot files | Clean up screenshots |
| `ensure-reports-dir` | Create reports directory | Ensure directory exists |
| `report:generate` | Generate custom report | Create enhanced report |
| `report:view` | Serve report on port 9090 | View report in browser |
| `report:full` | Generate + view report | Complete report workflow |
| `report:empty` | Generate empty report | Create report structure |
| `report:sample` | Generate with sample data | Demo report with data |
| `report:update-cucumber` | Update cucumber report | Sync report files |

---

## Test Framework Components

### 1. Feature Files (Gherkin)

**Location:** `tests/features/`

**Purpose:** Define test scenarios in business-readable language

**Structure:**
```gherkin
Feature: Browse Functionality
  As a user of Experience League
  I want to browse content
  So that I can discover learning resources

  Background:
    Given user is authenticated

  @smoke
  Scenario: User can filter content by type
    Given user navigates to browse page
    When user selects content type as "Courses"
    And user selects product as "Adobe Experience Manager"
    Then verify first card displays with selected content type and product tag

  @regression
  Scenario Outline: User can browse different content types
    Given user navigates to browse page
    When user selects content type as "<contentType>"
    Then content cards should be loaded
    And pagination should be working properly
    
    Examples:
      | contentType |
      | Courses     |
      | Tutorials   |
      | Documentation |
```

**Available Feature Files:**
1. **Auth-course.feature** - Authenticated course workflows
2. **browse.feature** - Browse and filter functionality
3. **certification-carousel.feature** - Certification UI components
4. **certification-page.feature** - Certification workflows
5. **Course-End-to-End.feature** - Complete course journey
6. **footer-validation.feature** - Footer element validation
7. **mobile-search.feature** - Mobile search functionality
8. **navigation.feature** - Site navigation patterns
9. **perspective.feature** - Perspective view tests
10. **php.feature** - PHP-specific tests
11. **search.feature** - Search functionality
12. **sign-up-modal.feature** - Sign-up modal interactions
13. **slides.feature** - Slide component tests
14. **tutorials.feature** - Tutorial workflows
15. **unauth-courses.feature** - Unauthenticated course access
16. **unauth-home-page.feature** - Home page without auth
17. **video-clips.feature** - Video player functionality
18. **asset-doc-tabs-toc.feature** - Asset documentation tabs

### 2. Step Definitions

**Location:** `tests/steps/`

**Purpose:** Implement Gherkin steps with actual automation code

**Example from `browse.js`:**

```javascript
const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League browse page', async function() {
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(2000);
});

When('user selects content type as {string}', async function(contentType) {
  await this.page.getByRole('button', { name: 'Content Type' }).click();
  await this.page.waitForTimeout(2000);
  
  await this.page.locator('form').getByText(contentType).click();
  await this.page.waitForTimeout(2000);
  
  this.selectedContentType = contentType;
});

Then('verify first card displays with selected content type and product tag', async function() {
  await this.page.waitForTimeout(2000);
  
  await expect(this.page.locator('form')).toContainText(this.selectedContentType);
  await expect(this.page.locator('form')).toContainText(this.selectedProduct);
});
```

**Step Definition Patterns:**
- **Given**: Setup and preconditions
- **When**: Actions and interactions
- **Then**: Assertions and validations
- **And/But**: Additional steps

**Common Patterns Used:**
- Page navigation
- Element interactions (click, type, select)
- Waiting strategies
- Screenshot capture
- State management via `this` context

### 3. Common Functions

**Location:** `tests/commonFunctions/`

#### `login.js` - Authentication Management

```javascript
async function performLogin(worldObject) {
  // Launch browser if not already launched
  if (!worldObject.page) {
    const result = await launchBrowser();
    worldObject.page = result.page;
    worldObject.browser = result.browser;
    worldObject.context = result.context;
  }
  
  // Navigate and perform login
  await worldObject.page.goto(ENV.URL);
  // Login logic here
  
  return worldObject;
}
```

**Features:**
- Browser initialization
- Login workflow automation
- Session management
- Error handling

#### `launchbrowser.js` - Browser Initialization

```javascript
async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  return { browser, context, page };
}

async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
  }
}
```

**Features:**
- Chromium browser launch
- Context creation
- Page initialization
- Clean browser closure

### 4. Hooks and Support Files

**Location:** `tests/support/`

#### `hooks.js` - Test Lifecycle Management

```javascript
const { Before, After, Status } = require('@cucumber/cucumber');
const { performLogin } = require('../commonFunctions/login');
const { closeBrowser } = require('../commonFunctions/launchbrowser');

// Before hook - automatic login
Before({ tags: 'not @skip-login' }, async function() {
  console.log('Performing login before scenario');
  const result = await performLogin(this);
  console.log('Login completed successfully before scenario');
});

// After hook - screenshot on failure
After(async function(scenario) {
  if (scenario.result.status === Status.FAILED && this.page) {
    console.log(`Test failed: ${scenario.pickle.name}`);
    
    const screenshot = await this.page.screenshot({ 
      fullPage: true 
    });
    
    this.attach(screenshot, 'image/png');
  }
});

// After hook - browser cleanup
After(async function() {
  if (this.browser && !this.keepBrowserOpen) {
    console.log('Closing browser after scenario');
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
```

**Hook Types:**
1. **Before Hook**
   - Automatic login (except for @skip-login scenarios)
   - Browser initialization
   - Test data setup

2. **After Hook - Screenshot**
   - Capture screenshot on failure
   - Attach to report
   - Full page capture

3. **After Hook - Cleanup**
   - Close browser
   - Clean up resources
   - Conditional cleanup based on flags

#### `custom-formatter.js` - Custom Report Formatting

**Purpose:** Format test results for custom text report

**Features:**
- Custom output format
- Test result aggregation
- Export to custom-report.txt

#### `generate-report.js` - Enhanced Report Generation

**Purpose:** Create HTML report with interactive charts

**Features:**
- Parse cucumber-report.json
- Generate HTML with Chart.js
- Multiple chart types (doughnut, bar, pie)
- Test statistics calculation
- Interactive visualizations

---

## Test Execution

### Running Tests

#### 1. Run All Tests
```bash
npm test
```
**Behavior:**
- Creates reports directory
- Executes all feature files
- Generates JSON report
- Filters out @skip tagged scenarios

#### 2. Run Tests with Report Generation
```bash
npm run test:report
```
**Behavior:**
- Runs all tests
- Generates custom HTML report
- Starts HTTP server on port 8080
- Opens report in browser

#### 3. Run Specific Feature
```bash
npx cucumber-js tests/features/browse.feature
```

#### 4. Run with Specific Tags
```bash
# Run smoke tests only
npx cucumber-js --tags "@smoke"

# Run regression tests
npx cucumber-js --tags "@regression"

# Exclude specific tags
npx cucumber-js --tags "not @skip"

# Multiple tag conditions
npx cucumber-js --tags "@smoke and not @skip"
```

#### 5. Dry Run (Validate Scenarios)
```bash
npx cucumber-js --dry-run
```

#### 6. Run with Custom Profile
```bash
npx cucumber-js --profile default
```

### Parallel Execution

**Configuration:** Set in `cucumber.json`
```json
{
  "parallel": 1
}
```

**Increase Parallel Workers:**
```json
{
  "parallel": 4
}
```

**Benefits:**
- Faster test execution
- Better resource utilization
- Isolated test contexts

### Test Timeout Management

**Default Timeout:** 90 seconds (set in step definitions)

```javascript
setDefaultTimeout(90 * 1000);
```

**Custom Timeout for Specific Steps:**
```javascript
await this.page.waitForSelector('.element', { timeout: 30000 });
```

### Environment Management

**Switch Environments:**
Edit `config.js`:
```javascript
// Production
URL: 'https://experienceleague.adobe.com/en',

// Staging
URL: 'https://experienceleague-stage.adobe.com/en',
```

### Debugging Tests

**Headed Mode:**
```javascript
// In launchbrowser.js
const browser = await chromium.launch({ 
  headless: false,
  slowMo: 100 
});
```

**Console Logging:**
- Already enabled in step definitions
- Shows progress and actions
- Identifies elements being interacted with

**Screenshot Debugging:**
```javascript
await this.page.screenshot({ path: 'debug-screenshot.png' });
```

---

## Reporting

### Report Types

#### 1. Custom HTML Report with Charts

**Location:** `reports/custom-report.html`

**Features:**
- **Summary Statistics Dashboard**
  - Total scenarios
  - Passed count
  - Failed count
  - Skipped count
  - Success rate percentage

- **Interactive Charts (Chart.js)**
  - Test Results Overview (Doughnut)
  - Feature Status (Stacked Bar)
  - Step Status Distribution (Pie)
  - Scenarios Per Feature (Bar)

- **Detailed Test Results**
  - Feature-level breakdown
  - Scenario status indicators
  - Step-by-step details
  - Duration tracking

**Generation:**
```bash
npm run report:generate
```

**Viewing:**
```bash
npm run report:view
```

**Full Workflow:**
```bash
npm run report:full
```

#### 2. Cucumber HTML Report

**Location:** `reports/cucumber-report.html`

**Features:**
- Standard Cucumber format
- Scenario-level results
- Step-level details
- Embedded screenshots
- Execution duration

#### 3. Cucumber JSON Report

**Location:** `reports/cucumber-report.json`

**Features:**
- Machine-readable format
- Complete test data
- Used by report generators
- CI/CD integration friendly

**Sample Structure:**
```json
[
  {
    "uri": "tests/features/browse.feature",
    "id": "browse-functionality",
    "name": "Browse Functionality",
    "description": "",
    "elements": [
      {
        "id": "browse-functionality;user-can-filter-content",
        "type": "scenario",
        "name": "User can filter content",
        "steps": [...]
      }
    ]
  }
]
```

#### 4. Custom Text Report

**Location:** `reports/custom-report.txt`

**Features:**
- Plain text format
- Custom formatter output
- Quick review format

#### 5. Allure Report

**Location:** `allure-report/`

**Features:**
- Professional reporting framework
- Historical trends
- Test categorization
- Timeline view
- Retries tracking
- Environment information

**Generate Allure Report:**
```bash
npx allure generate allure-results --clean
npx allure open allure-report
```

### Report Generation Scripts

#### Generate Empty Report
```bash
npm run report:empty
```

#### Generate with Sample Data
```bash
npm run report:sample
```

#### Update Cucumber Report
```bash
npm run report:update-cucumber
```

### Screenshot Management

**Automatic Capture:**
- On test failure (full page)
- Critical test steps
- Before/after state comparisons

**Storage:** `screenshots/` directory

**Naming Convention:**
- Descriptive names
- Step-based naming
- State indicators (before/after)

**Examples:**
- `auth-after-login.png`
- `course-details-page.png`
- `after-button-click.png`
- `module-1-completed.png`

**Cleanup:**
```bash
npm run clean:screenshots
```

---

## Dependencies

### Production Dependencies

```json
{
  "allure-cucumberjs": "^3.3.0",
  "allure-js-commons": "^3.3.0"
}
```

### Development Dependencies

```json
{
  "@cucumber/cucumber": "^11.3.0",
  "@cucumber/pretty-formatter": "^1.0.0",
  "@playwright/test": "^1.53.2",
  "@types/node": "^24.0.7",
  "allure-commandline": "^2.34.1",
  "allure-playwright": "^3.3.0",
  "cucumber": "^6.0.7",
  "http-server": "^14.1.1",
  "rimraf": "^5.0.5",
  "xlsx": "^0.18.5"
}
```

### Dependency Breakdown

#### Core Testing
- **@cucumber/cucumber**: BDD framework
- **@playwright/test**: Browser automation
- **cucumber**: Legacy Cucumber support

#### Reporting
- **allure-commandline**: Allure CLI tool
- **allure-playwright**: Playwright-Allure adapter
- **allure-cucumberjs**: Cucumber-Allure adapter
- **allure-js-commons**: Common Allure utilities
- **@cucumber/pretty-formatter**: Console formatting

#### Utilities
- **http-server**: Local web server for reports
- **rimraf**: Cross-platform file deletion
- **xlsx**: Excel file operations
- **@types/node**: TypeScript type definitions

---

## Setup and Installation

### Prerequisites

- **Node.js**: v14 or higher (v18+ recommended)
- **npm**: v6 or higher
- **Git**: For repository cloning
- **Operating System**: Windows, macOS, or Linux

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/Nandini-Adobe471/EXL_Functional_automation.git
cd EXLAutomationReportEnabled
```

#### 2. Install Dependencies
```bash
npm install
```

**This installs:**
- Playwright and Cucumber
- All reporters and formatters
- Utility libraries
- Browser drivers

#### 3. Install Playwright Browsers
```bash
npx playwright install
```

**This installs:**
- Chromium
- Firefox
- WebKit

**Install Specific Browser:**
```bash
npx playwright install chromium
```

#### 4. Configure Environment

**Edit `config.js`:**
```javascript
const ENV = {
   URL: 'https://experienceleague.adobe.com/en',
   EMAIL: 'your-test-email@adobetest.com',
   PASSWORD: 'your-test-password',
   TIMEOUT_1: 1000
}
module.exports = ENV;
```

**Security Note:**
- Never commit actual credentials to Git
- Use environment variables for sensitive data
- Consider using `.env` files (add to `.gitignore`)

#### 5. Verify Installation
```bash
# Run dry run to verify setup
npx cucumber-js --dry-run

# Check Playwright browsers
npx playwright --version
```

#### 6. Run First Test
```bash
# Run a single feature file
npx cucumber-js tests/features/browse.feature
```

### Environment Variables (Recommended)

**Create `.env` file:**
```bash
BASE_URL=https://experienceleague.adobe.com/en
TEST_EMAIL=your-email@adobetest.com
TEST_PASSWORD=your-password
```

**Update `.gitignore`:**
```
.env
node_modules/
reports/
screenshots/
allure-results/
allure-report/
```

**Load in config.js:**
```javascript
require('dotenv').config();

const ENV = {
   URL: process.env.BASE_URL || 'https://experienceleague.adobe.com/en',
   EMAIL: process.env.TEST_EMAIL,
   PASSWORD: process.env.TEST_PASSWORD,
   TIMEOUT_1: 1000
}
module.exports = ENV;
```

---

## Best Practices

### Test Writing Guidelines

#### 1. Feature Files
- **Write Clear Scenarios**: Use business-readable language
- **Keep Scenarios Atomic**: One scenario should test one thing
- **Use Descriptive Names**: Make scenario names self-explanatory
- **Leverage Background**: Share common setup across scenarios
- **Use Tags Wisely**: @smoke, @regression, @skip for organization
- **Data-Driven Tests**: Use Scenario Outline for multiple inputs

**Good Example:**
```gherkin
@smoke @browse
Scenario: User filters courses by product
  Given user navigates to browse page
  When user selects content type as "Courses"
  And user selects product as "Adobe Experience Manager"
  Then verify first card displays with selected content type and product tag
```

**Avoid:**
```gherkin
Scenario: Test browse page
  Given I am on the page
  When I do some stuff
  Then something happens
```

#### 2. Step Definitions
- **Reusable Steps**: Write generic, reusable step implementations
- **Clear Parameter Names**: Use descriptive parameter names
- **Proper Async/Await**: Always use async/await for asynchronous operations
- **Timeout Management**: Set appropriate timeouts for different operations
- **Error Handling**: Add try-catch blocks for robust error handling
- **State Management**: Use `this` context to share data between steps

**Best Practice Example:**
```javascript
When('user selects {string} from dropdown', async function(option) {
  try {
    await this.page.waitForSelector('.dropdown', { timeout: 5000 });
    await this.page.selectOption('.dropdown', option);
    console.log(`Selected ${option} from dropdown`);
  } catch (error) {
    console.error(`Failed to select ${option}: ${error.message}`);
    throw error;
  }
});
```

#### 3. Locator Strategies
- **Prefer Semantic Selectors**: Use role-based, text-based selectors
- **Avoid Brittle Selectors**: Don't rely on deep CSS paths
- **Use Data Attributes**: Add test-specific data attributes
- **Multiple Fallbacks**: Try multiple selector strategies

**Recommended Order:**
1. Role-based: `getByRole('button', { name: 'Submit' })`
2. Text-based: `getByText('Login')`
3. Label: `getByLabel('Email')`
4. Placeholder: `getByPlaceholder('Enter email')`
5. Test ID: `getByTestId('login-btn')`
6. CSS Selector: `.login-button` (last resort)

#### 4. Waiting Strategies
- **Avoid Hard Waits**: Don't use `waitForTimeout` unnecessarily
- **Smart Waits**: Wait for specific conditions
- **Use Playwright Auto-Wait**: Leverage built-in waiting
- **Network Idle**: Wait for network when needed

**Examples:**
```javascript
// Good - wait for element
await page.waitForSelector('.content', { state: 'visible' });

// Good - wait for navigation
await page.waitForNavigation();

// Good - wait for condition
await page.waitForFunction(() => document.querySelectorAll('.card').length > 0);

// Avoid - arbitrary timeout
await page.waitForTimeout(5000);
```

### Code Organization

#### 1. File Structure
- **Consistent Naming**: Use kebab-case for files
- **One Feature per File**: Keep features focused
- **Organize by Module**: Group related features
- **Separate Concerns**: Keep logic separated

#### 2. Code Style
- **Use Async/Await**: Consistent asynchronous code
- **Descriptive Variables**: Clear variable names
- **Comments**: Document complex logic
- **Error Messages**: Helpful error messages
- **Console Logging**: Strategic logging for debugging

#### 3. DRY Principle
- **Common Functions**: Extract reusable logic
- **Shared Utilities**: Create utility modules
- **Page Objects**: Encapsulate page interactions
- **Test Data**: Centralize test data

### Test Data Management

#### 1. Data Organization
```
tests/data/
├── users.js          # User credentials
├── products.js       # Product data
├── search-data.js    # Search test data
└── test-config.js    # Test configuration
```

#### 2. Data-Driven Testing
```gherkin
Scenario Outline: Login with multiple users
  Given user navigates to login page
  When user enters "<email>" and "<password>"
  Then user should see "<result>"
  
  Examples:
    | email           | password | result  |
    | valid@test.com  | pass123  | Success |
    | invalid@test.com| wrong    | Error   |
```

#### 3. Dynamic Data
```javascript
const testData = {
  timestamp: Date.now(),
  email: `test-${Date.now()}@example.com`,
  uniqueId: `test-${Math.random().toString(36).substr(2, 9)}`
};
```

### Error Handling and Debugging

#### 1. Screenshot Strategy
- Capture on failure (automatic via hooks)
- Capture at key checkpoints
- Descriptive filenames
- Full page screenshots

#### 2. Logging
```javascript
console.log('✓ Step completed successfully');
console.error('✗ Step failed:', error.message);
console.warn('⚠ Warning: Unusual behavior detected');
```

#### 3. Debugging Tools
- Browser DevTools (in headed mode)
- Playwright Inspector
- VS Code debugger
- Console logs

### CI/CD Integration

#### 1. GitHub Actions Example
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: test-reports
          path: reports/
```

#### 2. Environment Configuration
- Use environment variables
- Separate configs for environments
- Secrets management
- Parallel execution on CI

### Maintenance Best Practices

#### 1. Regular Updates
- Keep dependencies updated
- Update browser drivers
- Review and refactor tests
- Remove obsolete tests

#### 2. Test Review
- Code reviews for test changes
- Maintain test documentation
- Track flaky tests
- Monitor test execution time

#### 3. Performance
- Optimize test execution time
- Use parallel execution
- Clean up test data
- Optimize selectors

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Browser Launch Failures

**Symptom:** Browser fails to launch

**Solutions:**
```bash
# Reinstall browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps

# Check Playwright version
npx playwright --version
```

#### 2. Timeout Errors

**Symptom:** Tests fail with timeout errors

**Solutions:**
```javascript
// Increase global timeout
setDefaultTimeout(120 * 1000);

// Increase specific wait timeout
await page.waitForSelector('.element', { timeout: 60000 });

// Check network conditions
// Ensure stable internet connection
```

#### 3. Element Not Found

**Symptom:** Cannot find element on page

**Solutions:**
```javascript
// Take screenshot to debug
await page.screenshot({ path: 'debug.png' });

// Wait for element
await page.waitForSelector('.element', { state: 'visible' });

// Try multiple selectors
const element = await page.locator('.element, #element, [data-testid="element"]');

// Check if element is in iframe
const frame = page.frameLocator('iframe');
await frame.locator('.element').click();
```

#### 4. Login Failures

**Symptom:** Authentication fails

**Solutions:**
- Verify credentials in `config.js`
- Check if account is locked
- Verify network connectivity
- Check for CAPTCHA or MFA
- Review login flow in `login.js`

#### 5. Report Generation Failures

**Symptom:** Reports are empty or not generated

**Solutions:**
```bash
# Ensure reports directory exists
npm run ensure-reports-dir

# Check if JSON report is generated
ls reports/cucumber-report.json

# Use sample data for testing
npm run report:sample

# Verify generate-report.js is working
node tests/support/generate-report.js
```

#### 6. Screenshot Issues

**Symptom:** Screenshots not captured

**Solutions:**
```javascript
// Verify page object exists
if (this.page) {
  await this.page.screenshot({ path: 'test.png' });
}

// Check screenshot permissions
// Ensure screenshots directory has write permissions

// Clean old screenshots
npm run clean:screenshots
```

#### 7. Parallel Execution Issues

**Symptom:** Tests fail in parallel mode

**Solutions:**
```json
// Reduce parallel workers in cucumber.json
{
  "parallel": 1
}

// Ensure test independence
// Avoid shared state between tests
// Use unique test data
```

#### 8. Memory Issues

**Symptom:** Out of memory errors

**Solutions:**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm test

# Clean up resources
# Ensure browsers are closed after tests
# Clear temp files regularly
```

### Debug Commands

```bash
# Run with verbose logging
DEBUG=pw:api npm test

# Run single scenario
npx cucumber-js tests/features/browse.feature:10

# Run with specific tag
npx cucumber-js --tags "@debug"

# Dry run to validate
npx cucumber-js --dry-run

# Generate report from existing data
npm run report:generate
```

### Logging Best Practices

```javascript
// Structured logging
console.log(`[${new Date().toISOString()}] Starting test: ${scenarioName}`);
console.log(`[INFO] Navigating to ${url}`);
console.log(`[DEBUG] Element found: ${elementText}`);
console.error(`[ERROR] Test failed: ${error.message}`);
```

---

## Advanced Topics

### Mobile Testing

**Set Viewport:**
```javascript
await page.setViewportSize({ width: 390, height: 844 });
```

**Device Emulation:**
```javascript
const iPhone = devices['iPhone 12'];
const context = await browser.newContext({
  ...iPhone
});
```

### Network Interception

```javascript
// Block images
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());

// Mock API responses
await page.route('**/api/data', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mocked' })
  });
});
```

### Performance Testing

```javascript
// Measure page load time
const startTime = Date.now();
await page.goto(url);
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);

// Performance metrics
const metrics = await page.evaluate(() => JSON.stringify(window.performance.timing));
```

### Accessibility Testing

```javascript
// Check for accessibility violations
await page.evaluate(() => {
  // Run axe-core or similar
});
```

---

## Appendix

### Useful Commands Reference

```bash
# Installation
npm install
npx playwright install

# Running Tests
npm test
npm run test:report
npx cucumber-js tests/features/browse.feature
npx cucumber-js --tags "@smoke"

# Reports
npm run report:generate
npm run report:view
npm run report:full
npm run report:sample

# Cleanup
npm run clean:reports
npm run clean:screenshots

# Debugging
npx cucumber-js --dry-run
DEBUG=pw:api npm test
npx playwright test --debug

# Updates
npm update
npm outdated
npx playwright install
```

### Keyboard Shortcuts (Headed Mode)

- **F12**: Open DevTools
- **Ctrl+Shift+C**: Inspect element
- **F5**: Refresh page
- **Ctrl+Shift+I**: DevTools

### Recommended VS Code Extensions

- **Cucumber (Gherkin) Full Support**
- **Playwright Test for VSCode**
- **ESLint**
- **Prettier - Code formatter**
- **GitLens**
- **JavaScript (ES6) code snippets**

### Further Resources

- **Playwright Docs**: https://playwright.dev
- **Cucumber.js Docs**: https://cucumber.io/docs/cucumber/
- **Allure Docs**: https://docs.qameta.io/allure/
- **Experience League**: https://experienceleague.adobe.com

---

## Glossary

- **BDD**: Behavior-Driven Development - testing approach using natural language
- **Gherkin**: Language for writing BDD scenarios
- **Playwright**: Cross-browser automation framework
- **Cucumber**: BDD testing framework
- **Hook**: Function that runs before/after tests
- **Step Definition**: Implementation of a Gherkin step
- **Feature File**: File containing Gherkin scenarios
- **Locator**: Way to find elements on a page
- **Allure**: Advanced test reporting framework
- **CI/CD**: Continuous Integration/Continuous Deployment

---

## Contact and Contribution

**Repository:** https://github.com/Nandini-Adobe471/EXL_Functional_automation.git  
**Issue Tracking:** GitHub Issues  
**Latest Commit:** 57f3bf77cdcc53dbf9966c046d2cefa5847332be

### Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Write tests following the framework conventions
4. Ensure all tests pass
5. Create a pull request

---

## Version History

**Version 1.0** - January 29, 2026
- Comprehensive framework documentation
- Complete setup guide
- Best practices and troubleshooting
- Advanced topics coverage

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Framework Version:** Based on package.json dependencies  
**Maintained By:** EXL Automation Team

---

*This document provides a comprehensive overview of the EXL Automation Framework. For specific implementation details, refer to the code files and inline documentation. Keep this document updated as the framework evolves.*
