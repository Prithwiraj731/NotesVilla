# Implementation Plan

- [x] 1. Update frontend Home component navigation



  - Modify the handleDive function in client/src/pages/Home.jsx to navigate directly to /notes without token checking
  - Remove localStorage token validation logic
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Clean up frontend App component routing
  - Remove user authentication route imports from client/src/App.jsx
  - Remove user login/signup routes from the Routes configuration
  - Remove user token initialization logic from useEffect
  - Keep admin routes and admin authentication intact
  - _Requirements: 4.2, 4.3_

- [ ] 3. Update Header component for public access
  - Remove user login/logout functionality from client/src/components/Header.jsx
  - Keep admin logout functionality for admin users
  - Update navigation to reflect public access model
  - _Requirements: 5.1, 5.3_

- [ ] 4. Remove user authentication components
  - Delete or disable user login page component (if separate from admin login)
  - Delete or disable user signup page component
  - Remove any user-specific protected route components (keep admin protected routes)
  - _Requirements: 4.2, 4.3_

- [ ] 5. Remove backend user authentication routes
  - Remove user auth routes import from server/app.js
  - Remove the /api/auth route mounting
  - Keep /api/admin and /api/notes routes intact
  - _Requirements: 4.2, 4.3_

- [ ] 6. Remove user authentication controllers and routes
  - Delete server/routes/auth.routes.js file
  - Delete server/controllers/auth.controller.js file
  - Verify no other files reference these deleted components
  - _Requirements: 4.2, 4.3_

- [ ] 7. Verify notes routes are fully public
  - Review server/routes/notes.routes.js to ensure GET endpoints have no authentication middleware
  - Confirm upload endpoints still use admin middleware only
  - Remove any user authentication middleware from public note access routes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 8. Update API service configuration
  - Review client/src/services/api.js to ensure it handles public requests correctly
  - Remove any user authentication token logic that might interfere with public access
  - Keep admin authentication token handling
  - _Requirements: 2.1, 2.2_

- [ ] 9. Test frontend public access functionality
  - Create test to verify home page navigates directly to notes
  - Create test to verify notes listing works without authentication
  - Create test to verify individual note viewing works without authentication
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 10. Test admin functionality preservation
  - Create test to verify admin login still works
  - Create test to verify admin upload functionality remains protected
  - Create test to verify admin routes redirect properly when not authenticated
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 11. Clean up unused imports and references
  - Remove unused imports related to user authentication from all frontend files
  - Remove unused imports related to user authentication from all backend files
  - Update any remaining references to user authentication in comments or documentation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 12. Update UI messaging for public access
  - Update home page messaging to reflect free access to notes
  - Ensure admin access remains discrete (footer link or similar)
  - Remove any user authentication prompts or messaging
  - _Requirements: 5.2, 5.3, 5.4_