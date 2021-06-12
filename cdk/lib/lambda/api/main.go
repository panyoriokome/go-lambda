package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Response struct {
	RequestMethod  string `json:"RequestMethod"`
	RequestBody    string `json:"RequestBody"`
	PathParameter  string `json:"PathParameter"`
	QueryParameter string `json:"QueryParameter"`
}

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// httpリクエストの情報を取得
	method := request.HTTPMethod
	body := request.Body
	pathParam := request.PathParameters["todoId"]
	// queryParam := request.QueryStringParameters
	// レスポンスとして返すjson文字列を作る
	res := Response{
		RequestMethod: method,
		RequestBody:   body,
		PathParameter: pathParam,
		// QueryParameter: queryParam,
	}
	jsonBytes, _ := json.Marshal(res)
	// 返り値としてレスポンスを返す
	return events.APIGatewayProxyResponse{
		Body:       string(jsonBytes),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
