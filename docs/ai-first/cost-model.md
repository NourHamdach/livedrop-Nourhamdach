## Assumptions

- **Model:** Llama 3.1 8B Instruct via OpenRouter at $0.05/1K prompt tokens, $0.20/1K completion tokens
- **Avg tokens in:**
  - Support assistant: 500
  - Search suggestions: 10
- **Avg tokens out:**
  - Support assistant: 100
  - Search suggestions: 20
- **Requests/day:**
  - Support assistant: 1,000
  - Search suggestions: 50,000
- **Cache hit rate:**
  - Support assistant: 30%
  - Search suggestions: 70%

## Calculation

`Cost/action = (tokens_in/1000 * prompt_price) + (tokens_out/1000 * completion_price)`

`Daily cost = Cost/action * Requests/day * (1 - cache_hit_rate)`

## Results

- **Support assistant:**
  - **Cost/action:** $0.045
  - **Daily cost:** $31.50

- **Search suggestions:**
  - **Cost/action:** $0.0045
  - **Daily cost:** $67.50

## Cost lever if over budget

- **Support assistant:** Shorten the context to `300` tokens or use a smaller, fine-tuned model on low-risk paths.
- **Search suggestions:** Downgrade the model to a cheaper, simpler embedding-based retrieval model, or apply a stricter cache policy.
