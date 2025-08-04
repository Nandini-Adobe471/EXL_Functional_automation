Feature: Browse Topic Navigation and Content Verification

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
