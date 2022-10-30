import { NestedStack } from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { BaseNestedStackProps } from "../properties/BaseNestedStackProps";

interface DynamoDbStackProps extends BaseNestedStackProps {}

export class DynamoDbStack extends NestedStack {
  
  private readonly urlTable: ITable;

  public getUrlTable() {
    return this.urlTable;
  }
  
  constructor(scope: Construct, id: string, props: DynamoDbStackProps) {
    super(scope, id, props);

    const { appName, envName } = props;

    this.urlTable = new Table(this, "url-table", {
      tableName: `${appName}-${envName}-url`,
      partitionKey: {
        name: "shortLinkUid",
        type: AttributeType.STRING
      },
      timeToLiveAttribute: "validUntil",
      readCapacity: 1,
      writeCapacity: 1
    });
  }
}