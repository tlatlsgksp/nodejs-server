const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({
  region: 'ap-northeast-2', 
  credentials: { 
    accessKeyId: 'AKIATR4KVIIS74DNZLGD', 
    secretAccessKey: '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'
  }
});
const docClient = DynamoDBDocument.from(client);

async function buslocation() {
    try {
      var url = 'https://apis.data.go.kr/6410000/buslocationservice/getBusLocationList';
      var queryParams = '?' + encodeURIComponent('serviceKey') + '=7d5zmWvwEZpaRX9CIT1%2B4B4zWcsM5VHsA9gkQJ3fJEiv8%2BpuOnHZY9zwprseP3wmK0XbPoDKQl%2BUGKNBi419Ag%3D%3D';
          queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('235000091');
      const locationUrl = url + queryParams;
      request(locationUrl, function (error, response, body) {
        if (error) {
          console.error('API request failed:', error);
          return;
        }
      const xml = new DOMParser().parseFromString(body, 'text/xml');
      const resultCodeElement = xml.getElementsByTagName('resultCode')[0];
      const resultCode = resultCodeElement ? resultCodeElement.textContent : 'N/A';

      if (resultCode === '0') {
        const endBus = xml.getElementsByTagName('endBus')[0].textContent;
        const plateNo = xml.getElementsByTagName('plateNo')[0].textContent;
        const stationId = xml.getElementsByTagName('stationId')[0].textContent;

        const params = {
            TableName: 'BusLocation701',
            Item: {
            Bus: '701',
            states: '운행 중',
            stationId: stationId,
            endBus: endBus,
            plateNo: plateNo
            },
        };
  
        docClient.put(params)
            .then(() => {
            })
            .catch((err) => {
            console.error('Error saving Location_701 data to DynamoDB:', err);
            });
    } else{
        const deleteParams = {
            TableName: 'BusLocation701',
            Item: {
                Bus: '701',
                states: '운행 정보 없음',
                stationId: 'X',
                endBus: 'X',
                plateNo: 'X'
                },
          };

        docClient.put(deleteParams)
            .then(() => {
            })
            .catch((err) => {
            console.error('Error saving Location_701 data to DynamoDB:', err);
            });
    }
    });
    } catch (error) {
      console.error('Error:', error);
    }
  }setInterval(() => {
    buslocation();
  }, 10000);