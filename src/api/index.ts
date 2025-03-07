import axios from 'axios';
import { setupCache } from 'axios-cache-adapter'
import OfflineHelper from '@/offline-helper'
import emitter from "@/event-bus"
import store from '@/store';
import {
    StatusCodes
} from 'http-status-codes';
import router from '@/router'
import qs from "qs"


axios.interceptors.request.use((config: any) => {
    const token = store.getters['user/getUserToken'];
    if (token) {
        config.headers.Authorization =  'Bearer ' + token;
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // TODO Handle it in a better way
    // Currently when the app gets offline, the time between adding a loader and removing it is fractional due to which loader dismiss is called before loader present
    // which cause loader to run indefinitely
    // Following gives dismiss loader a delay of 100 microseconds to get both the actions in sync
    setTimeout(() => emitter.emit("dismissLoader"), 100);
    if (error.response) {
        // TODO Handle case for failed queue request
        const { status } = error.response;
        if (status === StatusCodes.UNAUTHORIZED) {
          store.dispatch("user/logout");
          router.push('/login')
        }
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });

const maxAge = process.env.VUE_APP_CACHE_MAX_AGE ? parseInt(process.env.VUE_APP_CACHE_MAX_AGE) : 0;
const axiosCache = setupCache({
    maxAge: maxAge * 1000
})


/**
 * Generic method to call APIs
 *
 * @param {string}  url - API Url
 * @param {string=} method - 'GET', 'PUT', 'POST', 'DELETE , and 'PATCH'
 * @param {any} [data] - Optional: `data` is the data to be sent as the request body. Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
 * When no `transformRequest` is set, must be of one of the following types:
 * - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
 * - Browser only: FormData, File, Blob
 * - Node only: Stream, Buffer
 * @param {any} [params] - Optional: `params` are the URL parameters to be sent with the request. Must be a plain object or a URLSearchParams object
 * @param {boolean} [cache] - Optional: Apply caching to it
 *  @param {boolean} [queue] - Optional: Apply offline queueing to it
 * @return {Promise} Response from API as returned by Axios
 */
const api = async (customConfig: any) => {
    // Prepare configuration
    const config: any = {
        url: customConfig.url,
        method: customConfig.method,
        data: customConfig.data,
        params: customConfig.params,
        // `paramsSerializer` is an optional function in charge of serializing `params`
        // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
        //   paramsSerializer: function (params) {
        //     return Qs.stringify(params, {arrayFormat: 'brackets'})
        //   },
        // This implemmentation is done to ensure array and object is passed correctly in OMS 1.0
        paramsSerializer: (p: any) => {
            // When objects are stringified, by default they use bracket notation:
            // qs.stringify({ a: { b: { c: 'd', e: 'f' } } });
            // 'a[b][c]=d&a[b][e]=f'
            //We may override this to use dot notation by setting the allowDots option to true:
            // qs.stringify({ a: { b: { c: 'd', e: 'f' } } }, { allowDots: true });
            // 'a.b.c=d&a.b.e=f'
            // OMS 1.0 supports objects passed as strings
            const params = Object.keys(p).reduce((params: any, key: string) => {
                let value = p[key];
                if ( typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    value = JSON.stringify(value)
                }
                params[key] = value;
                return params;
            }, {})
            // arrayFormat option is used to specify the format of the output array:
            //qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' })
            // 'a[0]=b&a[1]=c'
            //qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' })
            // 'a[]=b&a[]=c'
            //qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' })
            // 'a=b&a=c'
            //qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma' })
            // 'a=b,c'
            // Currently OMS 1.0 supports values as repeat
            return qs.stringify(params, {arrayFormat: 'repeat'});
        }
    }

    let baseURL = store.getters['user/getInstanceUrl'];
    baseURL = baseURL && baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;
    if (baseURL) config.baseURL = baseURL;

    if(customConfig.cache) config.adapter = axiosCache.adapter;

    const networkStatus =  await OfflineHelper.getNetworkStatus();
    if (customConfig.queue && !networkStatus.connected) {
        if (!config.headers) config.headers = { ...axios.defaults.headers.common, ...config.headers };

        emitter.emit("queueTask", {
            callbackEvent: customConfig.callbackEvent,
            payload: config
        });
    } else {
        return axios(config);
    }
}

/**
 * Client method to directly pass configuration to axios
 *
 * @param {any}  config - API configuration
 * @return {Promise} Response from API as returned by Axios
 */
const client = (config: any) => {
    return axios.request(config);
}

export { api as default, client, axios };