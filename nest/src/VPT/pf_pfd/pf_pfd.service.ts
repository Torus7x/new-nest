import { BadRequestException, Injectable } from '@nestjs/common';

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
import { RedisService } from 'src/redisService';

@Injectable()
export class PfPfdService {
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
      if (appGroup === 'defaults') {
        applicationDetails = application[tenant];
      } else {
        applicationDetails =
          application[tenant][appGroup][app][applicationName][processFlow][
            version
          ];
      }
      const configuration = {};
      if (app === 'PF' && appGroup !== 'defaults') {
        for (let keys in applicationDetails) {
          if (keys !== 'processFlow') {
            configuration[keys] = applicationDetails[keys];
          }
        }
        console.log('configuration --->', configuration);
        console.log('applicationDetails --->', applicationDetails);
        return {
          workflow: { ...applicationDetails['processFlow'] },
          configuration: { ...configuration },
        };
      }
      if (app === 'DF' && appGroup !== 'defaults') {
        return { workflow: { ...applicationDetails } };
      }
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
      }
      console.table(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getappGroup(tenant): Promise<any> {
    try {
      const res = await this.readReddis(tenant);
      const application = await JSON.parse(res);
      const response = [];
      if (
        application &&
        application.hasOwnProperty(tenant) &&
        Object.keys(application[tenant]).length &&
        typeof application === 'object'
      ) {
        const appGroupList = Object.keys(application[tenant]);

        if (appGroupList) {
          for (let appGroup of appGroupList) {
            response.push(appGroup);
          }
        }
        return response;
      }
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
        applications[tenant][appGroup][app] &&
        applications[tenant][appGroup][app].hasOwnProperty(applicationName) &&
        typeof applications === 'object' &&
        Object.keys(applications[tenant]?.[appGroup]?.[app]).length
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


        return processFlowDetails;
      }
      throw new BadRequestException ('Application Not Found');
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
      if (app == 'PF') {
        let sd = null;
        let processflowapi = [];
        let processFlowSummary = [];
        let workFlows = structuredClone(req.workFlow);
        const nodes = structuredClone(req.workFlow.node);
        const edges = structuredClone(req.workFlow.edge);
        if (nodes.length > 0 && edges.length > 0) {
          processFlowSummary = this.findAllRoutesWithFormatAndDecision(
            nodes,
            edges,
          );
          sd = this.newCreatePrcessFlow(edges, nodes);
          processflowapi = this.sortProcessFlow(sd);
        }
        result = {
          processFlow: {
            ...workFlows,
            ProcessFlow: [...processflowapi],
          },

          processFlowSummary: [...processFlowSummary],
          ...req.configuration,
        };

        updateResult = {
          processFlow: {
            ...workFlows,
            ProcessFlow: [...processflowapi],
          },

          processFlowSummary: [...processFlowSummary],
          ...req.configuration,
        };
      }

      if (app == 'DF') {
        result = {
          ...req.ErFlow,
        };
        updateResult = {
          ...req.ErFlow,
        };
      }

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

  updateArrayWithLabel(array, edge) {
    return array.map((node, index) => {
      let i = index;
      if (index > 0) {
        index = index - 1;
      }
      const labelInfo = edge.find(
        (edg) => edg.source === node.sourceNode && edg.target === node.nodeId,
      );
      if (labelInfo && array[index].nodeId == labelInfo.source) {
        array[index].label = labelInfo.label;
      }
      return node;
    });
  }
  findAllRoutesWithFormatAndDecision(node, edges) {
    let nodes = structuredClone(node);
    let edge = structuredClone(edges);
    let adjacencyList = {};
    const updateLable = (routeArray) => {
      let childRoute = [...routeArray];
      routeArray.forEach((parent) => {
        if (parent?.source) {
          childRoute.map((child) => {
            if (parent.source == child.NodeId) {
              if (parent?.conditionResult) {
                child.conditionResult = parent.conditionResult;
                delete parent.conditionResult;
              }
            }
          });
        }
      });
      childRoute.forEach((e) => {
        delete e.source;
      });
      return childRoute;
    };
    function findAllRoutes(
      startNode,
      endNode,
      visited = new Set(),
      currentRoute = [],
      allRoutes = [],
    ) {
      visited.add(startNode);
      let getNode = nodes.find((node) => node.id == startNode);
      let nodeObj = {
        NodeId: startNode,
        NodeName: getNode.data.label,
        NodeType: getNode.type,
      };
      currentRoute.push(nodeObj);
      if (startNode === endNode) {
        let flowName = `flow${allRoutes.length + 1}`;
        allRoutes.push({ [flowName]: [...currentRoute] });
      } else if (adjacencyList[startNode]) {
        for (const neighbor of adjacencyList[startNode]) {
          if (!visited.has(neighbor)) {
            findAllRoutes(neighbor, endNode, visited, currentRoute, allRoutes);
          }
        }
      }
      visited.delete(startNode);
      currentRoute.pop();
    }

    const findAllRoutesWithFormatAndDecisionResults = (nodes, edges) => {
      const graph = {};
      edges.forEach((edge) => {
        if (!graph[edge.source]) {
          graph[edge.source] = [];
        }
        graph[edge.source].push({
          target: edge.target,
          sourcenodeid: edge.source,
          label: edge.label,
        });
      });
      const allRoutes = [];
      const dfs = (node, currentRoute) => {
        const neighbors = graph[node] || [];
        neighbors.forEach((neighborInfo) => {
          const newRoute = [
            ...currentRoute,
            {
              nodeId: neighborInfo.target,
              sourcenodeid: neighborInfo.sourcenodeid,
              label: neighborInfo.label,
            },
          ];
          dfs(neighborInfo.target, newRoute);
        });
        if (neighbors.length === 0) {
          allRoutes.push(currentRoute);
        }
      };
      nodes.forEach((node) => {
        if (node.type === 'startNode') {
          const startNodeId = node.id;
          dfs(startNodeId, [{ nodeId: startNodeId, label: null }]);
        }
      });
      const formattedRoutes = allRoutes.map((route, index) => {
        let newArray = [];
        let currentConditionResult = null;
        let routeArray = route.map((routeItem) => {
          const sourceNodeId = routeItem.nodeId;
          const sourceNode = nodes.find((node) => node.id === sourceNodeId);
          if (sourceNode) {
            currentConditionResult = routeItem.label;
          }
          let routes = {
            nodeType:
              sourceNode.property.nodeType == 'defaultNode'
                ? sourceNode.type
                : sourceNode.property.nodeType,
            NodeId: sourceNode.id,
            Nodename: sourceNode.data.label,
            source: routeItem.sourcenodeid,
          };
          if (currentConditionResult) {
            routes['conditionResult'] = currentConditionResult;
          }
          return routes;
        });
        let routeOptionArray = updateLable(routeArray);
        let flowName = `flow${index + 1}`;
        return { [flowName]: routeOptionArray };
      });
      return formattedRoutes;
    };

    const summeryFlow = () => {
      const adjacencyList = {};
      edge.forEach((edge) => {
        if (!adjacencyList[edge.source]) {
          adjacencyList[edge.source] = [];
        }
        adjacencyList[edge.source].push(edge.target);
      });
      const routesWithFormatAndDecisionResults =
        findAllRoutesWithFormatAndDecisionResults(nodes, edge);
      return routesWithFormatAndDecisionResults;
    };
    let summeryRoutes = summeryFlow();
    return summeryRoutes;
  }
  newCreatePrcessFlow(edges, node) {
    let nodes = structuredClone(node);
    let edge = structuredClone(edges);

    const initElement = (item, element) => {
      item.role = element.data.role;

      item.nodeType =
        element.property.nodeType == 'defaultNode'
          ? element.type
          : element.property.nodeType;

      item.nodeId = element.id;
      if (typeof element?.parentId === 'object') {
        item.parentId = [...element?.parentId];
      } else {
        item.parentId = element?.parentId;
      }

      item.nodeName = element.property.name;

      item.nodeDesc = element.property.description;

      return item;
    };

    const addingElements = (item, array) => {
      if (array.filter((x) => x.id === item.id).length === 0) {
        let element = nodes.find((node) => node.id == item.source);

        array.push(initElement(item, element));
      }
    };

    const processFlow = () => {
      const resultObj = {};

      let array = [];

      let removeFields = [
        'source',

        'label',

        'sourceHandle',

        'selected',

        'targetHandle',

        'target',

        'type',

        'markerEnd',

        'id',
      ];

      edge.map((edges) => {
        addingElements(edges, array);
      });

      array.forEach((obj) => {
        let routeArray = [];

        const { source, target } = obj;

        let initRouteObj = {};

        if (!resultObj[source]) {
          resultObj[source] = obj;
        }

        if (obj.label) {
          initRouteObj['conditionResult'] = obj.label;
        }

        initRouteObj['nodeName'] = nodes.find(
          (node) => node.id == target,
        ).data.label;

        initRouteObj['nodeId'] = target;

        routeArray.push(initRouteObj);

        if (resultObj[source]?.routeArray?.length > 0) {
          let check = resultObj[source].routeArray.findIndex(
            (index) => obj.nodeId == source,
          );

          if (check >= 0) {
            resultObj[source].routeArray.push(initRouteObj);
          }
        } else {
          resultObj[source].routeArray = routeArray;
        }

        Object.keys(resultObj[source]).map((key) => {
          let status = removeFields.includes(key);

          if (status) {
            delete resultObj[source][key];
          }
        });
      });

      const updatedArray = Object.values(resultObj);

      let endNodeElement = nodes.find((node) => node.type == 'endNode');

      let item = initElement({}, endNodeElement);

      updatedArray.push(item);

      return updatedArray;
    };

    let processFlowResult = processFlow();

    return processFlowResult;
  }

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

  // sortProcessFlow(processFlow) {
  //   // Create a mapping of node IDs to their corresponding index in the array
  //   const nodeIdToIndex = {};
  //   processFlow.forEach((node, index) => {
  //     nodeIdToIndex[node.nodeId] = index;
  //   });

  //   // Helper function to get the index of a node in the array
  //   const getNodeIndex = (nodeId) => nodeIdToIndex[nodeId];

  //   // Helper function to recursively traverse the routeArray and return a sorted array
  //   const sortRouteArray = (routeArray) => {
  //     return (routeArray || []).sort((a, b) => {
  //       const indexA = getNodeIndex(a.nodeId);
  //       const indexB = getNodeIndex(b.nodeId);
  //       return indexA - indexB;
  //     });
  //   };

  //   // Find the node IDs of all "Start" nodes and "End" nodes
  //   const startNodeIds = processFlow
  //     .filter((node) => node.nodeType === 'startNode')
  //     .map((node) => node.nodeId);
  //   const endNodeIds = processFlow
  //     .filter((node) => node.nodeType === 'endNode')
  //     .map((node) => node.nodeId);

  //   // Sort the ProcessFlow array based on node type
  //   processFlow.sort((a, b) => {
  //     if (startNodeIds.includes(a.nodeId)) {
  //       return -1; // "Start" nodes should come first
  //     } else if (startNodeIds.includes(b.nodeId)) {
  //       return 1; // "Start" nodes should come first
  //     } else if (endNodeIds.includes(a.nodeId)) {
  //       return 1; // "End" nodes should come last
  //     } else if (endNodeIds.includes(b.nodeId)) {
  //       return -1; // "End" nodes should come last
  //     } else {
  //       // Sort based on the indices of the nodes in the array
  //       const indexA = getNodeIndex(a.nodeId);
  //       const indexB = getNodeIndex(b.nodeId);
  //       return indexA - indexB;
  //     }
  //   });

  //   // Sort the routeArray of each node in the ProcessFlow
  //   processFlow.forEach((node) => {
  //     node.routeArray = sortRouteArray(node.routeArray);
  //   });

  //   return processFlow;
  // }

  sortProcessFlow(processFlow) {
    let startNode = processFlow.find((node) => node.nodeType == 'startNode');
    let uniId = [];
    processFlow.map((ele) => {
      if (!uniId.includes(ele.nodeId)) {
        uniId.push(ele.nodeId);
      }
    });
    let alterData = [];
    processFlow.map((ele) => {
      if (ele.parentId.length == 0) {
        alterData.push(ele);
      }
      if (ele.parentId.length > 0) {
        if (
          ele.parentId.every((v) => {
            uniId.includes(v);
          })
        ) {
          alterData.push(ele);
        } else {
          alterData.push({
            ...ele,
            parentId: ele.parentId.filter((v) => uniId.includes(v)),
          });
        }
      }
    });
    let proFlow = [];
    proFlow.push(startNode);

    let includedId = [startNode.nodeId];

    console.log(proFlow, '-------->');
    for (let j = 0; includedId.length + 1 != alterData.length; ) {
      if (proFlow[j]?.routeArray.length > 0) {
        let route = proFlow[j]?.routeArray;

        for (let rou of route) {
          let data = alterData.find((node) => node.nodeId == rou.nodeId);
          if (
            data.nodeType !== 'endNode' &&
            !includedId.includes(data.nodeId) &&
            data.parentId.every((v) => includedId.includes(v))
          ) {
            includedId.push(data.nodeId);
            proFlow.push(data);
            // }
          }
        }
      }

      if (
        processFlow.length == j + 2 &&
        includedId.length + 1 !== processFlow.length
      ) {
        j = 0;
      } else {
        j = j + 1;
      }
    }

    proFlow.push(processFlow.find((node) => node.nodeType == 'endNode'));

    return proFlow;
  }

  // sortProcessFlow(processFlow) {
  //   const startNode = processFlow.find((node) => node.nodeType === 'startNode');
  //   const endNode = processFlow.find((node) => node.nodeType === 'endNode');

  //   const proFlow = [];
  //   const includedId = new Set([startNode.nodeId]);
  //   const queue = [startNode];

  //   while (queue.length > 0) {
  //     const currentNode = queue.shift();
  //     proFlow.push(currentNode);

  //     if (currentNode.routeArray && currentNode.routeArray.length > 0 && currentNode.nodeType !== 'endNode') {
  //       for (const route of currentNode.routeArray) {
  //         const nextNode = processFlow.find(
  //           (node) => node.nodeId === route.nodeId,
  //         );

  //         if (!includedId.has(nextNode.nodeId) && nextNode.nodeType !== 'endNode') {
  //           if (
  //             nextNode.parentId.length === 0 ||
  //             nextNode.parentId.every((v) => includedId.has(v))
  //           ) {
  //             includedId.add(nextNode.nodeId);
  //             queue.push(nextNode);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   proFlow.push(endNode);
  //   return proFlow;
  // // }
  // async getRedis(tenant) {
  //   const js = await redis.call('JSON.GET', tenant);

  //   return js;
  // }
}
