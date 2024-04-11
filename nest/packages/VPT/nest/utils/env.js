export const config_colorpolicy = {
  apiNode: {
    Level1: [],
    Level2: [],
    Level3: [],
    Level4: [],
    Level5: [],
    Level6: [],
    Level7: [],
    Level8: [],
    Level9: [],
    Level10: [],
  },

  decisionNode: {
    Level1: [],
    Level2: [],
    Level3: [],
    Level4: [],
    Level5: [],
    Level6: [],
    Level7: [],
    Level8: [],
    Level9: [],
    Level10: [],
  },
};

export const workflow_colorpolicy = {
  apiNode: {
    Level1: 'red',
    Level2: 'blue',
    Level3: 'green',
    Level4: 'tomato',
    Level5: 'violet',
    Level6: 'cyan',
    Level7: [],
    Level8: [],
    Level9: [],
    Level10: [],
  },

  decisionNode: {
    Level1: [],
    Level2: [],
    Level3: [],
    Level4: [],
    Level5: [],
    Level6: [],
    Level7: [],
    Level8: [],
    Level9: [],
    Level10: [],
  },
};

export const config_controlpolicy = {
  apiNode: { Level1: ['array', 'object', 'string'] },

  decisionNode: {
    Level1: ['array', 'object', 'string'],
    Level2: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level3: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level4: ['array', 'object', 'string'],
    Level5: ['array', 'object', 'string'],
    Level6: ['array', 'object', 'string'],
    Level7: ['array', 'object', 'string'],
    Level8: ['array', 'object', 'string'],
    Level9: ['array', 'object', 'string'],
    Level10: ['array', 'object', 'string'],
  },
};

export const workflow_controlpolicy = {
  apiNode: {
    Level1: ['array', 'object', 'string', 'boolean'],
    Level1: ['array', 'object', 'string'],
    Level2: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level3: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level4: ['array', 'object', 'string'],
    Level5: ['array', 'object', 'string'],
    Level6: ['array', 'object', 'string'],
    Level7: ['array', 'object', 'string'],
    Level8: ['array', 'object', 'string'],
    Level9: ['array', 'object', 'string'],
    Level10: ['array', 'object', 'string'],
  },
  decisionNode: {
    Level1: ['array', 'object', 'string'],
    Level2: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level3: ['array', 'object', 'string', 'boolean', 'number', 'null'],
    Level4: ['array', 'object', 'string'],
    Level5: ['array', 'object', 'string'],
    Level6: ['array', 'object', 'string'],
    Level7: ['array', 'object', 'string'],
    Level8: ['array', 'object', 'string'],
    Level9: ['array', 'object', 'string'],
    Level10: ['array', 'object', 'string'],
  },
};

export const save_options = [
  {
    "id": 1,
    "tenant": 'TORUS',
    "groups": [
      {
        "id": 1,
        "groupName": 'Group-1',
        "applications": [
          { "id": 'App1', "applicationName": 'app1' },
          { "id": 'App2', "applicationName": 'app2' },
          { "id": 'app3', "applicationName": 'app2' },
        ],
      },
    ],
  },
  {
    "id": 2,
    "tenant": 'tenantName-2',
    "groups": [
      {
        "id": 1,
        "groupName": 'G2',
        "applications": [
          { "id": 'App1', "applicationName": 'app1' },
          { "id": 'App2', "applicationName": 'app2' },
          { "id": 'app3', "applicationName": 'app2' },
        ],
      },
      {
        "id": 2,
        "groupName": 'G3',
        "applications": [
          { "id": 'App1', "applicationName": 'app1' },
          { "id": 'App2', "applicationName": 'app2' },
          { "id": 'app3', "applicationName": 'app2' },
        ],
      },
    ],
  },
  {
    "id": 3,
    "tenant": 'tenantName-3',
    "groups": [
      {
        "id": 1,
        "groupName": 'G2',
        "applications": [
          { "id": 'App1', "applicationName": 'app1' },
          { "id": 'App2', "applicationName": 'app2' },
          { "id": 'app3', "applicationName": 'app2' },
        ],
      },
      {
        "id": 2,
        "groupName": 'G3',
        "applications": [
          { "id": 'App1', "applicationName": 'app1' },
          { "id": 'App2', "applicationName": 'app2' },
          { "id": 'app3', "applicationName": 'app2' },
        ],
      },
    ],
  },
];

export const tenant_details = ['1', '2', '3', '4', '5', '6'];

export const roles = [
  { role: 'supervisor', color: '#aebbff' },
  { role: 'admin', color: '#92b2ff' },
  { role: 'testing', color: '#8ad3ff' }
];

export const APP_PFD_PATH = './Tenant/App'

export const READ_ONLY = '100'
export const DEVELOPER = '200'
export const ADMIN = '300'

 export const USER_TYPE  = 'ADMIN'
