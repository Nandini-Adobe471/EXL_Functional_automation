Feature: Browse Rail Visibility on Experience League

@browse-rail
Scenario: Verify browse rail and its list items are visible
    Given user navigates to Experience League browse page
    When the browse page loads completely
    Then the browse rail should be visible
    And the browse rail list items should be visible
