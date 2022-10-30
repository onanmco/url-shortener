import { NestedStack } from "aws-cdk-lib";
import { Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { BaseNestedStackProps } from "../properties/BaseNestedStackProps";

interface ApiStackProps extends BaseNestedStackProps {}

export class IamStack extends NestedStack {
  private readonly urlShortenerRestApiRole: IRole;

  public getUrlShortenerRestApiRole() {
    return this.urlShortenerRestApiRole;
  }

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      appName,
      envName
    } = props;

    const lambdaInvokePolicy = new ManagedPolicy(this, "lambda-invoke-policy", {
      managedPolicyName: `${envName}-${appName}-lambda-invoke-policy`,
      description: "Grants lambda invoke access to the principals.",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "lambda:InvokeFunction"
          ],
          resources: [
            `arn:${this.partition}:lambda:${this.region}:${this.account}:function:${envName}-${appName}*`
          ]
        })
      ]
    });

    this.urlShortenerRestApiRole = new Role(this, "url-shortener-api-role", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: `Grants Lambda invoke permissions to the ${envName}-${appName}-url-shortener-rest-api.`,
      managedPolicies: [
        lambdaInvokePolicy
      ]
    });
  }
}