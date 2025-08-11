Feature: Search Picker Navigation

@search-picker @skip-login
Scenario Outline: Verify search picker navigation functionality
    Given user navigates to Experience League homepage
    When user clicks on search picker
    Then dropdown should open with list of values
    When user navigates to "<page_name>"
    Then search picker should show "<expected_value>"
    

Examples:
    | page_name      | expected_value  |
    | docs/home-tutorials      | Tutorials       |
    | docs           | Documentation   |
    | events         | Events          |
    | certification-home | Certification |
    | playlists      | Playlists       |
    | perspectives   | Perspectives    |
