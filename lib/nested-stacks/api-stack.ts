import { NestedStack } from "aws-cdk-lib";
import { Deployment, IRestApi, IStage, LambdaIntegration, PassthroughBehavior, RestApi, Stage } from "aws-cdk-lib/aws-apigateway";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { IRole } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import dotenv from "dotenv";
import path from "path";
import { BaseNestedStackProps } from "../properties/BaseNestedStackProps";

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

interface ApiStackProps extends BaseNestedStackProps {
  createShortUrl: IFunction;
  redirector: IFunction;
  urlShortenerRestApiRole: IRole;
};

export class ApiStack extends NestedStack {
  private urlShortenerRestApi: IRestApi;
  private urlShortnerRestApiStage: IStage;
  
  public getUrlShortenerRestApi() {
    return this.urlShortenerRestApi;
  }

  public getUrlShortnerRestApiStage() {
    return this.urlShortnerRestApiStage;
  }

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      appName,
      envName,
      createShortUrl,
      redirector
    } = props;

    this.urlShortenerRestApi = new RestApi(this, "url-shortener-rest-api", {
      restApiName: `${envName}-${appName}-url-shortener-rest-api`,
      deploy: false
    });

    this.urlShortenerRestApi.root.addMethod(
      HttpMethod.POST,
      new LambdaIntegration(createShortUrl, {
        proxy: true,
        passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        credentialsRole: props.urlShortenerRestApiRole
      })
    );

    const createShortUrlResource = this.urlShortenerRestApi.root.addResource("{shortLinkUid}");

    createShortUrlResource.addMethod(
      HttpMethod.GET,
      new LambdaIntegration(redirector, {
        proxy: true,
        passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        credentialsRole: props.urlShortenerRestApiRole
      })
    );

    const deployment = new Deployment(this, "api-deployment", {
      api: this.urlShortenerRestApi
    });

    this.urlShortnerRestApiStage = new Stage(this, "api-stage", {
      deployment: deployment,
      stageName: process.env.CDK_ENV_NAME as string
    });
  }
}