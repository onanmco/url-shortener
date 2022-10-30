#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../lib/main-stack';
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

const app = new cdk.App();
new MainStack(app, 'MainStack', {
  stackName: `${process.env.CDK_ENV_NAME}-${process.env.CDK_APP_NAME}-main-stack`,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION 
  }
});