# Requirements Document

## Introduction

Groove is a mobile-first web application that reimagines the classic vinyl record player experience for the modern streaming era. Users can create and manage music playlists visualized as vinyl records displayed on virtual wooden shelves, with interactive controls that mimic the tactile experience of operating a physical turntable. The application bridges nostalgic analog aesthetics with contemporary digital music streaming, supporting both Spotify and Apple Music integration.

## Glossary

- **Groove**: The application name and brand identity
- **Welcome Screen**: The splash/onboarding screen with animated vinyl logo and authentication options
- **Now Playing Screen**: The main playback interface displaying a vinyl record on a turntable with track queue below
- **My Shelf Screen**: The collection view displaying user's vinyl records arranged on wooden shelves
- **Create New Screen**: The interface for creating new playlists with vinyl customization options
- **Vinyl Record**: A visual representation of a playlist with customizable cover art as the label
- **Track Queue**: The list of tracks displayed below the vinyl player showing upcoming songs
- **Spotify API**: The external service used to access Spotify playlists and control music playback
- **Apple Music API**: The external service used to access Apple Music playlists and control playback
- **Web Application**: The Next.js-based frontend application with Tailwind CSS styling
- **Backend Service**: The Express.js server hosted on Supabase handling API authentication and requests
- **Supabase**: The cloud platform providing hosting, database, authentication, and storage services
- **User**: A person accessing the web application with a Spotify or Apple Music account

## Requirements

### Requirement 1: Welcome and Authentication

**User Story:** As a user, I want to see an engaging welcome screen and authenticate with my music streaming account, so that I can access my playlists and control music playback.

#### Acceptance Criteria 1

1. WHEN a user launches the application, THE Web Application SHALL display an animated splash screen with the Groove vinyl logo
2. WHEN the splash animation completes, THE Web Application SHALL transition to the Welcome screen with "Connect with Spotify" and "Connect with Apple Music" buttons
3. WHEN a user clicks "Connect with Spotify", THE Backend Service SHALL redirect the user to Spotify's OAuth authorization page
4. WHEN a user clicks "Connect with Apple Music", THE Backend Service SHALL redirect the user to Apple Music's authorization page
5. WHEN authorization succeeds, THE Backend Service SHALL store the access token securely in Supabase and redirect the user to the Now Playing screen
6. WHEN the access token expires, THE Backend Service SHALL refresh the token automatically using Supabase-stored refresh tokens without requiring re-authentication
7. WHEN a user logs out, THE Web Application SHALL clear all authentication data and return to the Welcome screen

### Requirement 2: My Shelf - Playlist Collection

**User Story:** As a user, I want to view all my playlists as vinyl records on wooden shelves, so that I can browse my music collection in a nostalgic visual format.

#### Acceptance Criteria 2

1. WHEN a user navigates to My Shelf, THE Web Application SHALL fetch and display all user playlists from the connected music service
2. WHEN displaying playlists, THE Web Application SHALL render each playlist as a vinyl record arranged on wooden shelf rows
3. WHEN a playlist has no custom cover, THE Web Application SHALL display a default vinyl record design with the Groove logo
4. WHEN the user scrolls through shelves, THE Web Application SHALL load additional playlists efficiently without blocking the interface
5. WHEN a user taps on a vinyl record, THE Web Application SHALL navigate to the Now Playing screen with that playlist loaded
6. WHEN viewing My Shelf, THE Web Application SHALL display an "Add New Vinyl" button to create new playlists

### Requirement 3: Now Playing - Playback Interface

**User Story:** As a user, I want to control music playback using a vinyl turntable interface, so that I can experience the tactile feel of operating a turntable.

#### Acceptance Criteria 3

1. WHEN a playlist is selected, THE Now Playing Screen SHALL display the vinyl record on a turntable with the playlist cover as the label
2. WHEN a user taps the play control, THE Now Playing Screen SHALL begin playback and animate the record spinning at 33 RPM
3. WHEN a user taps the pause control, THE Now Playing Screen SHALL pause playback and stop the spinning animation
4. WHEN a user drags the tonearm or scrubs the record, THE Now Playing Screen SHALL seek to the corresponding position in the current track
5. WHEN a user taps the skip forward control, THE Now Playing Screen SHALL advance to the next track in the playlist
6. WHEN a user taps the skip backward control, THE Now Playing Screen SHALL return to the previous track or restart the current track if more than 3 seconds have elapsed
7. WHILE a track is playing, THE Now Playing Screen SHALL display the track queue below the turntable showing track names and artists
8. WHEN a user taps "View All" in the track queue, THE Web Application SHALL expand to show the full playlist

### Requirement 4: Create New - Vinyl Customization

**User Story:** As a user, I want to create new playlists with custom vinyl designs, so that I can personalize my music collection.

#### Acceptance Criteria 4

1. WHEN a user taps "Add New Vinyl" or navigates to Create New, THE Web Application SHALL display the vinyl creation interface
2. WHEN creating a vinyl, THE Web Application SHALL display a preview of the vinyl record with customization options
3. WHEN a user selects a color from the color picker, THE Web Application SHALL update the vinyl record color in real-time
4. WHEN a user selects an image from the image gallery, THE Web Application SHALL apply it as the vinyl label
5. WHEN a user uploads a custom image, THE Web Application SHALL validate the image format (JPEG, PNG) and size (maximum 4MB) before accepting it
6. WHEN a user taps "Create Playlist", THE Backend Service SHALL create a new playlist via the music service API and store metadata in Supabase
7. WHEN playlist creation succeeds, THE Web Application SHALL add the new vinyl to My Shelf and display a success message
8. IF playlist creation fails, THEN THE Web Application SHALL display an error message with the reason for failure

### Requirement 5: Playback Information Display

**User Story:** As a user, I want the vinyl player to display real-time playback information, so that I can see what's currently playing and track progress.

#### Acceptance Criteria 5

1. WHILE a track is playing, THE Now Playing Screen SHALL display the track name and artist below the turntable
2. WHILE a track is playing, THE Now Playing Screen SHALL show a progress indicator on the vinyl record
3. WHEN playback position changes, THE Now Playing Screen SHALL update the progress display within 1 second
4. WHILE the vinyl record spins, THE Now Playing Screen SHALL rotate at 33 RPM to simulate authentic turntable speed
5. WHILE playback is paused, THE Now Playing Screen SHALL maintain the current rotation position without spinning

### Requirement 6: Navigation and Layout

**User Story:** As a user, I want intuitive navigation between screens, so that I can easily access all features of the application.

#### Acceptance Criteria 6

1. WHEN the application loads, THE Web Application SHALL display a hamburger menu icon for navigation
2. WHEN a user taps the hamburger menu, THE Web Application SHALL display navigation options for Now Playing, My Shelf, and Create New
3. WHEN navigating between screens, THE Web Application SHALL use smooth transitions appropriate for mobile devices
4. WHEN on the Now Playing screen, THE Web Application SHALL display "NOW PLAYING" as the header title
5. WHEN on the My Shelf screen, THE Web Application SHALL display "MY SHELF" as the header title
6. WHEN on the Create New screen, THE Web Application SHALL display "CREATE NEW" as the header title

### Requirement 7: Error Handling

**User Story:** As a user, I want the application to handle errors gracefully, so that I can continue using the app even when issues occur.

#### Acceptance Criteria 7

1. IF the music service API is unavailable, THEN THE Web Application SHALL display a user-friendly error message and retry option
2. IF network connectivity is lost, THEN THE Web Application SHALL detect the disconnection and notify the user
3. IF an API request fails, THEN THE Backend Service SHALL log the error details to Supabase and return an appropriate error response
4. IF authentication fails, THEN THE Web Application SHALL redirect the user to the Welcome screen with an explanation
5. IF rate limits are exceeded, THEN THE Backend Service SHALL queue requests and inform the user of the delay

### Requirement 8: Responsive Design

**User Story:** As a user, I want the vinyl player interface to be responsive, so that I can use the application on different devices.

#### Acceptance Criteria 8

1. WHEN the application loads on a mobile device (width less than 768px), THE Web Application SHALL display the mobile-optimized layout as shown in the design
2. WHEN the application loads on a tablet (width 768px to 1024px), THE Web Application SHALL scale the vinyl player and shelves appropriately
3. WHEN the application loads on a desktop (width greater than 1024px), THE Web Application SHALL display an expanded shelf view with larger vinyl records
4. WHEN the user rotates their device, THE Web Application SHALL adjust the layout to fit the new orientation
5. WHEN touch gestures are used, THE Web Application SHALL respond to swipes for navigation and taps for interactions

### Requirement 9: Visual Design and Color Scheme

**User Story:** As a user, I want a cohesive and visually appealing interface, so that the application feels polished and immersive.

#### Acceptance Criteria 9

1. WHEN displaying the Welcome/Splash screens, THE Web Application SHALL use a purple-to-pink gradient background (dark purple #2D1B4E transitioning to lavender/pink)
2. WHEN displaying the Now Playing screen, THE Web Application SHALL use a pink/lavender gradient background with a dark header section for the "NOW PLAYING" title
3. WHEN displaying the My Shelf screen, THE Web Application SHALL use a light pink/cream background (#F5E6E8) with wooden shelf textures in brown tones
4. WHEN displaying the Create New screen, THE Web Application SHALL use a light gray/white background with clear section separation
5. WHEN rendering vinyl records, THE Web Application SHALL display them with a black outer ring, grooves texture, and colored/image center label
6. WHEN displaying buttons, THE Web Application SHALL use teal/cyan (#00BCD4) for primary actions like "Create Playlist" and "Add New Vinyl"
7. WHEN displaying the Groove logo, THE Web Application SHALL use the purple vinyl icon with the stylized "GROOVE" text

### Requirement 10: Development Best Practices

**User Story:** As a developer, I want the application to follow modern web development best practices, so that the codebase is maintainable and performant.

#### Acceptance Criteria 10

1. WHEN the application is built, THE Web Application SHALL use Next.js App Router for routing and server components where appropriate
2. WHEN styling components, THE Web Application SHALL use Tailwind CSS utility classes consistently
3. WHEN making API calls, THE Backend Service SHALL implement proper error handling and request validation
4. WHEN storing sensitive data, THE Backend Service SHALL use Supabase environment variables and Row Level Security (RLS) policies
5. WHEN the application loads, THE Web Application SHALL implement code splitting and lazy loading for optimal performance
6. WHEN deploying the Backend Service, THE Express.js server SHALL be hosted on Supabase Edge Functions or compatible hosting
