import { createSlice } from "@reduxjs/toolkit";

export const gptSlice = createSlice({
    name : 'gpt',
    initialState : {
        showGptSearch : false,
        movieNames : null,
        movieResults : null
    },
    reducers : {
        toggleGptSearchView : (state)=>{
            state.showGptSearch = !state.showGptSearch;
        },
        addGptMovieResult : (state, action)=>{
            const {movieNames, movieResults} = action.payload;
            state.movieNames = movieNames;
            state.movieResults = movieResults;
        },
        resetGptSlice : (state)=>{
            state.showGptSearch = false;
            state.movieNames = null;
            state.movieResults = null;
        }
    }
})

export const {toggleGptSearchView, addGptMovieResult, resetGptSlice} = gptSlice.actions

export default gptSlice.reducer