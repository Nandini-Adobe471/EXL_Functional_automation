Feature: Mobile Search functionality
@mobile-search-filter-only-button @skip-login
Scenario: Verify only button functionality for subchild in mobile search filter
    Given the user navigates to the mobile search page
    When the user clicks on the mobile search icon
    # Rename this step to avoid ambiguity with the step in search.js
    And the user clicks on the filter button in mobile view
    And the user checks the mobile "Experience Manager" parent checkbox
    Then all mobile child checkboxes under "Experience Manager" should be checked
    And the user clicks on the mobile "only" button for a subchild
    Then only that mobile child should be selected
    And all other mobile children should be unselected
    And the mobile parent checkbox should be unchecked

@mobile-search-multiple-filters @skip-login
Scenario: Verify multiple filter selection and breadcrumb display in mobile view
    Given the user navigates to the mobile search page
    When the user clicks on the mobile search icon
    And the user clicks on the filter button in mobile view
    And the user selects "Certification" from "Content Type" facet in mobile
    And the user selects "Analytics" from "Product" facet in mobile
    And the user clicks on the close icon in mobile view
    Then the breadcrumb list should show "+ 2" button

@mobile-search-clear-filters @skip-login
Scenario: Verify clear filter functionality in mobile view
    Given the user navigates to the mobile search page
    When the user clicks on the mobile search icon
    And the user clicks on the filter button in mobile view
    And the user selects "Certification" from "Content Type" facet in mobile
    And the user selects "Analytics" from "Product" facet in mobile
    And the user clicks on the close icon in mobile view
    Then the breadcrumb list should show "+ 2" button
    When the user clicks on the clear all filters button
    And the user clicks on the filter button in mobile view
    Then the "Certification" checkbox in "Content Type" facet should be unchecked
    And the "Analytics" checkbox in "Product" facet should be unchecked
