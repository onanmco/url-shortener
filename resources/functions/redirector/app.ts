import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

import { DynamoDB } from "aws-sdk";
import ShortLinkDto from "../../types/ShortLinkDto";

const documentClient = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});

interface Event extends Omit<APIGatewayProxyEvent, "pathParameters"> {
  pathParameters: {
    shortLinkUid: string;
  }
}

export const lambdaHandler = async (event: Event): Promise<APIGatewayProxyStructuredResultV2> => {
  const {
    pathParameters: {
      shortLinkUid
    }
  } = event;

  const { Item } = await documentClient.get({
    TableName: process.env.URL_TABLE_NAME as string,
    Key: {
      shortLinkUid
    }
  }).promise();


  if (!Item) {
    return {
      statusCode: 404
    };
  }

  const { redirectTo } = Item as ShortLinkDto;

  return {
    statusCode: 301,
    headers: {
      "Location": redirectTo
    }
  };
}