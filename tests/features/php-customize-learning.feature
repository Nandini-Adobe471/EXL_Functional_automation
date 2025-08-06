Feature: Customize Learning and Verify Interests on Home Page

@customize-learning @skip-login
Scenario: Verify interests from customize learning appear as pills on home page
    Given user logs in to Experience League
    When user clicks on customize learning link
    And user should see element with class user-interests
    Then user should see interests separated by pipe symbol
    When user navigates back to home page
    Then interests should be visible as pills in responsive pill list
