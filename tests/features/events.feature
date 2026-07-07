Feature: Events Page Validation

  @events-block-count-validation
  Scenario: Validate events block is visible and total count matches Coveo API response
    Given user launches the application and logs in for events validation
    When user navigates to the events page
    Then the events search block should be visible
    And the API totalCount should match the UI events and recordings count
    When user sets viewport to mobile size
    Then the events search block should be visible in mobile view
    And the mobile filter toggle should expand filters on click

  @events-product-filter-applied @skip-login
  Scenario: Select first Product filter and verify each result card shows the selected product
    Given user is logged in and on the events page
    When user selects the first option from the Product filter
    Then results count should update
    And each result card should show the selected product or include it in the multisolution tooltip

  @events-series-filter-applied @skip-login
  Scenario: Select first Series filter and verify filtered results are displayed
    Given user is logged in and on the events page
    When user expands the Series filter group
    And user selects the first option from the Series filter
    Then results count should update
    And result cards should be visible

  @events-event-type-filter-applied @skip-login
  Scenario: Select first Event Type filter and verify filtered results are displayed
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the first option from the Event Type filter
    Then results count should update
    And result cards should be visible

  @events-on-demand-filter-card-validation @skip-login
  Scenario: Filter by On Demand event type and validate card structure
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then results count should update
    And each On Demand event card should not have the event time block
    When user clears all filters
    And user expands the Event Type filter group
    And user selects the "Upcoming Events" option from the Event Type filter
    Then results count should update
    And each Upcoming event card should have the event time block
    And each Upcoming event card should not have bookmark or copy link
