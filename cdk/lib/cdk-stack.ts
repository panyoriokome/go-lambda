import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as path from 'path'
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import * as apigw from '@aws-cdk/aws-apigateway';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Smaple Lambdaの定義
    new lambda.Function(this, 'MyGoFunction', {
      runtime: lambda.Runtime.GO_1_X,
      functionName: 'GoSampleLambdaFunction',
      handler: 'main',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/sample'), {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingImage,
          command: [
            'bash',
            '-c',
            ['go test -v', 'GOOS=linux go build -o /asset-output/main'].join(
              ' && '
            ),
          ],
          user: 'root',
        },
      }),
    })

    // DynamoDBの定義
    const dynamoTable = new Table(this, 'todo', {
      partitionKey: {
        name: 'toDoId',
        type: AttributeType.STRING
      },
      tableName: 'todos',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // DynamoDBにアクセスするLambdaの定義
    const apiLambda = new lambda.Function(this, 'GoAPIFunction', {
      runtime: lambda.Runtime.GO_1_X,
      functionName: 'GoAPILambdaFunction',
      handler: 'main',
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: "toDoId",
      },
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/api'), {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingImage,
          command: [
            'bash',
            '-c',
            ['go test -v', 'GOOS=linux go build -o /asset-output/main'].join(
              ' && '
            ),
          ],
          user: 'root',
        },
      }),
    })

    // dynamodbへの権限をLambdaに付与
    dynamoTable.grantReadWriteData(apiLambda);


    // API Gatewayの定義
    const api = new apigw.RestApi(this, 'ServerlessRestApi', { 
      cloudWatchRole: false,
      restApiName: 'Golang-Api-Sample',
      description: 'sample'
    });
    const todosResource = api.root.addResource('todos')
    todosResource.addMethod('GET', new apigw.LambdaIntegration(apiLambda));

    const todoIdResource = todosResource.addResource('{todoId}')
    todoIdResource.addMethod('GET', new apigw.LambdaIntegration(apiLambda));
    todoIdResource.addMethod('PUT', new apigw.LambdaIntegration(apiLambda));
    todoIdResource.addMethod('DELETE', new apigw.LambdaIntegration(apiLambda));


  }
}
