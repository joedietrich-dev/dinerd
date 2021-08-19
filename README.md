# Dinerd

Turn to Dinerd to help you answer the age-old question:
> "Where do you want to eat tonight?"

## Tools / Libraries / APIs Used

### Front End

- [Leaflet](https://leafletjs.com) - Library for mapping location data. Uses [Open Streetmap](https://www.openstreetmap.org/) data.
- [Stamen Toner](http://maps.stamen.com/toner) - Map tile theme.
- [Pattern Monster](https://pattern.monster/) - SVG Pattern generator, as seen in the site's background.
- [Favicon Generator](https://realfavicongenerator.net/) - Multi-platform favicon generator.
- [Icon Finder](https://iconfinder.com/) - Source of MIT licensed SVG icons.
- [Normalize CSS](https://necolas.github.io/normalize.css/) - Provide a better cross-browser baseline for CSS styles.

### Back End

- [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3/get_started) - Source of data on restaurants by location.
- [Node.js](https://nodejs.org) - JavaScript runtime that powers the back end of Dinerd.
- [Express](https://expressjs.com) - Web application framework used to create API route to pass queries to Yelp and return results to client application.
- [Axios](https://axios-http.com) - HTTP client for Node.js (like fetch, but for Node).