import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDbStack } from './nested-stacks/dynamodb-stack';
import dotenv from "dotenv";
import path from "path";
import { LambdaStack } from './nested-stacks/lambda-stack';
import { ApiStack } from './nested-stacks/api-stack';
import { CfnOutput } from 'aws-cdk-lib';
import { IamStack } from './nested-stacks/iam-stack';

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = process.env.CDK_APP_NAME as string;
    const envName = process.env.CDK_ENV_NAME as string;

    const dynamoDbStack = new DynamoDbStack(this, "dynamodb-stack", {
      appName,
      envName,
      description: `Creates DynamoDb tables for ${envName}-${appName}.`
    });

    const lambdaStack = new LambdaStack(this, "lambda-stack", {
      appName,
      envName,
      urlTable: dynamoDbStack.getUrlTable(),
      description: `Creates Lambda functions for ${envName}-${appName}.`
    });

    const iamStack = new IamStack(this, "iam-stack", {
      appName,
      envName,
      description: `Creates IAM roles and policies for resources of ${envName}-${appName}.`
    });

    const apiStack = new ApiStack(this, "api-stack", {
      appName,
      envName,
      createShortUrl: lambdaStack.getCreateShortUrl(),
      redirector: lambdaStack.getRedirector(),
      urlShortenerRestApiRole: iamStack.getUrlShortenerRestApiRole(),
      description: `Creates APIs for ${envName}-${appName}.`
    });

    const { restApiId } = apiStack.getUrlShortenerRestApi();
    const { stageName } = apiStack.getUrlShortnerRestApiStage();

    new CfnOutput(this, "url-shortener-api-base-url", {
      exportName: "url-shortener-api-base-url",
      value: `https://${restApiId}.execute-api.${process.env.CDK_DEFAULT_REGION}.amazonaws.com/${stageName}`
    });
  }
}
