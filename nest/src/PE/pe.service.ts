import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { catchError, filter, firstValueFrom, map } from 'rxjs';
import { getAccountInformation } from './data';
const  Xid = require('xid-js');
const Redis = require('ioredis');
import * as ts from "typescript";
const { Engine } = require('json-rules-engine');
import 'dotenv/config';
import { url } from 'inspector';
import { error } from 'console';
import { RedisService } from 'src/redisService';
import { RuleEngine } from 'src/ruleEngine';
import { json } from 'stream/consumers';
import { format } from 'date-fns';
import { request } from 'http';

const redis = new Redis({
  host:  process.env.HOST,  
  port:  parseInt(process.env.PORT) 
});


@Injectable()
export class PeService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(PeService.name);
  static upid = 0
  static flag = 'Y'   
  redisService : RedisService = new RedisService()

  
  async getPrcLogs(){       
    try {
      var msgid = []
      var strmarr = []
      var arrData = [];
     
      var messages = await redis.call('XRANGE', 'TPEprocesslogs', '-', '+')    
   
      messages.forEach(([msgId,value])=>{
        msgid.push(msgId)
        strmarr.push(value)
        }); 
     for(var s=0;s<msgid.length;s++){
        var date = new Date(Number(msgid[s].split("-")[0])); 
        var entryId = format(date,'HH:mm:ss.SSS dd MMM yyyy') 
      if(JSON.parse(strmarr[s][1]).nodeName != 'Start'){
        var nodeInfo: any={};
          var objnpc:any={};
          var objipc:any={};
                     
          nodeInfo.key=strmarr[s][0] 
          nodeInfo.time =entryId
          nodeInfo.nodeName=JSON.parse(strmarr[s][1]).nodeName
       
         var npcpre= await redis.call('JSON.GET', nodeInfo.key + ':NPC:' + nodeInfo.nodeName + '.PRE');
         var npcpro=  await redis.call('JSON.GET', nodeInfo.key + ':NPC:' + nodeInfo.nodeName + '.PRO');
         var npcpst=  await redis.call('JSON.GET', nodeInfo.key + ':NPC:' + nodeInfo.nodeName + '.PST');
         var errval =  await redis.call('JSON.GET', nodeInfo.key + ':ERR:' + nodeInfo.nodeName);
        var ipcpre= await redis.call('JSON.GET', nodeInfo.key + ':IPC:' + nodeInfo.nodeName + '.PRE');
        var ipcpro=  await redis.call('JSON.GET', nodeInfo.key + ':IPC:' + nodeInfo.nodeName + '.PRO');
        var ipcpst=  await redis.call('JSON.GET', nodeInfo.key + ':IPC:' + nodeInfo.nodeName + '.PST');
         objnpc.PRE = npcpre
         objnpc.PRO = npcpro
         objnpc.PST = npcpst
         nodeInfo.npc=(objnpc);
         nodeInfo.err=(errval)
         objipc.PRE = ipcpre
         objipc.PRO = ipcpro
         objipc.PST = ipcpst

         nodeInfo.ipc = objipc        
        arrData.push(nodeInfo); 
      }
    }
   return (arrData);
    } catch (error) {
      throw error   
    }
  }

  async getvariables(key){
    var data = []
      var keys = await redis.keys(key+':*');
      for(var k=0;k<keys.length;k++){
        var response = await redis.call('JSON.MGET',keys[k],'$')
       // console.log(response);      
        if(response!='[{}]'){
         var obj = {}
          obj['nodename'] = keys[k]
          obj['data'] = JSON.parse(response)
          data.push(obj)
        }    
      }
      return data;
  }
async getFormdata(key, fdata){

  var fjson = await this.redisService.getJsonData( key + 'processFlow');  
    if(!fjson){
      console.log("Processflow does not exist");
      throw new BadRequestException("Processflow does not exist. Please check the key");
    }
    var fdjson: any = JSON.parse(fjson).ProcessFlow;  
    for (var z = 0; z < fdjson.length; z++) { 
      if( fdjson[z].nodeType == 'humanTaskNode'){
       
        await this.redisService.setJsonData(key+fdjson[z].nodeName+'.config',JSON.stringify(fdata),'request')
      }
    }
    console.log(key)
   var response = await this.getProcess(key)
   return response;

}

async getProcess(key) { 
  try {
   

   this.logger.log("Torus Process Engine Started....")
   PeService.upid = Xid.next()

     var json: any = await this.pfPreProcessor(key);  
     if(json == 'Success') {  
     await this.pfProcessor(key);
     await this.pfPostProcessor(key); 
     return {data:key+PeService.upid} ;    
     }
   else{
    return {status:201,data:json};
   } 
  } catch (error) {
    return {status:400,err:error}
  }        
  }


// -----------------------------pfPreProcessor--------------------------------------


  async pfPreProcessor(key) { 

    this.logger.log('Pf PreProcessor started!');   
    try{ 
    var val = {}
    // Read Process Flow Json
    const json = await this.redisService.getJsonData( key + 'processFlow');  
    if(!json){
      console.log("Processflow does not exist");
      throw new BadRequestException("Processflow does not exist. Please check the key");
    }
    var pfjson: any = JSON.parse(json).ProcessFlow;  
   
     
   this.logger.log("config key validation..")
    // nodetype data file validation
    for (var i = 0; i < pfjson.length; i++) { 

      if( pfjson[i].nodeType == 'humanTaskNode'){
        var request: any = await this.redisService.getJsonData(key + pfjson[i].nodeName + '.config');    
        if(!request){
          console.log(pfjson[i].nodeName, " config does not exist");
          throw new BadRequestException(pfjson[i].nodeName, "config does not exist");
        }
        var mconfig = await this.redisService.getJsonData(key+pfjson[i].nodeName+'.config')
        var formdata = JSON.parse(mconfig).url
               
        if(!JSON.parse(mconfig).request){ 
          return formdata;
        }            
      }

      if(pfjson[i].nodeName != 'Start' && pfjson[i].nodeName != 'End'){
      var request: any = await this.redisService.getJsonData(key + pfjson[i].nodeName + '.config');    
      if(!request){
        console.log(pfjson[i].nodeName, " config does not exist");
        throw new BadRequestException(pfjson[i].nodeName, "config does not exist");
      }
      else{  
        if(PeService.flag == 'Y'){          
        
        await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson[i].nodeName +'.PRE',JSON.stringify(val))
        await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson[i].nodeName +'.PRO',JSON.stringify(val))
        await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson[i].nodeName +'.PST',JSON.stringify(val))

        if(pfjson[i].ipcFlag){
          if(pfjson[i].ipcFlag != 'N'){          
          
          await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson[i].ipcFlag +':'+ pfjson[i].nodeName +'.PRE',JSON.stringify(val))  
          await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson[i].ipcFlag +':'+ pfjson[i].nodeName +'.PRO',JSON.stringify(val)) 
          await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson[i].ipcFlag +':'+ pfjson[i].nodeName +'.PST',JSON.stringify(val)) 
        }
        } 
       
               
      }
      }    
      // workflow json file verification
      if( pfjson[i].nodeType == 'decisionNode'){
        var wf: any =  await this.redisService.getJsonData(key + pfjson[i].nodeName + '.WF');
        if(!wf){
          console.log(pfjson[i].nodeName+" workflow json not available")
          throw new BadRequestException(pfjson[i].nodeName+" workflow json not available")
        }
      }       
    }
     }
     return 'Success'
    }catch(error){
      var errobj ={}
      errobj['nodename'] = pfjson[i].nodeName
      errobj['error'] = error;
           
      await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson[i].nodeName,JSON.stringify(error))
     // await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, errobj); 
  
    }
    
  }

// --------------------------------pfProcessor--------------------------------------

  async pfProcessor(key) {

    this.logger.log('Pf Processor started!');
    try{
    var arr = [];
    var nodeid;      
    var requestConfig;
    var nodeConfig;
    var customConf;
    var node_name;

    const json = await this.redisService.getJsonData( key + 'processFlow');   
    
    var pfjson: any = JSON.parse(json).ProcessFlow;  
   console.log(pfjson)
    
    var input = await this.redisService.getJsonDataWithPath('PEdata','.url');
          
   
     for (var i = 0; i < pfjson.length; i++) { 
      
     // Start Node

      if (pfjson[i].nodeName == 'Start') {
        node_name = pfjson[i].nodeName;
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        
        arr.push(obj);
        var deci = {};
        deci['nodeName']=pfjson[i].nodeName;
        
        
        await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid,JSON.stringify(deci)); 
        nodeid = pfjson[i].routeArray[0].nodeId;        
      }  
      // Humantask node

      if (nodeid == pfjson[i].nodeId && pfjson[i].nodeType == 'humanTaskNode' && (pfjson[i].nodeName != 'Start' || pfjson[i].nodeName != 'End')) { 
        try{
          node_name=pfjson[i].nodeName;
          var obj = {};
          obj['nodeid'] = pfjson[i].nodeId;
          obj['nodename'] = pfjson[i].nodeName;
          obj['nodetype'] = pfjson[i].nodeType;          
          arr.push(obj);
          var fdataReq = await this.redisService.getJsonDataWithPath(key+pfjson[i].nodeName+'.config', '.request')
          nodeid = pfjson[i].routeArray[0].nodeId; 
         for(var y=0; y<pfjson.length; y++){
          if(nodeid == pfjson[y].nodeId){
            if(pfjson[y].nodeType=='decisionNode'){
              await this.redisService.setJsonData(key+pfjson[y].nodeName+'.config',fdataReq,'request.data' )
            }
            else{
              await this.redisService.setJsonData(key+pfjson[y].nodeName+'.config',fdataReq,'execution.pro.request.data' )
            }     
          }
         }

          var deci = {};
          deci['nodeName']=pfjson[i].nodeName;
          
          
          await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid,JSON.stringify(deci)); 
                 
        }catch(err)
        {
          await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson[i].nodeName,error)
        }
      }
      
    // Decision Node

       if (nodeid == pfjson[i].nodeId && pfjson[i].nodeType == 'decisionNode' && (pfjson[i].nodeName != 'Start' || pfjson[i].nodeName != 'End')) { 
        try{        
          node_name=pfjson[i].nodeName;
        await this.redisService.setJsonData(key+pfjson[i].nodeName+'.config',JSON.stringify(JSON.parse(input)+pfjson[i].nodeName),'request.url')
        await this.redisService.setJsonData(key+pfjson[i].nodeName+'.WF',JSON.stringify(pfjson[i].nodeId),'wfConditions[0].nodeId')
        await this.redisService.setJsonData(key+pfjson[i].nodeName+'.WF',JSON.stringify(pfjson[i].nodeId),'wfConditions[1].nodeId')
        
        
        var wfarr: any = await this.redisService.getJsonData(key + pfjson[i].nodeName + '.WF')
      
        
        var wfVal: any = JSON.parse(wfarr).wfConditions; // wfConditions      
        var ruleEngine: RuleEngine = new RuleEngine();
        this.logger.log("decision node execution started...")
        for (var a = 0; a < wfVal.length; a++) {
        
          var wfres: any = await ruleEngine.start(wfVal[a], key, pfjson[i].nodeName);
     
          if (wfres.length > 0) {                  
            for (var k = 0; k < pfjson[i].routeArray.length; k++) {          
              if (pfjson[i].routeArray[k].conditionResult == wfres[0].result) {                 
                await this.redisService.setJsonData(key + pfjson[i].nodeName + '.config','{"statuscode":"'+200+'","status":"SUCCESS","responseData":{"data":'+JSON.stringify(pfjson[i].routeArray[k])+'}}','response');  
                if(PeService.flag == 'Y'){
                var setData = await this.redisService.getJsonData(key + pfjson[i].nodeName + '.config'); 
                await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson[i].nodeName +'.PRO',setData)                            
                }
                
                var resData = await this.redisService.getJsonDataWithPath(key + pfjson[i].nodeName + '.config','.response');
                var deci = {};
                deci['nodeName']=pfjson[i].nodeName;
                deci['request'] =  JSON.parse(wfarr)
                deci['response'] =  JSON.parse(resData)          
                await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, JSON.stringify(deci));
                nodeid = pfjson[i].routeArray[k].nodeId;                
                break;
              }
            }
          }
        }      
        this.logger.log("decision node execution completed..")
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj);  
      }catch(error){
        await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson[i].nodeName,error)
      }       
      }
     
      //Custom Node 

      if (nodeid == pfjson[i].nodeId  && pfjson[i].nodeType == 'customNode' && pfjson[i].nodeName != 'Start' && pfjson[i].nodeName != 'End') {
      this.logger.log("custom code execution started")
    
        node_name=pfjson[i].nodeName;
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj);      
       
      var customConfig = await this.redisService.getJsonData(key+pfjson[i].nodeName+'.config')
      var customRequest = await this.redisService.getJsonDataWithPath(key+pfjson[i].nodeName+'.config','.request')
      var data = JSON.parse(customConfig).request.code      
      
          for(var k = 1; k < arr.length-1; k++){
            var curnName = (arr[k].nodename).toLowerCase();
             
           var str = data.indexOf(curnName)
            if(str != -1){      
            if(arr[k].nodetype == 'decisionNode'){
            var value = await this.redisService.getJsonDataWithPath(key+arr[k].nodename+'.config','.request.data')           
            var chkdata = JSON.parse(value)
         
            var chkkey = Object.keys(chkdata)
            var chkval = Object.values(chkdata)
           
            for(var s=0;s<chkkey.length;s++){
              var val = curnName+'.request.data.'+chkkey[s]             
              if(data.indexOf(val)){
              data = data.replace(new RegExp(val, 'g'), chkval[s])
            } 
            }
          }  
          if(arr[k].nodetype == 'apiNode'){
            var value = await this.redisService.getJsonDataWithPath(key+arr[k].nodename+'.config','.execution.pro.request.data')
            var chkdata = JSON.parse(value)
            var chkkey = Object.keys(chkdata)
            var chkval = Object.values(chkdata)
            for(var s=0;s<chkkey.length;s++){
             var val = curnName+'.execution.pro.request.data.'+chkkey[s]          
            if(data.indexOf(val)){
              data = data.replace(new RegExp(val, 'g'), chkval[s]) 
            }
          }
          }
        }         
      }

      let result = ts.transpile(data);
      var t1 = eval(result);      
      this.logger.log(t1);    
      await this.redisService.setJsonData(key+pfjson[i].nodeName+'.config','{"statuscode":"'+200+'","status":"SUCCESS","responseData":{"data":{"trnCharges":'+JSON.stringify(t1)+'}}}','response')    
      if(PeService.flag == 'Y'){     
      var setData = await this.redisService.getJsonData(key + pfjson[i].nodeName + '.config');     
      await this.redisService.setJsonData(key+PeService.upid+':NPC:'+pfjson[i].nodeName+'.PRO',setData)  
      } 
      var deci = {};
      deci['nodeName']=pfjson[i].nodeName;
      deci['request'] = JSON.parse(customRequest) 
      deci['response'] =  JSON.parse(setData)           
      await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, JSON.stringify(deci)); 
        nodeid = pfjson[i].routeArray[0].nodeId;    
              
      this.logger.log("custom code execution completed")    
      }
   
      // redisProvider
      if (nodeid == pfjson[i].nodeId && pfjson[i].nodeType == 'redisProvider' && pfjson[i].nodeName != 'Start' && pfjson[i].nodeName != 'End') {
       
        this.logger.log("Redis Provider Node execution started")     
       
        node_name=pfjson[i].nodeName;
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj);
        var deci = {};
        deci['nodeName']=pfjson[i].nodeName;        
        
        await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, JSON.stringify(deci)); 
        let obj3;
        for(var l = 1; l < arr.length-1; l++){
          if(arr[l].nodetype == 'apiNode'){         
          nodeConfig = await this.redisService.getJsonDataWithPath(key+arr[l].nodename+'.config', '.execution.pro.response.responseData.data')
          requestConfig = await this.redisService.getJsonDataWithPath(key+arr[l].nodename+'.config', '.execution.pro.request.data')
         
           if(nodeConfig != undefined){
            if(obj3 != undefined){
            obj3 = Object.assign(obj3,JSON.parse(nodeConfig))
            }
            else{
              obj3 = Object.assign(JSON.parse(nodeConfig))
            }
          }  
          if(requestConfig != undefined){
            if(obj3 != undefined){
            obj3 = Object.assign(obj3,JSON.parse(requestConfig))
            }
            else{
              obj3 = Object.assign(JSON.parse(nodeConfig))
            }
          }
          }
          else if(arr[l].nodetype == 'customNode' ){           
            customConf = await this.redisService.getJsonDataWithPath(key+arr[l].nodename+'.config', '.response.responseData.data')                                
                    
          if(customConf != undefined){
            if(obj3 != undefined){
              obj3 = Object.assign(obj3,JSON.parse(customConf))
            }
            else{
              obj3 = Object.assign(JSON.parse(nodeConfig))
            }
          }
          }         
          
        }    
        await this.redisService.setStreamData(key+ pfjson[i].nodeName, 'emailData', (obj3)); 
        
        nodeid = pfjson[i].routeArray[0].nodeId; 
        this.logger.log("Redis Provider Node execution completed")       
      }

      // rdisConsumer

      if (nodeid == pfjson[i].nodeId && pfjson[i].nodeType == 'redisConsumer' && pfjson[i].nodeName != 'Start' && pfjson[i].nodeName != 'End') {
       
        this.logger.log("Redis Consumer Node execution started")  
        node_name=pfjson[i].nodeName;
     
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj); 
        var streamdata;             

      var config = await this.redisService.getJsonData( key+pfjson[i].nodeName+'.config')    
      await this.redisService.setStreamData(key+pfjson[i].nodeName, 'CallCB', config);
       var str:any = await this.redisService.getStreamDatawithCount(1,key+pfjson[i].nodeName);             
         str.forEach(([message, value]) => { 
           value.forEach(([message, value1]) => {        
            streamdata = value1;
         });
       });      
     
      var responsedata = JSON.parse(streamdata[1]).execution.pro.url 
      const data = await this.apiCall(responsedata,key,pfjson[i].nodeName)    
          
           if(data != true){            
            await this.redisService.setJsonData(key+pfjson[i].nodeName+'.config', '{"statusCode":"'+200+'","status":"SUCCESS","responseData":{"data":'+JSON.stringify(data)+'}}','execution.pro.response')
           }

           if(PeService.flag == 'Y'){            
            var setData = await this.redisService.getJsonDataWithPath(key + pfjson[i].nodeName + '.config','.execution.pro');
            await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson[i].nodeName +'.PRO',setData) 
                    
    
            // IPC set
              if(pfjson.ipcFlag){
                if(pfjson.ipcFlag != 'N'){                       
               
                await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson[i].ipcFlag +':'+ pfjson[i].nodeName +'.PRO',setData)}
              }
            }
            var deci = {}            
            var req = await this.redisService.getJsonDataWithPath(key+pfjson[i].nodeName+'.config','.execution.pro.request') 
            var setData = await this.redisService.getJsonDataWithPath(key + pfjson[i].nodeName + '.config','.execution.pro.response'); 
            deci['nodeName']=pfjson[i].nodeName;
            deci['request'] =  JSON.parse(req)
            deci['response'] =  JSON.parse(setData)            
            await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, JSON.stringify(deci)); 
          nodeid = pfjson[i].routeArray[0].nodeId;                
          
        this.logger.log("Redis Consumer Node execution completed")       
      }

       // Api Node
       if (nodeid == pfjson[i].nodeId && pfjson[i].nodeType == 'apiNode' && pfjson[i].nodeName != 'Start' && pfjson[i].nodeName != 'End') {
       
        this.logger.log("Api Node execution started")     
        node_name=pfjson[i].nodeName;
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj);          
      
          await this.nodePreProcessor(key,pfjson[i])
          await this.nodeProcessor(key,pfjson[i],input)
          await this.nodePostProcessor(key,pfjson[i])
         
        nodeid = pfjson[i].routeArray[0].nodeId; 
       
        this.logger.log("Api Node execution completed")      

      }
        
      // End Node
          
       if (pfjson[i].nodeName == 'End'){
        var obj = {};
        obj['nodeid'] = pfjson[i].nodeId;
        obj['nodename'] = pfjson[i].nodeName;
        obj['nodetype'] = pfjson[i].nodeType;
        arr.push(obj);
       break;
      }
      } 

    console.log(arr)

    await this.redisService.setJsonData(key+'response',JSON.stringify(arr))
    return arr
    }catch(error){
      var errobj ={}
      errobj['nodename'] =  node_name;
      errobj['error'] = error;
      await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson[i].nodeName,JSON.stringify(error))
      await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, errobj);
      throw error; 
    }
   
}

  // -----------------------------NodePreProcessor--------------------------------------

  async nodePreProcessor(key,pfjson){
    this.logger.log('Node PreProcessor started!');  
    try{
    if(PeService.flag == 'Y'){
    // Execute Pre Processing data
    if(pfjson.npcPREFlag){  // set npc
      if(pfjson.npcPREFlag == 'Y'){  
        var setData = await this.redisService.getJsonDataWithPath(key + pfjson.nodeName + '.config','.execution.pre'); 
        await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson.nodeName +'.PRE',setData) 
        await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, setData); 
        if(pfjson.ipcFlag){ // set ipc
          if(pfjson.ipcFlag != 'N'){             
            await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson.ipcFlag +':'+ pfjson.nodeName +'.PRE',setData)
          }
        }
      }
    }
  }
  }catch(error){
    var errobj ={}
    errobj['nodename'] = pfjson.nodeName
    errobj['error'] = error;        
   await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson.nodeName,JSON.stringify(error)) 
   await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, pfjson.nodeName);
   await this.redisService.setStreamData('TPEerrorlogs', key+PeService.upid, errobj);  
  }
  }

  // --------------------------------NodeProcessor--------------------------------------

  async nodeProcessor(key,pfjson,input){
    
    this.logger.log('Node Processor started!');      
      try{          
           await this.redisService.setJsonData(key+pfjson.nodeName+'.config',JSON.stringify(JSON.parse(input)+pfjson.nodeName),'execution.pro.url')             

           // execute Api call   
                   
          const data = await this.apiCall(JSON.parse(input)+pfjson.nodeName,key,pfjson.nodeName) 
          if(typeof(data) == 'string')   {
            var object = {}
            object[pfjson.nodeName + ' result'] = data
           }  
           else {
            object = data
           }    
           if(data != true){          
            await this.redisService.setJsonData(key+pfjson.nodeName+'.config', '{"statusCode":"'+200+'","status":"SUCCESS","responseData":{"data":'+JSON.stringify(object)+'}}','execution.pro.response') 
          }
       
    
       if(PeService.flag == 'Y'){        
        var setData = await this.redisService.getJsonDataWithPath(key + pfjson.nodeName + '.config','.execution.pro'); 
        await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson.nodeName +'.PRO',setData) 
        
               

        // IPC set
          if(pfjson.ipcFlag){
            if(pfjson.ipcFlag != 'N'){                    
            await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson.ipcFlag +':'+ pfjson.nodeName +'.PRO',setData)     
          }
          }
        }       
        var req = await this.redisService.getJsonDataWithPath(key+pfjson.nodeName+'.config','.execution.pro.request')
        var setData = await this.redisService.getJsonDataWithPath(key + pfjson.nodeName + '.config','.execution.pro.response');       
        var deci = {};
      deci['nodeName']=pfjson.nodeName;
      deci['request'] =  JSON.parse(req)
      deci['response'] =  JSON.parse(setData)
     
      await this.redisService.setStreamData('TPEprocesslogs',  key+PeService.upid, JSON.stringify(deci)); 
      }catch(error){
        var errobj ={}
        errobj['nodename'] = pfjson.nodeName
        errobj['error'] = error;       
       await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson.nodeName,JSON.stringify(error))
       await this.redisService.setStreamData('TPEerrorlogs', key+PeService.upid, pfjson.nodeName);
       await this.redisService.setStreamData('TPEerrorlogs', key+PeService.upid, errobj); 
      
      }      
   }
  
   // -----------------------------NodePostProcessor--------------------------------------

  async nodePostProcessor(key,pfjson){
    this.logger.log('Node PostProcessor started!');
      try{ 
    if(PeService.flag == 'Y'){
    if (pfjson.npcPSTFlag){  // set npc
      if (pfjson.npcPSTFlag == 'Y'){      
        var setData = await this.redisService.getJsonDataWithPath(key + pfjson.nodeName + '.config','.execution.pst'); 
      
      await this.redisService.setJsonData(key+PeService.upid+':NPC:'+ pfjson.nodeName +'.PST',setData)
      await this.redisService.setStreamData('TPEprocesslogs', key+PeService.upid, setData);
      if(pfjson.ipcFlag){  // set ipc
      if(pfjson.ipcFlag != 'N')    
      await this.redisService.setJsonData(key+PeService.upid+':IPC:'+ pfjson.ipcFlag +':'+ pfjson.nodeName +'.PST',setData)  
      }
      }
     }
    }
    }catch(error){  
      var errobj ={}
      errobj['nodename'] = pfjson.nodeName
      errobj['error'] = error;        
    await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ pfjson.nodeName,JSON.stringify(error))    
    await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, pfjson.nodeName); 
    await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, errobj); 
    }
    
  }

// -----------------------------pfPostProcessor--------------------------------------

  async pfPostProcessor(key) {
    this.logger.log('Pf PostProcessor started!');

    // garbage clean
    var keys = await redis.keys(key+PeService.upid+':*');
    // loop 
    for(var k=0;k<keys.length;k++){     
       var response = await redis.call('EXPIRE',keys[k], 86400) //86400 secs = 1 day 'Datafabrics:TorusPOC:StreamTest:v2:cr5tw08ezv8jbt7173jg:NPC:Input.PST',
      }   
  }

  async apiCall(url,key, nodeName){
    this.logger.log("API Execution")
    try{
    const data =  await firstValueFrom(this.httpService.get(url)
    .pipe(map(response => response.data)),);
    return data;
       }
       catch(err){
        this.logger.log(err)
        var errobj ={}
        errobj['nodename'] = nodeName
        errobj['error'] = err;        
        await this.redisService.setJsonData(key+PeService.upid+':ERR:'+ nodeName,JSON.stringify(err))      
        await this.redisService.setStreamData('TPEerrorlogs',  key+PeService.upid, JSON.stringify(errobj));        
        return true
       }  
  }
 
  
  async setData(data){
      try{
        console.log(data.key)
        console.log(data.amount)
        console.log(data.amlCheck)
        console.log(data.role) 
        console.log(data.email)        
     
        await this.redisService.setJsonData( data.key+'AmountCheck.config',  JSON.stringify(data.amount),'request.data.amount',)
        await this.redisService.setJsonData( data.key+'AMLCheck.config', JSON.stringify(data.amlCheck),'request.data.amlCheck')
        await this.redisService.setJsonData( data.key+'RoleCheck.config', JSON.stringify(data.role), 'request.data.role')
        await this.redisService.setJsonData( data.key+'Input.config', JSON.stringify(data.amount), 'execution.pro.request.data.amount')
        await this.redisService.setJsonData( data.key+'Input.config', JSON.stringify(data.email), 'execution.pro.request.data.email') 
        return 'Success'
      }catch(err){
        throw new error //HttpExceptionFilter()    
      }
  }    
    
}


