package ai

import (
	"context"
	"google.golang.org/genai"
)

const GEMINI_API_KEY="AIzaSyDYw8wgRWwThS4xDk2iY9PtXjwJWYHxcds"

func SummarizeWithGemini(input string) (string, error) {
	ctx := context.Background()

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  GEMINI_API_KEY,
		Backend: genai.BackendGeminiAPI,
	})

	if err != nil {
		return "", err
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text(input),
		nil,
	)
	if err != nil {
		return "", err
	}

	return result.Text(), nil
}
