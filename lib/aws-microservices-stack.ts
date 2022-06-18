import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import EcommerceDatabase from "./db";
import MicronService from "./ms";
import ApiGateWay from "./apigateway";
import EventBus from "./eventbus";
import Queue from "./queue";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const db = new EcommerceDatabase(this, "Database");

    const ms = new MicronService(this, "MicroService", {
      productTable: db.productTable,
      basketTable: db.basketTable,
      orderTable: db.orderTable,
    });

    const apigateway = new ApiGateWay(this, "ApiGateWay", {
      productService: ms.productService,
      basketService: ms.basketService,
      orderService: ms.orderService,
    });

    const queue = new Queue(this, "Queue", {
      orderConsumer: ms.orderService,
    });

    const eb = new EventBus(this, "EventBridge", {
      basketService: ms.basketService,
      orderQueue: queue.orderQueue,
    });
  }
}
