import pytest

@pytest.mark.asyncio
async def test_health_endpoints(client):
    res_live = await client.get("/api/v1/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "healthy"

    res_ready = await client.get("/api/v1/health/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["database"] == "connected"

    res_stats = await client.get("/api/v1/health/stats")
    assert res_stats.status_code == 200
    assert res_stats.json()["active_models_count"] >= 4

@pytest.mark.asyncio
async def test_models_endpoint(client):
    res = await client.get("/api/v1/models")
    assert res.status_code == 200
    models = res.json()
    assert len(models) >= 4
    model_ids = [m["id"] for m in models]
    assert "inhouse-llama3-enterprise" in model_ids
    assert "inhouse-devops-copilot" in model_ids

@pytest.mark.asyncio
async def test_chat_message_flow_and_persistence(client):
    # 1. Send chat message
    payload = {
        "content": "Deploy Azure AKS cluster with 3 node pools",
        "username": "devops_lead",
        "model_id": "inhouse-devops-copilot",
        "enable_comparison": True
    }
    res = await client.post("/api/v1/chat/message", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert data["assistant_message"]["role"] == "assistant"
    assert len(data["assistant_message"]["content"]) > 10
    assert data["model_used"] == "inhouse-devops-copilot"

    session_id = data["session_id"]

    # 2. Retrieve history for that session
    res_hist = await client.get(f"/api/v1/chat/history/{session_id}")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert len(hist_data["messages"]) >= 2

@pytest.mark.asyncio
async def test_multi_user_session_retrieval(client):
    # Retrieve sessions for user 'devops_lead'
    res = await client.get("/api/v1/sessions?username=devops_lead")
    assert res.status_code == 200
    sessions = res.json()
    assert isinstance(sessions, list)

@pytest.mark.asyncio
async def test_data_comparison(client):
    payload = {
        "input_text": "Standard Production AKS cluster configuration requires Azure CNI Overlay networking",
        "threshold": 0.2
    }
    res = await client.post("/api/v1/comparison/compare", json=payload)
    assert res.status_code == 200
    comp_data = res.json()
    assert comp_data["matches_found"] > 0
    assert comp_data["highest_similarity"] > 30.0
