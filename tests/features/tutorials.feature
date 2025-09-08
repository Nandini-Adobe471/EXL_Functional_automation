Feature: Tutorials Page Validation
  As a user
  I want to access the tutorials page
  So that I can view available tutorials

@tutorials-check @skip-login
Scenario: Verify Tutorials breadcrumb is displayed on tutorials page
  Given user navigates to Experience League tutorials page
  Then user should see "Tutorials" in the breadcrumb navigation
