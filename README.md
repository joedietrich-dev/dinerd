# Dinerd

*You can see [***Dinerd*** in action](https://joedietrich-dev.github.io/dinerd/) or watch me [walk through the app](https://www.youtube.com/watch?v=Ov_H7td_QYk).*

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

### Back-end Code

[View the full back-end source](https://github.com/joedietrich-dev/dinerd-backend).

#### Setup

I had previously researched creating a server using Node.js, so my mind immediately went in that direction to solve my problems. I would build a very small Node.js server to:

* Pass my front-end queries on to the Yelp Fusion API
* Return the results of the query back to the front-end application
* Allow me keep my API key secret
* Provide the opportunity for future expansion (logins, database integrations, result processing and caching)

While it would have been possible to meet my requirements using vanilla Node.js, I deceided to use [Express](https://expressjs.com) to create the server and [Axios](https://axios-http.com) to retrieve the API data from Yelp Fusion in an asyncronous, promise-friendly way.

To start, I initialized a Node.js project using `npm init`, and followed the prompts in my console. Then I created a few files I knew I would need, aside from the `package.json` file created by `npm init`:
* `index.js` - The gateway for the application, and where I put all the code for the server.
* `.env` - The file where I stored my environment variables (in this case, primarily the API key). It has two lines:
  ```
  YELP_KEY=<yelp secret key>
  PORT=3000
  ```
* `.gitignore` - The file that tells git to ignore other files and folders. This is important to ensure the `.env` file doesn't get synced to a cloud repository like GitHub, potentially exposing the secrets it contains. Configured correctly, it will also prevent the node_modules folder from being synced as well. For these purposes, it should contain at least these two lines:
  ```
  node_modules/
  .env
  ```

Once those files were properly configured, I ran the command `npm i express axios dotenv`, which installed the Express, Axios, and dotenv dependencies in my Node.js project. 

#### index.js

At the top of the `index.js` file, I put the `require` statements, which make the dependences I previously installed available in the code. I also defined the port the application listens on and initialized the Express server:

```js
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const port = process.env.PORT || 80;
const app = express();
```

The next few lines set up the route we'll use to query the Yelp Fusion API:

```js
app.get('/restaurants', (req, res) => {
  if (req.query.location && req.query.price && req.query.distance) {
    axios({
      method: 'get',
      url: `https://api.yelp.com/v3/businesses/search?term=food&limit=50&location=${req.query.location}&radius=${req.query.distance}&price=${req.query.price}`,
      headers: {
        Authorization: `Bearer ${process.env.YELP_KEY}`
      }
    }).then(yelpResponse => res.send(yelpResponse.data))
      .catch(err => res.status(400).send(err.message));
  } else {
    res.status(404).send('No match for requested URL found.');
  }
})
```

`app` is the server object. `.get` is a method that takes a route and a callback. When someone tries to access the route provided using the `GET` http method, Express will call the callback method provided as the second parameter to `.get`, passing in information about the request as the first parameter, and information about the response to the request as the second parameter.

For *Dinerd*, I expect my client-side application to make a request that contains three parameters - the three fields on the initial form:
* location
* price options
* distance from location chosen

If the `req` (request) contains the query parameters `location`, `price`, and `distance`, then I use Axios to send the request through to the Yelp Fusion API. For my purposes, I passed in an object containing the http method to use with Axios (`get`), the url to send the request to (the Yelp Fusion API `search` endpoint, with my query parameters interpolated), and the required `Authorization` header. The header contains a reference to the API key stored in my `.env` file.

If Yelp Fusion responds to my request with valid data, I pass it back to the requester in the `res` object, using the response's `send` method. If there were no results for the search parameters passed in, I respond to the client with a `400` error indicating a bad request, and the error message from Yelp.

If the `req` is not well-formed - that is, if it does not contain a location, price, and distance - then I respond to the client with a `404` error, since the url is not valid and doesn't match the required pattern.

All of the above sets up the Express server, but it's no good if it doesn't start listening for requests:

```js
app.listen(port, () => console.log('Listening on port ' + port));
```

This code tells the server to listen on the port provided. And with that, the *Dinerd* back end is ready - or almost.

#### CORS

If you run the command `node index.js` now, the server will start up and start listening for connections. 

**But**: Try to issue a fetch request from the browser:
```js
fetch('http://localhost:3000/restaurants?price=1,2,3,4&location=10001&distanc=2000').then(res=>res.json())
``` 

And you'll see an error like the following:

```http
Access to fetch at 'http://localhost:3000/restaurants?price=1,2,3,4&location=10001&distance=2000' from origin 'http://localhost:5500' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

This is a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), or Cross-Origin Resource Sharing, error. For security reasons, most browsers will prevent HTTP requests made from within a script or a browser's console from being successfully completed if the requested resource is on a different origin, or domain. For example, a site at `https://example-a.com/` can make a successful request to `https://example-a.com/api`, but not necessarily to `https://example-b.com/api`.

One way around this is to specify which origins a specific resource accepts requests from. In *Dinerd*, I did this using an [Express middleware](https://expressjs.com/en/guide/using-middleware.html#using-middleware) function to set the headers on every response from my server. I placed the below in `index.js` above the `app.get` line.

```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})
```

Express middleware has access to the request and response objects. With the above code, I intercept the responses the server sends out and add a line to the header. As written, this will signal to the requester that any origin (`*`) is allowed to access the resources on my server.

With the above in place, the backend is ready to go!

### Front-end Code

(View the full front-end source)[https://github.com/joedietrich-dev/dinerd].

*Dinerd*'s front end is written in vanilla javascript, HTML, and CSS. The form you see when you land on the home view is fully in the static HTML, with event listeners added when the javascript loads.

I use `fetch` to make calls to the back-end server created above, and render the restaurant cards using a `renderRestaurant` function that I created to translate the JSON data into visible and interactive components. The map on each card is created using the [Leaflet](https://leafletjs.com) library and [Open Streetmap](https://www.openstreetmap.org/) data, combined with each restaurant's location data returned from the API.

For this version of the app, I use the browser's local storage to persist a diner's previously visited restaurants. This means their choices will only be visible when they're using the same browser on the same device, and will be removed if they clear their local caches, but it does remove the need for a back-end database.

All animations including the sidebar slidein, error state appearance and disappearance, and card transitions are executed using CSS transistions. The card slider will be the topic of a later post.

## Future Plans

In future iterations of this app, I would like to add:
* Login and restaurant selection persistence using a back-end database instead of local storage.
* More filtering options when selecting a restaurant, including the ability to select only restaurants that are open when the search is performed.
* Autofilling the location from the device's gps
* Improved styles on very wide screens
* Swipe to navigate cards

## Tools / Libraries / APIs Used

### Front-end

- [Figma](https://figma.com) - Design and wireframing tool.
- [Leaflet](https://leafletjs.com) - Library for mapping location data. Uses [Open Streetmap](https://www.openstreetmap.org/) data.
- [Stamen Toner](http://maps.stamen.com/toner) - Map tile theme.
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - The Web Storage API method for storing and retrieving data within a user's browser.
- [Pattern Monster](https://pattern.monster/) - SVG Pattern generator, as seen in the site's background.
- [Favicon Generator](https://realfavicongenerator.net/) - Multi-platform favicon generator.
- [Icon Finder](https://iconfinder.com/) - Source of MIT licensed SVG icons.
- [Normalize CSS](https://necolas.github.io/normalize.css/) - Provide a better cross-browser baseline for CSS styles.

### Back-end

- [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3/get_started) - Source of data on restaurants by location.
- [Node.js](https://nodejs.org) - JavaScript runtime that powers the back-end of Dinerd.
- [Express](https://expressjs.com) - Web application framework used to create API route to pass queries to Yelp and return results to client application.
- [Axios](https://axios-http.com) - HTTP client for Node.js (like fetch, but for Node).
- [dotenv](https://www.npmjs.com/package/dotenv) - NPM package that loads environment variables from a .env file into a location accessible by a Node.js application.