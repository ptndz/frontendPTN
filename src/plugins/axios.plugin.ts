import axios from "axios"
import {getCookie} from 'cookies-next';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL_API

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    if (config && config.headers) {
        const token=getCookie('awt');
        if(token){
            config.headers['Authorization'] =`Bearer ${token}`;
        }
    }
    return config;
}, function (error) {
    // Do something with request error
    alertError(error)
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    alertError(error)
    return Promise.reject(error);
});

function alertError(e:any){
    if (e.statusCode === 400){
        window.location.href='http://localhost:8080'
    }
}