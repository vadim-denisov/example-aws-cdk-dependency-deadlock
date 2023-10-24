import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

export class APIStack extends cdk.Stack {
  apiLambda: lambda.Function;
  restApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.apiLambda = new lambda.Function(
      this,
      'ProcessedDataAPILambda',
      {
        functionName: 'ProcessedDataAPILambda',
        description: 'Read data from DB and provide rest api read access to processed data',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../lambdas/processed-data-api-lambda'),
        ),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_LATEST,
      }
    );

    this.restApi = new apigateway.LambdaRestApi(
      this,
      'ProcessedDataRestApi',
      {
        handler: this.apiLambda,
      }
    );
  }
}


interface AppDashboardStackProps extends cdk.StackProps {
  apiLambda: lambda.Function
}

export class AppDashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppDashboardStackProps) {
    super(scope, id, props);

    const dashboard = new cw.Dashboard(this, 'AppDashboard');

    const errorMetric = props.apiLambda.metricErrors()
    const errorMetricAlarm = errorMetric.createAlarm(
      this,
      'APILambdaErrorsAlarm',
      {
        threshold: 1,
        evaluationPeriods: 1,
      })

    const durationMetric = props.apiLambda.metricDuration()
    const durationMetricAlarm = durationMetric.createAlarm(
      this,
      'APILambdaDurationAlarm',
      {
        threshold: 2.5,
        evaluationPeriods: 1,
      }
    );

    dashboard.addWidgets(
      new cw.AlarmWidget({
        title: "API Lambda: Errors",
        alarm: errorMetricAlarm,
      }),
      new cw.AlarmWidget({
        title: "API Lambda: Duration",
        alarm: durationMetricAlarm,
      }),
    );
  }
}
