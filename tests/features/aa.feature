Feature: validate homepage essential

@skip-login
 Scenario: verify essential UI elements on the home page
    
    Given I navigate to the Experience League homepage
    Then the header navigation should be visible
    Then the search bar should be visible and enabled
     Then the marquee section should be displayed
     Then the footer should be visible
   
   
@home-page @search @skip-login
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

  @home-page @personalization @skip-login
Scenario: Verify personalized content recommendations for logged-in user
  Given user is logged in to Experience League to verify
  When user navigates to Experience League home page
  Then personalized recommendations section should be visible

  @home-page @performance @skip-login
Scenario: Verify home page performance metrics
  Given user navigates to Experience League home page to verify performsnce metrics
  Then page should load within acceptable time threshold
  And core web vitals should meet performance standards
    | Metric                    | Threshold |
    | First Contentful Paint    | < 2.5s    |
    | Largest Contentful Paint  | < 4.0s    |
    | Cumulative Layout Shift   | < 0.1     |
    | First Input Delay         | < 100ms   |
  And images should be properly optimized