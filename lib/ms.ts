import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

type MicroServiceProps = {
  productTable: ITable;
  basketTable: ITable;
};

export default class MicroService extends Construct {
  public readonly productService: NodejsFunction;
  public readonly basketService: NodejsFunction;

  constructor(scope: Construct, id: string, props: MicroServiceProps) {
    super(scope, id);

    this.productService = this.createProductFunction(props.productTable);
    this.basketService = this.createBasketFunction(props.basketTable);
  }

  createProductFunction(productTable: ITable) {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
    };

    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, "../src/product/index.js"),
      ...nodeJsFunctionProps,
    });

    //give permission to the productFunction to read and write product table
    productTable.grantReadWriteData(productFunction);
    return productFunction;
  }

  createBasketFunction(basketTable: ITable) {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMODB_TABLE_NAME: basketTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
    };

    const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
      entry: join(__dirname, "../src/basket/index.js"),
      ...nodeJsFunctionProps,
    });

    basketTable.grantReadWriteData(basketFunction);
    return basketFunction;
  }
}
