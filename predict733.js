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
const docClient = DynamoDBDocument.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
}
});
const { stationId_733 } = require('./route733');

async function buspredict() {
  const stateparams = {
    TableName: 'BusLocation733',
    Key: {
      Bus: '733'
    }
  };
  docClient.get(stateparams, (err, data) => {
    const states = data.Item.states;
    if (states === '운행 중'){
      for (let i = 0; i < stationId_733.length; i++) {
        try {
          const stationSeq = i+1;
          var url = 'https://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem';
          var queryParams = '?' + encodeURIComponent('serviceKey') + '=7d5zmWvwEZpaRX9CIT1%2B4B4zWcsM5VHsA9gkQJ3fJEiv8%2BpuOnHZY9zwprseP3wmK0XbPoDKQl%2BUGKNBi419Ag%3D%3D';
              queryParams += '&' + encodeURIComponent('stationId') + '=' + encodeURIComponent(stationId_733[i]);
              queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('241451015');
          const predictUrl = url + queryParams;
          request(predictUrl, async function (error, response, body) {
            if (error) {
              console.error('API request failed:', error);
              return;
            }
          const xml = new DOMParser().parseFromString(body, 'text/xml');
          const resultCodeElement = xml.getElementsByTagName('resultCode')[0];
          const resultCode = resultCodeElement ? resultCodeElement.textContent : 'N/A';
    
          if (resultCode === '0') {
            const locationNo1 = xml.getElementsByTagName('locationNo1')[0].textContent;
            const predictTime1 = xml.getElementsByTagName('predictTime1')[0].textContent;
      
            const params = {
              TableName: 'Bus733',
              Key: {
                stationId: stationId_733[i],
                stationSeq: stationSeq
              },
              UpdateExpression: 'SET locationNo1 = :locationNo1, predictTime1 = :predictTime1',
              ExpressionAttributeValues: {
                ':locationNo1': locationNo1,
                ':predictTime1': predictTime1
              }
            };
          
            await docClient.update(params)
              .then(() => {
              })
              .catch((err) => {
                console.error('Error updating Route data in DynamoDB:', err);
              });
            }else{
              const params = {
                TableName: 'Bus733',
                Key: {
                  stationId: stationId_733[i],
                  stationSeq: stationSeq
                },
                UpdateExpression: 'SET locationNo1 = :locationNo1, predictTime1 = :predictTime1',
                ExpressionAttributeValues: {
                  ':locationNo1': 'X',
                  ':predictTime1': 'X'
                }
              };
            
              await docClient.update(params)
                .then(() => {
                })
                .catch((err) => {
                  console.error('Error updating Route data in DynamoDB:', err);
                });
            }
        });
        } catch (error) {
          console.error('Error:', error);
        }
    }
    }else{
        console.log('733 운행 정보 없음')
    }
  });
  }setInterval(() => {
    buspredict();
  }, 30000);