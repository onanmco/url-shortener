import { NestedStackProps } from "aws-cdk-lib";

export interface BaseNestedStackProps extends NestedStackProps {
  appName: string;
  envName: string;
}