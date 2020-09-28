import axios from 'axios';

export const sleep = ms => new Promise(res => setTimeout(res, ms));

const END_POINT = 'https://yts.mx/api/v2';
const obj2params = obj => Object.keys(obj).map(key => `${key}=${obj[key]}`).join('?');
export const getMoviesList = (params = {}) => axios.get(`${END_POINT}/list_movies.json?${obj2params(params)}`);
export const getMoviesDetail = id => axios.get(`${END_POINT}/movie_details.json?movie_id=${id}`);

export const createPromise = () => {
  let resolve, reject;
  return [new Promise((res, rej) => [resolve, reject] = [res, rej]), resolve, reject];
};  
