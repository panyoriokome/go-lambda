import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as path from 'path'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new lambda.Function(this, 'MyGoFunction', {
      runtime: lambda.Runtime.GO_1_X,
      functionName: 'GoSampleLambdaFunction',
      handler: 'main',
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
  }
}
