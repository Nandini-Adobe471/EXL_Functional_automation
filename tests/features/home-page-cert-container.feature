Feature: Experience League Home Page Certification Container

@home-page-cert-container
Scenario: Verify certification top container is loaded on the home page
    Given user navigates to Experience League home apage
    When the home page loaads completely
    Then the certification top container should be visible
