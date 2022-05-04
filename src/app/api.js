
import { CANCEL } from '@redux-saga/symbols';

const api = {
    fetchData: () => {
        let controller = new AbortController();
        let signal = controller.signal;

        signal.addEventListener('abort', () => console.log("abort!"));

        const promise = fetch('https://reqres.in/api/products/3', {
            signal,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
        })
            .then((res) => console.log("fetched", res))
            .catch((err) => console.log("aborted", err));

        promise[CANCEL] = () => controller.abort();
        return promise;
    }
}

export default api;