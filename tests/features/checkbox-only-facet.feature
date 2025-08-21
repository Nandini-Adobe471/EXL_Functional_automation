Feature: Checkbox Only Facet Functionality

@checkbox-only-facet @skip-login
Scenario: Only button selects only that child facet
    Given the user navigates to the search results page for only facet test
    When the user checks the "Experience Manager" parent checkbox for only facet test
    Then all child checkboxes under "Experience Manager" should be checked for only facet test
    When the user hovers over a child facet
    Then the only button should be visible
    When the user clicks the only button
    Then only that child should be selected
    And all other children should be unselected
    And the parent checkbox should be unchecked
