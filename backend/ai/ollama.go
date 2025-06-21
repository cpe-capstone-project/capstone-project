package ai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type OllamaResponse struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
}

// เรียก Ollama local API เพื่อสรุปข้อความ
func GenerateSummaryLocal(content string, timeframe string) (string, error) {
	prompt := fmt.Sprintf(`กรุณาสรุปข้อความต่อไปนี้ให้กระชับ เข้าใจง่าย ถ้าเหตุการณ์บางเหตุการณ์แตกต่างกันให้สรุปแบ่งออกเป็นข้อๆ และครอบคลุมประเด็นสำคัญทั้งหมด:`, timeframe, content)

	reqBody := OllamaRequest{
		Model:  "mistral",
		Prompt: prompt,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	client := http.Client{Timeout: 60 * time.Second}
	resp, err := client.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(data))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("failed to call Ollama API: status " + resp.Status)
	}

	// 🟢 อ่าน response ทีละบรรทัดแบบ streaming
	var result string
	decoder := json.NewDecoder(resp.Body)
	for decoder.More() {
		var res OllamaResponse
		if err := decoder.Decode(&res); err != nil {
			break
		}
		result += res.Response
		if res.Done {
			break
		}
	}

	return result, nil
}
