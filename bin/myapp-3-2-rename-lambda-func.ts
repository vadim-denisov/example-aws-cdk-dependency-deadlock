#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import path = require('path');

const LAMBDA_NAME = {
    API_LAMBDA: 'GetDataAPILambda', // NEW: Rename lambda
};

// APIStack
export class APIStack extends cdk.Stack {
    apiLambda: lambda.Function;
    restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.apiLambda = new lambda.Function(this, 'ProcessedDataAPILambda', {
            functionName: LAMBDA_NAME.API_LAMBDA,
            description: 'Read data from DB and return in as api HTTP response',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas/processed-data-api-lambda')),
            handler: 'index.handler',
            runtime: lambda.Runtime.NODEJS_LATEST,
        });

        this.restApi = new apigateway.LambdaRestApi(this, 'ProcessedDataRestApi', { handler: this.apiLambda });

        // NEW: this export is not needed, removing
        // this.exportValue(this.apiLambda.functionName)
    }
}

// DashboardStack
export class DashboardStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const dashboard = new cw.Dashboard(this, 'AppDashboard');

        const apiLambda = lambda.Function.fromFunctionName(this, 'ProcessedDataAPILambda', LAMBDA_NAME.API_LAMBDA);

        const errorMetric = apiLambda.metricErrors();
        const errorMetricAlarm = errorMetric.createAlarm(this, 'APILambdaErrorsAlarm', {
            threshold: 1,
            evaluationPeriods: 1,
        });

        const durationMetric = apiLambda.metricDuration();
        const durationMetricAlarm = durationMetric.createAlarm(this, 'APILambdaDurationAlarm', {
            threshold: 2.5,
            evaluationPeriods: 1,
        });

        dashboard.addWidgets(
            new cw.AlarmWidget({
                title: 'API Lambda: Errors',
                alarm: errorMetricAlarm,
            }),
            new cw.AlarmWidget({
                title: 'API Lambda: Duration',
                alarm: durationMetricAlarm,
            }),
        );
    }
}

// Application
const app = new cdk.App();
new APIStack(app, 'APIStack');
new DashboardStack(app, 'DashboardStack');
