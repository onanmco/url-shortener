import { Duration, NestedStack } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";
import { BaseNestedStackProps } from "../properties/BaseNestedStackProps";

interface LambdaStackProps extends BaseNestedStackProps {
  urlTable: ITable;
};

export class LambdaStack extends NestedStack {

  private readonly createShortUrl: IFunction;
  private readonly redirector: IFunction;

  public getCreateShortUrl() {
    return this.createShortUrl;
  }

  public getRedirector() {
    return this.redirector;
  }

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const {
      appName,
      envName,
      urlTable
    } = props;

    this.createShortUrl = new NodejsFunction(this, "create-short-url", {
      functionName: `${envName}-${appName}-create-short-url`,
      description: "Creates shortened URLs.",
      entry: path.join(__dirname, "../../resources/functions/create-short-url/app.ts"),
      handler: "handler",
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      memorySize: 512,
      environment: {
        DEFAULT_TTL_IN_SECONDS: "300",
        URL_TABLE_NAME: urlTable.tableName,
        NODE_OPTIONS: "--enable-source-maps"
      },
      bundling: {
        externalModules: [
          "aws_sdk"
        ],
        nodeModules: [
          "uuid"
        ],
        sourceMap: true,
        minify: true
      }
    });

    urlTable.grantWriteData(this.createShortUrl);
    
    this.redirector = new NodejsFunction(this, "redirector", {
      functionName: `${envName}-${appName}-redirector`,
      description: "Redirects to original URLs from shortened URLs.",
      entry: path.join(__dirname, "../../resources/functions/redirector/app.ts"),
      handler: "lambdaHandler",
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      memorySize: 512,
      environment: {
        URL_TABLE_NAME: urlTable.tableName,
        NODE_OPTIONS: "--enable-source-maps"
      },
      bundling: {
        externalModules: [
          "aws_sdk"
        ],
        sourceMap: true,
        minify: true
      }
    });

    urlTable.grantReadData(this.redirector);
  }
}