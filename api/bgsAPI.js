const axios = require('axios');

const BASE_URL = 'https://apis.bgsgroup.co.zm/gps/';

const axiosInstance = axios.create({
    baseURL: BASE_URL
});

var token = "";

async function bgsAuth(creds) {
  const response = await axiosInstance.post(
    "login",
      //JSON.stringify({data}),
      creds,
    {
      headers: { "Content-Type": "multipart/form-data"},
    });
    if(response.data.data.accessToken != null){
      return response.data.data.accessToken;
    }else{
      console.log(`Server running ${response.data.message}`);
      return response.data.message
  }
}

async function fetchDataFromExternalAPI(accessToken, unitIds, date){
  //console.log('Token:', accessToken);
  //console.log('unitIds:', unitIds);
  try {
    var response = await axiosInstance.post('reports/get-multiple-reports',{
      "from":date.from,//"2023-07-15",
      "to": date.to,//date.to,
      "unitIds":unitIds
    },{
      headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json'},
    });
    //console.log('Drives fetched successfully');
    //console.log(response.data.data);
    //console.log('Drives, total drives : ');
    //console.log(response.data.data.drives.length);
    // console.log('Response data:', jsonData);
    // ... your code to process JSON data
    return response.data  
  }catch(error){
    // Handle the error
    if (error.response) {
      // The server responded with a status code and data
      console.log('Drives: Server responded with status:', error.response.status);
      console.log('Drives: Response data:', error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received
      console.log('Drives: No response received from the server.');
    } else {
      // Something else went wrong
      console.log('Drives: Error:', error.message);
    }
  }
 
}

async function fetchDataFromExternalAPIGeofence(accessToken, gIds){
  try {
    var response = await axiosInstance.post('reports/get-geofence-report',{
      
      "geofenceIds":gIds
    },{
      headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json'},
    });
    console.log('Geofences fetched successfully');
    //console.log(response.data.data);
    //console.log('Drives, total drives : ');
    //console.log(response.data.data.drives.length);
    // console.log('Response data:', jsonData);
    // ... your code to process JSON data
    return response.data.data 
  }catch(error){
    // Handle the error
    if (error.response) {
      // The server responded with a status code and data
      console.log('Drives: Server responded with status:', error.response.status);
      console.log('Drives: Response data:', error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received
      console.log('Drives: No response received from the server.');
    } else {
      // Something else went wrong
      console.log('Drives: Error:', error.message);
    }
  }
 
}

module.exports = {
    bgsAuth,
    fetchDataFromExternalAPI,
    fetchDataFromExternalAPIGeofence
}