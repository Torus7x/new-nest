import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config'; 

import { CG_CommonService } from 'src/cg-common/cg-common.service';
import { RedisService } from 'src/redisService';

let nodeArray =[];
let credArray =[];


@Injectable()
export class CG_N8nService {
    constructor(private readonly CommonService: CG_CommonService,
        private readonly redisService: RedisService
        ) {}


async generateApiforn8n(key: any): Promise<any> {
    try{
    var input = await this.redisService.getJsonData(key);
    var relarr = [];
    var jdata = JSON.parse(input);
        
    // console.log(jdata);
    var table = jdata.Entities;
    } catch (error) {
    throw new BadRequestException("Key Not Found for node detail");
    }
    

    /*-----------------------Create Basic Files ----------------------------------------------*/
    let app_name: any = path.join(__dirname,'..', 'N8N');
    await this.CommonService.createFolder(app_name);
    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/CODE_OF_CONDUCT.ejs',
        'Torus_App',
        '',
        app_name + '/CODE_OF_CONDUCT.md',
    );
    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/gulpfile.ejs',
        'Torus_App',
        '',
        app_name + '/gulpfile.js',
    );
    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/index.ejs',
        'Torus_App',
        '',
        app_name + '/index.js',
    );
    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/LICENSE.ejs',
        'Torus_App',
        '',
        app_name + '/LICENSE.md',
    );

    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/package-lock.ejs',
        'Torus_App',
        '',
        app_name + '/package-lock.json',
    );
    
    await this.CommonService.createFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/README_TEMPLATE.ejs',
        '',
        app_name + '/README_TEMPLATE.md',
    );
    await this.CommonService.createFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/README.ejs',
        '',
        app_name + '/README.md',
    );
    await this.CommonService.createFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/tsconfig.ejs',
        '',
        app_name + '/tsconfig.json',
    );
    await this.CommonService.createFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/tslint.ejs',
        '',
        app_name + '/tslint.json',
    );


    /*-----------------------------------Create Node.ts Files ----------------------*/

    
    let nodeNameinPascal = this.toPascalCase(jdata.nodeDetails[0].name)
    
    let app_template_nodes_path: any = path.join(app_name, 'nodes');
    await this.CommonService.createFolder(app_template_nodes_path);


    let app_template_credentials_path: any = path.join(app_name, 'credentials');
    await this.CommonService.createFolder(app_template_credentials_path);

    let app_template_node_path: any = path.join(app_template_nodes_path, jdata.nodeDetails[0].displayName);
    app_template_node_path = app_template_node_path.replace(/ /g, "");
    await this.CommonService.createFolder(app_template_node_path);

    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/node.ejs',
        jdata,
        nodeNameinPascal,
        app_template_node_path + '/'+nodeNameinPascal+'.node.ts',
    );
    
        
    /*------------------------------Create Credential for Node Files----------------------- */
    try{
    var credKey = nodeNameinPascal+'Cred';    
    var CredentialJson = await this.redisService.getJsonData(credKey);
        
    var credentialJdata = JSON.parse(CredentialJson);

        await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/credential.ejs',
        credentialJdata,
        nodeNameinPascal,
        app_template_credentials_path +
            '/' +
            nodeNameinPascal +
            'CredentialsApi.credentials.ts',
        );
    
    } catch (error) {
        throw new NotFoundException("Key Not Found for Credential");
        }   

    /*------------------------------Create JSON files for Node Files----------------------- */
    var nodeJsonKey = nodeNameinPascal+'Json';    
    var nodeJson = await this.redisService.getJsonData(nodeJsonKey);

    if(nodeJson == null){
    throw new NotFoundException("Key Not Found for Node's Json");
    }else{
    var str = JSON.parse(nodeJson);
    str = JSON.stringify(str,null, 2);
    
    var nodeJsonName = this.toPascalCase(jdata.nodeDetails[0].name);
    const paths = app_template_node_path + '/' + nodeJsonName + '.json';
    // console.log(CredentialJson);
    // let strJson = JSON.stringify(str);
    fs.writeFileSync(paths, str);
    }

    /*-----------------------------------Package.json ----------------------------------*/

    nodeArray.push(`dist/nodes/${nodeNameinPascal}/${nodeNameinPascal}.node.js`);
    credArray.push(`dist/credentials/${nodeNameinPascal}Api.credentials.js`);

    await this.CommonService.CreateSchemaFile(
        './src/cg-AppTemplate/n8nCodeGenerationEjs/package.ejs',
        nodeArray,
        credArray,
        app_name + '/package.json',
    );

    return `${nodeNameinPascal} has been created successfully`;
    }

    

    toPascalCase(inputString) {
    return inputString.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toUpperCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
    }


}
