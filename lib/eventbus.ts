import { Construct } from "constructs";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";

type EventBusProps = {
  basketPubliser: IFunction;
  orderingTarget: IFunction;
};

export default class EcommerceEventBus extends Construct {
  constructor(scope: Construct, id: string, props: EventBusProps) {
    super(scope, id);

    this.basketCheckoutEventBridge({
      target: props.orderingTarget,
      publisher: props.basketPubliser,
    });
  }

  basketCheckoutEventBridge(basketProps: {
    target: IFunction;
    publisher: IFunction;
  }) {
    const bus = new EventBus(this, "EventBus", {
      eventBusName: "EventBus",
    });

    const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
      eventBus: bus,
      enabled: true,
      description: "checkout the basket from basket microservice",
      eventPattern: {
        source: ["com.basket.checkoutbasket"],
        detailType: ["CheckoutBasket"],
      },
      ruleName: "CheckoutBasketRule",
    });

    checkoutBasketRule.addTarget(new LambdaFunction(basketProps.target));

    bus.grantPutEventsTo(basketProps.publisher);
  }
}
