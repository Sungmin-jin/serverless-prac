import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import EcommerceDatabase from "./db";
import MicronService from "./ms";
import ApiGateWay from "./apigateway";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const db = new EcommerceDatabase(this, "Database");

    const ms = new MicronService(this, "MicroService", {
      productTable: db.productTable,
      basketTable: db.basketTable,
    });

    const apigateway = new ApiGateWay(this, "ApiGateWay", {
      productService: ms.productService,
      basketService: ms.basketService,
    });
  }
}
