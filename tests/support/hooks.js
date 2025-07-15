const { Before, After, Status } = require('@cucumber/cucumber');
const { performLogin } = require('../commonFunctions/login');

// Before hook to perform login before each scenario
// Skip login for scenarios that already handle login
Before({ tags: 'not @skip-login' }, async function() {
  console.log('Performing login before scenario');
  try {
    // Default credentials are used from the performLogin function
    const result = await performLogin(this);
    // The world object is already updated in the performLogin function
    console.log('Login completed successfully before scenario');
  } catch (error) {
    console.error('Error during pre-scenario login:', error.message);
  }
});

// Log when test fails but don't save screenshots
After(async function(scenario) {
  if (scenario.result.status === Status.FAILED && this.page) {
    // Log failure but don't save screenshot to file
    console.log(`Test failed: ${scenario.pickle.name}`);
    
    // Optionally capture screenshot in memory for report data
    // but don't save it to disk
    try {
      const screenshot = await this.page.screenshot({ 
        fullPage: true 
      });
      
      // Attach screenshot to report data (will be filtered out in the HTML report)
      this.attach(screenshot, 'image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error.message);
    }
  }
});
