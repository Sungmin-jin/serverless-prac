import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

type ApiGateWayProps = {
  productService: IFunction;
  basketService: IFunction;
  orderService: IFunction;
};

export default class ApiGateWay extends Construct {
  constructor(scope: Construct, id: string, props: ApiGateWayProps) {
    super(scope, id);
    this.createProductApi(props.productService);
    this.createBasketApi(props.basketService);
    this.createOrderApi(props.orderService);
  }

  createProductApi(productService: IFunction) {
    const apigw = new LambdaRestApi(this, "productApi", {
      restApiName: "Product Service",
      handler: productService,
      proxy: false,
    });

    const product = apigw.root.addResource("product");
    product.addMethod("GET"); //GET /product
    product.addMethod("POST"); //POST /product

    const singleProduct = product.addResource("{id}"); //product/{id}
    singleProduct.addMethod("GET"); //GET /product/{id}
    singleProduct.addMethod("PUT"); //PUT /product/{id}
    singleProduct.addMethod("DELETE"); // DELETE /product{id}
  }

  createBasketApi(basketService: IFunction) {
    const apigw = new LambdaRestApi(this, "basketApi", {
      restApiName: "Basket Service",
      handler: basketService,
      proxy: false,
    });

    const basket = apigw.root.addResource("basket");
    basket.addMethod("GET");
    basket.addMethod("POST");

    const singleBasket = basket.addResource("{userName}");
    singleBasket.addMethod("GET");
    singleBasket.addMethod("DELETE");
    singleBasket.addMethod("PUT");

    const basketCheckout = basket.addResource("checkout");
    basketCheckout.addMethod("POST");
  }

  createOrderApi(orderService: IFunction) {
    const apigw = new LambdaRestApi(this, "orderApi", {
      restApiName: "Order Service",
      handler: orderService,
      proxy: false,
    });

    const order = apigw.root.addResource("order");
    order.addMethod("GET");
    const singleOrder = order.addResource("{userName}");
    singleOrder.addMethod("GET");
  }
}
