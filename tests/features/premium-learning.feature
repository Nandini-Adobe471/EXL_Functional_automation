Feature: Premium Learning Blocks Validation
  As a premium learning user
  I want to verify cohort blocks are displayed correctly
  Based on enrollment status and recommendations API data

  @cohort-enrollment @skip-login
  Scenario: Validate cohort blocks display based on enrollment API response
    Given user logs in and lands on the PHP page for cohort validation
    When user navigates to the PHP home page
    Then user intercepts the enrollment API response
    And if enrollment API returns empty data then Suggested Cohort block should be visible
    And if enrollment API returns data then Active Cohort block should be visible
    And if neither block is displayed then authoring of PL blocks is missing

  @premium-learning-search @skip-login
  Scenario: Validate Premium Learning Search block visibility based on authentication
    Given user navigates to the search page without logging in
    Then the Premium Learning Search block should not be visible for unauthenticated user
    When user logs in and navigates to the search page
    Then the Premium Learning Search block should be visible for authenticated user
    And user intercepts the Premium Learning Search query API response
    And verify the cards displayed in Premium Learning Search block match the API data

  @suggested-cohort @skip-login
  Scenario: Validate Suggested Cohort block cards match API recommendations
    Given user logs in and lands on the PHP page for suggested cohort validation
    When user navigates to the PHP home page for suggested cohort validation
    Then user checks if Suggested Cohort block is visible
    And if Suggested Cohort block is not visible verify Active Cohort block is shown
    And if Suggested Cohort block is visible verify max 4 cards are displayed
    And verify the displayed cohort card IDs and image URLs match the recommendations API data
    And verify each product tab shows cohorts matching that product from the API

  @pl-search-past-due-cohort @skip-login
  Scenario: Validate past-due cohort filtering in PL Search block
    Given user logs in for PL search past-due cohort validation
    When user navigates to the search page for PL past-due cohort validation
    Then user intercepts the PL Search block query API and validates past-due cohort filtering

  @pl-browse-cards-validation @skip-login
  Scenario: Validate PL Browse page cards - cohort deadline and course type labels
    Given user logs in for PL browse cards validation
    When user navigates to the PL browse page for card validation
    Then user intercepts the PL Browse cards query API and validates cohort filtering and course type labels
