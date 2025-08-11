Feature: Browse page
@skip-login
@browse-filter
Scenario: Filter content by type and product and validate first card
    Given user is on the PHP page
    When user navigates to the browse page
    And user selects content type as "Certification"
    And user selects product as "^Analytics$"
    Then verify first card displays with selected content type and product tag
@browse-topic-navigation 
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
@browse-rail
Scenario: Verify browse rail and its list items are visible
    Given user navigates to Experience League browse page
    When the browse page loads completely
    Then the browse rail should be visible
    And the browse rail list items should be visible
   
@browse-breadcrumb
Scenario: Verify breadcrumb navigation from browse rail list items
    Given user navigates to Experience League browse pagea
    When the browse page loads completelya
    And user clicks on a list item in the browse rail
    Then the breadcrumb should be visible
    When user clicks on the browse breadcrumb
    Then user should navigate back to the browse page
    # Mobile view testing
    When user sets viewport to mobile size1
    And user clicks on a list item in the browse rail in mobile view
    Then the breadcrumb should be visible in mobile view
    When user clicks on the browse breadcrumb in mobile view
    Then user should navigate back to the browse page in mobile view
@bookmark-management @skip-login
Scenario: Add and remove bookmarks for browse cards
    Given user logs in to Experience Leaguee
    When user navigates to browse page
    And user gets the title of the first card in tabbed-cards-wrapper
    And user bookmarks the first card
    And user navigates to bookmarks page
    Then user should see the bookmarked card with the same title
    When user removes the bookmark from the card
    And user navigates back to browse page
    Then the card should be available for bookmarking again
