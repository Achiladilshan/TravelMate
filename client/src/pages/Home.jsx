import React, { useState } from "react";
import ResponsiveAppBar from "../components/Navbar";
import img from "../assets/person-traveling-enjoying-their-vacation.webp";
import TextField from "@mui/material/TextField";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CountrySelect from "../components/CountrySearch";
import MoodIcon from "@mui/icons-material/Mood";
import Button from "@mui/material/Button";
import RecommendIcon from '@mui/icons-material/Recommend';
import { Card, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from 'axios';
import { APILoader, PlaceOverview, PlaceDirectionsButton } from '@googlemaps/extended-component-library/react';
import { TailSpin } from 'react-loader-spinner';
import Swal from 'sweetalert2';

function Home() {
  const [tags, setTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [country, setCountry] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  const addTag = (e) => {
    if (e.key === "Enter") {
      if (e.target.value.length > 0) {
        setTags([...tags, e.target.value]);
        e.target.value = "";
      }
    }
  };

  const removeTag = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() && !tags.length && country) {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'Please describe your preference.',
      });
      return;
    }
  
    if (!userInput.trim() && !country && !tags.length) {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'Please provide at least one input.',
      });
      return;
    }
    try {
      setLoading(true);

      const tagsString = tags;
      console.log(tagsString);

      const response = await fetch('http://localhost:3002/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          country: country,
          tags: tagsString
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleCardClick = async (destination) => {
    setSelectedDestination(destination);
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          q: destination.name,
          part: 'snippet',
          maxResults: 3,
          type: 'video',
          key: 'AIzaSyDo-T1IMhr8Zsnh1IMQfK1fSSEtqIYf7Fc'
        }
      });
      setVideos(response.data.items);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="bg-fixed bg-cover bg-center overflow-x-hidden" style={{ backgroundImage: `url(${img})` }}>
      <div className="w-screen h-screen flex flex-col justify-between p-10">
        <div>
          <ResponsiveAppBar />
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <div>
            <h1 className="text-white text-6xl">Dreaming of New Horizons? </h1>
            <h4 className="text-white text-xl pl-[2px] pt-4">
              Checkout Our New AI Travel Recommendation System!
            </h4>
          </div>
        </div>

        <div className="h-[9rem] rounded-3xl bg-white py-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <div className="flex">
            <div className="flex w-1/4 border-r-2 border-black border-opacity-30 gap-5 justify-center items-center">
              <div>
                <LocationOnIcon />
              </div>

              <div>
                <CountrySelect onChange={(selectedCountry) => setCountry(selectedCountry)} />
              </div>
            </div>

            <div className="flex w-1/4 border-r-2 border-black border-opacity-30 px-5 overflow-y-auto gap-5 items-center">
              <div>
                <MoodIcon />
              </div>
              <TextField
                className="w-full border"
                id="standard-textarea"
                label="Describe your preference"
                placeholder="eg: I want to travel to historical places and do some hiking and surfing"
                multiline
                rows='2'
                variant="standard"
                onChange={handleChange}
              />
            </div>

            <div className="flex w-1/4 border-r-2 border-black border-opacity-30 px-12  gap-3 items-center ">
              <div>
                <FavoriteIcon />
              </div>

              <div className="w-full overflow-y-auto">
                <div className="w-full max-w-75 flex flex-wrap min-h-30 border-b border-gray-400 py-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center p-1 border border-gray-300 rounded-md mr-2 mb-2"
                    >
                      {tag}{" "}
                      <span
                        className="ml-2 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        x
                      </span>
                    </div>
                  ))}
                  <input
                    onKeyDown={addTag}
                    className="border-none flex-1 outline-none text-black"
                    placeholder="What are your interests?"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center w-1/4">
              <Button variant="contained" endIcon={<RecommendIcon />} onClick={handleSubmit}>
                Get Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Render recommendations */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 mb-[70px] bg-[#ffffff5a] px-10 py-6">
      {recommendations.map((destination, index) => (
        <Card
        key={index}
        onClick={() => handleCardClick(destination)}
        className="cursor-pointer w-64 h-40 items-center justify-center"
        style={{
          backgroundImage: `url('https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${destination.photoReference}&key=AIzaSyDo-T1IMhr8Zsnh1IMQfK1fSSEtqIYf7Fc')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '10px',
        }}
      >
        <div className="w-64 h-40 bg-[#0000001a] flex items-center justify-center">
          <div className="bg-[#00000097] p-2 rounded-xl">
            <h2 className="text-white font-bold text-xl text-center" >{destination.name}</h2>
          </div>
          
        </div>
        

      </Card>
      ))}
      </div>

      {/* Dialog for selected destination */}
      <Dialog open={selectedDestination !== null} onClose={handleCloseDialog}>
        <DialogTitle>{selectedDestination && selectedDestination.name}</DialogTitle>
        <DialogContent>
          <div className="container">
            <APILoader apiKey="AIzaSyDo-T1IMhr8Zsnh1IMQfK1fSSEtqIYf7Fc" solutionChannel="GMP_GCC_placeoverview_v1_xl" />
            <PlaceOverview place={selectedDestination?.placeId} google-logo-already-displayed>
              <PlaceDirectionsButton slot="action">
                Directions
              </PlaceDirectionsButton>
            </PlaceOverview>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="mt-10 mb-5 font-bold text-2xl">Recommended Videos</div>
            {videos.map((video) => (
              <iframe
                key={video.id.videoId}
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading animation */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <TailSpin color="#FFFFFF" height={80} width={80} />
        </div>
      )}
    </div>
  );
}

export default Home;
