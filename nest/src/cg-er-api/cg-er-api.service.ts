import { Injectable } from '@nestjs/common';
import * as path from 'path';
import 'dotenv/config';
import { CG_CommonService } from 'src/cg-common/cg-common.service';
import { RedisService } from 'src/redisService';

@Injectable()
export class CG_APIService {
  constructor(
    private readonly CommonService: CG_CommonService,
    private readonly redisService: RedisService,
  ) {}

  async generateApi(
    key: string,
    tenantName: string,
    appGroupName: string,
    appName: string,
  ): Promise<any> {
    let tenant_path = path.dirname(
      path.dirname(path.dirname(path.dirname(__dirname))),
    );
    let tenant_path_name = path.join(tenant_path, tenantName);
    let app_group_path_name = path.join(tenant_path_name, appGroupName);
    let app_name = path.join(app_group_path_name, appName);

    await this.CommonService.createFolder(tenant_path_name);
    await this.CommonService.createFolder(app_group_path_name);
    await this.CommonService.createFolder(app_name);

    let input: string = await this.redisService.getJsonData(key);
    let jdata: any = structuredClone(JSON.parse(input));
    let reldata = jdata.flatMap((item) => item.relationships);
    let table = jdata;
    let relArray = [];
    for (let i = 0; i < reldata.length; i++) {
      interface obj {
        sEntity: string;
        tEntity: string;
        sColumn: string;
        tColumn: string;
        Relationship: string;
      }

      let obj: obj = {
        sEntity: 'string',
        tEntity: 'string',
        sColumn: 'string',
        tColumn: 'string',
        Relationship: 'string',
      };
      let Entities = reldata[i].Entities.split(',');
      obj.sEntity = Entities[0];
      obj.tEntity = Entities[1];
      let Column = reldata[i].Coloumn.split(',');
      obj.sColumn = Column[0];
      obj.tColumn = Column[1];
      obj.Relationship = reldata[i].Relationship;
      relArray.push(obj);
    }

    /*--------------------- Create Prisma related files   ----------------------------------*/

    let app_template_prisma_path: any = path.join(app_name, 'prisma');
    await this.CommonService.createFolder(app_template_prisma_path);

    let app_template_prismaSchema_path: any = path.join(
      app_template_prisma_path,
      'schema.prisma',
    );

    await this.CommonService.CreateSchemaFile(
      './src/cg-AppTemplate/cg-er-api/prisma.ejs',
      jdata,
      relArray,
      app_template_prismaSchema_path,
    );

    /*--------------------- Create Torus_App and Base files   ----------------------------------*/

    await this.CommonService.createFolder(app_name);
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/env.ejs',
      '',
      app_name + '/.env',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/.eslintrc.ejs',
      '',
      app_name + '/.eslintrc.js',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/gitignore.ejs',
      '',
      app_name + '/.gitignore',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/prettierrc.ejs',
      '',
      app_name + '/.prettierrc',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/nest-cli.ejs',
      '',
      app_name + '/nest-cli.json',
    );
    await this.CommonService.CreateSchemaFile(
      './src/cg-AppTemplate/cg-er-api/package-lock.ejs',
      appName,
      '',
      app_name + '/package-lock.json',
    );
    await this.CommonService.CreateSchemaFile(
      './src/cg-AppTemplate/cg-er-api/package.ejs',
      appName,
      '',
      app_name + '/package.json',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/README.ejs',
      '',
      app_name + '/README.md',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/tsconfig.build.ejs',
      '',
      app_name + '/tsconfig.build.json',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/tsconfig.ejs',
      '',
      app_name + '/tsconfig.json',
    );

    /*--------------------- Create Casl related files   ----------------------------------*/

    let AppTemplateCaslPath: any = path.join(app_name, 'src/ability');
    await this.CommonService.createFolder(AppTemplateCaslPath);

    let userMatrixJson = await this.redisService.getJsonData(
      'GSS:ADF:TorusPOC:userMatrix',
    );
    userMatrixJson = JSON.parse(userMatrixJson);

    let userMatrixJdata = {
      jdata: [...jdata],
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
                  userName: 'string',
                  tenantName: 'string',
                  appGroupName: 'string',
                  appName: 'string',
                  roleName: 'string',
                  resource: 'string',
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
                  ].resource.startsWith('DF')
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
                    const [Fabric, type, tablename] = parts.split(':');
                    obj.resource = tablename;
                    obj.can.push(
                      userMatrixJson.users[i].tenantDetails[j].appGroupDetails[
                        k
                      ].appDetails[l].rolePolicyDetails[m].policy.Statement[n]
                        .actionAllowed[o].action,
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
                        .actionDenied[p].action,
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
      './src/cg-AppTemplate/cg-er-api/ability.factory.ejs',
      userMatrixJdata,
      userMatrix,
      AppTemplateCaslPath + '/ability.factory.ts',
    );

    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/ability.module.ejs',
      '',
      AppTemplateCaslPath + '/ability.module.ts',
    );

    await this.CommonService.CreateSchemaFile(
      './src/cg-AppTemplate/cg-er-api/ability.decorator.ejs',
      table,
      '',
      AppTemplateCaslPath + '/ability.decorator.ts',
    );

    await this.CommonService.CreateSchemaFile(
      './src/cg-AppTemplate/cg-er-api/ability.guard.ejs',
      '',
      '',
      AppTemplateCaslPath + '/ability.guard.ts',
    );

    /*--------------------- Create Main file   ----------------------------------*/

    let app_template_src_path: any = path.join(app_name, 'src');

    await this.CommonService.createFolder(app_template_src_path);
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/main.ejs',
      '',
      app_template_src_path + '/main.ts',
    );

    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/prisma.service.ejs',
      '',
      app_template_src_path + '/prisma.service.ts',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/jwt.service.ejs',
      '',
      app_template_src_path + '/jwt.service.ts',
    );

    let app_template_test_path: any = path.join(app_name, 'test');
    await this.CommonService.createFolder(app_template_test_path);
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/app.e2e-spec.ejs',
      '',
      app_template_test_path + '/app.e2e-spec.ts',
    );
    await this.CommonService.createFile(
      './src/cg-AppTemplate/cg-er-api/jest-e2e.ejs',
      '',
      app_template_test_path + '/jest-e2e.json',
    );
    await this.CreateDir(jdata, app_template_src_path);

    return 'Completed';
  }

  async CreateDir(strReadPath: JSON, path: String) {
    try {
      let jsondata: any = strReadPath;
      let tables: any = jsondata;

      /*--------------------- Create Entity files   ----------------------------------*/
      for (let i = 0; i < tables.length; i++) {
        let tabName: any = tables[i].Entity;
        await this.CommonService.createFolder(path + '/' + tabName);
        await this.CommonService.createFolder(
          path + '/' + tabName + '/' + 'entity',
        );
        let column: any = tables[i];
        let columnForEntity: any = tables[i].attributes;
        await this.CommonService.CreateSchemaFile(
          './src/cg-AppTemplate/cg-er-api/service.ejs',
          column,
          tabName,
          path + '/' + tabName + '/' + tabName + '.service.ts',
        );
        await this.CommonService.CreateSchemaFile(
          './src/cg-AppTemplate/cg-er-api/controller.ejs',
          column,
          tabName,
          path + '/' + tabName + '/' + tabName + '.controller.ts',
        );
        await this.CommonService.CreateSchemaFile(
          './src/cg-AppTemplate/cg-er-api/enitity.ejs',
          columnForEntity,
          tabName,
          path + '/' + tabName + '/' + 'entity' + '/' + tabName + '.entity.ts',
        );

        await this.CommonService.CreateSchemaFile(
          './src/cg-AppTemplate/cg-er-api/module.ejs',
          '',
          tabName,
          path + '/' + tabName + '/' + tabName + '.module.ts',
        );
        await this.CommonService.CreateSchemaFile(
          './src/cg-AppTemplate/cg-er-api/app.module.ejs',
          jsondata,
          '',
          path + '/' + 'app.module.ts',
        );
      }
      return await jsondata;
    } catch (error) {
      throw error;
    }
  }
}
