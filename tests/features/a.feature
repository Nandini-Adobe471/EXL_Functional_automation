Feature: Recently viewed block functionality on Adobe Experience League

@skip-login
Scenario: Verify Recently viewed block disappears when cookies are disabled
    Given user is logged in to Experience League application
    When the home page loads completely
    Then user checks if Recently viewed block is available
    When user clicks on Cookie preferences in the footer
    And user disables cookies in the preferences modal
    And user refreshes the page
    Then the Recently viewed block should not be visible
