import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import * as yup from "yup";
import moment from "moment";
import {
  DynamoDB
} from "aws-sdk";
import { v4 as uuidV4 } from "uuid";
import ShortLinkDto from "../../types/ShortLinkDto";

const documentClient = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});

const eventSchema = yup.object({
  body: yup.object({
    url: yup.string()
      .url()
      .required(),
    validUntil: yup.date()
      .min(moment().toISOString())
  })
});

interface Event extends Omit<APIGatewayProxyEvent, "body"> {
  body: {
    url: string;
    validUntil?: string;
  }
}

const lambdaHandler = async (event: Event): Promise<APIGatewayProxyResult> => {
  try {
    eventSchema.validateSync(event, { abortEarly: false })
  } catch ({ errors }) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Validation error",
        details: errors
      })
    };
  }

  const {
    body: {
      url,
      validUntil
    },
    requestContext: {
      stage,
      apiId
    }
  } = event;

  let validUntilUnix: number;
  
  if (validUntil) {
    validUntilUnix = moment(validUntil)
      .unix();
  } else {
    validUntilUnix = moment()
      .add(parseInt(process.env.DEFAULT_TTL_IN_SECONDS as string), "seconds")
      .unix();
  }

  const shortLinkRecord: ShortLinkDto = {
    shortLinkUid: uuidV4(),
    redirectTo: url,
    validUntil: validUntilUnix
  };

  await documentClient.put({
    Item: shortLinkRecord,
    TableName: process.env.URL_TABLE_NAME as string,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      shortLink: `https://${apiId}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${stage}/${shortLinkRecord.shortLinkUid}`
    })
  };
}

export const handler = middy(lambdaHandler)
  .use(httpErrorHandler())
  .use(jsonBodyParser());
