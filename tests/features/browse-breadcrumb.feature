Feature: Browse Breadcrumb Navigation on Experience League

@browse-breadcrumb
Scenario: Verify breadcrumb navigation from browse rail list items
    Given user navigates to Experience League browse pagea
    When the browse page loads completelya
    And user clicks on a list item in the browse rail
    Then the breadcrumb should be visible
    When user clicks on the browse breadcrumb
    Then user should navigate back to the browse page
