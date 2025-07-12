package ai

import (
	"context"
	"google.golang.org/genai"
)

const GEMINI_API_KEY="AIzaSyAWXCDJ6_FIX60X_8_rg-SyDwZfFYVzgo0"

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
