Feature: Search functionality
@search-php @skip-login
Scenario: Verify secondary search functionality
    Given user logs in and lands on the home page for search validation
    And user clicks on the search picker icon
    Then user should land on search result page
    And header search is not visible
    And all filters in the left side are expanded
    And search results are displayed
    And sort by option is displayed
    And result header contains columns "Name, Content Type, Product, Updated"
   

@search-php-mobile @skip-login
Scenario: Verify search functionality in mobile view
    Given user logs in and lands on the home page for mobile search validation
    When user changes viewport to mobile
    Then search icon in mobile view should be visible
    When user clicks on search icon in mobile view
    Then user should land on search result page in mobile view
    When user navigates back to home page in mobile view
    Then user checks if secondary search is visible in mobile view
    When user clicks on the secondary search icon
    Then user should land on search result page in mobile view again

@search-pagination @skip-login
Scenario: Verify pagination and results per page functionality
    Given user logs in and navigates to search page
    Then search results are displayed with pagination
    And default results per page should be "10"
    When user changes results per page to "25"
    Then number of results displayed should be "25"
    When user navigates to page "2"
    Then page "2" should be active in pagination


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

@search-facets-alphabetical @skip-login
Scenario: Verify search facets are alphabetically ordered
    Given user navigates to search page
    Then facet items in "facetRole" should be alphabetically ordered
    And facet items in "facetContentType" should be alphabetically ordered
    And facet items in "facetProduct" should be alphabetically ordered

@search-facets-multiple @skip-login
Scenario: Verify multiple facet selection and breadcrumb display
    Given user navigates to search page
    When user selects "Experience Manager" from "Product" facet
    And user selects "Documentation" from "Content Type" facet
    Then all selected facets should appear in the breadcrumb list

@search-facets-multiple-mobile @skip-login
Scenario: Verify multiple facet selection and breadcrumb display on mobile
    Given user navigates to search page in mobile view
    When user selects "Experience Manager" from "Product" facet
    And user selects "Documentation" from "Content Type" facet
    And user clicks on close icon
    Then all selected facets should appear in the breadcrumb list
