import { configureStore } from '@reduxjs/toolkit';

const initialState = {
    studenti: [],
    uplate: []
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'studenti/dodaj':
            return { ...state, studenti: [...state.studenti, action.payload] };
        default:
            return state;
    }
};

export const store = configureStore({ reducer: rootReducer });