Feature: Sign-Up modal validation

@sign-up-modal @skip-login
Scenario: Validate sign-up modal and create account link
    Given user navigates to Experience League homepage for signup validation
    When user clicks on sign in button
    Then user should see create account link
    When user clicks on create account link
    Then create account page should be displayed
    When user enters a unique email address
    And user enters a unique password
    And user clicks on continue button
