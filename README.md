Project Goal: Your task is to create a functional and visually accurate clone of the "Popular Movies" page from The Movie Database (TMDB) website. This assignment is designed to test your ability to work with a real-world API and build a responsive user interface.


Project Requirements

1. UI Duplication:
Recreate the core layout and styling of the https://www.themoviedb.org/movie page.
Focus on the main content area: The "Popular Movies" section, the sorting options, and the movie cards.
The header and footer are placeholders for now. You do not need to implement any complex navigation, login or search functionality in the header.
2. API Integration:
All movie data must be fetched from the official TMDB API.
Use the "Get Popular" endpoint: https://developer.themoviedb.org/reference/movie-popular-list.
3. Functionality:
Initial Load: The page should load with the first page of popular movies displayed.
Sorting: Implement the sorting functionality exactly as it appears on the original TMDB page (e.g., "Popularity Descending," "Release Date Descending"). This requires you to correctly pass the sort_by parameter to the API.
Filtering: The filters should work as on the page excluding “Where to Watch”, "Certifications" and "Show Me" sections
Load More: Implement a "Load More" button at the bottom of the movie list. When clicked, it must fetch 20 movies on every click.

Grading Rubric - Your project will be evaluated based on the following criteria:

1. Presentation and Visual Appearance - 50% 
UI Fidelity: 15%
The design and layout of the movie cards, sorting controls, and overall page structure closely match the original TMDB page.
Responsive Design: 15% The layout adapts correctly to different screen sizes (desktop, tablet, mobile) without horizontal scrolling or broken elements.
User Experience (UX): 10% The sorting and "Load More" functionality is intuitive and working as expected.
Consistency: 10% Consistent use of fonts, colors, spacing, and icons. Movie posters and rating circles are displayed correctly.

2. Clear and Structured Code - 50% 
Code Structure & Organization: 15% The codebase is well-organized with separated folders handling all the logic.
Clarity & Readability: 20% Variable and function names are descriptive and follow conventions. Code is formatted consistently, and comments explain complex logic.
API Integration Logic: 15% API calls are handled correctly (e.g., using async/await or Promises). Error states are handled gracefully (e.g., what happens if the API call fails).
Submission & Late Policy
Late Policy: Any submissions made after the deadline will result in a 50% reduction in your final grade. Please communicate any extenuating circumstances well in advance of the deadline.
🚨 Important
Use CSS variables
Use BEM approach for CSS, JS and HTML