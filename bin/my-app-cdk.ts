#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { APIStack, AppDashboardStack } from '../lib/app-stacks';

const app = new cdk.App();
const apiStack = new APIStack(app, 'APIStack');
new AppDashboardStack(app, 'AppDashboardStack', {
    apiLambda: apiStack.apiLambda
});
