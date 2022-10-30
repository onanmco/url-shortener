# URL Shortener Service

This project consist of the source codes of a CDK application that builds and deploys an URL shortener service in AWS using TypeScript, Lambda, API Gateway and DynamoDB.

## Solution Diagram

![image](https://user-images.githubusercontent.com/45673838/198887159-dc680118-a6d4-408e-80bf-1431668396e7.png)

## Steps To Deploy the Application

* Copy the .env.example file and rename as .env.
* Fill in the environment variables regarding to your own AWS account information.
* Run `npm i`
* Run `cdk bootstrap`
* Run `cdk deploy`
