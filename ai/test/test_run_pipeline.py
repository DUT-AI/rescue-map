import os
import importlib.util
import sys
import pandas as pd

# Load the local pipeline module by file path to avoid package import issues
pipeline_path = os.path.join(os.path.dirname(__file__), "pipeline.py")
spec = importlib.util.spec_from_file_location("ai.test.pipeline", pipeline_path)
pipeline = importlib.util.module_from_spec(spec)
# Ensure project root is on sys.path so `import ai.*` inside the module works
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
import types

# Provide fake model modules so importing pipeline doesn't require heavy ML deps
for mod_name in (
    "ai.models.Train_model_XGBoost",
    "ai.models.Train_model_RandomForest",
    "ai.models.Train_model_LightGBM",
):
    if mod_name not in sys.modules:
        m = types.ModuleType(mod_name)
        def _predict(data, path):
            n = len(data)
            return (["HIGH"] * n, [0.9] * n, ["RELIABLE"] * n, [0.8] * n)
        m.predict = _predict
        sys.modules[mod_name] = m

spec.loader.exec_module(pipeline)


def test_run_processing_data(monkeypatch):
    # Provide a minimal DataFrame from raw_to_dataframe
    monkeypatch.setattr(
        pipeline,
        "raw_to_dataframe",
        lambda raw: pd.DataFrame([{"content": "c1", "location": "loc", "contact": "0123456"}]),
    )

    # Make data_clean a noop that returns the same DataFrame (with predictable length)
    monkeypatch.setattr(pipeline, "data_clean", lambda df: df.reset_index(drop=True))

    # Mock model predict functions to return deterministic outputs
    def mock_predict(df, path):
        n = len(df)
        return (["HIGH"] * n, [0.9] * n, ["RELIABLE"] * n, [0.8] * n)

    monkeypatch.setattr(pipeline, "predict_xgboost", mock_predict)
    monkeypatch.setattr(pipeline, "predict_randomForest", mock_predict)
    monkeypatch.setattr(pipeline, "predict_lbm", mock_predict)

    # Capture what is sent to the client's import_json_data
    captured = {}

    class DummyClient:
        def import_json_data(self, merged_data):
            captured["merged"] = merged_data
            return {"success": len(merged_data), "total": len(merged_data)}

    pipeline.client = DummyClient()

    # Run the pipeline (should not raise)
    pipeline.run_processing_data(None)

    assert "merged" in captured
    merged = captured["merged"]
    assert "final_urgency_score" in merged.columns
    assert "final_reliability_score" in merged.columns
    assert merged.shape[0] == 1
