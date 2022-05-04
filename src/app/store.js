import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import createSagaMiddleware from 'redux-saga'

import mySaga from './sagas'

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()

export default configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware: [sagaMiddleware],
})

sagaMiddleware.run(mySaga);