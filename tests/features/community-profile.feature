Feature: Community Profile Validation

@community-profile-validation @skip-login
  Scenario: Validate community section availability in profile menu
    Given user logs in to Experience League for community profile
    When user hovers on the profile button
    And user waits for 2 seconds for community profile
    Then verify if community section is available in profile menu
    And if community section is not visible print "Community profile is not created"
 
    
@community-profile-links @skip-login
Scenario: Validate community profile links visibility and navigation
    Given user logs in to Experience League for community profile
    When user hovers on the profile button
    And user waits for 2 seconds for community profile
    Then verify community section is visible in profile menu
    And verify "My Community profile" link is visible and clickable
    And verify "My Community profile" link navigates to "https://experienceleaguecommunities-beta.adobe.com/members/"
    And verify "Private messages" link is visible and clickable
    And verify "Private messages" link navigates to "https://experienceleaguecommunities-beta.adobe.com/inbox/overview"
    And verify "Account settings" link is visible and clickable
    And verify "Account settings" link navigates to "https://experienceleaguecommunities-beta.adobe.com/settings/profile"
    And verify "Subscriptions" link is visible and clickable
    And verify "Subscriptions" link navigates to "https://experienceleaguecommunities-beta.adobe.com/favorite/overview"

@community-profile-complete-validation @skip-login
Scenario: Complete community profile validation with all checks
    Given user logs in to Experience League for community profile
    When user hovers on the profile button
    And user waits for 2 seconds for community profile
    Then verify if community section is available in profile menu
    When community section is visible
    Then verify all community profile links are present:
      | Link Name             | Expected URL Pattern                                           |
      | My Community profile  | https://experienceleaguecommunities-beta.adobe.com/members/    |
      | Private messages      | https://experienceleaguecommunities-beta.adobe.com/inbox/overview |
      | Account settings      | https://experienceleaguecommunities-beta.adobe.com/settings/profile |
      | Subscriptions         | https://experienceleaguecommunities-beta.adobe.com/favorite/overview |
    And verify each link is visible and clickable
    And verify each link navigates to the correct target URL
    When community section is not visible
    Then print "Community profile is not created"

@community-profile-network-validation @skip-login
Scenario: Validate community profile via network API status code
    Given user starts monitoring network requests for profile menu
    And user logs in to Experience League for community profile with network monitoring
    When user hovers on the profile button
    And user waits for 2 seconds for community profile
    Then verify profile-menu-list API status code and determine profile status
    And log the profile status result

@community-profile-spanish-language @skip-login
Scenario: Validate community links are displayed in Spanish after language change
    Given user logs in to Experience League for community profile
    When user clicks on language selector button
    And user selects "Español" from language list
    And user hovers on the profile button
    And user waits for 2 seconds for community profile
    Then verify community section header is displayed in Spanish as "Comunidad"
    And verify all community links are displayed in Spanish:
      | Spanish Link Name         | Expected URL Pattern                                           |
      | Mi perfil en la comunidad | https://experienceleaguecommunities-beta.adobe.com/members/    |
      | Mensajes privados         | https://experienceleaguecommunities-beta.adobe.com/inbox/overview |
      | Configuración de la cuenta| https://experienceleaguecommunities-beta.adobe.com/settings/profile |
      | Suscripciones             | https://experienceleaguecommunities-beta.adobe.com/favorite/overview |
