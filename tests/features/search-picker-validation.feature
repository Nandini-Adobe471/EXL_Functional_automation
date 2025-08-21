Feature: Search Picker Functionality

@search-picker-selection @skip-login
Scenario: Verify search picker dropdown shows checkmark against selected values
    Given user navigates to home page
    When user clicks on search picker button
    Then search picker dropdown should be visible
    And a checkmark should be displayed against "All" in search picker
    When user selects "Documentation" from search picker dropdown
    Then a checkmark should be displayed against "Documentation" in search picker
    When user selects "All" from search picker dropdown
    Then a checkmark should be displayed against "All" in search picker
