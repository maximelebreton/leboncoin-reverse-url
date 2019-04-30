const Url = require('url');
const fetch = require('node-fetch');

const ReverseUrl = require('./ReverseUrl');
const testUrls = require('./testUrls.json');

test('check if urls return params', () => {
  testUrls.forEach(url => {
    let params = ReverseUrl.getApiParamsFromUrl(url);
    expect(typeof params).toBe('object');
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
