Feature: Sign-Up modal validation

Background:
    Given user navigates to Experience League homepage for signup validation

@sign-up-modal @skip-login @desktop
Scenario: Complete sign-up process validation
    When user clicks on sign in button
    Then user should see create account link
    When user clicks on create account link
    Then create account page should be displayed
    When user enters a unique email address
    And user enters a unique password
    And user clicks on continue button
    Then user should see the personal information form
    When user enters first name as "Functional"
    And user enters last name as "Automation"
    And user selects birth month as "May"
    And user enters birth year as "1990"
    And user clicks on create account button
    Then user should see account created successfully
    And account details should match entered information
    Then user should see role selection section with "Business User" selected by default
    When user selects "Developer" role from user roles section
    And user selects "Administrator" role from user roles section
    And user clicks on next button in role selection section
    Then user should see the product interests form
    When user selects 5 random interests
    And user clicks on next button in interests section
    Then user should see selected roles in profile card
    And user should see selected interests in profile card
    When user clicks on complete button
    Then home page should load
    When user clicks on customize your learning link
    Then user role in profile settings should match selected roles
    And user interests in profile settings should match selected interests
