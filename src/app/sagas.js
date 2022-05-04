import { call, put, takeLatest, cancelled } from 'redux-saga/effects'
import { decrement, increment } from '../features/counter/counterSlice'
import api from './api';

function* fetchData() {
   try {
      const res = yield call(api.fetchData);
      yield put({type: "DATA_FETCH_SUCCEEDED", data: res});
   } catch (e) {
      yield put({type: "DATA_FETCH_FAILED", message: e.message});
   }
   finally {
      if (yield cancelled()) {
         console.log("saga cancelled");
      }
   }
}

function* mySaga() {
  yield takeLatest(increment.type, fetchData);
  yield takeLatest(decrement.type, fetchData);
}

export default mySaga;