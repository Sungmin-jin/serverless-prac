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
  orderTable: ITable;
};

export default class MicroService extends Construct {
  public readonly productService: NodejsFunction;
  public readonly basketService: NodejsFunction;
  public readonly orderService: NodejsFunction;

  constructor(scope: Construct, id: string, props: MicroServiceProps) {
    super(scope, id);

    this.productService = this.createProductService(props.productTable);
    this.basketService = this.createBasketService(props.basketTable);
    this.orderService = this.createOrderService(props.orderTable);
  }

  createProductService(productTable: ITable) {
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

    const productService = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, "../src/product/index.js"),
      ...nodeJsFunctionProps,
    });

    //give permission to the productFunction to read and write product table
    productTable.grantReadWriteData(productService);
    return productService;
  }

  createBasketService(basketTable: ITable) {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMODB_TABLE_NAME: basketTable.tableName,
        EVENT_SOURCE: "com.basket.checkoutbasket",
        EVENT_DETAIL_TYPE: "CheckoutBasket",
        EVENT_BUS_NAME: "EventBus",
      },
      runtime: Runtime.NODEJS_14_X,
    };

    const basketService = new NodejsFunction(this, "basketLambdaFunction", {
      entry: join(__dirname, "../src/basket/index.js"),
      ...nodeJsFunctionProps,
    });

    basketTable.grantReadWriteData(basketService);
    return basketService;
  }

  createOrderService(orderTable: ITable) {
    const nodejsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        SORT_KEY: "orderDate",
        DYNAMODB_TABLE_NAME: orderTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
    };

    const orderService = new NodejsFunction(this, "orderLambdaFunction", {
      entry: join(__dirname, "../src/order/index.js"),
      ...nodejsFunctionProps,
    });
    orderTable.grantReadWriteData(orderService);

    return orderService;
  }
}
