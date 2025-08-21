Feature: Experience Manager parent-child checkbox functionality

@checkbox-parent-child @skip-login
Scenario: Parent checkbox controls child checkboxes
    Given the user navigates to the search results page
    When the user checks the "Experience Manager" parent checkbox
    Then all child checkboxes under "Experience Manager" should be checked
    Then all child elements in atomic-breadbox should display with pattern "Product:Experience Manager | child name"
    When the user unchecks the first child under "Experience Manager"
    Then the unchecked child should not appear in the breadcrumb
    Then the "Experience Manager" parent checkbox should be unchecked

@checkbox-breadcrumb-removal @skip-login
Scenario: Removing breadcrumb element unchecks corresponding facet
    Given the user navigates to the search results page
    When the user checks the "Experience Manager" parent checkbox
    Then all child checkboxes under "Experience Manager" should be checked
    Then all child elements in atomic-breadbox should display with pattern "Product:Experience Manager | child name"
    When the user removes a breadcrumb element
    Then the corresponding facet should be unchecked

@checkbox-mobile-filter @skip-login
Scenario: Filter selection in mobile view
    Given the user navigates to the search results page
    When the user changes viewport to mobile
    And the user clicks on the search icon
    And the user clicks on the mobile filter button
    And the user checks the "Experience Manager" parent checkbox
    Then all child checkboxes under "Experience Manager" should be checked

@checkbox-mobile-parent-child @skip-login
Scenario: Parent checkbox controls child checkboxes in mobile view
    Given the user navigates to the search results page
    When the user changes viewport to mobile
    And the user clicks on the search icon
    And the user clicks on the mobile filter button
    And the user checks the "Experience Manager" parent checkbox
    Then all child checkboxes under "Experience Manager" should be checked
    Then all child elements in atomic-breadbox should display with pattern "Product:Experience Manager | child name"
    When the user unchecks the first child under "Experience Manager"
    Then the unchecked child should not appear in the breadcrumb
    Then the "Experience Manager" parent checkbox should be unchecked
