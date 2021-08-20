# Dinerd

Turn to *Dinerd* to help you answer the age-old question:
> "Where do you want to eat tonight?"

## Purpose

I developed *Dinerd* to help me break out of one of the routines I found myself falling into during the past year - always going to or ordering from the same restaurants over and over again.

Comfort food is great! But every so often it's good to branch out and try new things - and this is where *Dinerd* comes in. *Dinerd* leverages the [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3/get_started) to serve the prospective diner random restaurants near them, and lets them skip ones they've already been to!

## Basic Features

When a diner first lands on *Dinerd*, they will see a form that asks them for a location, the distance from that location they'd like results from, and a price-level preference. After they have submitted their selections, *Dinerd* presents the diner with a randomized list of up to 20 restaurants, pulling details from Yelp Fusion.

If a diner has already visited a particular restaurant, they can mark it as visited and it will no longer show up in their search results. They can see the restaurants they have already visited in a pop-out sidebar menu and remove them from the visited list.

## Development Strategy and Process

Before I built *Dinerd*, I researched restaurant-locator APIs. Yelp was the best I found by far, with a generous daily API limit and high-quality data. After doing research on the data I could expect to fetch from the Yelp Fusion API, I signed up for an API key, and then started creating simple wireframes using Figma - one for the landing form, one for the visited restaurant sidebar, and one for the restaurant card. 

Then I started to code.

I started by trying to play with the API. I quickly realized that building a purely front-end application with the Yelp Fusion API [wouldn't work](https://github.com/Yelp/yelp-fusion/issues/386) (and would also expose my API key to the world, which made me uncomfortable).

<!-- TO DO: Building backend, building front end, maps, map render issue -->

## Tools / Libraries / APIs Used

### Front End

- [Figma](https://figma.com) - Design and wireframing tool.
- [Leaflet](https://leafletjs.com) - Library for mapping location data. Uses [Open Streetmap](https://www.openstreetmap.org/) data.
- [Stamen Toner](http://maps.stamen.com/toner) - Map tile theme.
- The Web Storage API: [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Method for storing and retrieving data within a user's browser.
- [Pattern Monster](https://pattern.monster/) - SVG Pattern generator, as seen in the site's background.
- [Favicon Generator](https://realfavicongenerator.net/) - Multi-platform favicon generator.
- [Icon Finder](https://iconfinder.com/) - Source of MIT licensed SVG icons.
- [Normalize CSS](https://necolas.github.io/normalize.css/) - Provide a better cross-browser baseline for CSS styles.

### Back End

- [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3/get_started) - Source of data on restaurants by location.
- [Node.js](https://nodejs.org) - JavaScript runtime that powers the back end of Dinerd.
- [Express](https://expressjs.com) - Web application framework used to create API route to pass queries to Yelp and return results to client application.
- [Axios](https://axios-http.com) - HTTP client for Node.js (like fetch, but for Node).