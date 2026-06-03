@aim-hub @new-account
Feature: Product Interests Verification in EXLM
  As a new user
  I want to verify product interest selection workflow
  So that my learning preferences are properly tracked

  @complete-flow @skip-login
  Scenario: Signup, verify AI Training not checked, apply filter, verify in profile
    Given user launches the EXLM application
    When user creates a new account and completes sign up
    Then user should be on the product interests page
    And "AI Training" checkbox should not be checked in product interests wrapper
    When user navigates to the browse courses page
    Then the browse courses block should be visible
    When user opens the Product filter dropdown
    And user selects "AI Training" from product dropdown
    Then "AI Training" filter should be applied
    When user clicks on the profile toggle button
    And user selects "My Learning profile" from dropdown
    Then user should be on My Learning profile page
    When user navigates to profile interests section
    Then "AI Training" should be checked in profile interests
