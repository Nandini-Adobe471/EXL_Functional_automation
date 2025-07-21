Feature: Perspective Page Author Badge
  As a user
  I want to filter perspectives by author type
  So that I can view perspectives authored by Adobe
@skip-login
  Scenario: Filter perspectives by author type '&nbsp;Adobe' and verify badge
    Given user logs in and lands on PHP page
    When user navigates to the perspective page
    And user selects author type as "Adobe"
    Then verify first card displays with "By Adobe" badge
