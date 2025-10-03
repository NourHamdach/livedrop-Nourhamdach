import requests
import json

# --- Configuration ---
BASE_URL = "YOUR_CURRENT_NGROK_URL"  # ✅ your ngrok tunnel

# --- Helper to format RAG responses ---
def format_rag_response(data: dict) -> str:
    answer = data.get("answer", "No answer provided.")
    # # Normalize sources
    # if isinstance(sources, str):
    #     sources = [s.strip() for s in sources.split(",") if s.strip()]

    output = [
        "\n--- 🤖 RAG RESPONSE ---",
        f" {answer}",
    ]

    output.append("-------------------------")
    return "\n".join(output)

# --- RAG Chat Function ---
def make_api_request(question: str, base_url: str):
    url = f"{base_url.rstrip('/')}/chat"
    payload = {"question": question}

    print(f"\nSending request to: {url}")
    print(f"Payload: {payload}")   # 👈 matches your requirement

    resp = requests.post(url, json=payload, timeout=120)

    if resp.status_code == 200:
        try:
            data = resp.json()
        except json.JSONDecodeError:
            return f"❌ JSON Error: Received non-JSON response: {resp.text}"
        return format_rag_response(data)
    else:
        return f"❌ Backend Error {resp.status_code}: {resp.text}"

def main():
    print("--- 🚀 RAG API Tester ---")
    if BASE_URL == "YOUR_CURRENT_NGROK_URL":
        print(make_api_request("", BASE_URL))
        return
    print(f"Connected to backend URL: {BASE_URL}")
    print("Type 'exit' or 'quit' to end the session.")
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                break
            if not user_input.strip():
                continue
            response = make_api_request(user_input, BASE_URL)
            print(response)
        except KeyboardInterrupt:
            print("\nExiting session.")
            break

if __name__ == "__main__":
    main()