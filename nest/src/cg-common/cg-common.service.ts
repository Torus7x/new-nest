import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as fs from 'fs';

@Injectable()
export class CG_CommonService {


    async CreateSchemaFile(template, data, relation, path) {
        try {
          let objtemplate: any = await this.ReadFile(template);
          let fn = ejs.compile(objtemplate);
          let str = fn({
            data: data,
            relation: relation,
          });
          if (str != '') {
            fs.writeFileSync(path, str);
          }
        } catch (error) {
          throw error;
        }
      }
    
      async ReadFile(strReadPath: any) {
        try {
          return await fs.readFileSync(strReadPath, 'utf8');
        } catch (error) {
          throw error;
        }
      }

      async createFolder(foldername: string) {
        // let strroot_path: string = path.join('src', foldername)
        fs.mkdirSync(foldername, { recursive: true });
        return await 'success';
      }
      async createFile(template, data, path) {
        try {
          let objtemplate: any = await this.ReadFile(template);
    
          let fn = ejs.compile(objtemplate);
          let str = fn(data);
          if (str != '') {
            fs.writeFileSync(path, str);
          }
        } catch (error) {
          throw error;
        }
      }

      async CreateFileWithThreeParam(template, data, relation, data1, data2, path) {
        try {
        let objtemplate: any = await this.ReadFile(template);
        let fn = ejs.compile(objtemplate);
        let str = fn({
            data: data,
            relation: relation,
            data1: data1,
            data2: data2,
        });
        if (str != "") {
            fs.writeFileSync(path, str);
        }
        } catch (error) {
        throw error;
        }
    }

}
