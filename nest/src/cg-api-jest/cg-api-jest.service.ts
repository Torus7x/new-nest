import { Injectable } from '@nestjs/common';
import * as path from 'path';
import 'dotenv/config';
import { CG_CommonService } from 'src/cg-common/cg-common.service';
import { RedisService } from 'src/redisService';


@Injectable()
export class CG_API_JestService {
    constructor(private readonly CommonService: CG_CommonService,
    private readonly redisService: RedisService
    ) {}
async generatecodefortesting(key: string): Promise<any> {
    let input: string = await this.redisService.getJsonData(key);
    let relarr: any = [];
    let jdata: any = JSON.parse(input);
    let table = jdata.Entities;
    let app_name: any = path.join(__dirname,'..', "Torus_App_Jest");
    let app_template_test_path: any = path.join(app_name, "test");
    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].columns.length; j++) {
        if (table[i].columns[j].relationship) {
            let obj = {};
            obj["parent"] = table[i].columns[j].relationship[0].parent;
            obj["table"] = table[i].tname;
            obj["option"] =
            table[i].columns[j].relationship[0].isOptional[0].flag;
            relarr.push(obj);
        }
        }
    }

    /*--------------------- Create Torus_App and Base files   ----------------------------------*/
    
    await this.CommonService.createFolder(app_name);
    await this.CommonService.createFile("./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/env.ejs", "", app_name + "/.env");
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/.eslintrc.ejs",
        "",
        app_name + "/.eslintrc.js"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/gitignore.ejs",
        "",
        app_name + "/.gitignore"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/prettierrc.ejs",
        "",
        app_name + "/.prettierrc"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/nest-cli.ejs",
        "",
        app_name + "/nest-cli.json"
    );
    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/package-lock.ejs",
        "Torus_App",
        "",
        app_name + "/package-lock.json"
    );
    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/package.ejs",
        "Torus_App",
        "",
        app_name + "/package.json"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/README.ejs",
        "",
        app_name + "/README.md"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/tsconfig.build.ejs",
        "",
        app_name + "/tsconfig.build.json"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/tsconfig.ejs",
        "",
        app_name + "/tsconfig.json"
    );

    /*--------------------- Create Prisma related files   ----------------------------------*/

    let app_template_prisma_path: any = path.join(app_name, "prisma");
    await this.CommonService.createFolder(app_template_prisma_path);

    let app_template_prismaSchema_path: any = path.join(
        app_template_prisma_path,
        "schema.prisma"
    );

    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/prisma.ejs",
        jdata,
        relarr,
        app_template_prismaSchema_path
    );

    /*--------------------- Create Casl related files   ----------------------------------*/

    let AppTemplateCaslPath: any = path.join(app_name, "src/ability");
    await this.CommonService.createFolder(AppTemplateCaslPath);

    let userMatrixJson = await this.redisService.getJsonData(
        "GSS:ADF:TorusPOC:userMatrix"
    );
    userMatrixJson = JSON.parse(userMatrixJson);

    let userMatrixJdata = {
        jdata: [...jdata.Entities],
        users: [...userMatrixJson.users],
    };

    let userMatrix = [];

    for (let i = 0; i < userMatrixJson.users.length; i++) {
        for (let j = 0; j < userMatrixJson.users[i].tenantDetails.length; j++) {
        for (
            let k = 0;
            k < userMatrixJson.users[i].tenantDetails[j].appGroupDetails.length;
            k++
        ) {
            for (
            let l = 0;
            l <
            userMatrixJson.users[i].tenantDetails[j].appGroupDetails[k]
                .appDetails.length;
            l++
            ) {
            for (
                let m = 0;
                m <
                userMatrixJson.users[i].tenantDetails[j].appGroupDetails[k]
                .appDetails[l].rolePolicyDetails.length;
                m++
            ) {
                for (
                let n = 0;
                n <
                userMatrixJson.users[i].tenantDetails[j].appGroupDetails[k]
                    .appDetails[l].rolePolicyDetails[m].policy.Statement.length;
                n++
                ) {
                interface obj {
                    userName: string;
                    tenantName: string;
                    appGroupName: string;
                    appName: string;
                    roleName: string;
                    resource: string;
                    can: Array<string>;
                    cannot: Array<string>;
                }

                let obj: obj = {
                    userName: "string",
                    tenantName: "string",
                    appGroupName: "string",
                    appName: "string",
                    roleName: "string",
                    resource: "string",
                    can: [],
                    cannot: [],
                };

                obj.userName = userMatrixJson.users[i].loginName;
                obj.tenantName =
                    userMatrixJson.users[i].tenantDetails[j].tenatName;
                obj.appGroupName =
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                    k
                    ].appGroupName;
                obj.appName =
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                    k
                    ].appDetails[l].appName;
                obj.roleName =
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                    k
                    ].appDetails[l].rolePolicyDetails[m].roleName;
                if (
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                    k
                    ].appDetails[l].rolePolicyDetails[m].policy.Statement[
                    n
                    ].resource.startsWith("DF")
                ) {
                    for (
                    let o = 0;
                    o <
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[k]
                        .appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .actionAllowed.length;
                    o++
                    ) {
                    const parts =
                        userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                        k
                        ].appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .resource;
                    const [Fabric, type, tablename] = parts.split(":");
                    obj.resource = tablename;
                    obj.can.push(
                        userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                        k
                        ].appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .actionAllowed[o].action
                    );
                    }
                    for (
                    let p = 0;
                    p <
                    userMatrixJson.users[i].tenantDetails[j].appGroupDetails[k]
                        .appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .actionDenied.length;
                    p++
                    ) {
                    obj.cannot.push(
                        userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                        k
                        ].appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .actionDenied[p].action
                    );
                    }
                    userMatrix.push(obj);
                }
                }
            }
            }
        }
        }
    }

    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/ability.factory.ejs",
        userMatrixJdata,
        userMatrix,
        AppTemplateCaslPath + "/ability.factory.ts"
    );

    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/ability.module.ejs",
        "",
        AppTemplateCaslPath + "/ability.module.ts"
    );

    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/ability.decorator.ejs",
        table,
        "",
        AppTemplateCaslPath + "/ability.decorator.ts"
    );

    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/ability.guard.ejs",
        "",
        "",
        AppTemplateCaslPath + "/ability.guard.ts"
    );

    /*--------------------- Create Main file   ----------------------------------*/

    let app_template_src_path: any = path.join(app_name, "src");

    await this.CommonService.createFolder(app_template_src_path);
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/main.ejs",
        "",
        app_template_src_path + "/main.ts"
    );
    /*--------------------- Create Prisma service   ----------------------------------*/
    let tableArray: string[] = [];
    for (let i = 0; i < jdata.Entities.length; i++) {
        let tableName: string = jdata.Entities[i].tname;
        tableArray.push(tableName);
    }

    await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/prisma.service.ejs",
        tableArray,
        "",
        app_template_src_path + "/prisma.service.ts"
    );

    
    await this.CommonService.createFolder(app_template_test_path);
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/app.e2e-spec.ejs",
        "",
        app_template_test_path + "/app.e2e-spec.ts"
    );
    await this.CommonService.createFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/jest-e2e.ejs",
        "",
        app_template_test_path + "/jest-e2e.json"
    );
    await this.CreateDir1(jdata, app_template_src_path);

    return 'Dynamically generated code successfully';
    }

    async CreateDir1(strReadPath: JSON, paths: any) {
    try {
        let jsondata: any = strReadPath;
        let tables: any = jsondata.Entities;
        let tablecount: any = tables.length;
        let app_name: any = path.join(__dirname,'..', "Torus_App_Jest");
        let app_template_test_path: any = path.join(app_name, "test");
        
        
    /*--------------------- Create Entity files   ----------------------------------*/
    let testPath: any = __dirname + "Torus_App" + "/" + "test";

    for (let i = 0; i < tablecount; i++) {
        let tabName: any = tables[i].tname;
        await this.CommonService.createFolder(paths + "/" + tabName);
        await this.CommonService.createFolder(paths + "/" + tabName + "/" + "entity");
        let column: any = tables[i].methods;

        let columnForEntity: any = tables[i].columns;
        await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/service.ejs",
        column,
        tabName,
        paths + "/" + tabName + "/" + tabName + ".service.ts"
        );

        await this.CommonService.CreateSchemaFile(
        "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/controller.ejs",
        column,
        tabName,
        paths + "/" + tabName + "/" + tabName + ".controller.ts"
        );
    /*--------------------- Preapare E2E   ----------------------------------*/
    let data = jsondata.Entities;

    function deleteOrder(data) {
    const visited = new Set();
    const stack = [];

    function dfs(node) {
        visited.add(node);

        for (const relationship of node.columns) {
        const childTable = data.find(
            (table) => table.tname === relationship.parent
        );
        if (childTable && !visited.has(childTable)) {
            dfs(childTable);
        }
        }

        stack.push(node);
    }

    for (const table of data) {
        if (!visited.has(table)) {
        dfs(table);
        }
    }

    return stack.reverse();
    }

    const deletionOrder = deleteOrder(data);
    let entityDeleteOrder = deletionOrder.map((table) => table.tname);

    await this.CommonService.CreateFileWithThreeParam(
    "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/e2e.spec.ejs",
    tables[i],
    tabName,
    jsondata,
    entityDeleteOrder,
    app_template_test_path +
        "/" +
        tabName +
        ".e2e-spec.ts"
    );
    await this.CommonService.CreateSchemaFile(
    "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/enitity.ejs",
    columnForEntity,
    tabName,
    paths + "/" + tabName + "/" + "entity" + "/" + tabName + ".entity.ts"
    );

    await this.CommonService.CreateSchemaFile(
    "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/module.ejs",
    "",
    tabName,
    paths + "/" + tabName + "/" + tabName + ".module.ts"
    );
    await this.CommonService.CreateSchemaFile(
    "./src/cg-AppTemplate/APIGenerationWithIAMJestEJS/app.module.ejs",
    jsondata.Entities,
    "",
    paths + "/" + "app.module.ts"
    );
}
return await jsondata;
} catch (error) {
throw error;
}
}

}
