Feature: Docs page navigation functionality

@docs-navigation @skip-login
Scenario: Navigate to docs page and click on first cloud solution
    Given user navigates to the docs page
    When user locates the first cloud solutions block
    Then the cloud solutions list should be visible
    When user clicks on the first item in the cloud solutions list
    Then user should be redirected to the selected solution page
    And breadcrumb should be displayed with the clicked item name
    And all h2 headings should be displayed in mini-toc
    When user clicks on a link in the mini-toc
    Then page should scroll to the respective section

@docs-navigation-mobile @skip-login
Scenario: Navigate to docs page and click on first cloud solution in mobile view
    Given user navigates to the docs page in mobile view
    When user locates the first cloud solutions block in mobile view
    Then the cloud solutions list should be visible in mobile view
    When user clicks on the first item in the cloud solutions list in mobile view
    Then user should be redirected to the selected solution page in mobile view
    And breadcrumb should be displayed with the clicked item name in mobile view

@docs-navigation-guides @skip-login
Scenario: Navigate to docs page and click on first guide in the guides section
    Given user navigates to the docs page
    When user locates the first cloud solutions block
    Then the cloud solutions list should be visible
    When user clicks on the first item in the cloud solutions list
    Then user should be redirected to the selected solution page
    And breadcrumb should be displayed with the clicked item name
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And TOC header should match first item in the cloud solutions list
    When user clicks on right rail toggle
    Then right rail should be hidden with closed

@docs-navigation-left-rail @skip-login
Scenario: Toggle left rail on docs page
    Given user navigates to the docs page
    When user locates the first cloud solutions block
    Then the cloud solutions list should be visible
    When user clicks on the first item in the cloud solutions list
    Then user should be redirected to the selected solution page
    And breadcrumb should be displayed with the clicked item name
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And TOC header should match first item in the cloud solutions list
    When user clicks on left rail toggle
    Then left rail should be hidden with closed
