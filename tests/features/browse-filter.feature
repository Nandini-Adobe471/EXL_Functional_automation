Feature: Browse and filter content on Adobe Experience League

@skip-login
@browse-filter
Scenario: Filter content by type and product and validate first card
    Given user is on the PHP page
    When user navigates to the browse page
    And user selects content type as "Community"
    And user selects product as "Analytics"
    Then verify first card displays with selected content type and product tag
