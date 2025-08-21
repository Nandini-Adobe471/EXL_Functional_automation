Feature: Footer Fragment Validation

@footer-exl
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

@footer-clickable-items @skip-login
Scenario: Verify all list items in the footer are clickable
    Given user logs in and lands on the home page for footer validation
    When user navigates to the main site
    Then all list items in the footer should be clickable
