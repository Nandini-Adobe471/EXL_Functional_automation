Feature: Recommendations functionality on Adobe Experience League

@skip-login
Scenario: Check and interact with See More Recommendations button
    Given user is logged in to Experience League
    When the page loads completely
    Then user checks if See More Recommendations button is available
    And user clicks the See More Recommendations button
    And waits for additional recommendations to load
    And verifies that See Less Recommendations is displayed
