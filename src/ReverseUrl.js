const Url = require('url');
const QueryString = require('querystring');
const Cleaner = require('deep-cleaner');

/** sample:
 *
 * {"filters":{"category":{"id":"2"},
 *  "enums":{"ad_type":["offer"],"brand":["Bmw"],"fuel":["1"],"gearbox":["1"],"model":["Serie 1"]},
 *  "keywords":{},"location":{"region":"12"},
 *  "ranges":{"mileage":{"min":20000,"max":60000},"price":{"min":250,"max":47500}}},"limit":35,"limit_alu":3,"offset":35}
 *
 */

const ReverseUrl = {
  getUrlParams: url => {
    let urlQuery = Url.parse(url).query;
    let urlParams = QueryString.parse(urlQuery);
    return urlParams;
  },

  getOwnerType: ({ owner_type }) => {
    if (owner_type) {
      return owner_type;
    }
    return '';
  },

  getCategoryFilter: ({ category }) => {
    if (category) {
      return {
        id: category
      };
    }
    return {};
  },

  getKeywordsFilter: ({ text, search_in }) => {
    let keywords = {};
    if (text) {
      keywords.text = text;
    }
    if (search_in) {
      keywords.type = search_in;
    }
    return keywords;
  },

  getEnumsFilter: items => {
    let enums = {};
    items.forEach(([key, value]) => {
      let valueStringToArray = value.split(',');
      enums[key] = valueStringToArray;
    });
    return enums;
  },

  getRangesFilter: items => {
    let ranges = {};
    items.forEach(([key, value]) => {
      const valueStringToArray = value.split('-');
      const min = Number(valueStringToArray[0]);
      const max = Number(valueStringToArray[1]);
      if (min || max) {
        ranges[key] = {};
      }
      if (min) {
        ranges[key].min = min;
      }
      if (max) {
        ranges[key].max = max;
      }
    });
    return ranges;
  },

  getLocationFilter: params => {
    let regionsPrefix = 'r_';
    let departmentsPrefix = 'd_';
    const regionsRegex = RegExp(`^${regionsPrefix}`);
    const departmentsRegex = RegExp(`^${departmentsPrefix}`);
    let location = {};

    if (params.locations) {
      if (regionsRegex.test(params.locations)) {
        const region = params.locations.replace(regionsPrefix, '');
        location = {
          region
        };
      } else if (departmentsRegex.test(params.locations)) {
        const department = params.locations.replace(departmentsPrefix, '');
        location = {
          department
        };
      } else {
        const locationsArray = params.locations.split(',');
        let city_zipcodes = [];
        locationsArray.forEach(value => {
          const cityZipcodeArray = value.split('_');
          if (cityZipcodeArray.length === 1) {
            const city = cityZipcodeArray[0];
            city_zipcodes.push({
              city
            });
          } else {
            const zipcode = cityZipcodeArray[1];
            city_zipcodes.push({
              zipcode
            });
          }
        });
        location = {
          city_zipcodes
        };
      }
    } else if (params.lat && params.lng) {
      location.area = {
        lat: Number(params.lat),
        lng: Number(params.lng),
        radius: Number(params.radius) || 30000
      };
    }
    return location;
  },

  getFilters: params => {
    let filters = {};

    const paramKeys = Object.keys(params);
    let enumEntries = [];
    let rangeEntries = [];

    let notFilters = ['owner_type', 'page', 'limit', 'limit_alu', 'offset'];
    let categoryFilter = ['category'];
    let keywordsFilter = ['text', 'search_in'];
    let locationFilter = ['locations', 'lat', 'lng', 'radius'];

    /**
     * if a key isn't in 'notFilters', and is not a specific filter like 'location', we can assume it's a range or a enum
     */
    paramKeys.forEach(key => {
      if (notFilters.includes(key)) {
        // not a filter!
      } else if (categoryFilter.includes(key)) {
        if (!filters.category)
          filters.category = ReverseUrl.getCategoryFilter(params);
      } else if (keywordsFilter.includes(key)) {
        if (!filters.keywords)
          filters.keywords = ReverseUrl.getKeywordsFilter(params);
      } else if (locationFilter.includes(key)) {
        if (!filters.location)
          filters.location = ReverseUrl.getLocationFilter(params);
      } else {
        let value = params[key];
        let enumOrRange = value.split('-');
        // if dash, it's a range!
        if (enumOrRange.length === 1) {
          enumEntries.push([key, value]);
        } else {
          rangeEntries.push([key, value]);
        }
      }
    });

    filters.enums = ReverseUrl.getEnumsFilter(enumEntries);
    filters.ranges = ReverseUrl.getRangesFilter(rangeEntries);

    return filters;
  },

  getApiParamsFromUrl: url => {
    const params = ReverseUrl.getUrlParams(url);

    const filters = ReverseUrl.getFilters(params);
    const owner_type = ReverseUrl.getOwnerType(params);
    const limit = 35;
    const page = params.page || 1;

    let apiParams = {
      filters: Cleaner(filters),
      owner_type,
      limit: limit,
      limit_alu: 3,
      offset: (page - 1) * limit
    };

    return Cleaner(apiParams);
  }
};

module.exports = ReverseUrl;
