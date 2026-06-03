Feature: php validation
@home-page-essential-ui-elements @skip-login
 Scenario: verify essential UI elements on the home page
    
    Given I navigate to the Experience League homepage
    Then the header navigation should be visible
    Then the search bar should be visible and enabled
     Then the marquee section should be displayed
     Then the footer should be visible
   
   
@home-page-search @search @skip-login
Scenario: Validate search functionality from home page
  Given user navigates to Experience League home page
  When user enters "Analytics" in the search bar
  And user submits the search
  Then search results page should display
  Then search results should contain items related to "Analytics"

  @home-page @navigation @skip-login
Scenario: Verify main navigation links functionality
  Given user navigates to Experience League home page
  When user clicks on each main navigation link
    | Link Name    |
    | Tutorials       |
    | Documentation   |
    | Perspective       |
  Then each page should load successfully
  And each page should display relevant content

  @home-page @responsive @skip-login
Scenario: Validate responsive behavior of home page
  Given user navigates to EX League home page 
    When viewport size is changed to the following dimensions
    | Device      | Width | Height |
    | Mobile      | 375   | 667    |
    | Tablet      | 768   | 1024   |
    | Desktop     | 1440  | 900    |
  Then page layout should adapt appropriately to each viewport


  @home-page @performance @skip-login
Scenario: Verify home page performance metrics
  Given user navigates to Experience League home page to verify performsnce metrics
  Then page should load within acceptable time threshold
  And core web vitals should meet performance standards
    | Metric                    | Threshold |
    | First Contentful Paint    | < 1.8s    |
    | Largest Contentful Paint  | < 2.5s    |
    | Cumulative Layout Shift   | < 0.1     |
    | First Input Delay         | < 100ms   |
  And images should be properly optimized

  @home-page @cookies @skip-login
Scenario: Verify Recently viewed block disappears when cookies are disabled
    Given user is logged in to Experience League application
    When the home page loads completely
    Then user checks if Recently viewed block is available
    When user clicks on Cookie preferences in the footer
    And user disables cookies in the preferences modal
    And user refreshes the page
    Then the Recently viewed block should not be visible

   @php-bookmark @skip-login
 Scenario: Bookmark content on Experience League
    Given user is on Experience League home
    When user bookmarks the first content card
    Then ensure bookmarked card appears in bookmarks page

    @See-more-and-less @skip-login
Scenario: Check and interact with See More Recommendations button
    Given user is logged in to Experience League
    When the page loads completely
    Then user checks if See More Recommendations button is available
    And user clicks the See More Recommendations button
    And waits for additional recommendations to load
    And verifies that See fewer recommendations is displayed

@recommendation-validation @skip-login
Scenario: Verify recommendation count matches between recs count and recommended content blocks on PHP page
    Given user is logged in to Experience League application with valid credentials
    When wait till the page loads completely
    Then user captures the target recs count from console
    And user finds the recommended content blocks count on the page
    And user verifies the count matches between target recs and recommended content blocks on php page

    @customize-learning @skip-login
Scenario: Verify interests from customize learning appear as pills on home page
    Given user logs in to Experience League
    When user clicks on customize learning link
    And user should see element with class user-interests
    Then user should see interests separated by pipe symbol
    When user navigates back to home page
    Then interests should be visible as pills in responsive pill list
