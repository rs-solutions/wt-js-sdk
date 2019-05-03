const axios = require('axios');
const axiosRetry = require('axios-retry');
const { get, merge } = require('lodash');
const { isNetworkOrIdempotentRequestError } = require('./retry');

axios.defaults.baseURL = 'https://dev.wetransfer.com/';
axios.defaults.method = 'post';

const auth = {
  apiKey: null,
  jwt: null,
};

function configure(options = {}) {
  axiosRetry(axios, {
    retries: get(options, 'retries', 15),
    retryDelay: get(options, 'retryDelay', axiosRetry.exponentialDelay),
    // Retry if it's a network error, a 5XX error, API rate limit error on an idempotent request
    retryCondition(error) {
      const retry = isNetworkOrIdempotentRequestError(error.response);
      if (retry) {

      }

      return retry;
    },
  });
}

function defaultOptions(apiKey, jwt) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  };

  if (jwt) {
    options.headers['Authorization'] = `Bearer ${jwt}`;
  }

  return options;
}

function send(options = {}, data = null) {
  const requestOptions = merge(
    {},
    defaultOptions(auth.apiKey, auth.jwt),
    options,
    { data }
  );

  const log = {
    method: (options.method || axios.defaults.method).toUpperCase(),
  };
  return axios(requestOptions).then((response) => response.data);
}

function upload(uploadUrl, data) {
  const requestOptions = {
    url: uploadUrl,
    method: 'put',
    data,
  };

  return axios(requestOptions).then((response) => response.data);
}

module.exports = {
  send,
  upload,
  configure,
  set apiKey(apiKey) {
    auth.apiKey = apiKey;
  },
  set jwt(jwt) {
    auth.jwt = jwt;
  },
};
