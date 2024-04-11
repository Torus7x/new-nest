import { Engine } from "json-rules-engine";
import { getAccountInformation } from "./PE/data";


export class RuleEngine {

async start(wfarr: any, key: string, nName: string) {
    
    // Setup a new engine
  
   const engine = new Engine();

   if(wfarr.conditionOperator.selectedValue)
     var condoperator = wfarr.conditionOperator.selectedValue
   else
     condoperator = wfarr.conditionOperator

   // setup the result
   var eventResult = {
     nodeId: wfarr.nodeId,
     result: wfarr.conditionResult,
   };
   // set the rule params dynamiccaly
   engine.addRule({
     conditions: {
       any: [
         {
           fact: nName,
           operator: condoperator,
           value: wfarr.conditionValue,
           path: '$.' + wfarr.conditionParams,
         },
       ],
     },
     event: {
       // define the event to fire 
       type: 'amountcheck',
       params: {
         message: eventResult,
       },
     },
   });

   engine.addFact(nName, (params, almanac) => {
     // get the value for evaluate the rule
     return almanac.factValue('drName').then((drName:any) => {
       return getAccountInformation(drName, key, wfarr.conditionParams);
     });
   });

   const facts = { drName: nName };    
   // Run the engine
   const { events } = await engine.run(facts);    
   // return the result
   return events.map((event) => event.params.message);
 }
}