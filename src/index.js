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
}

app();

function app() {
  const visitedRestaurants = new SavedRestaurants();

  const rangeControl = document.querySelector("#distance");
  const rangeOutput = document.querySelector('#distance-display')
  rangeControl.addEventListener('input', (e) => {
    const padRight = (value, length) => {
      const rightLength = value.toString().split('.')[1]?.length || 0
      return rightLength === 0 ? `${value}.${'0'.repeat(length)}` : rightLength < length ? `${value}${'0'.repeat(length - rightLength)}` : `${value}`;
    }
    const mileValue = (miles) => miles <= 1 ? `${padRight(miles, 2)} mile` : `${padRight(miles, 2)} miles`;
    rangeOutput.value = mileValue(e.target.value);
  })

  const searchForm = document.querySelector('#search-form');
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const { location, distance } = e.target;
    const prices = Array.from(document.querySelectorAll('#search-form #pricing input[type=checkbox]:checked'))
      .map(check => check.value)
      .join(',');
    getRestaurants(location.value, convertToMeters(distance.value), prices)
  })

  async function getRestaurants(location, distance, prices) {
    const isTest = true;
    const url = isTest ? 'http://localhost:3000/api/test' : `http://localhost:3000/restaurants?location=${location}&price=${prices}&distance=${distance}`;
    const results = await fetch(url, { method: 'GET' })
      .then(res => res.json());
    const restaurantsData = results.businesses;
    const unvisitedRestaurants = restaurantsData.filter(restaurant => !visitedRestaurants.getRestaurantIds().includes(restaurant.id));
    console.log(restaurantsData);
    console.log(unvisitedRestaurants);

    const restaurantHolder = document.querySelector('#restaurant-holder');
    restaurantHolder.append(...unvisitedRestaurants.map(r => renderRestaurant(r)));
  }

  function renderRestaurant(restaurantData) {
    const restaurantCard = document.createElement('div');
    restaurantCard.classList.add('restaurant-card', 'hidden');

    // Restaurnt Name
    const restaurantName = document.createElement('h2');
    restaurantName.classList.add('restaurant-name');
    restaurantName.innerText = restaurantData.name;

    // Ratings And Reviews
    const ratingAndReviewCountLink = document.createElement('a');
    ratingAndReviewCountLink.href = restaurantData.url;
    ratingAndReviewCountLink.classList.add('rating-review')
    const rating = getRatingImage(restaurantData.rating);
    const reviewCount = document.createElement('p');
    reviewCount.innerText = `${restaurantData.review_count} Reviews`
    ratingAndReviewCountLink.append(rating, reviewCount);

    // Price
    const price = document.createElement('p');
    price.innerText = 'Price: ' + restaurantData.price;
    price.classList.add('price');

    // Restaurant Types
    const cuisineTypes = document.createElement('p');
    cuisineTypes.innerText = restaurantData.categories.map(category => category.title).join(' | ')
    cuisineTypes.classList.add('cuisine-type');

    const priceAndRestaurantTypes = document.createElement('div');


    // Phone
    const phoneNumber = document.createElement('p');
    phoneNumber.innerText = restaurantData.display_phone || restaurantData.phone
    phoneNumber.classList.add('phone')

    // Address
    const address = document.createElement('p');
    address.innerHTML = restaurantData?.location?.display_address.join('<br />') || '';
    address.classList.add('address');

    // Restaurant Image
    const mainImage = document.createElement('img');
    mainImage.src = restaurantData.image_url;
    mainImage.classList.add('restaurant-image');

    // Map
    const locationMap = document.createElement('div');
    locationMap.classList.add('map-location')
    locationMap.style.height = '300px'
    locationMap.style.width = '300px'
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
    })

    const prevButton = document.createElement('button');
    prevButton.classList.add('button', 'previous-button');
    prevButton.innerText = '<';

    const nextButton = document.createElement('button');
    nextButton.classList.add('button', 'next-button');
    nextButton.innerText = '>';

    restaurantCard.append(
      restaurantName,
      ratingAndReviewCountLink,
      price,
      cuisineTypes,
      phoneNumber,
      address,
      visitedButton,
      mainImage,
      locationMap,
      prevButton,
      nextButton);

    setTimeout(() => map.invalidateSize(), 1000);

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

  function convertToMeters(miles) {
    return Math.floor(miles * 1609.34);
  }

  function addSavedRestaurant(restaurant) {

  }
}