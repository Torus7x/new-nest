import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../../redisService';

import {
  tenant_details,
  roles,
  app_pfd_path,
  read_only,
  developer,
  admin,
  user_type,
  save_options,
  workflow_controlpolicy,
  config_controlpolicy,
  workflow_colorpolicy,
  config_colorpolicy,
  propertyWindow,
} from '../../../packages/VPT/nest/utils/environment';
import { error } from 'console';

@Injectable()
export class UfSldService {
  constructor(private readonly redisService: RedisService) {}
  async getJson(
    applicationName,
    version,
    processFlow,
    tenant,
    appGroup,
    app,
  ): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const application = await JSON.parse(res);
      console.log('🚀 ~ AppService ~ application:', application);
      let applicationDetails = {};

      applicationDetails =
        application[tenant][appGroup][app][applicationName][processFlow][
          version
        ];

      return { workflow: { ...applicationDetails } };
    } catch (error) {
      throw error;
    }
  }

  async deleteApplication(
    applicationName: any,
    tenant: any,
    appGroup,
    app,
  ): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const application = await JSON.parse(res);
      console.log('application --->', application);
      if (application[tenant][appGroup][app][applicationName]) {
        delete application[tenant][appGroup][app][applicationName];
        await this.writeReddis(tenant, application);

        return { msg: 'Successfully Deleted', code: 200 };
      }
      return { msg: 'Application Not Found', code: 400 };
    } catch (error) {
      throw error;
    }
  }

  async getApplicationList(tenant, appGroup, app): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const applications = await JSON.parse(res);
      console.log(applications, 'appllllll');
      const response = [];
      if (
        applications &&
        applications.hasOwnProperty(tenant) &&
        applications[tenant].hasOwnProperty(appGroup) &&
        applications[tenant][appGroup].hasOwnProperty(app) &&
        applications[tenant][appGroup][app] &&
        typeof applications === 'object' &&
        Object.keys(applications[tenant]?.[appGroup]?.[app]).length
      ) {
        const applicationName = Object.keys(
          applications[tenant][appGroup][app],
        );

        if (applicationName) {
          for (let application of applicationName) {
            const processFlowName = Object.keys(
              applications[tenant][appGroup][app][application],
            );
            const processFlowDetails = [];
            for (const processFlow of processFlowName) {
              const version = Object.keys(
                applications[tenant][appGroup][app][application][processFlow],
              );

              processFlowDetails.push({
                processFlow: processFlow,
                version: version,
              });
            }
            response.push({
              application: application,
              processFlow: processFlowDetails,
            });
          }
        }
      } else {
      }
      console.table(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getFabrics(tenant, appGroup): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const applications = await JSON.parse(res);
      console.log(applications, 'appllllll');
      const response = [];
      if (
        applications &&
        applications.hasOwnProperty(tenant) &&
        applications[tenant].hasOwnProperty(appGroup) &&
        typeof applications === 'object'
      ) {
        const fabricsList = Object.keys(applications[tenant][appGroup]);

        if (fabricsList) {
          for (let fabrics of fabricsList) {
            const processFlowName = Object.keys(
              applications[tenant][appGroup][fabrics],
            );
            const processFlowDetails = [];
            for (const processFlow of processFlowName) {
              processFlowDetails.push(processFlow);
            }
            response.push({
              fabrics: fabrics,
              applications: processFlowDetails,
            });
          }
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getFlowList(tenant, appGroup, app, applicationName): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const applications = await JSON.parse(res);
      if (
        applications &&
        applications.hasOwnProperty(tenant) &&
        applications[tenant].hasOwnProperty(appGroup) &&
        applications[tenant][appGroup].hasOwnProperty(app) &&
        applications[tenant][appGroup][app].hasOwnProperty(applicationName) &&
        applications[tenant][appGroup][app][applicationName] &&
        typeof applications === 'object' &&
        Object.keys(applications[tenant]?.[appGroup]?.[app]?.[applicationName])
          .length
      ) {
        const processFlowName = Object.keys(
          applications[tenant][appGroup][app][applicationName],
        );

        const processFlowDetails = [];
        for (const processFlow of processFlowName) {
          const version = Object.keys(
            applications[tenant][appGroup][app][applicationName][processFlow],
          );

          processFlowDetails.push({
            artiFactsList: processFlow,
            version: version,
          });
        }
        console.log(processFlowDetails, 'pgdetails');
        return processFlowDetails;
      }
      throw new BadRequestException('Application Not Found');
    } catch (error) {
      throw error;
    }
  }
  async getRedisAll(tenants) {
    let newObj = {};
    for (let index = 0; index < tenants.length; index++) {
      const element = tenants[index];
      const res = await this.readReddis(element);
      console.log('🚀 ~ AppService ~ getRedisAll ~ res:', res);
      let tenantJson: any = await JSON.parse(res);
      console.log(tenantJson, 'tenantJsontenantJsontenantJson');
      if (tenantJson && Object.keys(tenantJson).length > 0) {
        newObj = { ...newObj, ...tenantJson };
        console.log(tenantJson, 'hjhjhjhgh');
      }
    }

    return newObj;
  }

  // async getPathsAndCreateFolders(obj, currentPath = '', interator) {
  //   let paths = [];

  //   for (const key in obj) {
  //     if (obj.hasOwnProperty(key)) {
  //       const newPath = `${currentPath}/${key}`;
  //       paths.push(newPath);

  //       if (typeof obj[key] === 'object' && obj[key] !== null) {
  //         if (interator <= 6) {
  //           if (interator === 1 && fs.existsSync(`./${newPath}`)) {
  //             await fs.rmSync(`./${newPath}`, {
  //               recursive: true,
  //               force: true,
  //             });
  //           }
  //           fs.mkdirSync(`./${newPath}`);
  //           paths = paths.concat(
  //             await this.getPathsAndCreateFolders(
  //               obj[key],
  //               newPath,
  //               interator + 1,
  //             ),
  //           );
  //         } else {
  //           fs.writeFileSync(`./${newPath}.json`, JSON.stringify(obj[key]));
  //         }
  //       } else if (typeof obj[key] === 'string' && obj[key] !== null) {
  //         fs.writeFileSync(`./${newPath}.txt`, obj[key]);
  //       }
  //     }
  //   }
  //   return paths;
  // }

  async createRedisFiles(obj, currentPath = '', interator) {
    let path = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newPath = `${currentPath}:${key}`;
        path.push(newPath);

        if (typeof obj[key] == 'object' && obj[key] !== null) {
          if (interator <= 6) {
            path = path.concat(
              await this.createRedisFiles(obj[key], newPath, interator + 1),
            );
          } else {
            let arr = newPath.split(':');
            arr.shift();
            const kes = arr.join(':');
            console.log(kes, 'key');
            // await redis.call('JSON.SET', kes, '$', JSON.stringify(obj[key]));
          }
        }
      }
    }
  }

  // async syncToFolder(tenant: any): Promise<any> {
  //   let ten = save_options;

  //   let arr = [];
  //   ten.map((t) => {
  //     arr.push(t.tenant);
  //   });

  //   const tenants = [...arr];
  //   console.log(tenants, 'tenants');
  //   let tenantObjects = await this.getRedisAll(tenants);
  //   console.log('tenantObjects-->', tenantObjects);
  //   if (tenantObjects && Object.keys(tenantObjects).length) {
  //     let keys: any = await this.getPathsAndCreateFolders(tenantObjects, '', 1);
  //     console.log(keys, 'klklklkl');
  //     return tenantObjects;
  //   }
  // }

  async saveaWorkFlow(
    req: any,
    type: string,
    version: any,
    tenant: string,
    appGroup: string,
    app: string,
  ): Promise<any> {
    try {
      let updateResult = {};
      let result = {};

      result = {
        UFdata: req.UFflow,
      };
      updateResult = {
        UFdata: req.UFflow,
      };

      if (type === 'create') {
        const res = await this.readReddis(tenant);
        const applications: object = await JSON.parse(res);

        if (
          applications &&
          applications.hasOwnProperty(tenant) &&
          applications[tenant].hasOwnProperty(appGroup) &&
          applications[tenant][appGroup].hasOwnProperty(app) &&
          typeof applications === 'object' &&
          Object.keys(applications[tenant][appGroup][app]).length
        ) {
          const application = { ...applications };
          if (
            application[tenant][appGroup][app].hasOwnProperty(
              req.applicationName,
            )
          ) {
            if (
              application[tenant][appGroup][app][
                req.applicationName
              ].hasOwnProperty(req.processFlow)
            ) {
              const version = `v${
                Object.keys(
                  applications[tenant][appGroup][app][req.applicationName][
                    req.processFlow
                  ],
                ).length + 1
              }`;
              applications[tenant][appGroup][app][req.applicationName][
                req.processFlow
              ] = {
                ...applications[tenant][appGroup][app][req.applicationName][
                  req.processFlow
                ],
                [version]: {
                  ...result,
                },
              };
            } else {
              applications[tenant][appGroup][app][req.applicationName] = {
                ...applications[tenant][appGroup][app][req.applicationName],
                [req.processFlow]: {
                  v1: {
                    ...result,
                  },
                },
              };
            }
            console.log(
              'application exists-->',
              JSON.stringify(application),
              tenant,
            );
            await this.writeReddis(tenant, application);
            const versions = Object.keys(
              application[tenant][appGroup][app][req.applicationName][
                req.processFlow
              ],
            );

            const appw = structuredClone(application);

            await this.createRedisFiles(appw, '', 1);
            return {
              msg: 'New Application Created',
              versions: versions,
              code: 200,
            };
          } else {
            const version = `v1`;
            applications[tenant][appGroup][app][req.applicationName] = {
              ...applications[tenant][appGroup][app][req.applicationName],
              [req.processFlow]: {
                [version]: {
                  ...result,
                },
              },
            };
            console.log(
              'application exists-->',
              JSON.stringify(application),
              tenant,
            );
            await this.writeReddis(tenant, application);

            const versions = Object.keys(
              application[tenant][appGroup][app][req.applicationName][
                req.processFlow
              ],
            );

            const appw = structuredClone(application);

            await this.createRedisFiles(appw, '', 1);

            return {
              msg: 'New Version Created',
              versions: versions,
              code: 200,
            };
          }
        } else {
          const res = await this.readReddis(tenant);
          let application = { ...(await JSON.parse(res)) };

          console.log(
            application,
            'outside',
            tenant,
            appGroup,
            app,
            req.applicationName,
            req.processFlow,
          );
          let appl = structuredClone(application);
          const version = `v1`;
          if (!appl.hasOwnProperty(tenant)) {
            appl = {
              ...appl,
              [tenant]: {},
            };
          }
          if (!appl[tenant].hasOwnProperty(appGroup)) {
            appl[tenant] = { ...appl[tenant], [appGroup]: {} };
          }
          if (!appl[tenant][appGroup].hasOwnProperty(app)) {
            appl[tenant][appGroup] = {
              ...appl[tenant][appGroup],
              [app]: {},
            };
          }

          appl[tenant][appGroup][app] = {
            [req.applicationName]: {
              [req.processFlow]: {
                [version]: {
                  ...result,
                },
              },
            },
          };

          console.log('application created-->', appl, tenant);
          await this.writeReddis(tenant, appl);
          const appw = structuredClone(appl);

          await this.createRedisFiles(appw, '', 1);
          const versions = Object.keys(
            appl[tenant][appGroup][app][req.applicationName][req.processFlow],
          );
          return {
            msg: 'New Application Created',
            versions: versions,
            code: 200,
          };
        }
      }

      if (type === 'update') {
        const res = await this.readReddis(tenant);
        const applications: any = await JSON.parse(res);
        console.log('redis-->', JSON.stringify(applications), tenant);
        const application = { ...applications };

        applications[tenant][appGroup][app][req.applicationName][
          req.processFlow
        ] = {
          ...applications[tenant][appGroup][app][req.applicationName][
            req.processFlow
          ],
          [version]: {
            ...applications[tenant][appGroup][app][req.applicationName][
              req.processFlow
            ][version],
            ...updateResult,
          },
        };
        console.log(
          'application exists-->',
          JSON.stringify(application),
          tenant,
        );
        await this.writeReddis(tenant, application);
        const appw = structuredClone(application);

        await this.createRedisFiles(appw, '', 1);

        return { msg: `${version} Updated`, code: 201 };
      }
    } catch (error) {
      return error;
    }
  }

  async tenantDetails() {
    try {
      const saveOptions = save_options;
      return {
        code: 200,

        saveOptions: saveOptions,
      };
    } catch (error) {
      throw error;
    }
  }

  async controlpolicy(nodeType: any) {
    try {
      const configControlpolicy = config_controlpolicy;
      const workflowControlpolicy = workflow_controlpolicy;
      const configColorpolicy = config_colorpolicy;
      const workflowColorpolicy = workflow_colorpolicy;

      return {
        configControlpolicy: configControlpolicy[`${nodeType}`],
        workflowControlpolicy: workflowControlpolicy[`${nodeType}`],
        configColorpolicy: configColorpolicy[`${nodeType}`],
        workflowColorpolicy: workflowColorpolicy[`${nodeType}`],
        code: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async getpropertywindow(node) {
    try {
      const property = propertyWindow.find((item) => item.node === node);
      if (property) {
        return {
          propertyType: property.PropertyType,
          code: 200,
        };
      } else {
        return {
          message: 'Node not found',
          code: 404,
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async getUserRoleDetails(roleId) {
    try {
      const READ_ONLY = read_only;
      const ADMIN = admin;
      const DEVELOPER = developer;
      let response = null;
      switch (roleId) {
        case READ_ONLY:
          response = { statusCode: 200, roleType: 'READ_ONLY' };
          break;
        case ADMIN:
          response = { statusCode: 200, roleType: 'ADMIN' };
          break;
        case DEVELOPER:
          response = { statusCode: 200, roleType: 'DEVELOPER' };
          break;
        default:
          response = { statusCode: 400, roleType: null };
          break;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // createVersionFolder(req, version) {
  //   console.log('createVersionFolder');
  //   fs.mkdirSync(
  //     `${app_pfd_path}/${req.applicationName}/${req.processFlow}/v${version}`,
  //     (err) => {
  //       // console.log(err);
  //     },
  //   );
  //   console.log('createVersionFolder-END');
  // }
  // createWorkFlow(req, folderVersion) {
  //   console.log('createWorkFlow');
  //   try {
  //     fs.writeFileSync(
  //       `${app_pfd_path}/${req.applicationName}/${req.processFlow}/v${folderVersion}/processflow.json`,
  //       JSON.stringify(req.workFlow),
  //     );
  //   } catch (error) {
  //     return error;
  //   }
  //   console.log('createWorkFlow-END');
  // }
  // createConfiqureFile(req, folderVersion) {
  //   try {
  //     const keys = Object.keys(req.configuration);
  //     for (let configure of keys) {
  //       fs.writeFileSync(
  //         `${app_pfd_path}/${req.applicationName}/${req.processFlow}/v${folderVersion}/${configure}.json`,
  //         JSON.stringify(req.configuration[configure]),
  //       );
  //     }
  //   } catch (error) {
  //     return error;
  //   }
  // }

  applicationDetails() {
    try {
      return { roleType: user_type, role: roles };
    } catch (error) {
      throw error;
    }
  }

  async readReddis(tenant): Promise<any> {
    return await this.redisService.getJsonData(tenant);
  }

  async writeReddis(key, json): Promise<any> {
    await this.redisService.setJsonData(key, JSON.stringify(json));
  }

  // async getRedis(tenant) {
  //   const js = await redis.call('JSON.GET', tenant);

  //   return js;
  // }
}
