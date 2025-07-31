Feature: cookie prefernce validation on Adobe Experience League

@recommendation-validation @skip-login
Scenario: Verify recommendation count matches between recs count and recommended content blocks on PHP page
    Given user is logged in to Experience League application with valid credentials
    When wait till the page loads completely
    Then user captures the target recs count from console
    And user finds the recommended content blocks count on the page
    And user verifies the count matches between target recs and recommended content blocks on php page
