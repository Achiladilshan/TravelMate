import React, { useState } from 'react';

const Recommend = () => {
  const [userInput, setUserInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [country, setCountry] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          country: country
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRecommendations(data.destinations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination);
  };

  const handleCloseDialog = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="recommend">
      <h1>Travel Destination Recommender</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="interests">Enter your interests:</label>
        <textarea
          id="interests"
          rows={4} // Set the number of rows to 4
          value={userInput}
          onChange={handleChange}
        />
        <label htmlFor="country">Enter country:</label>
        <input
          type="text"
          id="country"
          value={country}
          onChange={handleCountryChange}
        />
        <button type="submit">Get Recommendations</button>
      </form>
      <div>
        <h2>Recommended Destinations:</h2>
        <div className="destination-cards">
          {recommendations.map((destination, index) => (
            <div
              key={index}
              className="destination-card"
              onClick={() => handleDestinationClick(destination)}
            >
              <img src={destination.photos[0].photo_reference} alt={destination.name} />
              <p>{destination.name}, {destination.formatted_address}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedDestination && (
        <div className="destination-dialog">
          <div className="dialog-content">
            <button className="close-btn" onClick={handleCloseDialog}>Close</button>
            <h2>{selectedDestination.name}</h2>
            <p>
              Opening Hours:
              {selectedDestination.opening_hours.map((hours, index) => (
                <span key={index}>{hours}<br /></span>
              ))}
            </p>
            <p>
              Reviews:
              {selectedDestination.reviews.map((review, index) => (
                <span key={index}>{review}<br /></span>
              ))}
            </p>
            {/* Add logic to display additional images */}
            {/* <div className="additional-images">
              {selectedDestination.photos.map((photo, index) => (
                <img key={index} src={photo.photo_reference} alt={`Additional Image ${index + 1}`} />
              ))}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommend;
