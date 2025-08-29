import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // usa localStorage
import logger from 'redux-logger';
import { appStateReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { userReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { LOG_REDUX_ACTIONS } from '../utils/constants';
import { partiesReducer } from './slices/partiesSlice';
import { permissionsReducer } from './slices/permissionsSlice';
import { productsReducer } from './slices/productsSlice';
import { invitaliaReducer } from './slices/invitaliaSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['invitalia'],
};

const rootReducer = combineReducers({
    user: userReducer,
    appState: appStateReducer,
    parties: partiesReducer,
    permissions: permissionsReducer,
    products: productsReducer,
    invitalia: invitaliaReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const additionalMiddlewares = [LOG_REDUX_ACTIONS ? logger : undefined];

export const createStore = () =>
    configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware: (arg0: { serializableCheck: boolean }) => any) =>
            additionalMiddlewares.reduce(
                (array, middleware) => (middleware ? array.concat(middleware) : array),
                getDefaultMiddleware({ serializableCheck: false })
            ),
    });

export const store = createStore();
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
