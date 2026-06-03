Feature: AI Training page navigation

@ai-training @skip-login
Scenario: Launch URL with adobeQA parameter, click AI training link, and reload page
    Given user navigates to Experience League with adobeQA parameter
    When user clicks on AI training link
    Then user should be redirected to AI training page
    When user reloads the page
    Then AI training page should be displayed
