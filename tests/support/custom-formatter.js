const { Formatter, Status } = require('@cucumber/cucumber');

class CustomFormatter extends Formatter {
  constructor(options) {
    super(options);
    
    options.eventBroadcaster.on('envelope', (envelope) => {
      if (envelope.testCaseFinished) {
        const { testCaseStarted, testResult } = envelope.testCaseFinished;
        
        if (testResult && testResult.status === Status.FAILED) {
          const { message } = testResult;
          this.log(`❌ Test failed: ${message || 'No error message'}\n`);
        } else if (testResult && testResult.status === Status.PASSED) {
          this.log('✅ Test passed\n');
        } else if (testResult && testResult.status === Status.SKIPPED) {
          this.log('⏭️ Test skipped\n');
        } else {
          this.log('⚠️ Test status unknown\n');
        }
      }
      
      if (envelope.testRunFinished) {
        const timestamp = new Date().toISOString();
        
        this.log('\n==================================');
        this.log(`Test run completed at: ${timestamp}`);
        
        if (envelope.testRunFinished.success) {
          const { success, message } = envelope.testRunFinished;
          this.log(`Overall result: ${success ? '✅ PASSED' : '❌ FAILED'}`);
          if (message) {
            this.log(`Message: ${message}`);
          }
        } else {
          this.log('Overall result: ⚠️ UNKNOWN');
        }
        
        this.log('==================================\n');
      }
    });
  }
}

module.exports = CustomFormatter;
