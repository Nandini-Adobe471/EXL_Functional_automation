Feature: Footer Fragment Validation

@footer
Scenario: Validate footer fragment elements across pages
    Given user logs in and lands on the home page for footer validation
    When user navigates to the footer fragment page
    Then user should see footer breadcrumb
    And user should see footer item h2 tag texts
    And user should see language selector
    And user should see social media links
    And user should see footer copyright section
    When user navigates to the main site
    Then user should see the same footer elements on main site
    # Mobile view testing
    When user sets viewport to mobile size for footer validation
    Then user should see the same footer elements on main site in mobile view
