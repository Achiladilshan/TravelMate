import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Paper, TextField } from "@mui/material";
import img from "../assets/person-traveling-enjoying-their-vacation.webp";
import ResponsiveAppBar from "../components/Navbar";

const apiKey = "AIzaSyCOuOGDld8dMKAsvn06Sfxk6l6GLfru4jo";

function Maps() {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlacePhotos, setSelectedPlacePhotos] = useState([]);
  const [promptValue, setPromptValue] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [placeRating, setPlaceRating] = useState(null);
  const [contactNumber, setContactNumber] = useState(null);

  useEffect(() => {
    const loadMapScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    loadMapScript();

    return () => {
      // Clean up script tag
      const script = document.querySelector(
        'script[src^="https://maps.googleapis.com/maps/api/js"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(
      document.getElementById("map"),
      {
        zoom: 14,
        mapTypeId: "roadmap",
      }
    );
    setMap(mapInstance);

    // Try HTML5 geolocation to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          mapInstance.setCenter(pos);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }

    // Initialize autocomplete
    const input = document.getElementById("searchTextField");
    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      input
    );
    autocompleteInstance.bindTo("bounds", mapInstance);
    setAutocomplete(autocompleteInstance);

    // Add event listener for place selection
    autocompleteInstance.addListener("place_changed", () => {
      const place = autocompleteInstance.getPlace();
      if (!place.geometry || !place.geometry.location) {
        console.error("No location found for place:", place);
        return;
      }

      // Clear existing markers
      clearMarkers();

      // Add marker for selected place
      const marker = new window.google.maps.Marker({
        map: mapInstance,
        position: place.geometry.location,
        title: place.name,
      });
      setMarkers([...markers, marker]);

      // Pan the map to the selected location
      mapInstance.panTo(place.geometry.location);
    });
  };

  const clearMarkers = () => {
    // Clears all markers from the map
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    setMarkers([]);
  };

  const searchRestaurants = (newResponse) => {
    // Clear existing markers
    clearMarkers();
    // Clear selected place details
    clearSelectedPlaceDetails();

    if (map && userLocation) {
      const placesService = new window.google.maps.places.PlacesService(map);
      placesService.nearbySearch(
        {
          location: userLocation,
          radius: 6000, // 500 meters radius
          type: `${newResponse}`,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // Add new markers
            for (let i = 0; i < Math.min(results.length, 10); i++) {
              createMarker(results[i]);
            }
          } else {
            console.error("Places service request failed:", status);
          }
        }
      );
    }
  };

  const searchDetails = () => {
    setSearch(promptValue);
    aiRun();
    // Clear image section
    setSelectedPlacePhotos([]);
    // Clear selected place details
    clearSelectedPlaceDetails();
  };

  const clearSelectedPlaceDetails = () => {
    setPlaceName("");
    setPlaceRating(null);
    setContactNumber(null);
  };

  const showclg = (v) => {
    console.log(v[0].key);
    setNewResponse(v[0].key);
  };

  const [search, setSearch] = useState("");
  const [aiResponse, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAz6lyQmy_GCN9SBgQIyMP7fqXZiC47gT8"
  ); // Replace 'YOUR_GENERATIVE_AI_API_KEY' with your actual API key

  async function aiRun() {
    setLoading(true);
    setResponse("");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `User
    accounting
    airport
    amusement_park
    aquarium
    art_gallery
    atm
    bakery
    bank
    bar
    beauty_salon
    bicycle_store
    book_store
    bowling_alley
    bus_station
    cafe
    campground
    car_dealer
    car_rental
    car_repair
    car_wash
    casino
    cemetery
    church
    city_hall
    clothing_store
    convenience_store
    courthouse
    dentist
    department_store
    doctor
    drugstore
    electrician
    electronics_store
    embassy
    fire_station
    florist
    funeral_home
    furniture_store
    gas_station
    gym
    hair_care
    hardware_store
    hindu_temple
    home_goods_store
    hospital
    insurance_agency
    jewelry_store
    laundry
    lawyer
    library
    light_rail_station
    liquor_store
    local_government_office
    locksmith
    lodging
    meal_delivery
    meal_takeaway
    mosque
    movie_rental
    movie_theater
    moving_company
    museum
    night_club
    painter
    park
    parking
    pet_store
    pharmacy
    physiotherapist
    plumber
    police
    post_office
    primary_school
    real_estate_agency
    restaurant
    roofing_contractor
    rv_park
    school
    secondary_school
    shoe_store
    shopping_mall
    spa
    stadium
    storage
    store
    subway_station
    supermarket
    synagogue
    taxi_stand
    tourist_attraction
    train_station
    transit_station
    travel_agency
    university
    veterinary_care
    zoo
    
    these are the keywords .now im entering some prompt.Read the prompt carefully and give me the most suitable keyword as the output.Only one keyword

    prompt:${promptValue} 
    
   `;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text().replace(/\*/g, ""); // Remove asterisks

    // Split the response into individual place entries
    const places = text.split("- ").filter((place) => place.trim() !== "");

    // line break
    const formattedResponse = places.map((place) => (
      <React.Fragment key={place}>
        {place.trim()}
        <br />
      </React.Fragment>
    ));
    setResponse(formattedResponse);

    showclg(formattedResponse);
    setLoading(false);
  }

  const createMarker = (place) => {
    const marker = new window.google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
    });
    marker.addListener("click", () => {
      getPlaceDetails(place.place_id);
    });
    setMarkers([...markers, marker]);
  };

  const getPlaceDetails = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(map);
    placesService.getDetails({ placeId: placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Display up to 5 photos of the place, if available
        if (place.photos && place.photos.length > 0) {
          setSelectedPlacePhotos(
            place.photos.slice(0, 3).map((photo) => photo.getUrl())
          );
        } else {
          setSelectedPlacePhotos([]);
        }

        // Display rating
        const rating = place.rating ? place.rating : "N/A";
        setPlaceRating(rating);

        // Display contact number
        const contactNumber = place.formatted_phone_number
          ? place.formatted_phone_number
          : "N/A";
        setContactNumber(contactNumber);

        // Display place name
        setPlaceName(place.name);
      } else {
        console.error("Place details request failed:", status);
      }
    });
  };

  return (
    <div
      className="flex w-full h-screen"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-col w-full">
        <div className="p-6">
          <ResponsiveAppBar />
        </div>
        <div className="flex">
          <div className="m-4 flex flex-col gap-2" style={{ width: "80%" }}>
            <div className="flex gap-3">
              <TextField
                className="w-[84%]"
                id="outlined-basic"
                // label="Outlined"
                variant="outlined"
                onChange={(e) => setPromptValue(e.target.value)}
              />

              <button
                className="rounded-lg w-[145px] bg-[#24674d] text-white"
                onClick={() => {
                  searchDetails();
                  searchRestaurants(newResponse);
                  console.log(newResponse);
                }}
              >
                Search
              </button>
            </div>
            <div className=" flex flex-col gap-1 text-lg text-white">
              <div>Catagory: {aiResponse}</div>
              <div>Place Name: {placeName}</div>
              <div>Rating: {placeRating}</div>
              <div>Contact Number: {contactNumber}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Paper
                elevation={4}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  height: "440px",
                  alignItems: "end",
                  borderRadius: "10px",
                  bgcolor: "#ffffff5f",
                }}
              >
                {/* <h1
                  className="text-5xl items-center"
                  style={{
                    position: "absolute",
                    top: "8%",
                    left: "36%",
                    color: "#a1b2c3",
                  }}
                >
                  Images
                </h1> */}
                {selectedPlacePhotos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    {selectedPlacePhotos.slice(0, 4).map((photoUrl, index) => (
                      <Paper
                        key={index}
                        elevation={4}
                        sx={{
                          m: 1,
                          height: "360px",
                          borderRadius: 2,
                          p: 1,
                          width: "220px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center", // Center items vertically
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Photo ${index + 1}`}
                          style={{
                            borderRadius: "10px",
                            width: "205px", // Set width to one-third of container width
                            marginRight: "",
                          }}
                        />
                      </Paper>
                    ))}
                  </div>
                )}
              </Paper>
            </div>
        </div>
      

      <div className="mr-4 my-4 rounded-lg"
        id="map"
        style={{ width: "500px", marginBottom: "20px" }}
      ></div>
      </div>
      </div>
    </div>
  );
}

export default Maps;
