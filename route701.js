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
const stationId_701 = [];
module.exports = { stationId_701 };

async function busroute() {
  try {
    var url = 'http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=7d5zmWvwEZpaRX9CIT1%2B4B4zWcsM5VHsA9gkQJ3fJEiv8%2BpuOnHZY9zwprseP3wmK0XbPoDKQl%2BUGKNBi419Ag%3D%3D';
        queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('235000091');
    const routeUrl = url + queryParams;
    request(routeUrl, function (error, response, body) {
      if (error) {
        console.error('API request failed:', error);
        return;
      }
    const xml = new DOMParser().parseFromString(body, 'text/xml');
    const route_nodeList = xml.getElementsByTagName('busRouteStationList');

    for (i = 0; i < route_nodeList.length; i++) {
      const route_element = route_nodeList.item(i);
      const stationId = route_element.getElementsByTagName('stationId')[0].textContent;
      const stationName = route_element.getElementsByTagName('stationName')[0].textContent;
      const latitude = route_element.getElementsByTagName('y')[0].textContent;
      const longitude = route_element.getElementsByTagName('x')[0].textContent;
      const stationSeq = parseInt(route_element.getElementsByTagName('stationSeq')[0].textContent);
      const turnYn = route_element.getElementsByTagName('turnYn')[0].textContent;
      stationId_701.push(stationId);

    const params = {
      TableName: 'Bus701',
      Item: {
        stationId: stationId,
        stationName: stationName,
        latitude: latitude,
        longitude: longitude,
        stationSeq: stationSeq,
        turnYn: turnYn,
        locationNo1: 'X',
        predictTime1: 'X'
      },
    };

    docClient.put(params)
      .then(() => {
      })
      .catch((err) => {
        console.error('Error saving Route data to DynamoDB:', err);
      });
    }
  });
  } catch (error) {
    console.error('Error:', error);
  }
}busroute();