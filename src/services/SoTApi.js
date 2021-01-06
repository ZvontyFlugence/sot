import BaseApiService from './BaseApi';

const BASE_URL = process.env.REACT_APP_SOT_API || 'http://localhost:5000/api';
let client = new BaseApiService({ baseURL: BASE_URL });

let SoTApi = {};

SoTApi.setToken = token => {
  const HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  client = new BaseApiService({ baseURL: BASE_URL, headers: HEADERS, timeout: 5000 });
}

// AUTH ENDPOINTS
SoTApi.validate = () => client.get('/auth/validate');
SoTApi.login = payload => client.post('/auth/login', payload);
SoTApi.register = payload => client.post('/auth/register', payload);

// User
SoTApi.getUser = () => client.get('/user');
SoTApi.getUsers = () => client.get('/user/all');
SoTApi.getProfile = id => client.get(`/user/${id}`);
SoTApi.getLocationInfo = () => client.get('/user/location-info');
SoTApi.getWalletInfo = () => client.get('/user/wallet-info');
SoTApi.getUserCompanies = () => client.get('/user/companies');
SoTApi.getUserCompaniesPlus = query => client.get(`/user/companies?${query}`);
SoTApi.doAction = payload => client.patch('/user/action', payload);
SoTApi.vote = payload => client.post('/user/vote', payload);

// Company
SoTApi.getCompany = id => client.get(`/companies/${id}`);
SoTApi.getCompanies = ceo_id => client.get(`/companies/ceo/${ceo_id}`);
SoTApi.updateCompDetails = (comp_id, payload) => client.post(`/companies/${comp_id}`, payload);
SoTApi.deleteCompany = comp_id => client.delete(`/companies/${comp_id}`);
SoTApi.doCompAction = (comp_id, payload) => client.patch(`/companies/${comp_id}/action`, payload);

// Country
SoTApi.getCountry = id => client.get(`/countries/${id}`);
SoTApi.getCountries = () => client.get('/countries');
SoTApi.getDemographics = id => client.get(`/countries/${id}/demographics`);
SoTApi.getCountryRegions = id => client.get(`/countries/${id}/regions`);
SoTApi.getJobOffers = id => client.get(`/countries/${id}/jobs`);
SoTApi.getProductOffers = id => client.get(`/countries/${id}/goods`);
SoTApi.getCountryArticles = id => client.get(`/countries/${id}/articles`);
SoTApi.getCountryParties = id => client.get(`/countries/${id}/parties`);
SoTApi.getCountryPoliticans = id => client.get(`/countries/${id}/politicians`);

// News
SoTApi.getNewspaper = id => client.get(`/news/${id}`);
SoTApi.doNewsAction = (news_id, payload) => client.post(`/news/${news_id}/action`, payload);
SoTApi.getArticle = (news_id, article_id) => client.get(`/news/${news_id}/article/${article_id}`);

// Parties
SoTApi.getParty = id => client.get(`/parties/${id}`);
SoTApi.getParties = () => client.get('/parties');
SoTApi.doPartyAction = (partyId, payload) => client.patch(`/parties/${partyId}/action`, payload);

// Regions
SoTApi.getRegion = id => client.get(`/regions/${id}`);
SoTApi.getRegions = () => client.get('/regions');
SoTApi.getTravelDistance = payload => client.post('/regions/travel-distance', payload);

// Shouts
SoTApi.getShouts = payload => client.post('/shouts', payload);

// Stats
SoTApi.getCitizenStats = payload => client.post('/stats/citizens', payload);
SoTApi.getCountryStats = payload => client.post('/stats/countries', payload);
SoTApi.getPartyStats = payload => client.post('/stats/parties', payload);
SoTApi.getNewspaperStats = payload => client.post('/stats/newspapers', payload);

// Map
SoTApi.getMapRegions = () => client.get('/map/regions');

export default SoTApi;