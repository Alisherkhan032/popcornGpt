import React, { useRef, useState } from "react";
import languages from "../utils/languageConstants";
import { useSelector, useDispatch } from "react-redux";
import { genAI, geminiApiKey } from "../utils/geminiAi";
import { API_OPTIONS } from "../utils/constants";
import { addGptMovieResult, clearGptMovieResult } from "../utils/gptSlice";
import Spinner from "./Spinner";

const GptSearchBar = () => {
  const langIdentifier = useSelector((store) => store.config.language);
  const langObj = languages[langIdentifier];
  const searchText = useRef(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //* search movie in tmdb d/b
  const searchMovieTMDB = async (movie) => {
    const data = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=en-US&page=1 `,
      API_OPTIONS
    );

    const jsonData = await data.json();

    return jsonData.results;
  };

  const handleGptSearchClick = async () => {
    if (loading) return;

    setError("");

    if (!geminiApiKey || !genAI) {
      setError(
        "Missing Gemini API key. Set REACT_APP_GEMINI_API_KEY in your .env file and restart the dev server."
      );
      return;
    }

    const query = searchText.current?.value?.trim();
    if (!query) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt =
        "Act as a movie recommendation system. Based on the query '" +
        query +
        "', recommend exactly 10 movie titles. Please provide the results as a comma-separated list, ensuring that no years or additional text are included. Example: 'Golmaal Returns, Sholay, Don, Hum Aapke Hain Kaun, De Dana Dan'.";

      const result = await model.generateContent(prompt);

      const gptMovies = result?.response?.text().split(",");

      if (!gptMovies || gptMovies.length === 0) {
        setError("No recommendations returned. Try a different query.");
        return;
      }

      // Clean up whitespace
      const cleanedMovies = gptMovies
        .map((movie) => movie.trim())
        .filter((movie) => movie.length > 0);

      if (cleanedMovies.length === 0) {
        setError("No recommendations returned. Try a different query.");
        return;
      }

      //* ['Tumbbad', ' Pari', ' Stree', ' Bhoot: Part One - The Haunted Ship', 'Raaz']

      // For each movie, look for it in TMDB Api

      const promiseArray = cleanedMovies.map((movie) => searchMovieTMDB(movie));
      // [promise , promise , promise , promise , promise]

      const tmdbResults = await Promise.all(promiseArray);

      dispatch(
        addGptMovieResult({
          movieNames: cleanedMovies,
          movieResults: tmdbResults,
        })
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to fetch recommendations. Verify your Gemini API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearClick = () => {
    dispatch(clearGptMovieResult());
    setError("");
    if (searchText.current) {
      searchText.current.value = "";
    }
  };

  return (
    <>
      <div className="pt-[10%] flex justify-center ">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-[95%] bg-black bg-opacity-70 rounded flex flex-wrap gap-2 justify-center items-center px-4 py-2 md:w-1/2 "
      >
        <input
          type="text"
          ref={searchText}
          className="p-4 m-2 flex-1 rounded-lg text-lg min-w-[220px]"
          placeholder={langObj.gptSearchPlaceholder}
          disabled={loading}
        />
        <div className="flex items-center gap-2 m-2">
          <button
            onClick={handleGptSearchClick}
            className={`py-2 px-4 text-white rounded-md ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={loading}
          >
            {loading ? "Searching..." : langObj.search}
          </button>
          <button
            type="button"
            onClick={handleClearClick}
            className={`py-2 px-4 rounded-md ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
    {loading && <div className="flex justify-center pt-5">
      <Spinner />
    </div>}
    {error && (
      <div className="pt-4 flex justify-center">
        <p className="text-red-400 text-sm bg-black bg-opacity-70 px-4 py-2 rounded">
          {error}
        </p>
      </div>
    )}
    </>
  );
};

export default GptSearchBar;
