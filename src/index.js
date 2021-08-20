class SavedRestaurants {
  constructor() {
    this.restaurants = JSON.parse(localStorage.getItem('saved-restaurants')) || [];
  }

  getRestaurants() {
    return this.restaurants;
  }
  getRestaurantIds() {
    return this.restaurants.map(r => r.id);
  }
  saveRestaurant(restaurant) {
    this.restaurants = [...this.restaurants, restaurant];
    localStorage.setItem('saved-restaurants', JSON.stringify(this.restaurants));
    return this.restaurants;
  }
  removeRestaurantById(id) {
    this.restaurants = [...this.restaurants.filter(r => r.id !== id)];
    localStorage.setItem('saved-restaurants', JSON.stringify(this.restaurants));
    return this.restaurants;
  }
}

app();

async function app() {
  const visitedRestaurants = new SavedRestaurants();
  const shiftPosition = positionTracker();

  // Wake server
  fetch('https://dinerd-backend.herokuapp.com/')
    .then((res) => res.ok || new Error('Search Results Unavailable.'))
    .catch((err) => console.log(err));

  // Form Setup
  const searchFormContainer = document.querySelector('.search-form-container');
  const searchForm = document.querySelector('#search-form');
  const rangeControl = document.querySelector("#distance");
  const rangeOutput = document.querySelector('#distance-display');
  const restaurantHolder = document.querySelector('#restaurant-holder');

  // Set up Range Control
  rangeControl.addEventListener('input', (e) => {
    const padRight = (value, length) => {
      const rightLength = value.toString().split('.')[1]?.length || 0
      return rightLength === 0 ? `${value}.${'0'.repeat(length)}` : rightLength < length ? `${value}${'0'.repeat(length - rightLength)}` : `${value}`;
    }
    const mileValue = (miles) => miles <= 1 ? `${padRight(miles, 2)} mile` : `${padRight(miles, 2)} miles`;
    rangeOutput.value = mileValue(e.target.value);
  });

  // Set up Search Form Behavior
  searchForm.addEventListener('submit', handleFormSubmit)

  // Footer setup
  const searchFooter = createFooter();
  searchFormContainer.append(searchFooter);

  // Visited List Setup
  const visitedList = document.querySelector('#visited-restaurant-holder');
  const openSidebarButton = document.querySelector('.open-sidebar-control');
  const closeSidebarButton = document.querySelector('#close-visited-restaurant');
  openSidebarButton.addEventListener('click', () => visitedList.classList.remove('closed'));
  closeSidebarButton.addEventListener('click', () => visitedList.classList.add('closed'));
  renderVisitedList();







  async function handleFormSubmit(e) {
    e.preventDefault();

    const submitButton = document.querySelector('#search-form input[type=submit]');
    submitButton.value = 'Searching...';
    submitButton.setAttribute('disabled', 'true');

    const { location, distance } = e.target;
    const allPrices = "1,2,3,4";
    const prices = Array.from(document.querySelectorAll('#search-form #pricing input[type=checkbox]:checked'))
      .map(check => check.value)
      .join(',') || allPrices;
    const restaurantsData = await getRestaurants(location.value, convertToMeters(distance.value), prices);
    const unvisitedRestaurants = scrambleArray(restaurantsData.filter(restaurant => !visitedRestaurants.getRestaurantIds().includes(restaurant.id)), 20);

    submitButton.value = 'Go!';
    submitButton.removeAttribute('disabled');

    if (unvisitedRestaurants.length === 0) {
      showResultError();
    } else {
      searchFormContainer.classList.add('hidden');
      searchForm.reset();

      restaurantHolder.innerHTML = '';
      restaurantHolder.append(...unvisitedRestaurants.map(r => renderRestaurant(r)));

      // Clean up Next / Previous buttons
      const firstPrev = document.querySelector('#restaurant-holder > .card:first-child .previous-button');
      const lastNext = document.querySelector('#restaurant-holder > .card:last-child .next-button');

      firstPrev.style.visibility = 'hidden';
      firstPrev.setAttribute('disabled', 'true');
      lastNext.style.visibility = 'hidden';
      lastNext.setAttribute('disabled', 'true');
    }
  }

  async function getRestaurants(location, distance, prices) {
    const url = `https://dinerd-backend.herokuapp.com/restaurants?location=${location}&price=${prices}&distance=${distance}`;

    const results = await fetch(url, { method: 'GET' })
      .then(res => {
        if (res.status === 400) throw new Error('Results not found!')
        return res.json()
      })
      .catch(err => {
        console.log(err);
        showResultError();
      });
    return results?.businesses || [];
  }

  function showResultError() {
    const errorMessage = document.querySelector('#submit-error');
    errorMessage.classList.remove('hidden');
    setTimeout(() => errorMessage.classList.add('error'), 50);
    setTimeout(() => {
      errorMessage.classList.remove('error');
      setTimeout(() => errorMessage.classList.add('hidden'), 500);
    }, 5000);
  }

  function renderVisitedList() {
    const visitedList = document.querySelector('#user-selection-list');
    visitedList.innerHTML = '';
    const visitedItems = visitedRestaurants.getRestaurants().map(restaurant => {
      const visitedItem = document.createElement('li');
      visitedItem.classList.add('visited-list-item')

      const visitedItemName = document.createElement('p');
      visitedItemName.innerText = restaurant.name;

      const removeVisitedItemButton = document.createElement('button');
      removeVisitedItemButton.innerText = 'X';
      removeVisitedItemButton.addEventListener('click', e => {
        visitedRestaurants.removeRestaurantById(restaurant.id);
        visitedItem.remove();
      });
      visitedItem.append(visitedItemName, removeVisitedItemButton);
      return visitedItem;
    })
    visitedList.append(...visitedItems);
  }

  function renderRestaurant(restaurantData) {
    const restaurantCard = document.createElement('div');
    restaurantCard.classList.add('card', 'restaurant-card', 'offscreen');

    // Restaurnt Name
    const restaurantName = document.createElement('h2');
    restaurantName.classList.add('restaurant-name');
    restaurantName.innerText = restaurantData.name;

    // Ratings And Reviews
    const ratingAndReviewCountLink = document.createElement('a');
    ratingAndReviewCountLink.href = restaurantData.url || 'https://yelp.com';
    ratingAndReviewCountLink.classList.add('rating-review');
    const rating = getRatingImage(restaurantData.rating);
    const reviewCount = document.createElement('p');
    reviewCount.innerText = `${restaurantData.review_count} Reviews`;
    ratingAndReviewCountLink.append(rating, reviewCount);

    // Price
    const price = document.createElement('p');
    price.innerText = 'Price: ' + (restaurantData.price || 'Not Provided');
    price.classList.add('price');

    // Restaurant Types
    const cuisineTypes = document.createElement('p');
    cuisineTypes.innerText = restaurantData.categories.map(category => category.title).join(' | ')
    cuisineTypes.classList.add('cuisine-type');

    // Ratings, Price, Types
    const restaurantDetails = document.createElement('div');
    restaurantDetails.classList.add('restaurant-details');
    restaurantDetails.append(ratingAndReviewCountLink, price, cuisineTypes);


    // Phone
    const phoneNumber = document.createElement('p');
    phoneNumber.innerText = restaurantData.display_phone || restaurantData.phone
    phoneNumber.classList.add('phone')

    // Address
    const address = document.createElement('p');
    address.innerHTML = restaurantData?.location?.display_address.join('<br />') || '';
    address.classList.add('address');

    // Restaurant Image
    const mainImage = document.createElement('div');
    mainImage.style.backgroundImage = `url(${restaurantData.image_url})`;
    mainImage.classList.add('restaurant-image');

    // Map
    const locationMap = document.createElement('div');
    locationMap.classList.add('map-location');
    locationMap.style.height = '100%';
    locationMap.style.width = '100%';
    const map = L.map(locationMap).setView([restaurantData.coordinates.latitude, restaurantData.coordinates.longitude], 16);
    const marker = L.marker([restaurantData.coordinates.latitude, restaurantData.coordinates.longitude]).addTo(map);
    const Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    });
    map.addLayer(Stamen_Toner);

    // Buttons
    const visitedButton = document.createElement('button');
    visitedButton.classList.add('button', 'been-there-button');
    visitedButton.id = 'visited-button-' + restaurantData.id;
    visitedButton.innerText = 'Mark as Visited';
    visitedButton.addEventListener('click', () => {
      if (!visitedRestaurants.getRestaurantIds().includes(restaurantData.id)) {
        visitedRestaurants.saveRestaurant({ id: restaurantData.id, name: restaurantData.name });
      }
      restaurantCard.classList.add('visited');
      visitedButton.disabled = true;
      visitedButton.innerText = 'Visited';
      renderVisitedList();
    })

    const prevButton = document.createElement('button');
    prevButton.classList.add('button', 'previous-button');
    prevButton.innerText = '<';
    prevButton.addEventListener('click', () => {
      restaurantHolder.style.transform = `translate(-${shiftPosition(-100)}vw, 0)`;
    })

    const resetButton = document.createElement('button');
    resetButton.classList.add('button', 'reset-button', 'secondary');
    resetButton.innerText = "New Search";
    resetButton.addEventListener('click', () => {
      restaurantHolder.innerHTML = '';
      restaurantHolder.style.transform = `translate(-${shiftPosition(0, true)}vw, 0)`;
      searchFormContainer.classList.remove('hidden');
    })

    const nextButton = document.createElement('button');
    nextButton.classList.add('button', 'next-button');
    nextButton.innerText = '>';
    nextButton.addEventListener('click', () => {
      restaurantHolder.style.transform = `translate(-${shiftPosition(100)}vw, 0)`;
    })

    // Phone, Address, Visited
    const restaurantContactDetails = document.createElement('div');
    restaurantContactDetails.classList.add('restaurant-contact');
    restaurantContactDetails.append(phoneNumber, address, visitedButton);

    // Nav Buttons
    const navButtons = document.createElement('div');
    navButtons.classList.add('restaurant-nav');
    navButtons.append(prevButton, resetButton, nextButton);

    // Footer
    const footer = createFooter(restaurantData.url);

    restaurantCard.append(
      restaurantName,
      restaurantDetails,
      restaurantContactDetails,
      mainImage,
      locationMap,
      navButtons,
      footer);

    setTimeout(() => map.invalidateSize(), 500);

    return restaurantCard;
  }

  function getRatingImage(rating) {
    const basePath = './src/img/yelp_stars/';
    const wholeRating = Math.floor(rating);
    const hasPartStar = rating % 1 === 0 ? false : true;
    const ratingImage = document.createElement('img');
    const fileName = `${basePath}regular_${wholeRating}${hasPartStar ? '_half' : ''}`;
    ratingImage.src = `${fileName}.png`;
    ratingImage.srcset = `${fileName}@2x.png 2x, ${fileName}@3x.png 3x`;
    ratingImage.alt = `Rating: ${rating}`;
    return ratingImage;
  }

  function createFooter(attributionURL = 'https://yelp.com') {
    const footer = document.createElement('footer');
    const attribution = document.createElement('div');
    attribution.classList.add('attribution-group');

    const yelpLink = document.createElement('a');
    yelpLink.href = attributionURL;

    const yelpLogo = document.createElement('img');
    yelpLogo.src = './src/img/yelp_logos/yelp_logo.svg';
    yelpLogo.alt = 'Yelp Logo';
    yelpLogo.classList.add('footer-logo-image');
    yelpLogo.width = '50';
    const yelpText = document.createElement('p');
    yelpText.innerText = 'Data provided by\xa0'

    yelpLink.append(yelpText, yelpLogo);
    attribution.append(yelpLink);

    const copyright = document.createElement('p');
    copyright.classList.add('footer-copyright');
    copyright.innerText = `©${new Date().getFullYear()} J. Dietrich`;

    footer.append(copyright, attribution);

    return footer
  }

  function positionTracker() {
    let currentPosition = 0;
    return function changePosition(shift, reset = false) {
      if (reset) currentPosition = 0;
      return currentPosition += shift;
    }
  }

  function convertToMeters(miles) {
    return Math.floor(miles * 1609.34);
  }

  function scrambleArray(arr, desiredLength = Infinity) {
    // const desiredElements = (arr.length < desiredLength) ? arr.length : desiredLength;
    const orderedArray = [...arr];
    const scrambledArray = [];
    while (orderedArray.length > 0 && scrambledArray.length < desiredLength) {
      const index = Math.floor(orderedArray.length * Math.random());
      scrambledArray.push(...orderedArray.splice(index, 1));
    }
    return scrambledArray;
  }
}
