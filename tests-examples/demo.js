const {Given, When, Then, After} = require('@cucumber/cucumber');
const { closeBrowser } = require('../commonFunctions/launchbrowser');

// Global browser variable that might be set in other step files
let browser;

//console.log ("hi")
Given('Checking demo', function ()  {
         console.log("Given")
         });

When('print some message', function () {
          console.log("When")
         });
Then('result values', function () {
            console.log("Then");
         });

// Add After hook to ensure browser is closed even if it was opened in another step file
After(async function() {
  // This ensures any browser instance is properly closed
  if (global.browser) {
    await closeBrowser(global.browser);
  }
});
