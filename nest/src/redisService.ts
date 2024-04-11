import { Injectable } from '@nestjs/common';
const Redis = require('ioredis');
import 'dotenv/config';
import { response } from 'express';
import { isEmpty } from 'rxjs';

export const redis = new Redis({
  host: process.env.HOST,  
  port: parseInt(process.env.PORT) 
});

@Injectable()
export class RedisService {

 async getJsonData(key:string) {
    var request: any = await redis.call('JSON.GET', key);  
    return request;
  }

  async getJsonDataWithPath(key:string,path:string) {
    var request: any = await redis.call('JSON.GET', key, path);  
    return request;
  }

async setJsonData(key:string, value:any, path?:string) {

    if(path){      
      var defpath = '.'+path
    }
    else{
      var defpath = '$'
    }  
    await redis.call('JSON.SET',key, defpath, value);
    return 'Value Stored';
  }

async setStreamData(streamName:string,key:string,strValue:any){
   
    try {
      var result = await redis.xadd(streamName, '*', key,strValue);
      //console.log(result)
      return result;
    } catch (error) {
      throw error
    }
  }

async getStreamData(streamName){
    try {
      var data=[]
      var messages = await redis.xread('STREAMS', streamName, 0-0);
        return messages
    } catch (error) {
      throw error
    }
  }

  async getStreamDatawithCount(count,streamName){
    try {
      var messages = await redis.xread('COUNT', count,'STREAMS', streamName, 0-0);     
      return messages
    } catch (error) {
      throw error
    }
  }

async createConsumerGroup(streamName,groupName,) {
    var result = await redis.xgroup('CREATE',streamName,groupName,'$','MKSTREAM');
   
    return `consumerGroup was created as ${groupName}`;
}

async createConsumer(streamName, groupName, consumerName){
  try {
    var result = await redis.xgroup('CREATECONSUMER', streamName, groupName, consumerName);
    console.log(`${consumerName} consumer was created`);
    return result
  } catch (error) {
    throw error
  }
}

async readConsumerGroup(streamName,groupName,consumerName){
  try {
      var msgId1:string
      var data =[]
      var result = await redis.xreadgroup('GROUP',groupName,consumerName,'STREAMS',streamName,'>');
      console.log(result);
      
      if (result) {
        result.forEach(([key, message]) => {
          console.log(`Stream: ${key}`);
          message.forEach(([messageId, data]) => {
            msgId1 = messageId;
            var response = `Message ID : ${messageId}. Data : ${JSON.stringify(data)}`;      
            console.log(response);
            
            data.push(response)
            //console.log(data);
          });
        });
        return data
      }
      else{
        return "No Data available to read"
      }                
   }catch (error) {
    throw error
  }
}

async ackMessage(streamName, groupName, msgId){
  let result= await redis.xack(streamName, groupName, msgId );
  return result
}

async getPrcErrLogs(key:string,field:string){
  try {
    var data = []
    var messages = await redis.call('XRANGE', key, '-', '+')
    messages.forEach(([msgId,value])=>{       
      data.push(value); 
    })
    var filteredData = data.filter(item => item.includes(field));
    return filteredData
  } catch (error) {
    throw error   
  }
}

async getvariables(key:string){
  var data = []
    var keys = await redis.keys(key+':*');
    for(var k=0;k<keys.length;k++){
      console.log(keys[k])
      var response = await redis.call('JSON.MGET',keys[k],'$')
      console.log(response);      
      if(response!='[{}]'){
        data.push(response)
      }    
    }
    return data;
}
}
