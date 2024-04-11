import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redisService';

@Injectable()
export class DfdService {
    constructor(private readonly appService: RedisService) { }
    async getFabricVersionList() {
        const res = await this.appService.getJsonData("DF:defaultJson");
        return Object.keys(JSON.parse(res));
    }

    async getFabricVersion(version: any) {
        const response = await this.appService.getJsonData("DF:defaultJson");
        const data = JSON.parse(response)[version];
        if (data) {
            return data;
        } else {
            return "No FabricVersion Found"
        }
    }

    async updateFabric(req: any, version: any) {
        const { key, newValue } = req;
        const fabrics = await this.appService.getJsonData(key);
        if (!fabrics) {
            return "No Fabric Found"
        }
        const versionList = await this.getFabricVersionList();
        if (versionList.includes(version)) {
            const data = JSON.parse(fabrics);
            data[version] = newValue;
            const res = await this.appService.setJsonData(key, JSON.stringify(data));
            return res;
        } else {
            return "No FabricVersion Found"
        }
    }

    async saveFabric(key: any, value: any) {
        const fabrics = await this.appService.getJsonData(key);
        if (!fabrics) {
            const res = await this.appService.setJsonData(key, JSON.stringify(value) );
            return res;
        } else {
            const version = `v${Object.keys(JSON.parse(fabrics)).length + 1}`;
            const res = await this.appService.setJsonData(key,JSON.stringify(value));
            return res;
        }
    }
}
