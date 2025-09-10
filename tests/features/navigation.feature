Feature: Navigation Menu Validation
  As a user
  I want to verify that all navigation menu items are clickable
  So that I can navigate to different sections of the application

@Header-navigation @skip-login
Scenario: Verify all navigation menu items are clickable and navigate to correct URLs
  Given user is logged in to Experience League for navigation validation
  When user identifies all navigation menu items
  Then all navigation menu items should be clickable
  And each navigation menu item should navigate to its targeted URL
