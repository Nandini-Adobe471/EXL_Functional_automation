Feature: Events Page Validation
  As a user
  I want to access the events page
  So that I can view upcoming events

@events-upcoming-events @skip-login
Scenario: Verify Events page navigation and content after login
  Given user is logged in to Experience League for events validation
  When user clicks on Events link in the navigation menu
  Then user should see upcoming events cards
  And events content should match the upcoming-events.json data
