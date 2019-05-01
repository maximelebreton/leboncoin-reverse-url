const Url = require('url');
const fetch = require('node-fetch');

const ReverseUrl = require('./ReverseUrl');
const testUrls = require('./testUrls.json');

var flattenObject = function(ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

describe('dirty check if each param is found in the response', () => {
  testUrls.forEach(url => {
    test(url, () => {
      let apiParams = ReverseUrl.getApiParamsFromUrl(url);
      let urlParams = ReverseUrl.getUrlParams(url);
      let stringApiParams = JSON.stringify(apiParams);
      Object.keys(urlParams).forEach((urlParamKey, index) => {
        if (urlParamKey.includes(['page'])) {
          return;
        }
        if (urlParamKey.includes(['locations'])) {
          urlParamKey = 'location';
        }
        let find = stringApiParams.search(urlParamKey) > -1 ? true : false;
        if (!find) {
          console.log(urlParamKey, find, url);
        }
        expect(find).toBe(true);
      });
      //expect(typeof params).toBe('object');
    });
  });
});

describe('check if url return results', () => {
  testUrls.forEach(url => {
    let params = ReverseUrl.getApiParamsFromUrl(url);
    let query = Url.parse(url).query;
    test(query, () => {
      return expect(
        fetch('https://api.leboncoin.fr/finder/search', {
          method: 'POST',
          headers: {
            origin: 'https://www.leboncoin.fr',
            api_key: 'ba0c2dad52b3ec',
            'content-type': 'text/plain;charset=UTF-8',
            accept: '*/*',
            referer: 'https://www.leboncoin.fr/annonces/offres/ile_de_france/'
          },
          body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(data => {
            return Promise.resolve(data);
          })
      ).resolves.toHaveProperty('ads');
    });
  });
});
