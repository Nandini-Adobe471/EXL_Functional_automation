Feature: Browse page

@browse-filter  @skip-login
Scenario: Filter content by type and product and validate first card
    Given user is on the PHP page
    When user navigates to the browse page
    And user selects content type as "Certification"
    And user selects product as "Analytics"
    Then verify first card displays with selected content type and product tag
@browse-topic-navigation @skip-login
Scenario: Navigate to Analytics and Experience Manager from left rail and verify content cards and pagination
    Given user navigates to Experience League browse page filter section
    When the browse page filters loads completely
    And user selects "Analytics" from the left rail
    And user clicks on any button in the browse topic block
    Then content cards should be loaded
    And pagination should be working properly
    When user navigates back to the browse page
    And user selects "Experience Manager" from the left rail
    And user clicks on any button in the browse topic block
    Then content cards should be loaded
    And pagination should be working properly
@browse-rail @skip-login
Scenario: Verify browse rail and its list items are visible
    Given user navigates to Experience League browse page
    When the browse page loads completely
    Then the browse rail should be visible
    And the browse rail list items should be visible
   
@browse-breadcrumb @skip-login
Scenario: Verify breadcrumb navigation from browse rail list items
    Given user navigates to Experience League browse page
    When the browse page loads completely
    And user clicks on a list item in the browse rail
    Then the breadcrumb should be visible
    When user clicks on the browse breadcrumb
    Then user should navigate back to the browse page
    # Mobile view testing
    When user sets viewport to mobile size and reloads the browse page
    And user clicks on a list item in the browse rail in mobile view
    Then the breadcrumb should be visible in mobile view
    When user clicks on the browse breadcrumb in mobile view
    Then user should navigate back to the browse page in mobile view

@BRW-02 @skip-login
Scenario: Browse rail Products group expands and collapses
    Given user opens the Experience League Browse landing page
    When the browse rail has fully loaded
    Then the Products list should be visible
    When user collapses the Products group in the browse rail
    Then the Products list should be hidden
    When user expands the Products group in the browse rail
    Then the Products list should be visible again

@BRW-05 @skip-login
Scenario: Multiple Browse filters combine with AND logic
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    And user applies the "Content Type" filter value "Certification"
    Then the single-filter result count is recorded
    And user applies the "Product" filter value "Analytics"
    Then every visible browse card matches both the "Content Type" and "Product" filters
    And the combined result count is not greater than the single-filter result count
    When user removes the "Product" filter value "Analytics"
    Then the results revert to matching only the "Content Type" filter

@BRW-06 @skip-login
Scenario: Clear filters resets the Browse results
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    And user applies the "Content Type" filter value "Certification"
    And user applies the "Product" filter value "Analytics"
    Then the Browse "Clear filters" control should be enabled
    When user clicks the Browse "Clear filters" control
    Then all applied Browse filter tags are removed
    And the full unfiltered set of browse cards is restored
    And the Browse "Clear filters" control should be disabled again

@BRW-08 @skip-login
Scenario: Pagination moves through distinct, non-duplicated Browse results
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    And user applies the "Content Type" filter value "Certification"
    Then the first page of browse results is recorded
    When user navigates to the next page of Browse results
    Then the second page of browse results is distinct from the first page
    When user navigates to the previous page of Browse results
    Then the original first page of browse results is restored

@BRW-09-multilevel @skip-login
Scenario: Breadcrumb reflects a two-level-deep Browse navigation path
    Given user opens the Experience League Browse landing page
    When user clicks a browse rail product link that is nested two path segments deep
    Then the browse breadcrumb shows the full path ending in a non-clickable current segment
    When user clicks the intermediate breadcrumb segment
    Then the browser navigates back to that intermediate Browse level

@BRW-10 @skip-login
Scenario: Deep link to a pre-filtered Browse URL applies the filter on load
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    And user applies the "Content Type" filter value "Certification"
    Then user captures the current filtered Browse URL
    When user opens the captured filtered Browse URL directly
    Then the "Content Type" filter is already applied and reflected in the UI

@BRW-11 @skip-login
Scenario: Empty state is shown for a zero-match Browse filter combination
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    And user keeps applying additional Browse filters until no results remain
    Then a clear "no results" message is displayed instead of a blank area
    And an option to reset filters is presented alongside the empty state
    When user resets the Browse filters from the empty state
    Then the full unfiltered set of browse cards is restored

@BRW-13 @skip-login
Scenario: Browse Content Type filter isolates matching content across result cards
    Given user opens the Experience League Browse landing page
    When the browse filters section has fully loaded
    Then user checks each available Content Type filter option in turn
    And every visible browse card under a selected content type matches that content type
