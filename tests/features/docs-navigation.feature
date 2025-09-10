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

@docs-navigation-metadata @skip-login
Scenario: Validate article metadata on guide page
    Given user navigates to the docs page
    When user locates the first cloud solutions block
    Then the cloud solutions list should be visible
    When user clicks on the first item in the cloud solutions list
    Then user should be redirected to the selected solution page
    And breadcrumb should be displayed with the clicked item name
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And the last update date in article metadata should match the meta tag
    And the topics in article metadata should match the feature meta tag
    And the created for roles in article metadata should match the role meta tag

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

@docs-navigation-mobile-toc @skip-login
Scenario: Navigate to docs page and interact with table of contents in mobile view
    Given user navigates to the docs page in mobile view
    When user locates the first cloud solutions block in mobile view
    Then the cloud solutions list should be visible in mobile view
    When user clicks on the first item in the cloud solutions list in mobile view
    Then user should be redirected to the selected solution page in mobile view
    And breadcrumb should be displayed with the clicked item name in mobile view
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And user should see table of contents button
    When user clicks on the table of contents button
    Then the table of contents dropdown should be expanded

@docs-navigation-copy-bookmark @skip-login
Scenario: Navigate to guide page, test copy link and bookmark functionality
    Given user logs in to the system
    When user locates the first cloud solutions block
    Then the cloud solutions list should be visible
    When user clicks on the first item in the cloud solutions list
    Then user should be redirected to the selected solution page
    And breadcrumb should be displayed with the clicked item name
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And user extracts the h1 id for later use
    When user clicks on the copy link icon
    Then toast success message should be displayed
    And user clicks on the bookmark icon
    And user navigates to the bookmark page
    Then the bookmark page should display a card with the saved h1 title

@docs-navigation-copy-bookmark-mobile @skip-login
Scenario: Navigate to guide page, test copy link and bookmark functionality in mobile view
    Given user logs in to the system in mobile view
    When user locates the first cloud solutions block in mobile view
    Then the cloud solutions list should be visible in mobile view
    When user clicks on the first item in the cloud solutions list in mobile view
    Then user should be redirected to the selected solution page in mobile view
    And breadcrumb should be displayed with the clicked item name in mobile view
    When user clicks on the first li item in the guides
    Then user should be redirected to the guide page
    And user extracts the h1 id for later use
    When user clicks on the copy link icon in mobile view
    Then toast success message should be displayed
    
