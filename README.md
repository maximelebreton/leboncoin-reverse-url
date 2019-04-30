# leboncoin-reverse-url
converts any offer leboncoin `string` url (with ?query) to its equivalent `object` params for api calls

## Install
```node
npm install leboncoin-reverse-url
```

## Usage
```node
const reverseUrl = require('leboncoin-reverse-url');

const url = 'https://www.leboncoin.fr/recherche/?category=10&text=studio&locations=Rennes&owner_type=pro&furnished=2&real_estate_type=2&price=150-350'
const params = reverseUrl(url)
```

Returns an object:
```js
{  
   "filters":{  
      "category":{  
         "id":"10"
      },
      "enums":{  
         "ad_type":[  
            "offer"
         ],
         "furnished":[  
            "2"
         ],
         "real_estate_type":[  
            "2"
         ]
      },
      "ranges":{  
         "price":{  
            "min":150,
            "max":350
         }
      },
      "keywords":{  
         "text":"studio"
      }
   },
   "owner_type":"pro",
   "limit":35,
   "limit_alu":3,
   "offset":0
}
```

## Test
```
npm run test
```

## Serve
```
npm run start
```

## Codesandbox playground
Play with it on https://codesandbox.io/s/github/maximelebreton/leboncoin-reverse-url

