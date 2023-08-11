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

async function fetchDataFromExternalAPI(accessToken, unitId, date){
  try {
    var response = await axiosInstance.post('reports/get-reports',{
      "from":"2022-11-01",//"2023-07-15",
      "to": "2022-11-16",//date.to,
      "unitId":Number(unitId)
    },{
      headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json'},
    });
    console.log(`Drives fetched successfully ${response.data }, drives : ${response.data.data.drives }`);
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

module.exports = {
    bgsAuth,
    fetchDataFromExternalAPI
}