const Redis = require('ioredis');
import 'dotenv/config';

const redis = new Redis({
  host: process.env.HOST,  //'192.168.2.165',
  port: parseInt(process.env.PORT) //8087,
});
var resVal: any;

/**
 * mock api client for retrieving account information
 */
export const getAccountInformation = async (drName: string,key: string,data: string): Promise<any> => {
 
  resVal = JSON.parse(await redis.call('JSON.GET', key + drName + '.config', '..' + data));
 
  if (typeof(resVal) == 'number') {
    resVal = Number(resVal);
  } else {
    resVal = resVal;
  }
  const accountData = {
  };
 accountData[data] = resVal;
  const message = `loading account information for "${data}"`;
  //console.log(accountData);
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      resolve(accountData[data]);
    });
  });
};
