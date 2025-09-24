Feature: Video Clips Visibility
  As a user
  I want to see the "Keep learning with video clips" section after login
  So that I can access video clip content and use the miniplayer functionality

@video-clips @skip-login
Scenario: Verify "Keep learning with video clips" section is visible after login
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    And the video clip card should have "Video Clip" in the banner
    When the user clicks on the first video clip card
    Then the video clip content should open
    And the test should capture a screenshot for evidence

@video-clips-miniplayer @skip-login
Scenario: Verify miniplayer functionality for video clips
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    When the user clicks on the first video clip card
    Then the video clip content should open
    When the user clicks on the activate miniplayer button
    Then the miniplayer should be activated
    And the test should capture a screenshot for evidence

@video-clips-expand-player @skip-login
Scenario: Verify expand video player functionality from miniplayer mode
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    When the user clicks on the first video clip card
    Then the video clip content should open
    When the user clicks on the activate miniplayer button
    Then the miniplayer should be activated
    When the user clicks on the expand video player button
    Then the MPC player should be visible
    When the user clicks on the play button
    Then the video should be playing
    And the test should capture a screenshot for evidence

@video-clips-close-player @skip-login
Scenario: Verify close player functionality from miniplayer mode
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    When the user clicks on the first video clip card
    Then the video clip content should open
    When the user clicks on the activate miniplayer button
    Then the miniplayer should be activated
    When the user clicks on the expand video player button
    Then the MPC player should be visible
    When the user clicks on the play button
    Then the video should be playing
    When the user clicks on the close player button
    Then the MPC player should not be visible
    And the test should capture a screenshot for evidence

@video-clips-full-video @skip-login
Scenario: Verify watch full video button opens in a new window
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    When the user clicks on the first video clip card
    Then the video clip content should open
    When the user clicks on the watch full video button
    Then a new window should open with the full video
    And the test should capture a screenshot for evidence

@video-clips-mobile @skip-login
Scenario: Verify video clip player on mobile devices
    Given the user logs in to the application with valid credentials
    When the user sets the viewport to mobile size
    And the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    When the user clicks on the first video clip card
    Then the video clip content should open
    And the activate miniplayer button should not be visible
    And only the close player button should be visible
    And the test should capture a screenshot for evidence

@video-clips-negative @skip-login
Scenario: Verify test fails when video clips section is not visible
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    And the "Keep learning with video clips" header is not visible
    Then the test should fail with "Video clips not visible" message
    And the test should capture a screenshot of the error state

@video-clips-see-more @skip-login
Scenario: Verify "See more recommendations" button functionality
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    And the "See more recommendations" button should be visible
    When the user clicks on the "See more recommendations" button
    Then the button text should change to "See fewer recommendations"
    And more video clip cards should be displayed
    And the test should capture a screenshot for evidence

@video-clips-bookmark @skip-login
Scenario: Verify bookmark icon is not visible in video clip cards
    Given the user logs in to the application with valid credentials
    When the user modifies the URL to append "?adobeQA=videoClips"
    And the page is fully loaded
    Then the "Keep learning with video clips" header should be visible
    And there should be at least one video clip card displayed
    And the bookmark icon should not be visible in video clip cards
    And the test should capture a screenshot for evidence
