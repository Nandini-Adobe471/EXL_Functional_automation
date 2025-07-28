Feature: Launch Adobe Experience League URL and login

@skip-login
Scenario Outline: PHP page launched successfully and user logs in
    Given the user is on the landing page
    When the user clicks the CTA to begin login
    And the user enters their email address "<email>"
    And the user clicks the Continue button
    And the user enters their password "<password>"
    And the user submits the password form
    Then the user should be logged in successfully

Examples:
  | email                                    | password  |
  | gsnair+US+Team+VISA+hello+1@adobetest.com | Bap@d0be |

 